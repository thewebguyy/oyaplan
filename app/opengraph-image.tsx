import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'OyaPlan: The Squad Outing Plan'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#008751',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          color: 'white',
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 24,
            lineHeight: 1.2,
          }}
        >
          Stop the group chat wahala.<br />Get your Lagos plan in seconds.
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
