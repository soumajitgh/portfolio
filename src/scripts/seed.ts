import 'dotenv/config'

import { getPayload } from 'payload'

import type { Project } from '@/payload-types'
import config from '@/payload.config'

function richText(title: string, paragraphs: string[]): Project['overview'] {
  const textNode = (text: string) => ({
    detail: 0,
    format: 0,
    mode: 'normal',
    style: '',
    text,
    type: 'text',
    version: 1,
  })
  return {
    root: {
      children: [
        {
          children: [textNode('Overview')],
          direction: 'ltr',
          format: '',
          indent: 0,
          tag: 'h2',
          type: 'heading',
          version: 1,
        },
        ...paragraphs.map((paragraph) => ({
          children: [textNode(paragraph)],
          direction: 'ltr' as const,
          format: '' as const,
          indent: 0,
          textFormat: 0,
          textStyle: '',
          type: 'paragraph',
          version: 1,
        })),
        {
          children: [textNode(title)],
          direction: 'ltr',
          format: '',
          indent: 0,
          tag: 'h3',
          type: 'heading',
          version: 1,
        },
        {
          children: [
            textNode(
              'Built for predictable operations, clear failure modes, and maintainable interfaces.',
            ),
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          textFormat: 0,
          textStyle: '',
          type: 'paragraph',
          version: 1,
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  }
}

async function seed() {
  const payload = await getPayload({ config })

  await payload.updateGlobal({
    slug: 'portfolio-settings',
    context: { disableRevalidate: true },
    data: {
      carouselRotationInterval: 7000,
      heroCommand: 'soumajit@portfolio:~$ whoami',
      heroDescription:
        'I design APIs, distributed systems, and developer infrastructure with an emphasis on reliability, clarity, and long-term maintainability.',
      heroHeadline: 'I build reliable backend systems.',
      contact: {
        email: 'soumojitghosh02@gmail.com',
        intro:
          'Have a backend, infrastructure, or developer tooling problem worth solving? Send the context and I will get back to you.',
        socials: [{ label: 'GitHub', url: 'https://github.com/soumajitgh' }],
      },
      interests: [
        {
          name: 'Distributed systems',
          description: 'Coordination, consistency, and resilient service design.',
        },
        {
          name: 'Developer tooling',
          description: 'Tools that reduce friction and improve feedback loops.',
        },
        {
          name: 'Infrastructure',
          description: 'Repeatable platforms, automation, and reliable delivery.',
        },
        {
          name: 'Observability',
          description: 'Making production behavior legible with useful signals.',
        },
        {
          name: 'Databases',
          description: 'Storage design, query behavior, and data-intensive systems.',
        },
        {
          name: 'Open-source software',
          description: 'Building in public and improving shared foundations.',
        },
      ],
      primaryAction: { label: './view-projects', url: '/projects' },
      secondaryAction: { label: './explore-stack', url: '#portfolio' },
      skills: [
        {
          category: 'languages',
          items: [{ name: 'TypeScript' }, { name: 'Go' }, { name: 'Python' }],
        },
        {
          category: 'backend-apis',
          items: [{ name: 'Node.js' }, { name: 'REST' }, { name: 'GraphQL' }],
        },
        {
          category: 'data-storage',
          items: [{ name: 'PostgreSQL' }, { name: 'Redis' }, { name: 'SQLite' }],
        },
        {
          category: 'infrastructure',
          items: [{ name: 'Docker' }, { name: 'Kubernetes' }, { name: 'CI/CD' }],
        },
        { category: 'observability', items: [{ name: 'OpenTelemetry' }, { name: 'Prometheus' }] },
        { category: 'tools', items: [{ name: 'Git' }, { name: 'Linux' }, { name: 'Payload CMS' }] },
      ],
    },
  })

  const seeds = [
    {
      accent: 'blue' as const,
      category: 'infrastructure' as const,
      displayOrder: 1,
      featured: true,
      pinned: true,
      projectYear: 2026,
      shortDescription:
        'A fault-tolerant service layer designed for predictable performance under load.',
      slug: 'distributed-api-platform',
      status: 'active' as const,
      title: 'Distributed API Platform',
      topics: [
        { name: 'typescript', slug: 'typescript' },
        { name: 'postgresql', slug: 'postgresql' },
        { name: 'redis', slug: 'redis' },
      ],
    },
    {
      accent: 'cyan' as const,
      category: 'developer-tools' as const,
      displayOrder: 2,
      featured: true,
      pinned: false,
      projectYear: 2026,
      shortDescription:
        'Structured traces, metrics, and logs that make production behavior easy to reason about.',
      slug: 'observability-toolkit',
      status: 'maintained' as const,
      title: 'Observability Toolkit',
      topics: [
        { name: 'opentelemetry', slug: 'opentelemetry' },
        { name: 'go', slug: 'go' },
        { name: 'clickhouse', slug: 'clickhouse' },
      ],
    },
    {
      accent: 'purple' as const,
      category: 'open-source' as const,
      displayOrder: 3,
      featured: true,
      pinned: false,
      projectYear: 2025,
      shortDescription:
        'A compact collection of reusable backend primitives for production TypeScript services.',
      slug: 'service-foundations',
      status: 'completed' as const,
      title: 'Service Foundations',
      topics: [
        { name: 'typescript', slug: 'typescript' },
        { name: 'nodejs', slug: 'nodejs' },
        { name: 'open-source', slug: 'open-source' },
      ],
    },
  ]

  for (const project of seeds) {
    const existing = await payload.find({
      collection: 'projects',
      limit: 1,
      overrideAccess: true,
      where: { slug: { equals: project.slug } },
    })
    if (existing.docs.length) continue

    await payload.create({
      collection: 'projects',
      context: { disableRevalidate: true },
      data: {
        ...project,
        _status: 'published',
        overview: richText(project.title, [project.shortDescription]),
        publishedAt: new Date().toISOString(),
      },
      draft: false,
      overrideAccess: true,
    })
  }

  payload.logger.info('Portfolio seed complete')
}

await seed()
