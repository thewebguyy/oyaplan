import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

// We need a lightweight supabase client for the edge
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const planId = searchParams.get('id');

    if (!planId) {
      return new ImageResponse(
        (
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', backgroundColor: '#008751', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
            <h1 style={{ color: 'white', fontSize: 60, fontWeight: 900 }}>OyaPlan</h1>
            <p style={{ color: '#E4F4EC', fontSize: 30 }}>Know exactly where to go—and what it'll really cost.</p>
          </div>
        ),
        { width: 1200, height: 630 }
      );
    }

    // Fetch plan data from Supabase
    const { data: sharedPlan, error } = await supabase
      .from('shared_plans')
      .select('plan_data')
      .eq('id', planId)
      .single();

    if (error || !sharedPlan || !sharedPlan.plan_data) {
      throw new Error('Plan not found');
    }

    const plan = sharedPlan.plan_data as any;
    const spotName = plan.spot?.name || 'A great spot';
    const totalCost = plan.totalCost || 0;
    const squadSize = plan.input?.squadSize || 2;
    const vibe = plan.spot?.vibe_tags?.[0] || 'Chill';

    return new ImageResponse(
      (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          width: '100%', 
          height: '100%', 
          backgroundColor: '#008751', 
          padding: 80,
          fontFamily: 'sans-serif'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ 
                color: '#008751', 
                backgroundColor: 'white',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 24,
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: 2
              }}>
                {vibe} Vibe
              </span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ color: 'white', fontSize: 80, fontWeight: 900, lineHeight: 1 }}>
                ₦{totalCost.toLocaleString()}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 32, marginTop: 10 }}>
                Total for {squadSize} {squadSize === 1 ? 'person' : 'people'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flex: 1 }} />

          {/* Footer / Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <h1 style={{ 
              color: 'white', 
              fontSize: 90, 
              fontWeight: 900, 
              lineHeight: 1.1,
              marginBottom: 20
            }}>
              {spotName}
            </h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <span style={{ color: '#F7C325', fontSize: 40, fontWeight: 700 }}>OyaPlan</span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 40 }}>|</span>
              <span style={{ color: 'white', fontSize: 30 }}>The exact cost of your next outing.</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    return new ImageResponse(
      (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', backgroundColor: '#008751', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ color: 'white', fontSize: 60, fontWeight: 900 }}>OyaPlan</h1>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}
