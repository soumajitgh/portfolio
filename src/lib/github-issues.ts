import { getGitHubToken, parseGitHubRepositoryURL } from '@/lib/github-contributions'

const GITHUB_API_URL = 'https://api.github.com'
const PAGE_SIZE = 100
const REQUEST_TIMEOUT_MS = 20_000
const RETRY_DELAYS_MS = [1_000, 2_000]

export const issueAuthorFilters = ['member', 'collaborator', 'contributor', 'all'] as const

export type IssueAuthorFilter = (typeof issueAuthorFilters)[number]

export type GitHubIssueMetadata = {
  assignees: string[]
  author: string
  authorAssociation: string
  body: null | string
  closedAt: null | string
  commentCount: number
  githubCreatedAt: string
  githubNodeId: string
  githubState: 'closed' | 'open'
  githubStateReason: null | string
  githubUpdatedAt: string
  issueKey: string
  issueNumber: number
  issueUrl: string
  labels: Array<{ color: null | string; description: null | string; name: string }>
  title: string
}

export type GitHubIssuesSnapshot = {
  issues: GitHubIssueMetadata[]
  rateLimit: {
    remaining: null | number
    resetAt: null | string
  }
  requestCount: number
}

export class GitHubIssuesUnavailableError extends Error {
  rateLimitRemaining: null | number
  retryAt?: string
  transient: boolean

