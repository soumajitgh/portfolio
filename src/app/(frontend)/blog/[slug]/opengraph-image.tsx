import { getBlogSocialPreview, getSocialPreviewIdentity } from '@/lib/social-preview-data'
import { renderSocialPreview, socialPreviewSize } from '@/lib/social-preview'

export const alt = 'Technical blog article by Soumajit Ghosh'
export const contentType = 'image/png'
export const revalidate = 300
export const size = socialPreviewSize

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [identity, post] = await Promise.all([
    getSocialPreviewIdentity(),
    getBlogSocialPreview(slug),
  ])
  const publishedYear = post?.publishedAt
    ? new Date(post.publishedAt).getUTCFullYear().toString()
    : ''

  return renderSocialPreview({
    command: `~/blog/#${post?.issueNumber || '404'}`,
    description: post?.excerpt || 'The requested issue is not publicly available.',
    eyebrow: post ? `blog issue / #${post.issueNumber}` : 'blog issue / not-found',
    identity,
    meta: publishedYear ? [`published ${publishedYear}`] : [],
    tags: post?.labels?.map((label) => label.name) || [],
    title: post?.title || 'Issue not found',
  })
}
