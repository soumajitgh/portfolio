import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { associationMatches, fetchGitHubIssues } from '@/lib/github-issues'
import { issueSyncCursor, syncIssueTracker } from '@/lib/issue-tracker-sync'

function githubIssue(overrides: Record<string, unknown> = {}) {
  return {
    assignees: [{ login: 'maintainer' }],
    author_association: 'MEMBER',
    body: 'Issue body',
    closed_at: null,
    comments: 2,
    created_at: '2026-09-27T13:00:00.000Z',
    html_url: 'https://github.com/acme/widgets/issues/42',
    labels: [{ color: 'ff0000', description: 'A bug', name: 'bug' }],
    node_id: 'I_kwDO42',
    number: 42,
    state: 'open',
    state_reason: null,
    title: 'Broken widget',
    updated_at: '2026-09-27T13:30:00.000Z',
    user: { login: 'octocat' },
    ...overrides,
  }
}

function response(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { 'content-type': 'application/json', ...init.headers },
  })
}

describe('GitHub issue REST client', () => {
  beforeEach(() => {
    process.env.GITHUB_TOKEN = 'test-token'
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    delete process.env.GITHUB_TOKEN
  })

  it.each([
    ['member', 'MEMBER', true],
    ['member', 'OWNER', false],
    ['collaborator', 'COLLABORATOR', true],
    ['contributor', 'CONTRIBUTOR', true],
    ['contributor', 'FIRST_TIME_CONTRIBUTOR', false],
    ['all', 'OWNER', true],
    ['all', 'NONE', true],
  ] as const)('matches %s against %s', (filter, association, expected) => {
    expect(associationMatches(filter, association)).toBe(expected)
  })

  it('paginates, requests all states, and excludes pull requests', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        response([githubIssue(), { ...githubIssue({ number: 43 }), pull_request: {} }], {
          headers: {
            link: '<https://api.github.com/repositories/1/issues?page=2>; rel="next"',
            'x-ratelimit-remaining': '4999',
            'x-ratelimit-reset': '1790500000',
          },
        }),
      )
      .mockResolvedValueOnce(
        response([githubIssue({ node_id: 'I_kwDO44', number: 44 })], {
          headers: { 'x-ratelimit-remaining': '4998' },
        }),
      )

    const result = await fetchGitHubIssues({
      fetchImpl,
      owner: 'Acme',
      repository: 'Widgets',
      since: new Date('2026-09-27T12:00:00.000Z'),
    })

    expect(result.issues.map((issue) => issue.issueNumber)).toEqual([42, 44])
    expect(result.issues[0]).toMatchObject({
      assignees: ['maintainer'],
      authorAssociation: 'MEMBER',
      issueKey: 'acme/widgets#42',
      labels: [{ color: 'ff0000', description: 'A bug', name: 'bug' }],
    })
    expect(result.requestCount).toBe(2)
    const requested = new URL(String(fetchImpl.mock.calls[0][0]))
    expect(requested.searchParams.get('state')).toBe('all')
    expect(requested.searchParams.get('per_page')).toBe('100')
    expect(requested.searchParams.get('since')).toBe('2026-09-27T12:00:00.000Z')
  })

  it('retries transient responses twice with exponential backoff', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(response({ message: 'Unavailable' }, { status: 503 }))
      .mockResolvedValueOnce(response({ message: 'Still unavailable' }, { status: 502 }))
      .mockResolvedValueOnce(response([]))
    const sleep = vi.fn(async () => undefined)

    await expect(
      fetchGitHubIssues({
        fetchImpl,
        owner: 'acme',
        repository: 'widgets',
        since: new Date('2026-09-27T12:00:00.000Z'),
        sleep,
      }),
    ).resolves.toMatchObject({ issues: [], requestCount: 1 })
    expect(sleep.mock.calls).toEqual([[1000], [2000]])
    expect(fetchImpl).toHaveBeenCalledTimes(3)
  })

  it('surfaces the GitHub reset time without retrying a rate limit response', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      response(
        { message: 'API rate limit exceeded' },
        {
          status: 403,
          headers: { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': '1790500000' },
        },
      ),
    )

    await expect(
      fetchGitHubIssues({
        fetchImpl,
        owner: 'acme',
        repository: 'widgets',
        since: new Date('2026-09-27T12:00:00.000Z'),
      }),
    ).rejects.toMatchObject({
      rateLimitRemaining: 0,
      retryAt: new Date(1790500000 * 1000).toISOString(),
    })
    expect(fetchImpl).toHaveBeenCalledOnce()
  })
})

