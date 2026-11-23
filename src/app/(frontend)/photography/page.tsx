import { ArrowRight, ArrowUpRight, ImageIcon } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { PageContainer } from '@/components/page-container'
import {
  photographyCollections,
  photographyLandingContent,
  storyLayoutPreviewSlug,
} from '@/lib/photography'
import { siteName } from '@/lib/seo'

import { PhotographyGrid } from './photography-grid'
import styles from './photography.module.css'

const description = 'Wildlife, nature, and countryside photography by Soumajit Ghosh.'
const socialTitle = `Photography | ${siteName}`
const wideImageSizes =
  '(min-width: 1232px) 1152px, (min-width: 640px) calc(100vw - 5rem), calc(100vw - 2.5rem)'
const coverImageSizes =
  '(min-width: 1232px) 560px, (min-width: 768px) calc(50vw - 3.5rem), (min-width: 640px) calc(100vw - 5rem), calc(100vw - 2.5rem)'

export const metadata: Metadata = {
  alternates: { canonical: '/photography' },
  description,
  openGraph: {
    description,
    locale: 'en_IN',
    siteName: 'soumajit.dev',
    title: socialTitle,
    type: 'website',
    url: '/photography',
  },
  title: 'Photography',
  twitter: { card: 'summary_large_image', description, title: socialTitle },
}

function ImagePlaceholder({ label }: { label: string }) {
  return (
    <div className={styles.placeholder}>
      <span>
        <ImageIcon aria-hidden="true" size={24} strokeWidth={1.3} />
        {label}
      </span>
    </div>
  )
}

function PhotographyHero({ hero }: Pick<typeof photographyLandingContent, 'hero'>) {
  return (
    <header className={styles.hero}>
      <PageContainer className={styles.container}>
        <div className={styles.heroIntro}>
          <div>
            <p className={styles.overline}>SOUMAJIT GHOSH / PHOTOGRAPHY</p>
            <h1>Through my lens.</h1>
          </div>
          <p className={styles.subtitle}>Wildlife, nature, and moments worth remembering.</p>
        </div>

        {hero ? (
          <Image
            alt={hero.alt}
            className={styles.heroImage}
            height={hero.height}
            preload
            sizes={wideImageSizes}
            src={hero.src}
            width={hero.width}
          />
        ) : (
          <div className={styles.heroPlaceholder}>
            <ImagePlaceholder label="No featured photograph yet" />
          </div>
        )}
      </PageContainer>
    </header>
  )
}

function SelectedPhotographs({ selected }: Pick<typeof photographyLandingContent, 'selected'>) {
  return (
    <section aria-labelledby="selected-photographs" className={`${styles.section} ${styles.dark}`}>
      <PageContainer className={styles.container}>
        <h2 className={styles.sectionHeading} id="selected-photographs">A few favourite frames.</h2>
        {selected.length ? (
          <PhotographyGrid photos={selected} />
        ) : (
          <div className={styles.empty}>
            <p>No selected photographs have been published yet.</p>
          </div>
        )}
      </PageContainer>
    </section>
  )
}

function FeaturedCollections({
  collectionCovers,
}: Pick<typeof photographyLandingContent, 'collectionCovers'>) {
  return (
    <section
      aria-labelledby="photography-collections"
      className={`${styles.section} ${styles.collections}`}
    >
      <PageContainer className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionHeading} id="photography-collections">Explore by subject.</h2>
          <Link className={styles.textLink} href="/photography/collections">
            View all collections <ArrowRight aria-hidden="true" size={17} />
          </Link>
        </div>
        <ul className={styles.collectionGrid}>
          {photographyCollections.map(({ description, slug, title }) => {
            const cover = collectionCovers[slug]

            return (
              <li key={slug}>
                <Link className={styles.collectionCard} href={`/photography/collections/${slug}`}>
                  <div className={styles.collectionCover}>
                    {cover ? (
                      <Image alt={cover.alt} fill sizes={coverImageSizes} src={cover.src} />
                    ) : (
                      <ImagePlaceholder label="Cover not yet published" />
                    )}
                  </div>
                  <div className={styles.collectionCopy}>
                    <div>
                      <h3>{title}</h3>
                      <p>{description}</p>
                    </div>
                    <span className={styles.cardArrow}>
                      <ArrowUpRight aria-hidden="true" size={20} strokeWidth={1.6} />
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </PageContainer>
    </section>
  )
}

function PhotoStoriesPreview({
  featuredStory,
}: Pick<typeof photographyLandingContent, 'featuredStory'>) {
  const story = featuredStory?.slug === storyLayoutPreviewSlug ? undefined : featuredStory

  return (
    <section aria-labelledby="photo-stories" className={`${styles.section} ${styles.dark}`}>
      <PageContainer className={styles.container}>
        <h2 className={styles.sectionHeading} id="photo-stories">Stories in frames.</h2>
        {story ? (
          <article className={styles.story}>
            <Link className={styles.storyLink} href={`/photography/stories/${story.slug}`}>
              <div className={styles.storyCover}>
                <Image alt={story.cover.alt} fill sizes={wideImageSizes} src={story.cover.src} />
              </div>
              <div className={styles.storyCopy}>
                <div>
                  <h3>{story.title}</h3>
                  <p>{story.summary}</p>
                </div>
                <span className={styles.cardArrow}>
                  <ArrowUpRight aria-hidden="true" size={20} strokeWidth={1.6} />
                </span>
              </div>
            </Link>
          </article>
        ) : (
          <div className={styles.empty}>
            <p>No photo stories have been published yet.</p>
            <Link className={styles.textLink} href="/photography/stories">
              View photo stories <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </div>
        )}
      </PageContainer>
    </section>
  )
}

export default function PhotographyPage() {
  const { collectionCovers, featuredStory, hero, selected } = photographyLandingContent

  return (
    <main className={styles.page}>
      <PhotographyHero hero={hero} />
      <SelectedPhotographs selected={selected} />
      <FeaturedCollections collectionCovers={collectionCovers} />
      <PhotoStoriesPreview featuredStory={featuredStory} />
    </main>
  )
}
