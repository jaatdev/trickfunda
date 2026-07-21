/**
 * GET /api/published/notes/[noteKey]
 * 
 * Public endpoint to fetch a single published note by noteKey.
 * Used by student view to display note content with SEO metadata.
 * 
 * Features:
 *  - Returns full note payload including sanitized HTML
 *  - Increments view_count on each fetch
 *  - Returns 404 if note not found or archived
 *  - Public access (no auth required)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ noteKey: string }> }
) {
  try {
    const { noteKey } = await params;

    if (!noteKey) {
      return NextResponse.json(
        { error: 'noteKey is required' },
        { status: 400 }
      );
    }

    const supa = createServerSupabaseClient();
    if (!supa) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
    }

    // Fetch the published note
    const { data, error } = await supa
      .from('published_notes')
      .select('*')
      .eq('note_key', noteKey)
      .eq('is_archived', false)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return NextResponse.json(
          { error: 'Note not found' },
          { status: 404 }
        );
      }

      console.error('[published/detail] DB error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch note', details: error.message },
        { status: 500 }
      );
    }

    // Increment view count (fire and forget - don't block response)
    (async () => {
      try {
        await supa
          .from('published_notes')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('note_key', noteKey);
      } catch (err) {
        console.warn('[published/detail] Failed to increment view_count:', err);
      }
    })();

    // Return the full note data
    return NextResponse.json({
      note: {
        id: data.id,
        noteKey: data.note_key,
        subjectSlug: data.subject_slug,
        topicId: data.topic_id,
        subtopicId: data.subtopic_id,
        title: data.title,
        description: data.description,
        bodyHtml: data.body_html,
        payload: data.payload,
        tags: data.tags || [],
        publishedAt: data.published_at,
        updatedAt: data.updated_at,
        viewCount: data.view_count || 0,
      },
    });
  } catch (err) {
    console.error('[published/detail] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
