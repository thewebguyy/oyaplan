import { ImageResponse } from 'next/og';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Fetch plan and spot details
  const { data: plan } = await supabase
    .from('shared_plans')
    .select('*, spot:spots(*)')
    .eq('id', id)
    .single();

  if (!plan) {
    return new Response('Not Found', { status: 404 });
  }

  const spotName = plan.spot?.name || 'Unknown Spot';
  const address = plan.spot?.address || 'Lagos, Nigeria';
  const totalCost = plan.total_cost.toLocaleString();
  const foodCost = plan.food_cost.toLocaleString();
  const transportCost = plan.transport_cost.toLocaleString();
  const vibe = plan.vibe;
  const squadSize = plan.squad_size;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'white',
        }}
      >
        {/* Left Side: Green */}
        <div
          style={{
            width: '60%',
            height: '100%',
            background: '#008751',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '60px',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Wordmark */}
            <div style={{ display: 'flex', fontSize: 32, fontWeight: 900, letterSpacing: '-0.04em' }}>
              <span style={{ color: '#008751' }}>Oya</span>
              <span style={{ color: '#F6C642' }}>Plan</span>
            </div>

            <div style={{ display: 'flex', fontSize: 20, color: '#F6C642', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '12px' }}>
              {vibe} Outing • {squadSize} People
            </div>
            
            <div style={{ fontSize: 64, fontWeight: 900, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '20px' }}>
              {spotName}
            </div>

            <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.7)', fontWeight: 500, maxWidth: '500px' }}>
              {address}
            </div>
          </div>

          <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>
            oyaplan.com
          </div>
        </div>

        {/* Right Side: White */}
        <div
          style={{
            width: '40%',
            height: '100%',
            background: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '60px',
            borderLeft: '1px solid #E8E8E8',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '40px' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
              Total Cost
            </div>
            <div style={{ fontSize: 56, fontWeight: 900, color: '#008751', letterSpacing: '-0.02em' }}>
              ₦{totalCost}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Food & Drinks
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#0A0A0A' }}>
                ₦{foodCost}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Transport
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#0A0A0A' }}>
                ₦{transportCost}
              </div>
            </div>
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
