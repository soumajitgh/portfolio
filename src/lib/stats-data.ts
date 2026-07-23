const LEETCODE_API_URL =
  process.env.LEETCODE_API_URL || 'https://alfa-leetcode-api.onrender.com'
const LEETCODE_USERNAME = process.env.LEETCODE_USERNAME || 'soumajitgh'
const GITHUB_USERNAME = process.env.GITHUB_USERNAME || 'soumajitgh'
const GITHUB_TOKEN = process.env.GITHUB_STATS_TOKEN || process.env.GITHUB_TOKEN
const WAKATIME_API_URL = process.env.WAKATIME_API_URL || 'https://wakatime.com/api/v1'

type JsonRecord = Record<string, unknown>

export type Metric = {
  name: string
  percent: number
  seconds: number
  text: string
}

export type DailyActivity = {
  date: string
  projects: { name: string; seconds: number; text: string }[]
  seconds: number
  text: string
}

export type LeetCodeStats = {
  available: boolean
  avatar?: string
  calendar: { date: string; count: number }[]
  contest: {
    attended: number
    globalRanking: number
    rating: number
    topPercentage: number
  }
  country?: string
  error?: string
  languages: { name: string; solved: number }[]
  name: string
  profileRanking: number
  recentSubmissions: {
    language: string
    timestamp: string
    title: string
    titleSlug: string
  }[]
  reputation: number
  solved: {
    easy: number
    hard: number
    medium: number
    total: number
  }
  totalQuestions: {
    easy: number
    hard: number
    medium: number
    total: number
  }
  username: string
}

export type GitHubStats = {
  accountCreated?: string
  available: boolean
  avatar?: string
  bio?: string
  company?: string
  contributionDays: { count: number; date: string }[]
  error?: string
  followers: number
  following: number
  languages: { name: string; repositories: number }[]
  location?: string
  name: string
  privateCommits: number | null
  publicGists: number
  publicRepos: number
  recentRepositories: {
    description?: string
    forks: number
    language?: string
    name: string
    stars: number
    updatedAt: string
    url: string
  }[]
  totalCommits: number
  totalContributions: number
  totalForks: number
  totalStars: number
  username: string
}

export type WakaTimeStats = {
  available: boolean
  bestDay?: { date: string; seconds: number; text: string }
  daily: DailyActivity[]
  dailyAverage: string
  editors: Metric[]
  end?: string
  error?: string
  languages: Metric[]
  operatingSystems: Metric[]
  projects: Metric[]
  range: string
  start?: string
  totalAllTime: string
  totalThisWeek: string
}

const asRecord = (value: unknown): JsonRecord =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : {}

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])

const text = (value: unknown, fallback = '') =>
  typeof value === 'string' ? value : typeof value === 'number' ? String(value) : fallback

const number = (value: unknown, fallback = 0) => {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const first = (...values: unknown[]) => values.find((value) => value !== undefined && value !== null)

async function fetchJSON(url: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json',
      'User-Agent': 'soumajit.dev stats dashboard',
      ...init?.headers,
    },
    next: { revalidate: 900 },
    signal: AbortSignal.timeout(12_000),
  })

  if (!response.ok) {
    throw new Error(`Upstream returned ${response.status}`)
  }

  return response.json()
}

const leetCodeURL = (path: string) =>
  `${LEETCODE_API_URL.replace(/\/$/, '')}/${encodeURIComponent(LEETCODE_USERNAME)}${path}`

