import { getBlogFeedPosts } from '@/lib/blog-data'

export const revalidate = 300
export const dynamic = 'force-dynamic'

const escapeXML = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')

export async function GET() {
  const siteURL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
  const posts = await getBlogFeedPosts()
  const items = posts
    .map(
      (post) => `<item>
  <title>${escapeXML(post.title)}</title>
  <link>${siteURL}/blogs/${encodeURIComponent(post.slug)}</link>
  <guid isPermaLink="true">${siteURL}/blogs/${encodeURIComponent(post.slug)}</guid>
  <description>${escapeXML(post.excerpt || '')}</description>
  ${post.publishedAt ? `<pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>` : ''}
  ${post.labels?.map((label) => `<category>${escapeXML(label.name)}</category>`).join('\n  ') || ''}
</item>`,
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>soumajit in ~/blogs</title>
  <link>${siteURL}/blogs</link>
  <description>Notes on backend systems, infrastructure, and developer tooling.</description>
  <language>en</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  ${items}
</channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
