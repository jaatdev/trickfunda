// app/api/presence/heartbeat/route.ts
import { NextResponse } from 'next/server';
import { requireAdminFromCookies } from '@/lib/adminAuth';
import rateLimit from '@/lib/rateLimiter';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

/**
 * POST { noteKey, userId, displayName, cursor }
 * Upserts a presence row for (noteKey, userId)
 */
export async function POST(req: Request) {
  // Verify Clerk auth via cookies (App Router)
  const auth = await requireAdminFromCookies();
  
  // Log auth failure but don't block presence updates in development
  if (!auth.ok) {
    // In development with clock skew, still process heartbeat
    // but mark it as unauthenticated
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
    const body = await req.json();
    const { noteKey, userId, displayName, cursor } = body;
    
    if (!noteKey || !userId) {
      return NextResponse.json({ error: 'noteKey and userId required' }, { status: 400 });
    }

    // Rate limit: 6 heartbeats per second per user-note pair (token bucket: 6 capacity, 1 refill/sec)
    const rlKey = `heartbeat:${noteKey}:${userId}`;
    const rl = rateLimit.inMemory(rlKey, 6, 1000, 1);
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'Too many heartbeats, please slow down' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) } }
      );
    }

    const payload = {
      note_key: noteKey,
      user_id: userId,
      display_name: displayName || null,
      last_active: new Date().toISOString(),
      cursor: cursor || null,
    };

    // Some dev DBs might lack the unique composite index on (note_key, user_id).
    // Use a select -> update/insert fallback instead of relying on upsert
    // with onConflict so we don't get a hard 500 from Postgres.
    try {
      const { data: existing, error: fetchErr } = await supa
        .from('note_edit_presence')
        .select('*')
        .eq('note_key', noteKey)
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

      if (fetchErr && fetchErr.code && fetchErr.code !== 'PGRST116') {
        console.error('[Presence] fetch existing presence err', fetchErr);
        return NextResponse.json({ error: fetchErr.message || 'DB error' }, { status: 500 });
      }

      if (existing) {
        const { data: updated, error: updateErr } = await supa
          .from('note_edit_presence')
          .update(payload)
          .eq('note_key', noteKey)
          .eq('user_id', userId)
          .select('*')
          .limit(1);

        if (updateErr) {
          console.error('[Presence] update err', updateErr);
          return NextResponse.json({ error: updateErr.message || 'DB update error' }, { status: 500 });
        }

        return NextResponse.json({ ok: true, data: updated }, { status: 200 });
      }

      // insert new
      const { data: inserted, error: insertErr } = await supa
        .from('note_edit_presence')
        .insert(payload)
        .select('*')
        .limit(1);

      if (insertErr) {
        console.error('[Presence] insert err', insertErr);
        return NextResponse.json({ error: insertErr.message || 'DB insert error' }, { status: 500 });
      }

      return NextResponse.json({ ok: true, data: inserted }, { status: 200 });
    } catch (upsertErr: any) {
      console.error('[Presence] Heartbeat upsert fallback error:', upsertErr);
      return NextResponse.json({ error: upsertErr?.message || String(upsertErr) }, { status: 500 });
    }
  } catch (err: any) {
    console.error('[Presence] Heartbeat error:', {
      message: err?.message || String(err),
      details: err?.details,
      hint: err?.hint,
      code: err?.code,
    });
    return NextResponse.json({ 
      error: err?.message || String(err),
      hint: err?.hint || '',
      code: err?.code || ''
    }, { status: 500 });
  }
}

export const runtime = 'edge';
