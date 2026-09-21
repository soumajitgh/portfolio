import { Gutter } from '@payloadcms/ui'
import Link from 'next/link'
import type { AdminViewProps } from 'payload'

type MetricProps = {
  detail: string
  href: string
  label: string
  value: number
}

const Metric = ({ detail, href, label, value }: MetricProps) => (
  <Link className="portfolio-dashboard__metric" href={href}>
    <span className="portfolio-dashboard__metric-label">{label}</span>
    <strong>{value.toLocaleString()}</strong>
    <span className="portfolio-dashboard__metric-detail">{detail}</span>
  </Link>
)

const SectionHeading = ({ children, href }: { children: React.ReactNode; href?: string }) => (
  <div className="portfolio-dashboard__section-heading">
    <h2>{children}</h2>
    {href ? <Link href={href}>View all</Link> : null}
  </div>
)

export default async function AdminDashboard({ payload, user }: AdminViewProps) {
  const access = { overrideAccess: false as const, user }
  const [
    publishedProjects,
    draftProjects,
    publishedPosts,
    draftPosts,
    media,
    projectStars,
    blogStars,
    contributions,
    mergedContributions,
    trackedRepositories,
    repositorySyncErrors,
    contributionSyncErrors,
    recentProjects,
    recentPosts,
  ] = await Promise.all([
    payload.count({
      ...access,
      collection: 'projects',
      where: { _status: { equals: 'published' } },
    }),
    payload.count({
      ...access,
      collection: 'projects',
      where: { _status: { equals: 'draft' } },
    }),
    payload.count({
      ...access,
      collection: 'blog-posts',
      where: { _status: { equals: 'published' } },
    }),
    payload.count({
      ...access,
      collection: 'blog-posts',
      where: { _status: { equals: 'draft' } },
    }),
    payload.count({ ...access, collection: 'media' }),
    payload.count({ ...access, collection: 'project-stars' }),
    payload.count({ ...access, collection: 'blog-stars' }),
    payload.count({ ...access, collection: 'oss-contributions' }),
    payload.count({
      ...access,
      collection: 'oss-contributions',
      where: { status: { equals: 'merged' } },
    }),
    payload.count({ ...access, collection: 'tracked-repositories' }),
    payload.count({
      ...access,
      collection: 'tracked-repositories',
      where: { syncStatus: { equals: 'error' } },
    }),
    payload.count({
      ...access,
      collection: 'oss-contributions',
      where: { githubSyncStatus: { equals: 'unavailable' } },
    }),
    payload.find({
      ...access,
      collection: 'projects',
      depth: 0,
      limit: 4,
      pagination: false,
      select: { title: true, updatedAt: true, _status: true },
      sort: '-updatedAt',
    }),
    payload.find({
      ...access,
      collection: 'blog-posts',
      depth: 0,
      limit: 4,
      pagination: false,
      select: { title: true, updatedAt: true, _status: true },
      sort: '-updatedAt',
    }),
  ])

  const draftCount = draftProjects.totalDocs + draftPosts.totalDocs
  const starCount = projectStars.totalDocs + blogStars.totalDocs
  const syncIssueCount = repositorySyncErrors.totalDocs + contributionSyncErrors.totalDocs
  const recentContent = [
    ...recentProjects.docs.map((doc) => ({ ...doc, kind: 'Project', slug: 'projects' })),
    ...recentPosts.docs.map((doc) => ({ ...doc, kind: 'Blog post', slug: 'blog-posts' })),
  ]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6)

  const dateFormatter = new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <Gutter className="portfolio-dashboard">
      <header className="portfolio-dashboard__hero">
        <div>
          <p className="portfolio-dashboard__eyebrow">Portfolio operations</p>
          <h1>Dashboard</h1>
          <p>Content performance, publishing status, and GitHub sync health at a glance.</p>
        </div>
        <div className="portfolio-dashboard__primary-actions">
          <Link
            className="btn btn--style-secondary btn--size-medium"
            href="/admin/collections/projects/create"
          >
            New project
          </Link>
          <Link
            className="btn btn--style-primary btn--size-medium"
            href="/admin/collections/blog-posts/create"
          >
            New blog post
          </Link>
        </div>
      </header>

      <section>
        <SectionHeading>Overview</SectionHeading>
        <div className="portfolio-dashboard__metrics">
          <Metric
            detail={`${draftProjects.totalDocs} project drafts`}
            href="/admin/collections/projects"
            label="Published projects"
            value={publishedProjects.totalDocs}
          />
          <Metric
            detail={`${draftPosts.totalDocs} post drafts`}
            href="/admin/collections/blog-posts"
            label="Published posts"
            value={publishedPosts.totalDocs}
          />
          <Metric
            detail={`${projectStars.totalDocs} project · ${blogStars.totalDocs} blog`}
            href="/admin/collections/project-stars"
            label="Total stars"
            value={starCount}
          />
          <Metric
            detail={`${mergedContributions.totalDocs} merged`}
            href="/admin/collections/oss-contributions"
            label="OSS contributions"
            value={contributions.totalDocs}
          />
        </div>
      </section>

      <div className="portfolio-dashboard__columns">
        <section className="portfolio-dashboard__panel">
          <SectionHeading href="/admin/collections/projects">Recently updated</SectionHeading>
          {recentContent.length ? (
            <div className="portfolio-dashboard__recent-list">
              {recentContent.map((item) => (
                <Link
                  className="portfolio-dashboard__recent-item"
                  href={`/admin/collections/${item.slug}/${item.id}`}
                  key={`${item.slug}-${item.id}`}
                >
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.kind}</small>
                  </span>
                  <span className="portfolio-dashboard__recent-meta">
                    <span
                      className={`portfolio-dashboard__status portfolio-dashboard__status--${item._status}`}
                    >
                      {item._status}
                    </span>
                    <time dateTime={item.updatedAt}>
                      {dateFormatter.format(new Date(item.updatedAt))}
                    </time>
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="portfolio-dashboard__empty">
              No content yet. Create your first project or blog post.
            </p>
          )}
        </section>

        <aside className="portfolio-dashboard__stack">
          <section className="portfolio-dashboard__panel">
            <SectionHeading href="/admin/collections/tracked-repositories">
              GitHub sync
            </SectionHeading>
            <div className="portfolio-dashboard__health">
              <span
                className={`portfolio-dashboard__health-dot${syncIssueCount ? ' is-error' : ''}`}
              />
              <div>
                <strong>
                  {syncIssueCount
                    ? `${syncIssueCount} sync issue${syncIssueCount === 1 ? '' : 's'}`
                    : 'All systems healthy'}
                </strong>
                <p>{trackedRepositories.totalDocs} tracked repositories</p>
              </div>
            </div>
          </section>

          <section className="portfolio-dashboard__panel">
            <SectionHeading>Quick actions</SectionHeading>
            <nav className="portfolio-dashboard__quick-links" aria-label="Quick actions">
              <Link href="/admin/collections/tracked-repositories/create">
                Track a repository <span>→</span>
              </Link>
              <Link href="/admin/collections/oss-contributions/create">
                Import a contribution <span>→</span>
              </Link>
              <Link href="/admin/collections/media">
                Manage media <span>{media.totalDocs}</span>
              </Link>
              <Link href="/admin/globals/portfolio-settings">
                Portfolio settings <span>→</span>
              </Link>
              {draftCount ? (
                <Link href="/admin/collections/blog-posts">
                  Review drafts <span>{draftCount}</span>
                </Link>
              ) : null}
            </nav>
          </section>
        </aside>
      </div>
    </Gutter>
  )
}
