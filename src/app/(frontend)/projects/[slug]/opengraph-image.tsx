import { getProjectSocialPreview, getSocialPreviewIdentity } from '@/lib/social-preview-data'
import { renderSocialPreview, socialPreviewSize } from '@/lib/social-preview'

export const alt = 'Backend project by Soumajit Ghosh'
export const contentType = 'image/png'
export const revalidate = 300
export const size = socialPreviewSize

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [identity, project] = await Promise.all([
    getSocialPreviewIdentity(),
    getProjectSocialPreview(slug),
  ])

  return renderSocialPreview({
    backgroundImageURL: project?.socialImage,
    command: `~/projects/${project?.slug || slug}`,
    description: project?.shortDescription || 'The requested project is not publicly available.',
    eyebrow: project ? `project / ${project.status}` : 'project / not-found',
    identity,
    meta: project ? [`${project.starCount} ${project.starCount === 1 ? 'star' : 'stars'}`] : [],
    tags: project?.topics?.map((topic) => topic.slug) || [],
    title: project?.title || 'Project not found',
  })
}
