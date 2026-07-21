import { NextRequest, NextResponse } from 'next/server';
import { requireAdminFromCookies } from '@/lib/adminAuth';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

// Simple HTML sanitizer (replaces isomorphic-dompurify to avoid ESM issues)
function sanitizeHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
    .replace(/javascript:/gi, '');
}

export async function POST(req: NextRequest) {
  try {
    // Admin auth check
    const auth = await requireAdminFromCookies();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.message || 'Unauthorized' }, { status: auth.status || 401 });
    }

    const supa = createServerSupabaseClient();
    if (!supa) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
    }

    const body = await req.json();
    const { 
      noteKey, 
      subjectSlug, 
      topicId, 
      subtopicId, 
      title, 
      bodyHtml,
      payload 
    } = body;

    if (!noteKey || !title) {
      return NextResponse.json({ error: 'noteKey and title required' }, { status: 400 });
    }

    // Sanitize HTML content if present
    const sanitizedBodyHtml = bodyHtml ? sanitizeHtml(bodyHtml) : '';

    const upsertData = {
      note_key: noteKey,
      subject_slug: subjectSlug || null,
      topic_id: topicId || null,
      subtopic_id: subtopicId || null,
      title: title || 'Untitled',
      description: payload?.excerpt || '',
      body_html: sanitizedBodyHtml,
      payload: payload || {},
      published_by: auth.userId || null,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: pub, error: upErr } = await supa
      .from('published_notes')
      .upsert(upsertData, { onConflict: 'note_key' })
      .select()
      .limit(1);

    if (upErr) {
      console.error('publish upsert error', upErr);
      return NextResponse.json({ error: upErr.message || 'DB upsert error' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, noteKey, published: pub?.[0] ?? null });
  } catch (err: any) {
    console.error('publish route err', err);
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export const runtime = 'edge';
