import { createElement } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { PhotoSequence } from '@/components/portfolio/photo-sequence'
import type { CreativePhoto } from '@/lib/creative-content'

vi.mock('next/image', () => ({ default: (props: object) => createElement('img', props) }))
const images: CreativePhoto[] = [0, 1].map((order) => ({
  id: `test-${order}`,
  collectionId: 'test-only',
  src: `/test-${order}.jpg`,
  alt: `Test photograph ${order}`,
  width: 600,
  height: 400,
  order,
  focalX: 50,
  focalY: 50,
  caption: `Caption ${order}`,
}))
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '')
  }
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
})
afterEach(cleanup)

describe('Photo viewer', () => {
  it('opens the selected image, navigates with keys and restores focus and scrolling on close', () => {
    render(createElement(PhotoSequence, { images, title: 'Test collection' }))
    const trigger = screen.getByRole('link', { name: 'View photograph: Test photograph 0' })
    fireEvent.click(trigger)
    const viewer = screen.getByRole('dialog')
    expect(document.body.style.overflow).toBe('hidden')
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /Close/ }))
    const next = screen.getByRole('button', { name: 'Next →' })
    next.focus()
    fireEvent.keyDown(viewer, { key: 'Tab' })
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /Close/ }))
    fireEvent.keyDown(viewer, { key: 'ArrowRight' })
    expect(viewer.textContent).toContain('Caption 1')
    fireEvent.keyDown(viewer, { key: 'ArrowLeft' })
    expect(viewer.textContent).toContain('Caption 0')
    fireEvent.click(screen.getByRole('button', { name: /Close/ }))
    expect(document.body.style.overflow).toBe('')
    expect(document.activeElement).toBe(trigger)
  })
  it('shows a useful fallback for a failed full image and cleans up on navigation', () => {
    const { unmount } = render(createElement(PhotoSequence, { images, title: 'Test collection' }))
    fireEvent.click(screen.getByRole('link', { name: 'View photograph: Test photograph 1' }))
    const viewer = screen.getByRole('dialog')
    fireEvent.error(viewer.querySelector('img')!)
    expect(viewer.textContent).toContain('could not be loaded')
    expect(screen.getByRole('link', { name: /Open original/ }).getAttribute('href')).toBe(
      '/test-1.jpg',
    )
    unmount()
    expect(document.body.style.overflow).toBe('')
  })
})
