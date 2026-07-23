import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

export const socialPreviewSize = { height: 630, width: 1200 }

export type SocialPreviewIdentity = {
  name: string
  site: string
  socials: string[]
}

export type SocialPreviewContent = {
  backgroundImageURL?: string
  command: string
  description: string
  eyebrow: string
  identity: SocialPreviewIdentity
  meta?: string[]
  tags?: string[]
  title: string
}

const fontDirectory = path.join(process.cwd(), 'node_modules/geist/dist/fonts/geist-mono')

const loadFont = async (filename: string) => {
  const font = await readFile(path.join(fontDirectory, filename))
  return font.buffer.slice(font.byteOffset, font.byteOffset + font.byteLength) as ArrayBuffer
}

const geistMonoRegular = loadFont('GeistMono-Regular.ttf')
const geistMonoSemibold = loadFont('GeistMono-SemiBold.ttf')

const truncate = (value: string, limit: number) => {
  const normalized = value.trim().replace(/\s+/g, ' ')
  return normalized.length > limit ? `${normalized.slice(0, limit - 1).trimEnd()}…` : normalized
}

function titleSize(title: string) {
  if (title.length > 62) return 48
  if (title.length > 42) return 56
  return 66
}

export async function renderSocialPreview(content: SocialPreviewContent) {
  const [regularFont, semiboldFont] = await Promise.all([geistMonoRegular, geistMonoSemibold])
  const tags = (content.tags || []).filter(Boolean).slice(0, 3)
  const meta = (content.meta || []).filter(Boolean).slice(0, 3)
  const socialFooter = [content.identity.site, ...content.identity.socials.slice(0, 3)].join(
    '  ·  ',
  )

  return new ImageResponse(
    <div
      style={{
        background: '#171a1f',
        color: '#c8ccd4',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Geist Mono',
        height: '100%',
        overflow: 'hidden',
        padding: '58px 68px 48px',
        position: 'relative',
        width: '100%',
      }}
    >
      {content.backgroundImageURL ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse requires a plain image element. */}
          <img
            alt=""
            src={content.backgroundImageURL}
            style={{
              height: '100%',
              inset: 0,
              objectFit: 'cover',
              position: 'absolute',
              width: '100%',
            }}
          />
          <div
            style={{
              background:
                'linear-gradient(90deg, rgba(23,26,31,.97) 0%, rgba(23,26,31,.90) 56%, rgba(23,26,31,.58) 100%)',
              display: 'flex',
              inset: 0,
              position: 'absolute',
            }}
          />
        </>
      ) : null}
      <div
        style={{
          backgroundImage:
            'linear-gradient(rgba(53,60,73,.22) 1px, transparent 1px), linear-gradient(90deg, rgba(53,60,73,.18) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          display: 'flex',
          inset: 0,
          maskImage: 'linear-gradient(to bottom right, transparent 12%, black 75%)',
          opacity: 0.35,
          position: 'absolute',
        }}
      />

      <div
        style={{
          background: 'linear-gradient(90deg, #56b6c2, #61afef 44%, transparent 78%)',
          display: 'flex',
          height: 3,
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0,
        }}
      />

      <div
        style={{
          border: '1px solid rgba(53,60,73,.65)',
          borderRadius: 999,
          display: 'flex',
          height: 178,
          position: 'absolute',
          right: -58,
          top: 86,
          width: 178,
        }}
      />
      {[0, 1, 2].map((node) => (
        <div
          key={node}
          style={{
            background: node === 1 ? '#98c379' : '#56b6c2',
            border: '4px solid #171a1f',
            borderRadius: 999,
            display: 'flex',
            height: 16,
            opacity: 0.72,
            position: 'absolute',
            right: 78 + node * 48,
            top: 102 + (node % 2) * 74,
            width: 16,
          }}
        />
      ))}

      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          fontSize: 22,
          letterSpacing: '-0.02em',
          position: 'relative',
        }}
      >
        <span style={{ color: '#8b92a1' }}>{truncate(content.command, 72)}</span>
      </div>

      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          maxWidth: 960,
          paddingBottom: 12,
          paddingTop: 18,
          position: 'relative',
        }}
      >
        <div
          style={{
            color: '#56b6c2',
            display: 'flex',
            fontSize: 17,
            fontWeight: 600,
            letterSpacing: '0.12em',
            marginBottom: 15,
            textTransform: 'uppercase',
          }}
        >
          {truncate(content.eyebrow, 44)}
        </div>
        <div
          style={{
            color: '#e5e7eb',
            display: 'flex',
            fontSize: titleSize(content.title),
            fontWeight: 600,
            letterSpacing: '-0.055em',
            lineHeight: 1.06,
            maxWidth: 960,
          }}
        >
          {truncate(content.title, 82)}
        </div>
        <div
          style={{
            color: '#9ca3af',
            display: 'flex',
            fontSize: 24,
            lineHeight: 1.4,
            marginTop: 20,
            maxWidth: 930,
          }}
        >
          {truncate(content.description, 154)}
        </div>

        {tags.length || meta.length ? (
          <div style={{ alignItems: 'center', display: 'flex', marginTop: 24 }}>
            {tags.map((tag) => (
              <div
                key={tag}
                style={{
                  background: 'rgba(198,120,221,.08)',
                  border: '1px solid #3b4350',
                  borderRadius: 7,
                  color: '#c678dd',
                  display: 'flex',
                  fontSize: 16,
                  marginRight: 10,
                  padding: '7px 12px',
                }}
              >
                {truncate(tag.toLowerCase(), 24)}
              </div>
            ))}
            {meta.length ? (
              <div
                style={{
                  color: '#d6b66f',
                  display: 'flex',
                  fontSize: 16,
                  marginLeft: tags.length ? 10 : 0,
                }}
              >
                {meta.join('  ·  ')}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div
        style={{
          alignItems: 'center',
          borderTop: '1px solid #303642',
          display: 'flex',
          fontSize: 17,
          justifyContent: 'space-between',
          paddingTop: 22,
          position: 'relative',
        }}
      >
        <div style={{ color: '#c8ccd4', display: 'flex', fontWeight: 600 }}>
          {content.identity.name.toLowerCase()}
        </div>
        <div style={{ color: '#8b92a1', display: 'flex' }}>{socialFooter}</div>
      </div>
    </div>,
    {
      ...socialPreviewSize,
      fonts: [
        { data: regularFont, name: 'Geist Mono', style: 'normal', weight: 400 },
        { data: semiboldFont, name: 'Geist Mono', style: 'normal', weight: 600 },
      ],
    },
  )
}
