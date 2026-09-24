import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#07150E',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          fontFamily: 'sans-serif',
          padding: '80px',
          border: '12px solid #008751',
        }}
      >
        {/* Top Header: Wordmark + Business Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', fontSize: 44, fontWeight: 900, letterSpacing: '-0.05em' }}>
            <span style={{ color: 'white' }}>Oya</span>
            <span style={{ color: '#F6C642' }}>Plan</span>
          </div>
          <div
            style={{
              background: '#008751',
              color: '#FFFFFF',
              fontSize: 20,
              fontWeight: 800,
              padding: '6px 18px',
              borderRadius: '999px',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            For Business
          </div>
        </div>

        {/* Center: Main Positioning */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px' }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 900,
              color: 'white',
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
            }}
          >
            More Squads. Zero Empty Seats.
          </div>
          <div
            style={{
              fontSize: 32,
              color: '#A3F3C6',
              fontWeight: 600,
              lineHeight: 1.3,
            }}
          >
            Control how your restaurant, lounge, or spot appears when Lagos squads plan where to spend.
          </div>
        </div>

        {/* Footer Bar */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '2px solid rgba(255, 255, 255, 0.15)',
            paddingTop: '30px',
          }}
        >
          <div style={{ fontSize: 22, color: 'rgba(255, 255, 255, 0.7)', fontWeight: 600 }}>
            Lagos Hospitality Partner Network
          </div>
          <div style={{ fontSize: 24, color: '#FCD116', fontWeight: 800 }}>
            oyaplan.com/for-business
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
