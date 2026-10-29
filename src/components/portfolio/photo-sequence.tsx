'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import type { CreativePhoto } from '@/lib/creative-content'

export function PhotoSequence({ images, title }: { images: CreativePhoto[]; title: string }) {
  const [index, setIndex] = useState<number | null>(null)
  const [failed, setFailed] = useState<string | null>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const trigger = useRef<HTMLAnchorElement | null>(null)
  const close = useRef<HTMLButtonElement>(null)
  const open = index !== null
  const photo = index === null ? null : images[index]

  useEffect(() => {
    if (!open) return
    const element = dialog.current!
    const previousOverflow = document.body.style.overflow
    const previousFocus = trigger.current
    element.showModal()
    document.body.style.overflow = 'hidden'
    close.current?.focus({ preventScroll: true })
    return () => {
      element.close()
      document.body.style.overflow = previousOverflow
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true })
    }
  }, [open])

  function move(direction: number) {
    setIndex((current) =>
      current === null ? null : (current + direction + images.length) % images.length,
    )
  }

  return (
    <>
      <div className="photo-sequence">
        {images.map((image) => (
          <figure key={image.id}>
            <a
              href={image.src}
              aria-label={`View photograph: ${image.alt}`}
              onClick={(event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
                event.preventDefault()
                trigger.current = event.currentTarget
                setIndex(images.findIndex((item) => item.id === image.id))
              }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                sizes="(max-width: 767px) 100vw, 80vw"
              />
            </a>
            {image.caption || image.location || image.date ? (
              <figcaption>
                {[image.caption, image.location, image.date].filter(Boolean).join(' · ')}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
      <dialog
        ref={dialog}
        className="photo-viewer"
        aria-label={`${title} photo viewer`}
        onClose={() => setIndex(null)}
        onKeyDown={(event) => {
          if (event.key === 'Tab') {
            const controls = Array.from(
              event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]'),
            )
            const first = controls[0]
            const last = controls[controls.length - 1]
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault()
              last?.focus()
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault()
              first?.focus()
            }
          }
          if (event.key === 'ArrowRight') {
            event.preventDefault()
            move(1)
          }
          if (event.key === 'ArrowLeft') {
            event.preventDefault()
            move(-1)
          }
        }}
      >
        {photo ? (
          <div className="photo-viewer-content">
            <div className="photo-viewer-toolbar">
              <span>{title}</span>
              <button ref={close} type="button" onClick={() => dialog.current?.close()}>
                Close <span aria-hidden="true">×</span>
              </button>
            </div>
            <figure>
              {failed === photo.id ? (
                <div className="photo-unavailable">
                  <p>This photograph could not be loaded.</p>
                  <a href={photo.src}>Open original image ↗</a>
                </div>
              ) : (
                <Image
                  key={photo.id}
                  src={photo.src}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  sizes="100vw"
                  onError={() => setFailed(photo.id)}
                />
              )}
              <figcaption aria-live="polite">
                <span>
                  {[photo.caption || photo.alt, photo.location, photo.date]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
                <span>
                  {index! + 1} / {images.length}
                </span>
              </figcaption>
            </figure>
            <div className="photo-viewer-controls">
              <button type="button" disabled={images.length < 2} onClick={() => move(-1)}>
                ← Previous
              </button>
              <button type="button" disabled={images.length < 2} onClick={() => move(1)}>
                Next →
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  )
}
