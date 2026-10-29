import type { Metadata } from 'next'
import Link from 'next/link'
import { ProjectMedia } from '@/components/projects/project-media'
import { PortfolioEntrance } from '@/components/portfolio/entrance'
import { getTechnicalPortfolio } from '@/lib/technical-data'

export const revalidate = 300
export const metadata: Metadata = {
  title: 'Technical',
  description: 'Software projects and open-source work by Soumajit Ghosh.',
  alternates: { canonical: '/technical' },
}

export default async function TechnicalPage() {
  const data = await getTechnicalPortfolio().catch(() => null)
  return (
    <main className="portfolio-area" data-identity="technical">
      <div className="portfolio-container">
        <PortfolioEntrance>
          <header className="portfolio-intro" data-portfolio-intro>
            <p className="portfolio-eyebrow">Soumajit Ghosh / Technical</p>
            <h1>
              Systems. Software.
              <br />
              <span>Engineering.</span>
            </h1>
            <div className="portfolio-intro-bottom">
              <p>Projects, engineering work, and contributions to open source.</p>
              <a href="#projects">Explore the work ↓</a>
            </div>
          </header>
        </PortfolioEntrance>
        <section id="projects" aria-labelledby="projects-title" className="portfolio-section">
          <div className="portfolio-section-heading">
            <h2 id="projects-title">Projects</h2>
            <Link href="/projects">Browse project archive ↗</Link>
          </div>
          {!data ? (
            <p className="portfolio-notice">
              Project records are temporarily unavailable. Please try again shortly.
            </p>
          ) : !data.projects.length ? (
            <p className="portfolio-notice">Project stories will appear here when published.</p>
          ) : (
            data.projects.map((project, index) => {
              const cover = typeof project.coverImage === 'object' ? project.coverImage : null
              return (
                <article className="editorial-project" key={project.id}>
                  <span className="portfolio-eyebrow" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3>
                      <Link href={`/projects/${project.slug}`}>
                        {project.title} <span aria-hidden="true">↗</span>
                      </Link>
                    </h3>
                    <p>{project.shortDescription}</p>
                    {project.topics?.length ? (
                      <ul className="project-technologies" aria-label="Technologies">
                        {project.topics.slice(0, 4).map((topic) => (
                          <li key={topic.slug}>{topic.name}</li>
                        ))}
                      </ul>
                    ) : null}
                    <Link className="portfolio-text-link" href={`/projects/${project.slug}`}>
                      Read project
                    </Link>
                  </div>
                  {cover?.url ? (
                    <ProjectMedia media={cover} className="editorial-project-media" />
                  ) : null}
                </article>
              )
            })
          )}
        </section>
        <section className="portfolio-section portfolio-support" aria-labelledby="experience-title">
          <div>
            <p className="portfolio-eyebrow">Background</p>
            <h2 id="experience-title">Experience</h2>
          </div>
          <div>
            <p>For professional background and experience, see the resume.</p>
            <Link className="portfolio-text-link" href="/resume">
              View resume ↗
            </Link>
          </div>
        </section>
        <section className="portfolio-section" aria-labelledby="oss-title">
          <div className="portfolio-section-heading">
            <h2 id="oss-title">Open source</h2>
            <Link href="/contributions">Contribution archive ↗</Link>
          </div>
          {data?.contributions.length ? (
            data.contributions.map((item) => (
              <article className="editorial-contribution" key={item.id}>
                <p className="portfolio-eyebrow">
                  {item.organization} / {item.repository} · {item.status}
                </p>
                <h3>
                  <a href={item.prUrl}>{item.title} ↗</a>
                </h3>
                {item.portfolioSummary ? <p>{item.portfolioSummary}</p> : null}
              </article>
            ))
          ) : (
            <p className="portfolio-notice">
              {data
                ? 'Published contributions will appear here.'
                : 'Contribution records are temporarily unavailable.'}
            </p>
          )}
        </section>
        <footer className="portfolio-footer">
          <Link href="/creative">Explore Creative ↗</Link>
          <Link href="/contact">Get in touch ↗</Link>
          <Link href="/stats">Coding statistics</Link>
        </footer>
      </div>
    </main>
  )
}