  constructor(
    message: string,
    options: {
      rateLimitRemaining?: null | number
      retryAt?: null | string
      transient?: boolean
    } = {},
  ) {
    super(message)
    this.name = 'GitHubIssuesUnavailableError'
    this.rateLimitRemaining = options.rateLimitRemaining ?? null
    this.retryAt = options.retryAt || undefined
    this.transient = options.transient === true
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function asRecords(value: unknown) {
  return Array.isArray(value) ? value.map(asRecord) : []
}

function text(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function number(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function numericHeader(headers: Headers, name: string) {
  const rawValue = headers.get(name)
  if (rawValue === null || rawValue.trim() === '') return null
  const value = Number(rawValue)
  return Number.isFinite(value) && value >= 0 ? value : null
}

function resetAtFromHeaders(headers: Headers) {
  const seconds = numericHeader(headers, 'x-ratelimit-reset')
  return seconds && seconds > 0 ? new Date(seconds * 1000).toISOString() : null
}

function headers() {
  const token = getGitHubToken()
  if (!token) {
    throw new GitHubIssuesUnavailableError('GITHUB_TOKEN is required to sync issue trackers.')
  }

  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'User-Agent': 'soumajit.dev-portfolio',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

function issueFromREST(
  value: Record<string, unknown>,
  owner: string,
  repository: string,
): GitHubIssueMetadata {
  const user = asRecord(value.user)
  const issueNumber = number(value.number)
  const githubNodeId = text(value.node_id)
  const title = text(value.title)
  const author = text(user.login)
  const issueUrl = text(value.html_url)
  const githubCreatedAt = text(value.created_at)
  const githubUpdatedAt = text(value.updated_at)
  const state = text(value.state).toLowerCase()

  if (
    !issueNumber ||
    !githubNodeId ||
    !title ||
    !author ||
    !issueUrl ||
    !githubCreatedAt ||
    !githubUpdatedAt ||
    !['closed', 'open'].includes(state)
  ) {
    throw new GitHubIssuesUnavailableError('GitHub returned incomplete issue data.')
  }

  return {
    assignees: asRecords(value.assignees)
      .map((assignee) => text(assignee.login))
      .filter(Boolean),
    author,
    authorAssociation: text(value.author_association).toUpperCase(),
    body: text(value.body) || null,
    closedAt: text(value.closed_at) || null,
    commentCount: number(value.comments),
    githubCreatedAt,
    githubNodeId,
    githubState: state as 'closed' | 'open',
    githubStateReason: text(value.state_reason) || null,
    githubUpdatedAt,
    issueKey: `${owner.toLowerCase()}/${repository.toLowerCase()}#${issueNumber}`,
    issueNumber,
    issueUrl,
    labels: (Array.isArray(value.labels) ? value.labels : [])
      .map((label) => {
        if (typeof label === 'string') return { color: null, description: null, name: label }
        const record = asRecord(label)
        const name = text(record.name)
        return name
          ? {
              color: text(record.color) || null,
              description: text(record.description) || null,
              name,
            }
          : null
      })
      .filter((label): label is NonNullable<typeof label> => Boolean(label)),
    title,
  }
}

function isTransientStatus(status: number) {
  return status === 408 || status === 429 || status >= 500
}

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds))

async function requestPage(args: {
  fetchImpl: typeof fetch
  owner: string
  page: number
  repository: string
  since: string
  sleep: (milliseconds: number) => Promise<void>
}) {
  const requestHeaders = headers()
  const url = new URL(
    `/repos/${encodeURIComponent(args.owner)}/${encodeURIComponent(args.repository)}/issues`,
    GITHUB_API_URL,
  )
  url.searchParams.set('direction', 'asc')
  url.searchParams.set('page', String(args.page))
  url.searchParams.set('per_page', String(PAGE_SIZE))
  url.searchParams.set('since', args.since)
  url.searchParams.set('sort', 'updated')
  url.searchParams.set('state', 'all')

  for (let attempt = 0; ; attempt += 1) {
    let response: Response
    try {
      response = await args.fetchImpl(url, {
        cache: 'no-store',
        headers: requestHeaders,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      })
    } catch (error) {
      if (attempt < RETRY_DELAYS_MS.length) {
        await args.sleep(RETRY_DELAYS_MS[attempt])
        continue
      }
      const message = error instanceof Error ? error.message : 'Unknown network error'
      throw new GitHubIssuesUnavailableError(`GitHub could not be reached: ${message}`, {
        transient: true,
      })
    }

    const remaining = numericHeader(response.headers, 'x-ratelimit-remaining')
    const resetAt = resetAtFromHeaders(response.headers)
    if (response.ok) {
      const body = await response.json().catch(() => null)
      if (!Array.isArray(body)) {
        throw new GitHubIssuesUnavailableError('GitHub returned an invalid issues response.')
      }
      return { body, remaining, resetAt, link: response.headers.get('link') || '' }
    }

    const body = asRecord(await response.json().catch(() => null))
    const githubMessage = text(body.message)
    const rateLimited = response.status === 429 || (response.status === 403 && remaining === 0)
    const transient = isTransientStatus(response.status) && !rateLimited

    if (transient && attempt < RETRY_DELAYS_MS.length) {
      await args.sleep(RETRY_DELAYS_MS[attempt])
      continue
    }

    throw new GitHubIssuesUnavailableError(
      rateLimited
        ? 'GitHub rate limit is exhausted; sync will resume after the reset time.'
        : `GitHub returned ${response.status}${githubMessage ? `: ${githubMessage}` : '.'}`,
      { rateLimitRemaining: remaining, retryAt: resetAt, transient },
    )
  }
}

export function associationMatches(filter: IssueAuthorFilter, association: string) {
  return filter === 'all' || association.toUpperCase() === filter.toUpperCase()
}

export async function fetchGitHubIssues(args: {
  fetchImpl?: typeof fetch
  owner: string
  repository: string
  since: Date
  sleep?: (milliseconds: number) => Promise<void>
}): Promise<GitHubIssuesSnapshot> {
  const parsed = parseGitHubRepositoryURL(`https://github.com/${args.owner}/${args.repository}`)
  const issues: GitHubIssueMetadata[] = []
  let page = 1
  let remaining: null | number = null
  let resetAt: null | string = null

  for (;;) {
    const result = await requestPage({
      fetchImpl: args.fetchImpl || fetch,
      owner: parsed.owner,
      page,
      repository: parsed.repo,
      since: args.since.toISOString(),
      sleep: args.sleep || wait,
    })
    remaining = result.remaining
    resetAt = result.resetAt

    for (const rawIssue of result.body.map(asRecord)) {
      // GitHub's issues endpoint deliberately includes pull requests.
      if ('pull_request' in rawIssue) continue
      issues.push(issueFromREST(rawIssue, parsed.owner, parsed.repo))
    }

    if (!result.link.split(',').some((link) => /rel="next"/.test(link))) break
    page += 1
  }

  return {
    issues,
    rateLimit: { remaining, resetAt },
    requestCount: page,
  }
}
