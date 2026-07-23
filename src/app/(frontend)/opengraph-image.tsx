import { getSocialPreviewIdentity } from '@/lib/social-preview-data'
import { renderSocialPreview, socialPreviewSize } from '@/lib/social-preview'
import { siteName, siteRole } from '@/lib/seo'

export const alt = `${siteName} — ${siteRole}`
export const contentType = 'image/png'
export const revalidate = 300
export const size = socialPreviewSize

export default async function OpenGraphImage() {
  const identity = await getSocialPreviewIdentity()

  return renderSocialPreview({
    command: 'soumajit@portfolio:~$ whoami',
    description: siteRole,
    eyebrow: 'portfolio / soumajit.dev',
    identity,
    meta: ['production-ready'],
    tags: ['typescript', 'next.js', 'payload cms'],
    title: siteName,
  })
}
