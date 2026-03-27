import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/keys/[id]/plugins
 * Return plugin flags stored on the API key (memory, lore, storyweaver, web_search_mode)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id: keyId } = await params;

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .select('id, memory_enabled, lore_enabled, lore_harvest_enabled, storyweaver_enabled, web_search_mode, user_id')
      .eq('id', keyId)
      .maybeSingle();

    if (error || !data) return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    if (data.user_id !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    return NextResponse.json({
      id: data.id,
      memoryEnabled: data.memory_enabled || false,
      loreEnabled: data.lore_enabled || false,
      loreHarvestEnabled: data.lore_harvest_enabled || false,
      storyweaverEnabled: data.storyweaver_enabled || false,
      webSearchMode: data.web_search_mode || 'off'
    });
  } catch (err: any) {
    console.error('[GET /api/keys/:id/plugins] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PATCH /api/keys/[id]/plugins
 * Update plugin flags for a specific API key (owner-only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id: keyId } = await params;

    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify ownership
    const { data: keyData, error: keyErr } = await supabaseAdmin
      .from('api_keys')
      .select('user_id')
      .eq('id', keyId)
      .maybeSingle();

    if (keyErr || !keyData) return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    if (keyData.user_id !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const updateData: any = {};

    if (typeof body.memoryEnabled === 'boolean') updateData.memory_enabled = body.memoryEnabled;
    if (typeof body.loreEnabled === 'boolean') updateData.lore_enabled = body.loreEnabled;
    if (typeof body.loreHarvestEnabled === 'boolean') updateData.lore_harvest_enabled = body.loreHarvestEnabled;
    if (typeof body.storyweaverEnabled === 'boolean') updateData.storyweaver_enabled = body.storyweaverEnabled;
    if (typeof body.webSearchMode === 'string') updateData.web_search_mode = body.webSearchMode;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ success: true });
    }

    const { error: updateErr } = await supabaseAdmin
      .from('api_keys')
      .update(updateData)
      .eq('id', keyId);

    if (updateErr) {
      console.error('[PATCH /api/keys/:id/plugins] Update error:', updateErr);
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[PATCH /api/keys/:id/plugins] Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
