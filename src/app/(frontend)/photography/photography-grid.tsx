'use client'

import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import Image from 'next/image'
import { type KeyboardEvent, type MouseEvent, useRef, useState } from 'react'

import type { SelectedPhotograph } from '@/lib/photography'

import styles from './photography.module.css'

const fullWidth = '(min-width: 640px) calc(100vw - 5rem), calc(100vw - 2.5rem)'

export function PhotographyGrid({ photos }: { photos: readonly SelectedPhotograph[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const openerRef = useRef<HTMLAnchorElement>(null)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const photo = activeIndex === null ? undefined : photos[activeIndex]
  const hasMultiplePhotos = photos.length > 1
  const thumbnailSizes = [
    'auto',
    photos.length >= 3 && '(min-width: 1232px) 371px, (min-width: 1024px) 30vw',
    hasMultiplePhotos
      ? '(min-width: 1232px) 566px, (min-width: 600px) 46vw'
      : '(min-width: 1232px) 1152px',
    fullWidth,
  ].filter(Boolean).join(', ')

  function openPhoto(event: MouseEvent<HTMLAnchorElement>, index: number) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return

    const dialog = dialogRef.current
    if (!dialog || typeof dialog.showModal !== 'function') return

    event.preventDefault()
    openerRef.current = event.currentTarget
    setActiveIndex(index)
    dialog.showModal()
    closeRef.current?.focus()
  }

  function move(direction: number) {
    setActiveIndex((index) =>
      index === null ? index : (index + direction + photos.length) % photos.length,
    )
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDialogElement>) {
    if (!hasMultiplePhotos || event.altKey || event.ctrlKey || event.metaKey) return

    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      move(event.key === 'ArrowLeft' ? -1 : 1)
    }
  }

  return (
    <>
      <ul className={styles.photoGrid} role="list">
        {photos.map(({ id, title, src, alt, width, height }, index) => (
          <li key={id}>
            <a
              aria-haspopup="dialog"
              aria-label={`View photograph: ${title}`}
              className={styles.thumbnail}
              href={src}
              onClick={(event) => openPhoto(event, index)}
            >
              <Image alt={alt} height={height} sizes={thumbnailSizes} src={src} width={width} />
            </a>
          </li>
        ))}
      </ul>

      <dialog
        aria-label="Photograph viewer"
        className={styles.lightbox}
        onClose={() => openerRef.current?.focus({ preventScroll: true })}
        onKeyDown={handleKeyDown}
        ref={dialogRef}
      >
        <div className={styles.viewer}>
          <div className={styles.viewerToolbar}>
            <p aria-atomic="true" aria-live="polite" className={styles.viewerCount}>
              {photo && activeIndex !== null && `${activeIndex + 1} / ${photos.length} · ${photo.title}`}
            </p>
            <div className={styles.viewerControls}>
              {hasMultiplePhotos ? (
                <>
                  <button aria-label="Previous photograph" onClick={() => move(-1)} type="button">
                    <ChevronLeft aria-hidden="true" size={22} />
                  </button>
                  <button aria-label="Next photograph" onClick={() => move(1)} type="button">
                    <ChevronRight aria-hidden="true" size={22} />
                  </button>
                </>
              ) : null}
              <button
                aria-label="Close viewer"
                onClick={() => dialogRef.current?.close()}
                ref={closeRef}
                type="button"
              >
                <X aria-hidden="true" size={22} />
              </button>
            </div>
          </div>

          {photo ? <LightboxPhotograph key={photo.id} photo={photo} /> : null}
        </div>
      </dialog>
    </>
  )
}

function LightboxPhotograph({ photo }: { photo: SelectedPhotograph }) {
  const details = [photo.location, photo.date, photo.camera, photo.lens].filter(Boolean)

  return (
    <figure className={styles.viewerFrame}>
      <div className={styles.viewerImage}>
        <Image
          alt={photo.alt}
          fill
          loading="eager"
          sizes={`min(96vw, ${Math.round((photo.width / photo.height) * 100)}vh)`}
          src={photo.src}
        />
      </div>
      <figcaption className={styles.viewerCaption}>
        <h3>{photo.title}</h3>
        {photo.caption ? <p>{photo.caption}</p> : null}
        {details.length ? <p>{details.join(' · ')}</p> : null}
      </figcaption>
    </figure>
  )
}
