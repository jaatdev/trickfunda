// app/api/drafts/save/route.ts
import { NextResponse } from 'next/server';
import { requireAdminFromCookies } from '@/lib/adminAuth';
import rateLimit from '@/lib/rateLimiter';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  // Verify Clerk auth via cookies (App Router)
  const auth = await requireAdminFromCookies();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status || 401 });

  const supa = createServerSupabaseClient();
  if (!supa) {
    return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
  }

  try {
    const body = await req.json();
    // Expect body: { noteKey, subjectId, topicId, subtopicId, type, userId?, payload, clientUpdatedAt? }
    const { noteKey, subjectId, topicId, subtopicId, type, userId, payload, clientUpdatedAt } = body as any;
    
    if (!noteKey || !payload) {
      return NextResponse.json({ error: 'missing noteKey or payload' }, { status: 400 });
    }

    // Rate limit: 2 saves per 2 seconds per user-note pair (autosave every 5s is OK)
    const rlKey = `save:${noteKey}:${userId || auth.userId}`;
    const rl = rateLimit.inMemory(rlKey, 2, 2000, 1);
    if (!rl.ok) {
      return NextResponse.json(
        { error: 'Save rate limit exceeded, please wait' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.retryAfterMs / 1000)) } }
      );
    }

    // ========== CONFLICT DETECTION (LWW Strategy) ==========
    // If client provides clientUpdatedAt, check if server has a newer version
    const clientUpdatedAtIso = clientUpdatedAt;
    const clientUpdatedAtMs = clientUpdatedAtIso ? new Date(clientUpdatedAtIso).getTime() : null;

    // fetch existing server draft
    const { data: existingDraft, error: fetchErr } = await supa
      .from('note_drafts')
      .select('updated_at, payload, user_id')
      .eq('note_key', noteKey)
      .single();

    if (fetchErr && fetchErr.code && fetchErr.code !== 'PGRST116') {
      console.error('fetch existing draft err', fetchErr);
      return NextResponse.json({ error: fetchErr.message || 'DB error' }, { status: 500 });
    }

    if (existingDraft && clientUpdatedAtMs) {
      const serverUpdatedAtMs = new Date(existingDraft.updated_at).getTime();
      // if server is newer than client -> conflict
      if (serverUpdatedAtMs > clientUpdatedAtMs) {
        return NextResponse.json({
          error: 'conflict',
          serverMeta: {
            updatedAt: existingDraft.updated_at,
            userId: existingDraft.user_id,
            payload: existingDraft.payload,
          },
        }, { status: 409 });
      }
    }
    // ======================================================

    // Payload stored as-is (HTML sanitization happens on render in NoteBoxPreview)
    const safePayload = { ...payload };

    // Upsert by note_key.
    // Some dev DBs may not have a UNIQUE constraint on note_key, which makes
    // `ON CONFLICT` upserts fail with: "there is no unique or exclusion
    // constraint matching the ON CONFLICT specification". To be robust we
    // implement a select -> update-or-insert fallback instead of relying on
    // onConflict.
    const payloadRow = {
      note_key: noteKey,
      subject_id: subjectId || null,
      topic_id: topicId || null,
      subtopic_id: subtopicId || null,
      type: type || null,
      user_id: userId || auth.userId || null,
      payload: safePayload,
      updated_at: new Date().toISOString(),
    };

    if (existingDraft) {
      // update
      const { data: updated, error: updateErr } = await supa
        .from('note_drafts')
        .update(payloadRow)
        .eq('note_key', noteKey)
        .select('*')
        .limit(1);

      if (updateErr) {
        console.error('[Drafts] Update error', updateErr);
        return NextResponse.json({ error: updateErr.message || 'DB update error' }, { status: 500 });
      }

      return NextResponse.json({ ok: true, data: updated }, { status: 200 });
    } else {
      // insert
      const { data: inserted, error: insertErr } = await supa
        .from('note_drafts')
        .insert(payloadRow)
        .select('*')
        .limit(1);

      if (insertErr) {
        console.error('[Drafts] Insert error', insertErr);
        return NextResponse.json({ error: insertErr.message || 'DB insert error' }, { status: 500 });
      }

      return NextResponse.json({ ok: true, data: inserted }, { status: 200 });
    }
  } catch (err: any) {
    console.error('save draft error', err);
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 });
  }
}

export const runtime = 'edge';
