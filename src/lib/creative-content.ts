/** Curated membership for existing Payload media. No demo/stock imagery belongs here.
 * Add only photographs owned by Soumajit (or explicitly approved for his portfolio).
 * The Media collection remains the source of URL, dimensions, alt and focal point.
 */
export type CreativeCollectionRecord = {
  id: string
  slug: string
  title: string
  description?: string
  order: number
  coverImageId: string
  images: Array<{
    id: string
    mediaId: number
    order: number
    caption?: string
    location?: string
    date?: string
  }>
}

export type CreativePhoto = {
  id: string
  collectionId: string
  src: string
  width: number
  height: number
  alt: string
  order: number
  focalX: number
  focalY: number
  caption?: string
  location?: string
  date?: string
}
export type CreativeCollection = Omit<CreativeCollectionRecord, 'images'> & {
  images: CreativePhoto[]
}

// Intentionally empty: no personal photographs have been supplied or verified.
export const creativeCollectionRecords: CreativeCollectionRecord[] = []
