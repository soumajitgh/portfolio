import { getSocialPreviewIdentity } from '@/lib/social-preview-data'
import { renderSocialPreview, socialPreviewSize } from '@/lib/social-preview'

export const alt = 'Soumajit Ghosh — backend engineer'
export const contentType = 'image/png'
export const revalidate = 300
export const size = socialPreviewSize

export default async function OpenGraphImage() {
  const identity = await getSocialPreviewIdentity()

  return renderSocialPreview({
    command: 'soumajit@portfolio:~$ whoami',
    description:
      'Backend systems, APIs, and infrastructure built to stay calm while everything else is on fire.',
    eyebrow: 'backend engineer / portfolio',
    identity,
    meta: ['production-ready'],
    tags: ['apis', 'distributed-systems', 'infrastructure'],
    title: 'I make servers look unbothered.',
  })
}
