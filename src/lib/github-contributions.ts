const DEFAULT_GITHUB_USERNAME = 'soumajitgh'

export type GitHubContributionMetadata = {
  additions: number
  author: string
  changedFiles: number
  deletions: number
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

export type ParsedPullRequestURL = {
  key: string
  number: number
  owner: string
  repo: string
  url: string
}

export class GitHubContributionUnavailableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GitHubContributionUnavailableError'
  }
}

export function getExpectedGitHubUsername() {
  return (process.env.GITHUB_USERNAME || DEFAULT_GITHUB_USERNAME).trim()
}

export function parseGitHubPullRequestURL(value: unknown): ParsedPullRequestURL {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('Enter a GitHub pull request URL.')
  }

  let url: URL
  try {
    url = new URL(value.trim())
  } catch {
    throw new Error('Enter a valid GitHub pull request URL.')
  }

  const hostname = url.hostname.toLowerCase().replace(/^www\./, '')
  const segments = url.pathname.split('/').filter(Boolean)
  const number = Number(segments[3])
  const validPath =
    segments.length === 4 && segments[2] === 'pull' && Number.isSafeInteger(number) && number > 0

  if (
    !['http:', 'https:'].includes(url.protocol) ||
    hostname !== 'github.com' ||
    url.port ||
    url.username ||
    url.password ||
    !validPath
  ) {
    throw new Error('Use a GitHub pull request URL like https://github.com/org/repo/pull/123.')
  }

  const owner = segments[0]
  const repo = segments[1]
  const validOwner = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/.test(owner)
  const validRepo = /^[a-zA-Z0-9._-]+$/.test(repo)

  if (!validOwner || !validRepo) {
    throw new Error('The GitHub owner or repository name is invalid.')
  }

  return {
    key: `${owner.toLowerCase()}/${repo.toLowerCase()}#${number}`,
    number,
    owner,
    repo,
    url: `https://github.com/${owner}/${repo}/pull/${number}`,
  }
}

function githubHeaders() {
  const token =
    process.env.GITHUB_CONTRIBUTIONS_TOKEN ||
    process.env.GITHUB_STATS_TOKEN ||
    process.env.GITHUB_TOKEN

  return {
    Accept: 'application/vnd.github+json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'User-Agent': 'soumajit.dev-portfolio',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
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
    throw new GitHubContributionUnavailableError(unavailable)
  }

  return body
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
