/**
 * GET /api/published/notes/list
 * 
 * Public endpoint to list published notes with pagination and filtering.
 * Used by student view to browse available notes.
 * 
 * Query params:
 *  - subject: filter by subject_slug (e.g., "polity", "history")
 *  - topic: filter by topic_id
 *  - subtopic: filter by subtopic_id
 *  - q: search query (full-text search on title and body_html)
 *  - page: page number (default 1)
 *  - limit: items per page (default 20, max 100)
 *  - sort: "latest" | "title" | "popular" (default "latest")
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export async function GET(req: NextRequest) {
  try {
    const supa = createServerSupabaseClient();
    if (!supa) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get('subject');
    const topic = searchParams.get('topic');
    const subtopic = searchParams.get('subtopic');
    const searchQuery = searchParams.get('q');
    const pageStr = searchParams.get('page') || '1';
    const limitStr = searchParams.get('limit') || '20';
    const sort = searchParams.get('sort') || 'latest';

    const page = Math.max(1, parseInt(pageStr, 10));
    const limit = Math.min(100, Math.max(1, parseInt(limitStr, 10)));
    const offset = (page - 1) * limit;

    // Build query
    let query = supa
      .from('published_notes')
      .select('id, note_key, subject_slug, topic_id, subtopic_id, title, description, tags, published_at, view_count', { count: 'exact' })
      .eq('is_archived', false);

    // Apply filters
    if (subject) {
      query = query.eq('subject_slug', subject);
    }
    if (topic) {
      query = query.eq('topic_id', topic);
    }
    if (subtopic) {
      query = query.eq('subtopic_id', subtopic);
    }

    // Full-text search
    if (searchQuery) {
      // Use Postgres full-text search or ilike for simplicity
      // For production, use to_tsvector/to_tsquery for better performance
      query = query.or(`title.ilike.%${searchQuery}%, body_html.ilike.%${searchQuery}%`);
    }

    // Sort
    switch (sort) {
      case 'title':
        query = query.order('title', { ascending: true });
        break;
      case 'popular':
        query = query.order('view_count', { ascending: false });
        break;
      case 'latest':
      default:
        query = query.order('published_at', { ascending: false });
        break;
    }

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('[published/list] DB error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch published notes', details: error.message },
        { status: 500 }
      );
    }

    // Calculate pagination metadata
    const totalPages = count ? Math.ceil(count / limit) : 0;
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return NextResponse.json({
      notes: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext,
        hasPrev,
      },
      filters: {
        subject,
        topic,
        subtopic,
        q: searchQuery,
        sort,
      },
    });
  } catch (err) {
    console.error('[published/list] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