export async function getLeetCodeStats(): Promise<LeetCodeStats> {
  const empty: LeetCodeStats = {
    available: false,
    calendar: [],
    contest: { attended: 0, globalRanking: 0, rating: 0, topPercentage: 0 },
    languages: [],
    name: LEETCODE_USERNAME,
    profileRanking: 0,
    recentSubmissions: [],
    reputation: 0,
    solved: { easy: 0, hard: 0, medium: 0, total: 0 },
    totalQuestions: { easy: 0, hard: 0, medium: 0, total: 0 },
    username: LEETCODE_USERNAME,
  }

  try {
    const year = new Date().getFullYear()
    const requests = await Promise.allSettled([
      fetchJSON(leetCodeURL('/profile')),
      fetchJSON(leetCodeURL('/solved')),
      fetchJSON(leetCodeURL('/contest')),
      fetchJSON(leetCodeURL('/language')),
      fetchJSON(leetCodeURL('/acSubmission?limit=8')),
      fetchJSON(leetCodeURL(`/calendar?year=${year}`)),
    ])
    const successful = requests.map((result) => (result.status === 'fulfilled' ? result.value : {}))
    if (!requests.some((result) => result.status === 'fulfilled')) {
      throw new Error('LeetCode API is currently unavailable')
    }

    const profileRoot = asRecord(successful[0])
    const profile = asRecord(first(profileRoot.profile, profileRoot.data, profileRoot))
    const solvedRoot = asRecord(successful[1])
    const solved = asRecord(first(solvedRoot.solved, solvedRoot.data, solvedRoot))
    const contestRoot = asRecord(successful[2])
    const contest = asRecord(first(contestRoot.contest, contestRoot.data, contestRoot))
    const languageRoot = asRecord(successful[3])
    const languageItems = asArray(
      first(
        languageRoot.languageProblemCount,
        languageRoot.languages,
        asRecord(languageRoot.data).languageProblemCount,
        languageRoot.data,
      ),
    )
    const submissionRoot = asRecord(successful[4])
    const submissions = asArray(
      first(
        submissionRoot.submission,
        submissionRoot.submissions,
        submissionRoot.recentSubmissions,
        submissionRoot.data,
      ),
    )
    const calendarRoot = asRecord(successful[5])
    const calendarValue = first(
      calendarRoot.submissionCalendar,
      asRecord(calendarRoot.data).submissionCalendar,
      calendarRoot.data,
    )
    let parsedCalendar: JsonRecord = asRecord(calendarValue)
    if (typeof calendarValue === 'string') {
      try {
        parsedCalendar = asRecord(JSON.parse(calendarValue))
      } catch {
        parsedCalendar = {}
      }
    }

    const easy = number(first(solved.easySolved, profile.easySolved))
    const medium = number(first(solved.mediumSolved, profile.mediumSolved))
    const hard = number(first(solved.hardSolved, profile.hardSolved))

    return {
      available: true,
      avatar: text(first(profile.avatar, profile.userAvatar)) || undefined,
      calendar: Object.entries(parsedCalendar)
        .map(([timestamp, count]) => ({
          count: number(count),
          date: new Date(number(timestamp) * 1000).toISOString().slice(0, 10),
        }))
        .filter((item) => item.count > 0)
        .sort((a, b) => a.date.localeCompare(b.date)),
      contest: {
        attended: number(first(contest.contestAttend, contest.attendedContestsCount)),
        globalRanking: number(first(contest.contestGlobalRanking, contest.globalRanking)),
        rating: number(first(contest.contestRating, contest.rating)),
        topPercentage: number(first(contest.contestTopPercentage, contest.topPercentage)),
      },
      country: text(first(profile.country, profile.countryName)) || undefined,
      languages: languageItems
        .map((item) => {
          const entry = asRecord(item)
          return {
            name: text(first(entry.languageName, entry.name)),
            solved: number(first(entry.problemsSolved, entry.solved)),
          }
        })
        .filter((item) => item.name)
        .sort((a, b) => b.solved - a.solved),
      name: text(first(profile.realName, profile.name), LEETCODE_USERNAME),
      profileRanking: number(first(profile.ranking, solved.ranking)),
      recentSubmissions: submissions
        .map((item) => {
          const entry = asRecord(item)
          return {
            language: text(first(entry.lang, entry.language)),
            timestamp: text(entry.timestamp),
            title: text(entry.title),
            titleSlug: text(entry.titleSlug),
          }
        })
        .filter((item) => item.title),
      reputation: number(profile.reputation),
      solved: {
        easy,
        hard,
        medium,
        total: number(first(solved.solvedProblem, solved.totalSolved, profile.totalSolved), easy + medium + hard),
      },
      totalQuestions: {
        easy: number(first(solved.totalEasy, profile.totalEasy)),
        hard: number(first(solved.totalHard, profile.totalHard)),
        medium: number(first(solved.totalMedium, profile.totalMedium)),
        total: number(first(solved.totalQuestions, profile.totalQuestions)),
      },
      username: text(profile.username, LEETCODE_USERNAME),
    }
  } catch (error) {
    return { ...empty, error: error instanceof Error ? error.message : 'Unable to load LeetCode stats' }
  }
}

