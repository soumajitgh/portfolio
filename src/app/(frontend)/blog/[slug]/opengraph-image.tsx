import { ImageResponse } from 'next/og'

import { getPublishedBlogPost } from '@/lib/blog-data'

export const alt = 'soumajit.dev blog article'
export const contentType = 'image/png'
export const size = { height: 630, width: 1200 }

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPublishedBlogPost(slug)

  return new ImageResponse(
    <div
      style={{
        background: '#171a1f',
        color: '#c8ccd4',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'monospace',
        height: '100%',
        justifyContent: 'space-between',
        padding: '72px 84px',
        width: '100%',
      }}
    >
      <div style={{ color: '#56b6c2', display: 'flex', fontSize: 28 }}>
        ~/blog/#{post?.issueNumber || '404'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div style={{ color: '#98c379', display: 'flex', fontSize: 25 }}>$ cat issue.md</div>
        <div style={{ display: 'flex', fontSize: 58, fontWeight: 600, lineHeight: 1.12 }}>
          {post?.title || 'issue not found'}
        </div>
      </div>
      <div style={{ color: '#8b92a1', display: 'flex', fontSize: 25 }}>soumajit.dev</div>
    </div>,
    size,
  )
}