describe('issue tracker synchronization', () => {
  beforeEach(() => {
    process.env.GITHUB_TOKEN = 'test-token'
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    delete process.env.GITHUB_TOKEN
  })

  it('uses a small overlap behind the successful cursor', () => {
    expect(
      issueSyncCursor({
        lastSyncedAt: '2026-09-27T12:00:00.000Z',
        trackingStartedAt: '2026-09-27T10:00:00.000Z',
      }).toISOString(),
    ).toBe('2026-09-27T11:58:00.000Z')
  })

  it('does not backfill old issues and creates only later matching issues', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(
        response([
          githubIssue({ created_at: '2026-09-27T11:59:59.000Z', node_id: 'old', number: 1 }),
          githubIssue({ created_at: '2026-09-27T12:00:01.000Z', node_id: 'new', number: 2 }),
          githubIssue({
            author_association: 'CONTRIBUTOR',
            created_at: '2026-09-27T12:00:02.000Z',
            node_id: 'filtered',
            number: 3,
          }),
        ]),
      ),
    )

    const payload = {
      count: vi.fn().mockResolvedValue({ totalDocs: 1 }),
      create: vi.fn().mockResolvedValue({}),
      find: vi.fn().mockResolvedValue({ docs: [] }),
      update: vi.fn().mockResolvedValue({}),
    }
    const result = await syncIssueTracker(
      payload as never,
      {
        authorFilter: 'member',
        enabled: true,
        id: 7,
        nextSyncAt: '2026-09-27T11:00:00.000Z',
        organization: 'acme',
        repository: 'widgets',
        repoKey: 'acme/widgets',
        syncIntervalHours: 6,
        trackingStartedAt: '2026-09-27T12:00:00.000Z',
      },
      { now: new Date('2026-09-27T14:00:00.000Z') },
    )

    expect(result).toMatchObject({ created: 1, updated: 0 })
    expect(payload.create).toHaveBeenCalledOnce()
    expect(payload.create.mock.calls[0][0].data).toMatchObject({
      githubNodeId: 'new',
      issueKey: 'acme/widgets#2',
      status: 'new',
    })
    expect(payload.update.mock.calls.at(-1)?.[0].data).toMatchObject({
      lastSyncedAt: '2026-09-27T14:00:00.000Z',
      nextSyncAt: '2026-09-27T20:00:00.000Z',
      syncStatus: 'synced',
    })
  })

  it('updates known issues without sending local status or notes', async () => {
    vi.stubGlobal('fetch', vi.fn<typeof fetch>().mockResolvedValue(response([githubIssue()])))
    const payload = {
      count: vi.fn().mockResolvedValue({ totalDocs: 1 }),
      create: vi.fn(),
      find: vi.fn().mockResolvedValue({
        docs: [{ id: 99, notes: 'keep me', status: 'saved' }],
      }),
      update: vi.fn().mockResolvedValue({}),
    }

    await syncIssueTracker(
      payload as never,
      {
        authorFilter: 'contributor',
        enabled: true,
        id: 7,
        lastSyncedAt: '2026-09-27T12:00:00.000Z',
        nextSyncAt: '2026-09-27T12:00:00.000Z',
        organization: 'acme',
        repository: 'widgets',
        repoKey: 'acme/widgets',
        trackingStartedAt: '2026-09-27T12:00:00.000Z',
      },
      { now: new Date('2026-09-27T14:00:00.000Z') },
    )

    const issueUpdate = payload.update.mock.calls.find(
      (call) => call[0].collection === 'tracked-issues',
    )
    expect(issueUpdate?.[0]).toMatchObject({ id: 99, overrideAccess: true })
    expect(issueUpdate?.[0].data).not.toHaveProperty('status')
    expect(issueUpdate?.[0].data).not.toHaveProperty('notes')
    expect(payload.create).not.toHaveBeenCalled()
  })
})
