/**
 * Preview-only photography navigation data.
 *
 * Replace this with published Payload CMS records when the photography
 * collections and photo-story content types are implemented.
 */
export const photographyCollections = [
  {
    slug: 'birds-wildlife',
    title: 'Birds & Wildlife',
    description: 'Birdlife, animal behavior, and quiet encounters in the natural world.',
  },
  {
    slug: 'nature-countryside',
    title: 'Nature & Countryside',
    description: 'Landscapes, changing seasons, and everyday scenes close to home.',
  },
] as const

export const storyLayoutPreviewSlug = 'sample-story'

export function findPhotographyCollection(slug: string) {
  return photographyCollections.find((collection) => collection.slug === slug)
}

export type PhotographyImage = {
  // Use a Payload media URL and the original dimensions for responsive images.
  src: string
  alt: string
  width: number
  height: number
}

export type SelectedPhotograph = PhotographyImage & {
  id: string
  title: string
  caption?: string
  camera?: string
  lens?: string
  location?: string
  date?: string // Human-readable display date from the photo record.
}

type PhotographyLandingContent = {
  hero?: PhotographyImage
  selected: readonly SelectedPhotograph[]
  collectionCovers: Partial<Record<(typeof photographyCollections)[number]['slug'], PhotographyImage>>
  featuredStory?: {
    slug: string
    title: string
    summary: string
    cover: PhotographyImage
  }
}

// Populate this boundary with curated, published records once a photography
// source exists. Generic Media uploads carry no photography publication status.
export const photographyLandingContent: PhotographyLandingContent = {
  selected: [],
  collectionCovers: {},
}
