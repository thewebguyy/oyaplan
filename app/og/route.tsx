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
          padding: '40px',
        }}
      >
        {/* Wordmark */}
        <div style={{ display: 'flex', fontSize: 48, fontWeight: 900, letterSpacing: '-0.05em', marginBottom: '20px' }}>
          <span style={{ color: 'white' }}>Oya</span>
          <span style={{ color: '#FCD116' }}>Plan</span>
        </div>

        {/* Rule */}
        <div style={{ width: '80%', height: '2px', background: 'white', opacity: 0.2, marginBottom: '60px' }} />

        {/* Headline */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: 'white',
            textAlign: 'center',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            maxWidth: '900px',
            marginBottom: '24px',
          }}
        >
          Find where to go. Know what it&apos;ll cost.
        </div>
        
        <div
          style={{
            fontSize: 40,
            color: '#FCD116',
            textAlign: 'center',
            fontWeight: 700,
          }}
        >
          In seconds.
        </div>

        {/* Footer Tagline */}
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            right: 80,
            fontSize: 24,
            color: 'white',
            fontWeight: 700,
            opacity: 0.6,
          }}
        >
          Lagos Squad Planner
        </div>
        
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: 80,
            fontSize: 20,
            color: 'white',
            opacity: 0.4,
          }}
        >
          oyaplan.com
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
