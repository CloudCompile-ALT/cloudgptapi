import { NextRequest, NextResponse } from 'next/server';
import { getLogtoContext } from '@logto/next/server-actions';
import { logtoConfig } from '@/lib/logto';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { isAuthenticated, claims } = await getLogtoContext(logtoConfig);
    
    if (!isAuthenticated || !claims) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('role, plan')
      .eq('id', claims.sub)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch (err) {
    console.error('Profile API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
