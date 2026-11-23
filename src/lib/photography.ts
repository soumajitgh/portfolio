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
