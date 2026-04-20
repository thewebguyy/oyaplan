import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
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
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            color: 'white',
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          Stop the group chat wahala.
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#FCD116',
            textAlign: 'center',
            marginBottom: 80,
          }}
        >
          Get your Lagos plan in 60 seconds.
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            right: 40,
            fontSize: 24,
            color: 'white',
            fontWeight: 'bold',
          }}
        >
          OyaPlan.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
