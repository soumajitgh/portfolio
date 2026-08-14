import { getPayload, type Payload } from 'payload'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import { fetchGitHubContribution, parseGitHubPullRequestURL } from '@/lib/github-contributions'
import config from '@/payload.config'

let payload: Payload

describe('GitHub contribution import', () => {
  beforeAll(async () => {
    payload = await getPayload({ config })
  })

  afterEach(() => {
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
})
