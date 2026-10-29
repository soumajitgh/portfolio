import { cache } from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'
import {
  creativeCollectionRecords,
  type CreativeCollection,
  type CreativePhoto,
} from '@/lib/creative-content'

export const getCreativeCollections = cache(async (): Promise<CreativeCollection[]> => {
  if (!creativeCollectionRecords.length) return []
  const ids = [
    ...new Set(
      creativeCollectionRecords.flatMap((collection) =>
        collection.images.map((image) => image.mediaId),
      ),
    ),
  ]
  if (!ids.length) return []
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'media',
    depth: 0,
    overrideAccess: false,
    pagination: false,
    limit: ids.length,
    where: { id: { in: ids } },
  })
  const mediaById = new Map(result.docs.map((media) => [media.id, media]))
  return creativeCollectionRecords
    .map((collection) => ({
      ...collection,
      images: collection.images
        .flatMap((image) => {
          const media = mediaById.get(image.mediaId)
          if (
            !media?.url ||
            !media.width ||
            !media.height ||
            !media.alt ||
            !media.mimeType?.startsWith('image/')
          )
            return []
          return [
            {
              id: image.id,
              collectionId: collection.id,
              src: media.url,
              width: media.width,
              height: media.height,
              alt: media.alt,
              order: image.order,
              focalX: media.focalX ?? 50,
              focalY: media.focalY ?? 50,
              caption: image.caption || media.caption || undefined,
              location: image.location,
              date: image.date,
            } satisfies CreativePhoto,
          ]
        })
        .sort((a, b) => a.order - b.order),
    }))
    .filter(
      (collection) =>
        collection.images.length &&
        collection.images.some((image) => image.id === collection.coverImageId),
    )
    .sort((a, b) => a.order - b.order)
})
