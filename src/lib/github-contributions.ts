const DEFAULT_GITHUB_USERNAME = 'soumajitgh'
const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql'
const MAX_SEARCH_PAGES = 10
const SEARCH_PAGE_SIZE = 100

export type GitHubContributionMetadata = {
  additions: number
  author: string
  changedFiles: number
  deletions: number
  githubNodeId: null | string
  mergedAt: null | string
  organization: string
  prCreatedAt: string
  prDescription: null | string
  prKey: string
  prNumber: number
  prUrl: string
  repoDescription: null | string
  repository: string
  repoUrl: string
  stars: number
  status: 'closed' | 'merged' | 'open'
  title: string
}

export type GitHubRateLimit = {
  cost: number
  remaining: number
  resetAt: null | string
}

export type ParsedPullRequestURL = {
  key: string
  number: number
  owner: string
  repo: string
  url: string
}

export type ParsedRepositoryURL = {
  key: string
  owner: string
  repo: string
  url: string
}

export type TrackedRepositorySnapshot = {
  contributions: GitHubContributionMetadata[]
  rateLimit: GitHubRateLimit
  repository: {
    organization: string
    repoDescription: null | string
    repository: string
    repoKey: string
    repoUrl: string
    stars: number
  }
  requestCount: number
}

export class GitHubContributionUnavailableError extends Error {
  retryAt?: string

  constructor(message: string, retryAt?: null | string) {
    super(message)
    this.name = 'GitHubContributionUnavailableError'
    this.retryAt = retryAt || undefined
  }
}

export function getExpectedGitHubUsername() {
  return (process.env.GITHUB_USERNAME || DEFAULT_GITHUB_USERNAME).trim()
}

export function getGitHubToken() {
  return (process.env.GITHUB_TOKEN || '').trim()
}

function parseGitHubURL(value: unknown, expectedPath: 'pull-request' | 'repository') {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(
      expectedPath === 'pull-request'
        ? 'Enter a GitHub pull request URL.'
        : 'Enter a GitHub repository URL.',
    )
  }

  let url: URL
  try {
    url = new URL(value.trim())
  } catch {
    throw new Error(
      expectedPath === 'pull-request'
        ? 'Enter a valid GitHub pull request URL.'
        : 'Enter a valid GitHub repository URL.',
    )
  }

  const hostname = url.hostname.toLowerCase().replace(/^www\./, '')
  const segments = url.pathname.split('/').filter(Boolean)
  const owner = segments[0] || ''
  const repo = (segments[1] || '').replace(/\.git$/i, '')
  const validOwner = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(owner)
  const validRepo = /^[a-zA-Z0-9._-]+$/.test(repo)

  if (
    !['http:', 'https:'].includes(url.protocol) ||
    hostname !== 'github.com' ||
    url.port ||
    url.username ||
    url.password ||
    !validOwner ||
    !validRepo
  ) {
    throw new Error(
      expectedPath === 'pull-request'
        ? 'Use a GitHub pull request URL like https://github.com/org/repo/pull/123.'
        : 'Use a GitHub repository URL like https://github.com/org/repo.',
    )
  }

  return { owner, repo, segments, url }
}

export function parseGitHubPullRequestURL(value: unknown): ParsedPullRequestURL {
  const parsed = parseGitHubURL(value, 'pull-request')
  const number = Number(parsed.segments[3])
  const validPath =
    parsed.segments.length === 4 &&
    parsed.segments[2] === 'pull' &&
    Number.isSafeInteger(number) &&
    number > 0

  if (!validPath) {
    throw new Error('Use a GitHub pull request URL like https://github.com/org/repo/pull/123.')
  }

  return {
    key: `${parsed.owner.toLowerCase()}/${parsed.repo.toLowerCase()}#${number}`,
    number,
    owner: parsed.owner,
    repo: parsed.repo,
    url: `https://github.com/${parsed.owner}/${parsed.repo}/pull/${number}`,
  }
}

export function parseGitHubRepositoryURL(value: unknown): ParsedRepositoryURL {
  const parsed = parseGitHubURL(value, 'repository')
  if (parsed.segments.length !== 2) {
    throw new Error('Use a GitHub repository URL like https://github.com/org/repo.')
  }

  return {
    key: `${parsed.owner.toLowerCase()}/${parsed.repo.toLowerCase()}`,
    owner: parsed.owner,
    repo: parsed.repo,
    url: `https://github.com/${parsed.owner}/${parsed.repo}`,
  }
}

