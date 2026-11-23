import { ImageResponse } from 'next/og'

export const alt = 'Through my lens. Photography by Soumajit Ghosh'
export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#f7f6f2',
          color: '#20201e',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          padding: 90,
          width: '100%',
        }}
      >
        <div style={{ color: '#8c4b32', fontSize: 24, letterSpacing: 4 }}>
          SOUMAJIT GHOSH / PHOTOGRAPHY
        </div>
        <div style={{ fontSize: 104, marginTop: 10 }}>Through my lens.</div>
        <div style={{ color: '#5e5e59', fontSize: 32, marginTop: 14 }}>
          Wildlife, nature, and moments worth remembering.
        </div>
      </div>
    ),
    size,
  )
}
