import { getPayload, type Payload } from 'payload'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import {
  fetchGitHubContribution,
  parseGitHubPullRequestURL,
  parseGitHubRepositoryURL,
} from '@/lib/github-contributions'
import { syncTrackedRepository } from '@/lib/tracked-repository-sync'
import config from '@/payload.config'

let payload: Payload

describe('GitHub contribution import', () => {
  beforeAll(async () => {
    payload = await getPayload({ config })
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('parses and normalizes a GitHub pull request URL', () => {
    expect(
      parseGitHubPullRequestURL('https://www.github.com/Org/Repo/pull/123/?tab=files'),
    ).toEqual({
      key: 'org/repo#123',
      number: 123,
      owner: 'Org',
      repo: 'Repo',
      url: 'https://github.com/Org/Repo/pull/123',
    })
  })

  it.each([
    'https://github.com/foo/bar',
    'https://github.com/foo/bar/issues/123',
    'https://github.com/foo/bar/commit/abcdef',
    'https://gitlab.com/foo/bar/pull/123',
    'not a url',
  ])('rejects a non-PR URL: %s', (url) => {
    expect(() => parseGitHubPullRequestURL(url)).toThrow(/pull request URL|GitHub pull request/)
  })

  it('parses repository URLs without accepting issues, commits, or pull requests', () => {
    expect(parseGitHubRepositoryURL('https://www.github.com/OneBusAway/maglev.git/')).toEqual({
      key: 'onebusaway/maglev',
      owner: 'OneBusAway',
      repo: 'maglev',
      url: 'https://github.com/OneBusAway/maglev',
    })

    expect(() => parseGitHubRepositoryURL('https://github.com/OneBusAway/maglev/pull/737')).toThrow(
      /repository URL/,
    )
  })

  it('maps pull request and repository responses to stored metadata', async () => {
    const responses = [
      {
        additions: 120,
        body: 'Implementation details',
        changed_files: 4,
        created_at: '2026-01-02T12:00:00Z',
        deletions: 34,
        html_url: 'https://github.com/OneBusAway/maglev/pull/737',
        merged_at: '2026-01-05T12:00:00Z',
        number: 737,
        state: 'closed',
        title: 'Improve GTFS processing',
        user: { login: 'soumajitgh' },
      },
      {
        description: 'Public transit tooling',
        html_url: 'https://github.com/OneBusAway/maglev',
        name: 'maglev',
        owner: { login: 'OneBusAway' },
        stargazers_count: 1500,
      },
    ]
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(
        async () =>
          new Response(JSON.stringify(responses.shift()), {
            headers: { 'Content-Type': 'application/json' },
            status: 200,
          }),
      ),
    )

    const metadata = await fetchGitHubContribution(
      parseGitHubPullRequestURL('https://github.com/OneBusAway/maglev/pull/737'),
    )

    expect(metadata).toMatchObject({
      additions: 120,
      author: 'soumajitgh',
      changedFiles: 4,
      deletions: 34,
      organization: 'OneBusAway',
      prKey: 'onebusaway/maglev#737',
      repository: 'maglev',
      stars: 1500,
      status: 'merged',
    })
  })

  it('imports metadata through Payload and rejects a duplicate PR', async () => {
    const prUrl = 'https://github.com/OneBusAway/maglev/pull/987654321'
    const pullRequest = {
      additions: 12,
      body: 'Implementation details',
      changed_files: 2,
      created_at: '2026-02-02T12:00:00Z',
      deletions: 3,
      html_url: prUrl,
      merged_at: null,
      number: 987654321,
      state: 'open',
      title: 'Add a test contribution',
      user: { login: 'soumajitgh' },
    }
    const repository = {
      description: 'Public transit tooling',
      html_url: 'https://github.com/OneBusAway/maglev',
      name: 'maglev',
      owner: { login: 'OneBusAway' },
      stargazers_count: 1500,
    }
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async (input: string | URL | Request) =>
        Promise.resolve(
          new Response(
            JSON.stringify(String(input).includes('/pulls/') ? pullRequest : repository),
            {
              headers: { 'Content-Type': 'application/json' },
              status: 200,
            },
          ),
        ),
      ),
    )

    let contributionID: number | undefined
    try {
      const contribution = await payload.create({
        collection: 'oss-contributions',
        context: { disableRevalidate: true },
        data: { prUrl } as never,
        overrideAccess: true,
      })
      contributionID = contribution.id

      expect(contribution).toMatchObject({
        author: 'soumajitgh',
        organization: 'OneBusAway',
        prNumber: 987654321,
        repository: 'maglev',
        status: 'open',
      })

      await expect(
        payload.create({
          collection: 'oss-contributions',
          context: { disableRevalidate: true },
          data: { prUrl } as never,
          overrideAccess: true,
        }),
      ).rejects.toThrow(/already in your contributions/)
    } finally {
      if (contributionID) {
        await payload.delete({
          collection: 'oss-contributions',
          context: { disableRevalidate: true },
          id: contributionID,
          overrideAccess: true,
        })
      }
    }
  })

  it('discovers authored PRs from a tracked repository and honors the sync cache', async () => {
    vi.stubEnv('GITHUB_TOKEN', 'test-token')
    const repositoryKey = 'example-owner/cache-test-repo'
    const prKey = `${repositoryKey}#24681012`
    const graphQLResponse = {
      data: {
        rateLimit: { cost: 1, remaining: 4999, resetAt: '2026-08-14T16:00:00Z' },
        repository: {
          description: 'A repository used by the sync integration test.',
          name: 'cache-test-repo',
          owner: { login: 'example-owner' },
          stargazerCount: 42,
          url: 'https://github.com/example-owner/cache-test-repo',
        },
        search: {
          issueCount: 1,
          nodes: [
            {
              additions: 18,
              author: { login: 'soumajitgh' },
              body: 'Test PR body',
              changedFiles: 3,
              createdAt: '2026-08-01T12:00:00Z',
              deletions: 4,
              id: 'PR_test_24681012',
              mergedAt: '2026-08-02T12:00:00Z',
              number: 24681012,
              repository: {
                description: 'A repository used by the sync integration test.',
                name: 'cache-test-repo',
                owner: { login: 'example-owner' },
                stargazerCount: 42,
                url: 'https://github.com/example-owner/cache-test-repo',
              },
              state: 'MERGED',
              title: 'Test tracked repository discovery',
              url: 'https://github.com/example-owner/cache-test-repo/pull/24681012',
            },
          ],
          pageInfo: { endCursor: null, hasNextPage: false },
        },
      },
    }
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(graphQLResponse), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }),
    )
    vi.stubGlobal('fetch', fetchMock)

    let contributionID: number | undefined
    let trackedRepositoryID: number | undefined
    try {
      const trackedRepository = await payload.create({
        collection: 'tracked-repositories',
        context: { skipRepositorySync: true },
        data: {
          enabled: true,
          githubUsername: 'soumajitgh',
          nextSyncAt: new Date(0).toISOString(),
          organization: 'example-owner',
          repoKey: repositoryKey,
          repository: 'cache-test-repo',
          repositoryUrl: 'https://github.com/example-owner/cache-test-repo',
          syncIntervalHours: 2,
          syncStatus: 'pending',
        },
        overrideAccess: true,
      })
      trackedRepositoryID = trackedRepository.id

      const firstSync = await syncTrackedRepository(payload, trackedRepository, {
        now: new Date('2026-08-14T12:00:00Z'),
      })
      expect(firstSync).toMatchObject({ cached: false, created: 1, updated: 0 })
      expect(fetchMock).toHaveBeenCalledTimes(1)

      const contribution = await payload.find({
        collection: 'oss-contributions',
        depth: 0,
        limit: 1,
        overrideAccess: true,
        where: { prKey: { equals: prKey } },
      })
      contributionID = contribution.docs[0]?.id
      expect(contribution.docs[0]).toMatchObject({
        author: 'soumajitgh',
        status: 'merged',
        trackedRepository: trackedRepository.id,
      })

      const refreshedRepository = await payload.findByID({
        collection: 'tracked-repositories',
        depth: 0,
        id: trackedRepository.id,
        overrideAccess: true,
      })
      const cachedSync = await syncTrackedRepository(payload, refreshedRepository, {
        now: new Date('2026-08-14T13:00:00Z'),
      })
      expect(cachedSync.cached).toBe(true)
      expect(fetchMock).toHaveBeenCalledTimes(1)
    } finally {
      if (contributionID) {
        await payload.delete({
          collection: 'oss-contributions',
          context: { disableRevalidate: true },
          id: contributionID,
          overrideAccess: true,
        })
      }
      if (trackedRepositoryID) {
        await payload.delete({
          collection: 'tracked-repositories',
          context: { skipRepositorySync: true },
          id: trackedRepositoryID,
          overrideAccess: true,
        })
      }
    }
  })

  it('queues an automatic sync when a repository tracker is created', async () => {
    let jobID: number | undefined
    let trackedRepositoryID: number | undefined
    try {
      const trackedRepository = await payload.create({
        collection: 'tracked-repositories',
        data: {
          repositoryUrl: 'https://github.com/example-owner/queued-sync-test',
        } as never,
        overrideAccess: true,
      })
      trackedRepositoryID = trackedRepository.id

      const jobs = await payload.find({
        collection: 'payload-jobs',
        depth: 0,
        limit: 10,
        overrideAccess: true,
        sort: '-createdAt',
        where: { taskSlug: { equals: 'syncTrackedRepositories' } },
      })
      const queuedJob = jobs.docs.find(
        (job) =>
          (job.input as { repositoryId?: number } | null)?.repositoryId === trackedRepository.id,
      )
      jobID = queuedJob?.id

      expect(queuedJob).toMatchObject({
        input: { force: false, repositoryId: trackedRepository.id },
        queue: 'github-contributions',
        taskSlug: 'syncTrackedRepositories',
      })
    } finally {
      if (jobID) {
        await payload.delete({
          collection: 'payload-jobs',
          id: jobID,
          overrideAccess: true,
        })
      }
      if (trackedRepositoryID) {
        await payload.delete({
          collection: 'tracked-repositories',
          context: { skipRepositorySync: true },
          id: trackedRepositoryID,
          overrideAccess: true,
        })
      }
    }
  })
})