function githubHeaders(token = getGitHubToken()) {
  return {
    Accept: 'application/vnd.github+json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'Content-Type': 'application/json',
    'User-Agent': 'soumajit.dev-portfolio',
    'X-GitHub-Api-Version': '2022-11-28',
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

async function githubJSON(path: string) {
  let response: Response

  try {
    response = await fetch(`https://api.github.com${path}`, {
      cache: 'no-store',
      headers: githubHeaders(),
      signal: AbortSignal.timeout(15_000),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown network error'
    throw new GitHubContributionUnavailableError(`GitHub could not be reached: ${message}`)
  }

  const body = asRecord(await response.json().catch(() => null))
  if (!response.ok) {
    const githubMessage = text(body.message)
    const unavailable =
      response.status === 404
        ? 'The pull request or repository is private, deleted, or unavailable.'
        : `GitHub returned ${response.status}${githubMessage ? `: ${githubMessage}` : '.'}`
    throw new GitHubContributionUnavailableError(
      unavailable,
      rateLimitResetFromHeaders(response.headers),
    )
  }

  return body
}

function rateLimitResetFromHeaders(headers: Headers) {
  const reset = Number(headers.get('x-ratelimit-reset'))
  return Number.isFinite(reset) && reset > 0 ? new Date(reset * 1000).toISOString() : null
}

export async function fetchGitHubContribution(
  parsed: ParsedPullRequestURL,
): Promise<GitHubContributionMetadata> {
  const owner = encodeURIComponent(parsed.owner)
  const repoName = encodeURIComponent(parsed.repo)
  const [pullRequest, repository] = await Promise.all([
    githubJSON(`/repos/${owner}/${repoName}/pulls/${parsed.number}`),
    githubJSON(`/repos/${owner}/${repoName}`),
  ])

  const repositoryOwner = asRecord(repository.owner)
  const pullRequestAuthor = asRecord(pullRequest.user)
  const canonicalOwner = text(repositoryOwner.login)
  const canonicalRepo = text(repository.name)
  const title = text(pullRequest.title)
  const author = text(pullRequestAuthor.login)
  const prNumber = number(pullRequest.number)
  const prCreatedAt = text(pullRequest.created_at)
  const repoUrl = text(repository.html_url)
  const prUrl = text(pullRequest.html_url)

  if (
    !canonicalOwner ||
    !canonicalRepo ||
    !title ||
    !author ||
    !prNumber ||
    !prCreatedAt ||
    !repoUrl ||
    !prUrl
  ) {
    throw new GitHubContributionUnavailableError('GitHub returned incomplete pull request data.')
  }

  const mergedAt = text(pullRequest.merged_at) || null
  const state = text(pullRequest.state).toLowerCase()

  return {
    additions: number(pullRequest.additions),
    author,
    changedFiles: number(pullRequest.changed_files),
    deletions: number(pullRequest.deletions),
    githubNodeId: text(pullRequest.node_id) || null,
    mergedAt,
    organization: canonicalOwner,
    prCreatedAt,
    prDescription: text(pullRequest.body) || null,
    prKey: `${canonicalOwner.toLowerCase()}/${canonicalRepo.toLowerCase()}#${prNumber}`,
    prNumber,
    prUrl,
    repoDescription: text(repository.description) || null,
    repository: canonicalRepo,
    repoUrl,
    stars: number(repository.stargazers_count),
    status: mergedAt ? 'merged' : state === 'open' ? 'open' : 'closed',
    title,
  }
}

const TRACKED_REPOSITORY_QUERY = `
  query TrackedRepositoryContributions(
    $owner: String!
    $repo: String!
    $searchQuery: String!
    $after: String
  ) {
    repository(owner: $owner, name: $repo, followRenames: true) {
      description
      name
      owner { login }
      stargazerCount
      url
    }
    search(query: $searchQuery, type: ISSUE, first: ${SEARCH_PAGE_SIZE}, after: $after) {
      issueCount
      nodes {
        ... on PullRequest {
          additions
          author { login }
          body
          changedFiles
          createdAt
          deletions
          id
          mergedAt
          number
          repository {
            description
            name
            owner { login }
            stargazerCount
            url
          }
          state
          title
          url
        }
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
    rateLimit {
      cost
      remaining
      resetAt
    }
  }
`

type GraphQLPage = {
  body: Record<string, unknown>
  resetAt: null | string
}

async function githubGraphQL(variables: Record<string, unknown>): Promise<GraphQLPage> {
  const token = getGitHubToken()
  if (!token) {
    throw new GitHubContributionUnavailableError(
      'GITHUB_TOKEN is required to sync tracked repositories.',
    )
  }

  let response: Response
  try {
    response = await fetch(GITHUB_GRAPHQL_URL, {
      body: JSON.stringify({ query: TRACKED_REPOSITORY_QUERY, variables }),
      cache: 'no-store',
      headers: githubHeaders(token),
      method: 'POST',
      signal: AbortSignal.timeout(20_000),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown network error'
    throw new GitHubContributionUnavailableError(`GitHub could not be reached: ${message}`)
  }

  const body = asRecord(await response.json().catch(() => null))
  const resetAt = rateLimitResetFromHeaders(response.headers)
  if (!response.ok) {
    throw new GitHubContributionUnavailableError(
      `GitHub returned ${response.status}${text(body.message) ? `: ${text(body.message)}` : '.'}`,
      resetAt,
    )
  }

  const errors = asRecords(body.errors)
  if (errors.length) {
    const message = errors
      .map((error) => text(error.message))
      .filter(Boolean)
      .join('; ')
    throw new GitHubContributionUnavailableError(
      message ? `GitHub GraphQL error: ${message}` : 'GitHub GraphQL returned an error.',
      resetAt,
    )
  }

  return { body, resetAt }
}

function contributionFromGraphQLNode(node: Record<string, unknown>) {
  const repository = asRecord(node.repository)
  const repositoryOwner = asRecord(repository.owner)
  const author = asRecord(node.author)
  const organization = text(repositoryOwner.login)
  const repositoryName = text(repository.name)
  const prNumber = number(node.number)
  const mergedAt = text(node.mergedAt) || null
  const state = text(node.state).toLowerCase()

  if (
    !organization ||
    !repositoryName ||
    !prNumber ||
    !text(node.title) ||
    !text(author.login) ||
    !text(node.createdAt) ||
    !text(node.url) ||
    !text(repository.url)
  ) {
    return null
  }

  return {
    additions: number(node.additions),
    author: text(author.login),
    changedFiles: number(node.changedFiles),
    deletions: number(node.deletions),
    githubNodeId: text(node.id) || null,
    mergedAt,
    organization,
    prCreatedAt: text(node.createdAt),
    prDescription: text(node.body) || null,
    prKey: `${organization.toLowerCase()}/${repositoryName.toLowerCase()}#${prNumber}`,
    prNumber,
    prUrl: text(node.url),
    repoDescription: text(repository.description) || null,
    repository: repositoryName,
    repoUrl: text(repository.url),
    stars: number(repository.stargazerCount),
    status: mergedAt ? 'merged' : state === 'open' ? 'open' : 'closed',
    title: text(node.title),
  } satisfies GitHubContributionMetadata
}

export async function fetchTrackedRepositoryContributions(args: {
  author: string
  owner: string
  repo: string
}): Promise<TrackedRepositorySnapshot> {
  const contributions: GitHubContributionMetadata[] = []
  let after: null | string = null
  let page = 0
  let repositoryMetadata: TrackedRepositorySnapshot['repository'] | null = null
  let rateLimit: GitHubRateLimit = { cost: 0, remaining: 0, resetAt: null }

  do {
    page += 1
    const { body, resetAt } = await githubGraphQL({
      after,
      owner: args.owner,
      repo: args.repo,
      searchQuery: `repo:${args.owner}/${args.repo} is:pr author:${args.author}`,
    })
    const data = asRecord(body.data)
    const repository = asRecord(data.repository)
    const repositoryOwner = asRecord(repository.owner)
    const canonicalOwner = text(repositoryOwner.login)
    const canonicalRepo = text(repository.name)

    if (!canonicalOwner || !canonicalRepo || !text(repository.url)) {
      throw new GitHubContributionUnavailableError(
        'The repository is private, deleted, or unavailable to the configured GitHub token.',
        resetAt,
      )
    }

    repositoryMetadata = {
      organization: canonicalOwner,
      repoDescription: text(repository.description) || null,
      repository: canonicalRepo,
      repoKey: `${canonicalOwner.toLowerCase()}/${canonicalRepo.toLowerCase()}`,
      repoUrl: text(repository.url),
      stars: number(repository.stargazerCount),
    }

    const search = asRecord(data.search)
    for (const node of asRecords(search.nodes)) {
      const contribution = contributionFromGraphQLNode(node)
      if (
        contribution &&
        contribution.author.toLowerCase() === args.author.toLowerCase() &&
        contribution.organization.toLowerCase() === canonicalOwner.toLowerCase() &&
        contribution.repository.toLowerCase() === canonicalRepo.toLowerCase()
      ) {
        contributions.push(contribution)
      }
    }

    const pageInfo = asRecord(search.pageInfo)
    const nextCursor = text(pageInfo.endCursor)
    const hasNextPage = pageInfo.hasNextPage === true
    const rawRateLimit = asRecord(data.rateLimit)
    rateLimit = {
      cost: rateLimit.cost + number(rawRateLimit.cost),
      remaining: number(rawRateLimit.remaining),
      resetAt: text(rawRateLimit.resetAt) || resetAt,
    }

    if (hasNextPage && rateLimit.remaining <= 50) {
      throw new GitHubContributionUnavailableError(
        'GitHub rate limit is nearly exhausted; sync will resume after the reset time.',
        rateLimit.resetAt,
      )
    }
    if (hasNextPage && (!nextCursor || page >= MAX_SEARCH_PAGES)) {
      throw new GitHubContributionUnavailableError(
        `GitHub returned more than ${MAX_SEARCH_PAGES * SEARCH_PAGE_SIZE} matching pull requests for this repository.`,
      )
    }

    after = hasNextPage ? nextCursor : null
  } while (after)

  if (!repositoryMetadata) {
    throw new GitHubContributionUnavailableError('GitHub returned incomplete repository data.')
  }

  return {
    contributions,
    rateLimit,
    repository: repositoryMetadata,
    requestCount: page,
  }
}
