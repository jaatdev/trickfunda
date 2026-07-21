// app/api/presence/leave/route.ts
import { NextResponse } from 'next/server';
import { requireAdminFromCookies } from '@/lib/adminAuth';
import rateLimit from '@/lib/rateLimiter';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

/**
 * POST { noteKey, userId }
 * Removes presence row when user leaves
 */
export async function POST(req: Request) {
  // Verify Clerk auth via cookies (App Router)
  const auth = await requireAdminFromCookies();
  
  // Log auth failure but don't block presence updates in development
  if (!auth.ok) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[Presence] Auth failed but processing in dev:', auth.message);
    } else {
      return NextResponse.json({ error: auth.message }, { status: auth.status || 401 });
    }
  }

  const supa = createServerSupabaseClient();
  if (!supa) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
  }

  try {
    const { noteKey, userId } = await req.json();
    
    if (!noteKey || !userId) {
      return NextResponse.json({ error: 'noteKey and userId required' }, { status: 400 });
    }

    // Rate limit: 30 leaves per minute per user (leaving a note should be rare)
    const rlKey = `leave:${userId}`;
    const rl = rateLimit.inMemory(rlKey, 30, 60 * 1000, 1);
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'Too many leave requests' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) } }
      );
    }

    const { error } = await supa
      .from('note_edit_presence')
      .delete()
      .match({ note_key: noteKey, user_id: userId });

    if (error) throw error;

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error('presence leave error', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export const runtime = 'edge';
