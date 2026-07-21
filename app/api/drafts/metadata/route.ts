// app/api/drafts/metadata/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  try {
    // Create client inside handler to avoid build-time initialization
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }
    
    const supa = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });
    
    const url = new URL(req.url);
    const noteKey = url.searchParams.get('noteKey');
    if (!noteKey) return NextResponse.json({ error: 'noteKey required' }, { status: 400 });

    const { data, error } = await supa
      .from('note_drafts')
      .select('note_key, updated_at, user_id, payload')
      .eq('note_key', noteKey)
      .single();

    if (error && error.code === 'PGRST116') {
      // not found
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    if (error) {
      console.error('metadata fetch error', error);
      return NextResponse.json({ error: error.message || 'DB error' }, { status: 500 });
    }

    if (!data) return NextResponse.json({ exists: false }, { status: 200 });

    return NextResponse.json({
      exists: true,
      noteKey: data.note_key,
      updatedAt: data.updated_at,
      userId: data.user_id,
      payload: data.payload,
    });
  } catch (e: any) {
    console.error('metadata route error', e);
    return NextResponse.json({ error: e?.message || 'Server error' }, { status: 500 });
  }
}

export const runtime = 'edge';
