import 'dotenv/config'

import { getPayload } from 'payload'

import type { BlogPost, Project } from '@/payload-types'
import config from '@/payload.config'

const textNode = (text: string) => ({
  detail: 0,
  format: 0,
  mode: 'normal',
  style: '',
  text,
  type: 'text',
  version: 1,
})

function richText(title: string, paragraphs: string[]): Project['overview'] {
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

function demoBlogBody(): BlogPost['body'] {
  const paragraph = (text: string) => ({
    children: [textNode(text)],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    textFormat: 0,
    textStyle: '',
    type: 'paragraph',
    version: 1,
  })
  const heading = (tag: 'h2' | 'h3' | 'h4', text: string) => ({
    children: [textNode(text)],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    tag,
    type: 'heading',
    version: 1,
  })
  const list = (items: string[]) => ({
    children: items.map((item, index) => ({
      children: [textNode(item)],
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      type: 'listitem',
      value: index + 1,
      version: 1,
    })),
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    listType: 'bullet',
    start: 1,
    tag: 'ul',
    type: 'list',
    version: 1,
  })

  return {
    root: {
      children: [
        heading('h2', 'Reliability starts at the boundary'),
        paragraph(
          'Background jobs look simple until retries, deployments, and partial failures happen at the same time. A reliable worker makes those conditions explicit instead of treating them as edge cases.',
        ),
        paragraph(
          'The useful question is not whether a job can fail. It is whether the system can retry that job without producing an incorrect result.',
        ),
        heading('h3', 'Three guarantees worth designing for'),
        list([
          'Idempotency: processing the same job more than once produces the same final state.',
          'Visibility: operators can see attempts, latency, failures, and the reason a job was retried.',
          'Bounded retries: transient faults recover automatically while permanent faults stop consuming capacity.',
        ]),
        {
          children: [
            textNode(
              'Retries are a normal execution path. Design them with the same care as the first attempt.',
            ),
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'quote',
          version: 1,
        },
        heading('h3', 'A small worker contract'),
        paragraph(
          'Keep transport concerns outside the handler. The handler should receive validated input, an idempotency key, and an execution context that makes cancellation observable.',
        ),
        {
          fields: {
            blockName: 'Reliable worker contract',
            blockType: 'Code',
            code: `type JobContext = {
  idempotencyKey: string
  signal: AbortSignal
}

export async function handleJob(
  input: JobInput,
  context: JobContext,
) {
  await store.transaction(async (tx) => {
    if (await tx.hasProcessed(context.idempotencyKey)) return
    await applyJob(input, tx)
    await tx.markProcessed(context.idempotencyKey)
  })
}`,
            language: 'typescript',
          },
          format: '',
          type: 'block',
          version: 2,
        },
        heading('h3', 'Operational checklist'),
        list([
          'Use exponential backoff with jitter.',
          'Send exhausted jobs to a dead-letter queue with enough context to replay safely.',
          'Alert on failure rate and queue age rather than individual failures.',
          'Test deployment shutdown so in-flight work is released or completed predictably.',
        ]),
        heading('h4', 'The practical result'),
        paragraph(
          'A production worker is less about clever queue code and more about clear boundaries. When ownership, retry behavior, and observability are explicit, failures become routine operational events instead of data incidents.',
        ),
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      type: 'root',
      version: 1,
    },
  } as BlogPost['body']
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
        'Building AI-powered web and desktop products with React, Next.js, NestJS, Python, and production-grade infrastructure.',
      heroHeadline: 'Your request\nhas been handled.',
      contact: {
        email: 'soumojitghosh02@gmail.com',
        intro:
          'Have an AI-powered web or desktop product, fullstack application, API, or infrastructure problem worth solving? Send the context and I will get back to you.',
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

  const demoPostSlug = 'designing-reliable-background-jobs'
  const existingDemoPost = await payload.find({
    collection: 'blog-posts',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { slug: { equals: demoPostSlug } },
  })

  if (!existingDemoPost.docs.length) {
    await payload.create({
      collection: 'blog-posts',
      context: { disableRevalidate: true },
      data: {
        _status: 'published',
        body: demoBlogBody(),
        excerpt:
          'A practical guide to idempotency, bounded retries, visibility, and predictable background-job execution.',
        issueNumber: 0,
        labels: [{ name: 'backend' }, { name: 'distributed-systems' }, { name: 'typescript' }],
        publishedAt: '2026-07-18T09:30:00.000Z',
        readingMinutes: 1,
        slug: demoPostSlug,
        title: 'Designing reliable background jobs',
      },
      draft: false,
      overrideAccess: true,
    })
  }

  payload.logger.info('Portfolio seed complete')
  await payload.destroy()
}

await seed()