const githubHeaders = () => ({
  Accept: 'application/vnd.github+json',
  ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
  'X-GitHub-Api-Version': '2022-11-28',
})

async function getContributionSummary() {
  if (!GITHUB_TOKEN) {
    return { days: [], privateCommits: null, totalCommits: 0, totalContributions: 0 }
  }

  const response = asRecord(
    await fetchJSON('https://api.github.com/graphql', {
      body: JSON.stringify({
        query: `query($login: String!) {
          user(login: $login) {
            contributionsCollection {
              totalCommitContributions
              contributionCalendar {
                totalContributions
                weeks { contributionDays { contributionCount date } }
              }
              commitContributionsByRepository(maxRepositories: 100) {
                repository { isPrivate }
                contributions { totalCount }
              }
            }
          }
        }`,
        variables: { login: GITHUB_USERNAME },
      }),
      headers: githubHeaders(),
      method: 'POST',
    }),
  )
  const data = asRecord(response.data)
  const user = asRecord(data.user)
  const collection = asRecord(user.contributionsCollection)
  const calendar = asRecord(collection.contributionCalendar)
  const contributionsByRepository = asArray(collection.commitContributionsByRepository)

  return {
    days: asArray(calendar.weeks).flatMap((week) =>
      asArray(asRecord(week).contributionDays).map((day) => {
        const entry = asRecord(day)
        return { count: number(entry.contributionCount), date: text(entry.date) }
      }),
    ),
    privateCommits: contributionsByRepository.reduce<number>((total, contribution) => {
      const entry = asRecord(contribution)
      if (asRecord(entry.repository).isPrivate !== true) return total
      return total + number(asRecord(entry.contributions).totalCount)
    }, 0),
    totalCommits: number(collection.totalCommitContributions),
    totalContributions: number(calendar.totalContributions),
  }
}

export async function getGitHubStats(): Promise<GitHubStats> {
  const empty: GitHubStats = {
    available: false,
    contributionDays: [],
    followers: 0,
    following: 0,
    languages: [],
    name: GITHUB_USERNAME,
    privateCommits: null,
    publicGists: 0,
    publicRepos: 0,
    recentRepositories: [],
    totalCommits: 0,
    totalContributions: 0,
    totalForks: 0,
    totalStars: 0,
    username: GITHUB_USERNAME,
  }

  try {
    const [userValue, reposValue, contributionsValue] = await Promise.all([
      fetchJSON(`https://api.github.com/users/${encodeURIComponent(GITHUB_USERNAME)}`, {
        headers: githubHeaders(),
      }),
      fetchJSON(
        `https://api.github.com/users/${encodeURIComponent(GITHUB_USERNAME)}/repos?per_page=100&sort=updated&type=owner`,
        { headers: githubHeaders() },
      ),
      getContributionSummary().catch(() => ({
        days: [],
        privateCommits: null,
        totalCommits: 0,
        totalContributions: 0,
      })),
    ])
    const user = asRecord(userValue)
    const repos = asArray(reposValue).map(asRecord).filter((repo) => !repo.fork)
    const languages = new Map<string, number>()
    for (const repo of repos) {
      const language = text(repo.language)
      if (language) languages.set(language, (languages.get(language) || 0) + 1)
    }

    return {
      accountCreated: text(user.created_at) || undefined,
      available: true,
      avatar: text(user.avatar_url) || undefined,
      bio: text(user.bio) || undefined,
      company: text(user.company) || undefined,
      contributionDays: contributionsValue.days,
      followers: number(user.followers),
      following: number(user.following),
      languages: Array.from(languages, ([name, repositories]) => ({ name, repositories })).sort(
        (a, b) => b.repositories - a.repositories,
      ),
      location: text(user.location) || undefined,
      name: text(user.name, GITHUB_USERNAME),
      privateCommits: contributionsValue.privateCommits,
      publicGists: number(user.public_gists),
      publicRepos: number(user.public_repos),
      recentRepositories: repos.slice(0, 8).map((repo) => ({
        description: text(repo.description) || undefined,
        forks: number(repo.forks_count),
        language: text(repo.language) || undefined,
        name: text(repo.name),
        stars: number(repo.stargazers_count),
        updatedAt: text(repo.updated_at),
        url: text(repo.html_url),
      })),
      totalCommits: contributionsValue.totalCommits,
      totalContributions: contributionsValue.totalContributions,
      totalForks: repos.reduce((sum, repo) => sum + number(repo.forks_count), 0),
      totalStars: repos.reduce((sum, repo) => sum + number(repo.stargazers_count), 0),
      username: text(user.login, GITHUB_USERNAME),
    }
  } catch (error) {
    return { ...empty, error: error instanceof Error ? error.message : 'Unable to load GitHub stats' }
  }
}

