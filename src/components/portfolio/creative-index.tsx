import Image from 'next/image'
import Link from 'next/link'
import type { CreativeCollection } from '@/lib/creative-content'

export function CreativeIndex({ collections }: { collections: CreativeCollection[] }) {
  return (
    <div className="creative-index">
      {collections.map((collection) => {
        const cover = collection.images.find((image) => image.id === collection.coverImageId)
        if (!cover) return null
        return (
          <article key={collection.id}>
            <Link href={`/creative/${collection.slug}`} className="collection-cover">
              <Image
                src={cover.src}
                alt={cover.alt}
                width={cover.width}
                height={cover.height}
                sizes="(max-width: 767px) 100vw, 65vw"
                style={{ objectPosition: `${cover.focalX}% ${cover.focalY}%` }}
              />
              <div>
                <h2>{collection.title}</h2>
                <span aria-hidden="true">↗</span>
              </div>
            </Link>
            {collection.description ? <p>{collection.description}</p> : null}
          </article>
        )
      })}
    </div>
  )
}
