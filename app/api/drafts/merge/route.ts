// app/api/drafts/merge/route.ts
import { NextResponse } from 'next/server';
import { requireAdminFromCookies } from '@/lib/adminAuth';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

// Simple HTML sanitizer (removes scripts and event handlers)
function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers (onclick, onload, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, '');
  
  // Remove javascript: protocol
  sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '');
  sanitized = sanitized.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, '');
  
  return sanitized;
}

export async function POST(req: Request) {
  // auth: server routes must be protected
  const auth = await requireAdminFromCookies();
  if (!auth.ok) return NextResponse.json({ error: auth.message }, { status: auth.status || 401 });

  const supa = createServerSupabaseClient();
  if (!supa) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { noteKey, strategy, clientPayload } = body;

    if (!noteKey || !strategy) {
      return NextResponse.json({ error: 'noteKey and strategy are required' }, { status: 400 });
    }

    // fetch existing server draft (if any)
    const { data: existing, error: fetchErr } = await supa
      .from('note_drafts')
      .select('note_key, payload, updated_at, user_id')
      .eq('note_key', noteKey)
      .single();

    if (fetchErr && fetchErr.code && fetchErr.code !== 'PGRST116') {
      console.error('merge: fetch existing error', fetchErr);
      return NextResponse.json({ error: fetchErr.message || 'DB error' }, { status: 500 });
    }

    // Strategy: accept_server -> return server payload, do not modify
    if (strategy === 'accept_server') {
      return NextResponse.json({
        ok: true,
        applied: 'server',
        payload: existing?.payload ?? null,
        updatedAt: existing?.updated_at ?? null,
        userId: existing?.user_id ?? null,
      });
    }

    // Strategy: accept_client -> sanitize and force-write client payload
    if (strategy === 'accept_client') {
      if (!clientPayload) {
        return NextResponse.json({ error: 'clientPayload required for accept_client' }, { status: 400 });
      }

      const safePayload = sanitizePayload(clientPayload);

      const upsertRow = {
        note_key: noteKey,
        payload: safePayload,
        updated_at: new Date().toISOString(),
        user_id: auth.userId || null,
      };

      const { data: upserted, error: upErr } = await supa
        .from('note_drafts')
        .upsert(upsertRow, { onConflict: 'note_key' })
        .select()
        .limit(1);

      if (upErr) {
        console.error('merge: upsert error', upErr);
        return NextResponse.json({ error: upErr.message || 'DB upsert error' }, { status: 500 });
      }

      return NextResponse.json({ ok: true, applied: 'client', data: upserted });
    }

    // Strategy: auto_merge -> simple placeholder with safe fallback to server
    if (strategy === 'auto_merge') {
      // VERY simple safe behavior: if no server exists, save client; otherwise return server
      if (!existing) {
        if (!clientPayload) {
          return NextResponse.json({ error: 'no data to merge' }, { status: 400 });
        }
        const safePayload = sanitizePayload(clientPayload);
        const upsertRow = {
          note_key: noteKey,
          payload: safePayload,
          updated_at: new Date().toISOString(),
          user_id: auth.userId || null,
        };
        const { data: up, error: up2 } = await supa.from('note_drafts').upsert(upsertRow, { onConflict: 'note_key' }).select().limit(1);
        if (up2) {
          console.error('merge:auto upsert err', up2);
          return NextResponse.json({ error: up2.message || 'DB upsert error' }, { status: 500 });
        }
        return NextResponse.json({ ok: true, applied: 'client', data: up });
      }
      // fallback: return server payload to avoid risky automatic merges
      return NextResponse.json({ ok: true, applied: 'server', payload: existing.payload, message: 'auto-merge fallback to server' });
    }

    return NextResponse.json({ error: 'unknown merge strategy' }, { status: 400 });
  } catch (err: any) {
    console.error('merge route exception', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

// helper: sanitize known fields in payload (adjust to your payload shape)
function sanitizePayload(payload: any) {
  const copy = { ...payload };
  if (typeof copy.bodyHtml === 'string') copy.bodyHtml = sanitizeHtml(copy.bodyHtml);
  if (Array.isArray(copy.sections)) {
    copy.sections = copy.sections.map((s: any) => ({ ...s, content: typeof s.content === 'string' ? sanitizeHtml(s.content) : s.content }));
  }
  return copy;
}

export const runtime = 'edge';