const wakaHeaders = (): Record<string, string> => {
  const apiKey = process.env.WAKATIME_API_KEY
  return apiKey ? { Authorization: `Basic ${Buffer.from(`${apiKey}:`).toString('base64')}` } : {}
}

const normalizeMetric = (value: unknown): Metric => {
  const metric = asRecord(value)
  return {
    name: text(metric.name, 'Unknown'),
    percent: number(metric.percent),
    seconds: number(first(metric.total_seconds, metric.seconds)),
    text: text(metric.text),
  }
}

export async function getWakaTimeStats(): Promise<WakaTimeStats> {
  const empty: WakaTimeStats = {
    available: false,
    daily: [],
    dailyAverage: '—',
    editors: [],
    languages: [],
    operatingSystems: [],
    projects: [],
    range: 'Last 7 days',
    totalAllTime: '—',
    totalThisWeek: '—',
  }

  if (!process.env.WAKATIME_API_KEY) {
    return { ...empty, error: 'WAKATIME_API_KEY is not configured' }
  }

  try {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setUTCDate(endDate.getUTCDate() - 13)
    const start = startDate.toISOString().slice(0, 10)
    const end = endDate.toISOString().slice(0, 10)
    const headers = wakaHeaders()
    const [statsValue, summariesValue, allTimeValue] = await Promise.all([
      fetchJSON(`${WAKATIME_API_URL}/users/current/stats/last_7_days`, { headers }),
      fetchJSON(`${WAKATIME_API_URL}/users/current/summaries?start=${start}&end=${end}`, { headers }),
      fetchJSON(`${WAKATIME_API_URL}/users/current/all_time_since_today`, { headers }),
    ])
    const stats = asRecord(asRecord(statsValue).data)
    const summaries = asArray(asRecord(summariesValue).data)
    const allTime = asRecord(asRecord(allTimeValue).data)
    const bestDay = asRecord(stats.best_day)

    return {
      available: true,
      bestDay: Object.keys(bestDay).length
        ? {
            date: text(bestDay.date),
            seconds: number(bestDay.total_seconds),
            text: text(bestDay.text),
          }
        : undefined,
      daily: summaries.map((summary) => {
        const entry = asRecord(summary)
        const range = asRecord(entry.range)
        const total = asRecord(entry.grand_total)
        return {
          date: text(first(range.date, range.start)).slice(0, 10),
          projects: asArray(entry.projects).map((project) => {
            const item = normalizeMetric(project)
            return { name: item.name, seconds: item.seconds, text: item.text }
          }),
          seconds: number(total.total_seconds),
          text: text(total.text),
        }
      }),
      dailyAverage: text(stats.human_readable_daily_average, '—'),
      editors: asArray(stats.editors).map(normalizeMetric),
      end: text(stats.end) || end,
      languages: asArray(stats.languages).map(normalizeMetric),
      operatingSystems: asArray(stats.operating_systems).map(normalizeMetric),
      projects: asArray(stats.projects).map(normalizeMetric),
      range: text(stats.human_readable_range, 'Last 7 days'),
      start: text(stats.start) || start,
      totalAllTime: text(first(allTime.text, allTime.human_readable_total), '—'),
      totalThisWeek: text(stats.human_readable_total, '—'),
    }
  } catch (error) {
    return { ...empty, error: error instanceof Error ? error.message : 'Unable to load WakaTime stats' }
  }
}
