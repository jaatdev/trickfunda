// components/admin/NoteBoxCreatorModern.tsx
'use client';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createNotesManager } from '@/lib/notesManager';
import { NoteBoxType, NoteBox } from '@/lib/admin-types';
import { boxThemes, themeMap } from '@/lib/admin-themes';
import NoteBoxPreview from './NoteBoxPreview';
import RichTextEditor from './RichTextEditor';
import HamburgerSidebar from './HamburgerSidebar';
import AdminNavSidebar from './AdminNavSidebar';
import ModernDropdown from './ModernDropdown';
import PresenceBadge from '@/components/ui/PresenceBadge';
import RemoteDraftAlert from '@/components/ui/RemoteDraftAlert';
import MergeConflictAlert from '@/components/ui/MergeConflictAlert';
import { getSupabaseClient } from '@/lib/supabaseClient';

const NOTES_MANAGER = createNotesManager();

const BOX_TYPE_ICONS: Partial<Record<NoteBoxType, string>> = {
  'big-notes': '📝',
  'small-notes': '📋',
  'right-wrong': '✓✗',
  'mnemonic-magic': '🔤',
  'mnemonic-card': '🎴',
  'container-notes': '📦',
  'quick-reference': '📌',
  'flashcard': '🎯',
};

const BOX_TYPES: { key: NoteBoxType; label: string; hint?: string }[] = [
  { key: 'big-notes', label: 'Big Notes', hint: 'Long explanation, headings' },
  { key: 'small-notes', label: 'Small Notes', hint: 'Bullet points / quick facts' },
  { key: 'right-wrong', label: 'Right / Wrong', hint: 'T/F statements' },
  { key: 'mnemonic-magic', label: 'Mnemonic Magic', hint: 'Mnemonic breakdown' },
  { key: 'mnemonic-card', label: 'Mnemonic Card', hint: 'Cards for quick recall' },
  { key: 'container-notes', label: 'Container Notes', hint: 'Sections / containers' },
  { key: 'quick-reference', label: 'Quick Reference', hint: 'Short labels & values' },
  { key: 'flashcard', label: 'Flashcard', hint: 'Q/A pairs' },
];

const DRAFT_KEY = (subjectId: string, topicId: string, subtopicId: string, type: string) =>
  `draft::${subjectId}::${topicId}::${subtopicId}::${type}`;

const DRAFT_HISTORY_KEY = (subjectId: string, topicId: string, subtopicId: string, type: string) =>
  `draft-history::${subjectId}::${topicId}::${subtopicId}::${type}`;

const PRESETS: Record<string, { title: string; bodyHtml?: string; pointsText?: string; flashText?: string }[]> = {
  'big-notes': [
    { 
      title: 'Article 15 - Core Concept', 
      bodyHtml: '<p><strong>Prohibition of discrimination</strong> on grounds of religion, race, caste, sex or place of birth</p><p>Article 15 is one of the key provisions ensuring equality. It prohibits the State from discriminating against any citizen on grounds only of religion, race, caste, sex, place of birth or any of them.</p>',
      pointsText: 'No discrimination on grounds of religion, race, caste, sex or place of birth\nSpecial provisions allowed for women and children\nSpecial provisions for advancement of SC/ST/OBC allowed'
    },
  ],
  'small-notes': [
    { 
      title: 'Key Points', 
      pointsText: 'Point 1: First important fact\nPoint 2: Second important fact\nPoint 3: Third important fact' 
    },
  ],
  'mnemonic-magic': [
    {
      title: 'RRCSP',
      pointsText: 'R - Religion - Cannot discriminate based on religious beliefs\nR - Race - Cannot discriminate based on race\nC - Caste - No discrimination on grounds of caste\nS - Sex - No gender-based discrimination\nP - Place of Birth - Cannot discriminate based on birthplace'
    }
  ],
  'mnemonic-card': [
    {
      title: 'JLEF',
      pointsText: 'J - Justice - Social, Economic, Political justice\nL - Liberty - Freedom of thought, expression, belief\nE - Equality - Equal status and opportunity\nF - Fraternity - Unity and dignity of the nation'
    }
  ],
  'right-wrong': [
    {
      title: 'True or False',
      pointsText: '✓ Article 15 prohibits discrimination\n✗ Article 15 allows discrimination on all grounds\n✓ Special provisions can be made for women and children'
    }
  ],
  'quick-reference': [
    {
      title: 'Quick Facts',
      pointsText: 'Article Number | 15\nType | Fundamental Right\nPart | Part III\nYear Enacted | 1950\nScope | Equality Rights'
    }
  ],
  'flashcard': [
    { 
      title: 'Q&A Cards', 
      flashText: 'What is Article 15? | Prohibition of discrimination on grounds of religion, race, caste, sex, or place of birth\nWhen was it enacted? | 1950, as part of the original Constitution\nCan special provisions be made? | Yes, for women, children, and SC/ST/OBC' 
    },
  ],
  'container-notes': [
    {
      title: 'Container Overview',
      bodyHtml: '<p>This is a comprehensive container note that can hold detailed information with rich formatting.</p>',
      pointsText: 'Key highlight 1\nKey highlight 2\nKey highlight 3'
    }
  ]
};

type Props = {
  subjectId: string;
  topicId: string;
  subtopicId: string;
  onCreated?: (note: NoteBox) => void;
  subjects?: any[];
  onSubjectChange?: (subjectId: string) => void;
  onTopicChange?: (topicId: string) => void;
  onSubtopicChange?: (subtopicId: string) => void;
  onAddSubject?: () => void;
  onDeleteSubject?: () => void;
  onAddTopic?: () => void;
  onDeleteTopic?: () => void;
  onAddSubtopic?: () => void;
  onDeleteSubtopic?: () => void;
};

export default function NoteBoxCreatorModern({ 
  subjectId, 
  topicId, 
  subtopicId, 
  onCreated,
  subjects = [],
  onSubjectChange,
  onTopicChange,
  onSubtopicChange,
  onAddSubject,
  onDeleteSubject,
  onAddTopic,
  onDeleteTopic,
  onAddSubtopic,
  onDeleteSubtopic
}: Props) {
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Editor identity (stable per browser tab)
  const [editorId] = useState(() => {
    if (typeof window === 'undefined') return 'anonymous';
    let id = localStorage.getItem('notty_editor_id');
    if (!id) {
      id = 'editor_' + Math.random().toString(36).slice(2, 9);
      localStorage.setItem('notty_editor_id', id);
    }
    return id;
  });

  // Form state
  const [type, setType] = useState<NoteBoxType>('big-notes');
  const [themeId, setThemeId] = useState('indigo');
  const [title, setTitle] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [pointsText, setPointsText] = useState('');
  const [flashText, setFlashText] = useState('');

  // Collaboration & drafts
  const [activeUsers, setActiveUsers] = useState<Array<{ user_id: string; display_name?: string; last_active: string; cursor?: any }>>([]);
  const [remoteDraft, setRemoteDraft] = useState<any>(null);
  const [remoteChangedAt, setRemoteChangedAt] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [editorLoadKey, setEditorLoadKey] = useState(0); // Stable key for editor remount on content load
  
  // LWW Merge Strategy (Step 5)
  const [conflictServerMeta, setConflictServerMeta] = useState<any>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  
  // Admin Navigation Sidebar State
  const [adminNavOpen, setAdminNavOpen] = useState(false);
  
  const channelRef = useRef<any>(null);
  const heartbeatRef = useRef<any>(null);
  const autosaveRef = useRef<any>(null);
  
  const supabase = getSupabaseClient();
  // Clerk auth state (client-side)
  const { isLoaded, isSignedIn } = useAuth();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+B or Cmd+B - Toggle Admin Nav
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setAdminNavOpen(prev => !prev);
      }
      // Ctrl+\ or Cmd+\ - Toggle note types sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
      }
      // Ctrl+S or Cmd+S - Save draft
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveDraft();
      }
      // Ctrl+Enter or Cmd+Enter - Create note
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleCreate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [title, bodyHtml, pointsText, flashText, type, themeId]);

  // Suggested themes based on note type
  const suggestedThemes = useMemo(() => {
    const typeMap: Partial<Record<NoteBoxType, string[]>> = {
      'big-notes': ['indigo', 'blue', 'slate'],
      'small-notes': ['cyan', 'teal', 'emerald'],
      'mnemonic-magic': ['purple', 'fuchsia', 'pink'],
      'mnemonic-card': ['amber', 'orange', 'yellow'],
      'right-wrong': ['green', 'red', 'rose'],
      'quick-reference': ['sky', 'blue', 'indigo'],
      'flashcard': ['violet', 'purple', 'indigo'],
      'container-notes': ['slate', 'zinc', 'neutral'],
    };
    const ids = typeMap[type] || [];
    return ids.map(id => themeMap[id]).filter(Boolean);
  }, [type]);

  // Load draft on mount (prefer server version if available, fallback to localStorage)
  useEffect(() => {
    const dk = DRAFT_KEY(subjectId, topicId, subtopicId, type);
    
    // Load history from localStorage
    const historyKey = DRAFT_HISTORY_KEY(subjectId, topicId, subtopicId, type);
    const historyData = localStorage.getItem(historyKey);
    if (historyData) {
      try {
        setHistory(JSON.parse(historyData));
      } catch {}
    }

    // Try loading from server first (handles multi-device/browser sync)
    (async () => {
      try {
        const res = await fetch('/api/drafts/list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ noteKey: dk, limit: 1 }),
        });
        
        if (res.ok) {
          const { data } = await res.json();
          if (data && data.length > 0) {
            const serverDraft = data[0];
            const serverPayload = serverDraft.payload || {};
            const serverUpdatedAt = serverDraft.updated_at;
            
            // Check if server version is newer than localStorage
            const localSaved = localStorage.getItem(dk);
            let useServer = true;
            if (localSaved) {
              try {
                const localParsed = JSON.parse(localSaved);
                const localTs = localParsed.ts || 0;
                const serverTs = new Date(serverUpdatedAt).getTime();
                if (localTs > serverTs) {
                  useServer = false; // Local is newer
                }
              } catch {}
            }
            
            if (useServer) {
              // Server is authoritative or no local draft
              const loadedTitle = serverPayload.title || '';
              const loadedBody = serverPayload.bodyHtml || '';
              const loadedPoints = serverPayload.pointsText || '';
              const loadedFlash = serverPayload.flashText || '';
              
              setTitle(loadedTitle);
              setBodyHtml(loadedBody);
              setPointsText(loadedPoints);
              setFlashText(loadedFlash);
              setLastSaved(new Date(serverUpdatedAt).getTime());
              setLastSavedAt(serverUpdatedAt);
              setEditorLoadKey(prev => prev + 1); // Increment to force editor remount
              
              // Also sync to localStorage so it's available for next load
              const localDraft = { 
                title: loadedTitle, 
                bodyHtml: loadedBody, 
                pointsText: loadedPoints, 
                flashText: loadedFlash, 
                ts: new Date(serverUpdatedAt).getTime() 
              };
              localStorage.setItem(dk, JSON.stringify(localDraft));
              
              console.log('✅ Loaded draft from server:', serverUpdatedAt);
              return;
            }
          }
        }
      } catch (err) {
        console.warn('⚠️ Failed to load draft from server, using localStorage fallback:', err);
      }
      
      // Fallback: load from localStorage if server fetch failed or local is newer
      const saved = localStorage.getItem(dk);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setTitle(parsed.title || '');
          setBodyHtml(parsed.bodyHtml || '');
          setPointsText(parsed.pointsText || '');
          setFlashText(parsed.flashText || '');
          setLastSaved(parsed.ts || null);
          setEditorLoadKey(prev => prev + 1); // Increment to force editor remount
          console.log('📦 Loaded draft from localStorage');
        } catch {}
      }
    })();
  }, [subjectId, topicId, subtopicId, type]);

  // Autosave: save immediately on first change, then debounce at 1.5s for responsiveness
  // Only autosave when Clerk is loaded and user is signed in (prevents 401 errors)
  useEffect(() => {
    if (autosaveRef.current) clearInterval(autosaveRef.current);
    
    // Skip autosave if Clerk not ready or user not signed in
    if (!isLoaded || !isSignedIn) {
      return;
    }
    
    // If dirty for the first time in this edit session, save immediately
    // Otherwise, debounce at 1.5s for rapid edits
    if (isDirty) {
      // Schedule save after 1.5s (debounced)
      autosaveRef.current = setInterval(() => {
        if (isDirty && isSignedIn) {
          saveDraft();
        }
      }, 1500);
    }
    
    return () => {
      if (autosaveRef.current) clearInterval(autosaveRef.current);
    };
  }, [isDirty, title, bodyHtml, pointsText, flashText, type, subjectId, topicId, subtopicId, isLoaded, isSignedIn]);

  // Realtime presence + collaboration
  useEffect(() => {
    // Wait for Supabase client and Clerk to initialize before starting presence logic
    if (!supabase) return;
    if (!isLoaded) return;

    const noteDraftKey = DRAFT_KEY(subjectId, topicId, subtopicId, type);
    
    const fetchActiveUsers = async () => {
      try {
        // Use /api/presence/list endpoint for initial snapshot
        const response = await fetch(`/api/presence/list?noteKey=${encodeURIComponent(noteDraftKey)}`, {
          credentials: 'include', // Include cookies (required for Clerk auth)
        });
        if (response.ok) {
          const { presence } = await response.json();
          setActiveUsers(
            (presence || []).map((r: any) => ({
              user_id: r.user_id,
              display_name: r.display_name,
              last_active: r.last_active,
              cursor: r.cursor || null,
            }))
          );
        }
      } catch (err) {
        // Fallback to direct supabase query if endpoint fails
        try {
          const { data } = await supabase
            .from('note_edit_presence')
            .select('*')
            .eq('note_key', noteDraftKey);
          if (data) {
            setActiveUsers(
              data.map((r: any) => ({
                user_id: r.user_id,
                display_name: r.display_name,
                last_active: r.last_active,
                cursor: r.cursor || null,
              }))
            );
          }
        } catch {}
      }
    };

    const channel = supabase
      .channel(`notty-note-${noteDraftKey}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'note_edit_presence', filter: `note_key=eq.${noteDraftKey}` },
        async () => {
          await fetchActiveUsers();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'note_drafts', filter: `note_key=eq.${noteDraftKey}` },
        (payload) => {
          try {
            const rec = (payload as any).record;
            if (!rec) return;
            if (rec.user_id && rec.user_id !== editorId) {
              setRemoteDraft(rec.payload || rec);
              setRemoteChangedAt(rec.updated_at || new Date().toISOString());
            }
          } catch {}
        }
      )
      .subscribe();

    channelRef.current = channel;

    const sendHeartbeat = async () => {
      try {
        // Only send heartbeat if the user is signed in
        if (!isSignedIn) return;

        // Use the protected server endpoint which performs the upsert with the service role
        await fetch('/api/presence/heartbeat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies (required for Clerk auth)
          body: JSON.stringify({ 
            noteKey: noteDraftKey, 
            userId: editorId, 
            displayName: editorId.slice(0, 8),
            cursor: { pos: 0, selectionLength: 0 } // Optional: can be updated with actual editor position
          }),
        });
      } catch (err) {
        // ignore heartbeat errors client-side
      }
    };

    // Run initial heartbeat and then start polling
    sendHeartbeat();
    fetchActiveUsers();
    heartbeatRef.current = setInterval(sendHeartbeat, 10000);

    return () => {
      if (channelRef.current) channelRef.current.unsubscribe();
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [subjectId, topicId, subtopicId, type, editorId, supabase, isLoaded, isSignedIn]);

  const saveDraft = () => {
    // Guard: only save if Clerk auth is ready and user is signed in
    if (!isLoaded || !isSignedIn) {
      console.warn('⏸️ Autosave paused (Clerk not ready or not signed in)');
      return;
    }

    const dk = DRAFT_KEY(subjectId, topicId, subtopicId, type);
    const now = Date.now();
    const isoNow = new Date(now).toISOString();
    const draft = { title, bodyHtml, pointsText, flashText, ts: now };
    localStorage.setItem(dk, JSON.stringify(draft));
    
    const historyKey = DRAFT_HISTORY_KEY(subjectId, topicId, subtopicId, type);
    const newHist = [JSON.stringify(draft), ...history.slice(0, 4)];
    setHistory(newHist);
    localStorage.setItem(historyKey, JSON.stringify(newHist));
    
    setLastSaved(now);
    setIsDirty(false);
    
    // Sync to server with LWW conflict detection (Step 5)
    const noteDraftKey = DRAFT_KEY(subjectId, topicId, subtopicId, type);
    const payload = { title, bodyHtml, pointsText, flashText };
    const clientUpdatedAt = lastSavedAt || isoNow; // Use previous save timestamp or current time
    
    (async () => {
      try {
        const res = await fetch('/api/drafts/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            noteKey: noteDraftKey,
            subjectId,
            topicId,
            subtopicId,
            type,
            userId: editorId,
            payload,
            clientUpdatedAt, // ← Include for LWW comparison
          }),
        });

        if (res.status === 409) {
          // Conflict detected! Server is newer
          const body = await res.json();
          setConflictServerMeta(body.serverMeta);
          console.warn('⚠️ Merge conflict detected:', body.serverMeta);
          return;
        }

        if (res.ok) {
          const body = await res.json();
          // Extract server's updated_at and store it for next LWW comparison
          const serverUpdatedAt = body?.data?.[0]?.updated_at || isoNow;
          setLastSavedAt(serverUpdatedAt);
          localStorage.setItem(`draft:${noteDraftKey}:updatedAt`, serverUpdatedAt);
          console.log('✅ Draft synced to server at', serverUpdatedAt);
        } else {
          // Capture error details for debugging
          const errorText = await res.text();
          console.error('❌ Draft sync failed (HTTP', res.status + '):', errorText);
          // Store partial error info
          try {
            const errorJson = JSON.parse(errorText);
            console.error('   Error details:', errorJson);
          } catch {
            // Not JSON, just text
          }
        }
      } catch (err) {
        console.error('❌ Server draft sync exception:', err);
        // Continue - localStorage still works (offline resilience)
      }
    })();
  };

  const clearDraft = () => {
    const dk = DRAFT_KEY(subjectId, topicId, subtopicId, type);
    localStorage.removeItem(dk);
    setLastSaved(null);
    setIsDirty(false);
  };

  const applyPreset = (preset: any) => {
    setTitle(preset.title || '');
    setBodyHtml(preset.bodyHtml || '');
    setPointsText(preset.pointsText || '');
    setFlashText(preset.flashText || '');
    setIsDirty(true);
  };

  const restoreHistoryItem = (idx: number) => {
    try {
      const parsed = JSON.parse(history[idx]);
      setTitle(parsed.title || '');
      setBodyHtml(parsed.bodyHtml || '');
      setPointsText(parsed.pointsText || '');
      setFlashText(parsed.flashText || '');
      setIsDirty(true);
    } catch {}
  };

  const applyRemoteDraft = () => {
    if (!remoteDraft) return;
    try {
      const parsed = remoteDraft.payload ? JSON.parse(remoteDraft.payload) : remoteDraft;
      setTitle(parsed.title || '');
      setBodyHtml(parsed.bodyHtml || '');
      setPointsText(parsed.pointsText || '');
      setFlashText(parsed.flashText || '');
      setRemoteDraft(null);
      setIsDirty(true);
    } catch {}
  };

  // LWW Merge Handlers (Step 5)
  const handleApplyServer = async () => {
    if (!conflictServerMeta) return;
    try {
      const res = await fetch('/api/drafts/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          noteKey: DRAFT_KEY(subjectId, topicId, subtopicId, type),
          strategy: 'accept_server',
        }),
      });

      if (res.ok) {
        const body = await res.json();
        // Apply server payload to editor
        const payload = conflictServerMeta.payload;
        setTitle(payload.title || '');
        setBodyHtml(payload.bodyHtml || '');
        setPointsText(payload.pointsText || '');
        setFlashText(payload.flashText || '');
        setLastSavedAt(conflictServerMeta.updatedAt);
        setConflictServerMeta(null);
        setIsDirty(false);
        console.log('✅ Applied server version');
      } else {
        console.error('Merge failed:', res.statusText);
      }
    } catch (err) {
      console.error('Apply server error:', err);
    }
  };

  const handleApplyClient = async () => {
    if (!conflictServerMeta) return;
    try {
      const res = await fetch('/api/drafts/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          noteKey: DRAFT_KEY(subjectId, topicId, subtopicId, type),
          strategy: 'accept_client',
          clientPayload: { title, bodyHtml, pointsText, flashText },
        }),
      });

      if (res.ok) {
        const body = await res.json();
        // Update lastSavedAt to current timestamp
        setLastSavedAt(new Date().toISOString());
        setConflictServerMeta(null);
        setIsDirty(false);
        console.log('✅ Overwrote server with local version');
      } else {
        console.error('Merge failed:', res.statusText);
      }
    } catch (err) {
      console.error('Apply client error:', err);
    }
  };

  const handleAttemptMerge = async () => {
    if (!conflictServerMeta) return;
    try {
      const res = await fetch('/api/drafts/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          noteKey: DRAFT_KEY(subjectId, topicId, subtopicId, type),
          strategy: 'auto_merge',
          clientPayload: { title, bodyHtml, pointsText, flashText },
        }),
      });

      if (res.ok) {
        const body = await res.json();
        // For now, auto_merge falls back to server (safe default)
        const mergedPayload = body.payload || conflictServerMeta.payload;
        setTitle(mergedPayload.title || '');
        setBodyHtml(mergedPayload.bodyHtml || '');
        setPointsText(mergedPayload.pointsText || '');
        setFlashText(mergedPayload.flashText || '');
        setLastSavedAt(new Date().toISOString());
        setConflictServerMeta(null);
        setIsDirty(false);
        console.log('✅ Auto-merge applied');
      } else {
        console.error('Merge failed:', res.statusText);
      }
    } catch (err) {
      console.error('Auto-merge error:', err);
    }
  };

  // Smart content parsing
  const contentForType = useMemo(() => {
    switch (type) {
      case 'big-notes':
      case 'container-notes': {
        const highlights = pointsText ? pointsText.split('\n').filter(Boolean) : [];
        return {
          heading: title || 'Heading',
          body: bodyHtml || '<p>Long-form explanation...</p>',
          highlights: highlights.length > 0 ? highlights : undefined
        };
      }
      case 'small-notes': {
        const points = pointsText ? pointsText.split('\n').filter(Boolean) : ['Point 1', 'Point 2'];
        return { title: title || 'Quick points', points };
      }
      case 'right-wrong': {
        const lines = pointsText ? pointsText.split('\n').filter(Boolean) : [];
        const statements = lines.map((line, i) => {
          const trimmedLine = line.trim();
          let isCorrect = true;
          let statement = trimmedLine;
          
          if (trimmedLine.startsWith('✓')) {
            isCorrect = true;
            statement = trimmedLine.replace(/^✓\s*/, '').trim();
          } else if (trimmedLine.startsWith('✗')) {
            isCorrect = false;
            statement = trimmedLine.replace(/^✗\s*/, '').trim();
          } else if (/^(true|correct):/i.test(trimmedLine)) {
            isCorrect = true;
            statement = trimmedLine.replace(/^(true|correct):\s*/i, '').trim();
          } else if (/^(false|wrong|incorrect):/i.test(trimmedLine)) {
            isCorrect = false;
            statement = trimmedLine.replace(/^(false|wrong|incorrect):\s*/i, '').trim();
          }
          
          return {
            id: `stmt_${i}`,
            statement: statement || 'Sample statement',
            isCorrect,
            explanation: ''
          };
        });
        return {
          title: title || 'True / False',
          statements: statements.length > 0 ? statements : [
            { id: 'stmt_0', statement: 'Sample correct statement', isCorrect: true, explanation: '' }
          ]
        };
      }
      case 'mnemonic-magic': {
        const mnemonic = title || 'SAMPLE';
        const lines = pointsText ? pointsText.split('\n').filter(Boolean) : [];
        const breakdown = lines.map((line, i) => {
          const parts = line.split(/[-:]/).map(s => s.trim());
          return {
            letter: parts[0] || mnemonic[i] || 'X',
            word: parts[1] || 'Word',
            meaning: parts[2] || 'Meaning'
          };
        });
        return {
          title: title || 'Mnemonic',
          mnemonic,
          breakdown: breakdown.length > 0 ? breakdown : mnemonic.split('').map((letter, i) => ({
            letter,
            word: `Word ${i + 1}`,
            meaning: `Meaning ${i + 1}`
          }))
        };
      }
      case 'mnemonic-card': {
        const mnemonic = title || 'SAMPLE';
        const lines = pointsText ? pointsText.split('\n').filter(Boolean) : [];
        const breakdown = lines.map((line) => {
          const parts = line.split(/[-:]/).map(s => s.trim());
          return {
            letter: parts[0] || 'X',
            word: parts[1] || 'Word',
            meaning: parts[2] || 'Meaning'
          };
        });
        return {
          title: title || 'Mnemonic Card',
          mnemonic,
          breakdown: breakdown.length > 0 ? breakdown : []
        };
      }
      case 'quick-reference': {
        const lines = pointsText ? pointsText.split('\n').filter(Boolean) : [];
        const facts = lines.map((line, i) => {
          const parts = line.split(/[|:]/).map(s => s.trim());
          return {
            id: `fact_${i}`,
            label: parts[0] || 'Label',
            value: parts[1] || 'Value'
          };
        });
        return {
          title: title || 'Quick Reference',
          facts: facts.length > 0 ? facts : [
            { id: 'fact_0', label: 'Sample Label', value: 'Sample Value' }
          ]
        };
      }
      case 'flashcard': {
        const lines = flashText ? flashText.split('\n').filter(Boolean) : [];
        const cards = lines.map((line, i) => {
          const parts = line.split('|').map(s => s.trim());
          return {
            id: `card_${i}`,
            question: parts[0] || 'Question?',
            answer: parts[1] || 'Answer'
          };
        });
        return {
          title: title || 'Flashcards',
          cards: cards.length > 0 ? cards : [
            { id: 'card_0', question: 'Sample Question?', answer: 'Sample Answer' }
          ]
        };
      }
      default:
        return {};
    }
  }, [type, title, bodyHtml, pointsText, flashText]);

  const previewNote = useMemo<NoteBox>(() => {
    return {
      id: 'preview',
      type,
      title: title || 'Preview',
      content: contentForType,
      themeId,
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [type, title, contentForType, themeId]);

  const handleCreate = () => {
    // Validate that at least subject and topic are selected
    if (!subjectId || !topicId) {
      alert('⚠️ Please select at least a Subject and Topic before creating a note.');
      return;
    }

    // If subtopic is empty string, pass it as is (will add to topic level)
    const nb = NOTES_MANAGER.createNoteBox(
      subjectId, 
      topicId, 
      subtopicId || '', // Allow empty string for topic-level notes
      type, 
      contentForType, 
      themeId
    );
    
    if (nb) {
      setTitle('');
      setBodyHtml('');
      setPointsText('');
      setFlashText('');
      setIsDirty(false);
      clearDraft();
      if (onCreated) onCreated(nb);
      
      const updatedSubject = NOTES_MANAGER.getSubject(subjectId);
      const updatedTopic = updatedSubject?.topics.find(t => t.id === topicId);
      const updatedSubtopic = updatedTopic?.subtopics.find(st => st.id === subtopicId);
      const noteCount = updatedSubtopic?.notes.length || 0;
      
      alert(`✅ Note created successfully!\n\nThis subtopic now has ${noteCount} note${noteCount !== 1 ? 's' : ''}.\nYour new note was added to the end of the list.`);
    } else {
      alert('Failed to create note. Check IDs');
    }
  };

  const handleReset = () => {
    setTitle('');
    setBodyHtml('');
    setPointsText('');
    setFlashText('');
    setIsDirty(false);
  };

  // Prepare dropdown items
  const boxTypeItems = BOX_TYPES.map(bt => ({
    value: bt.key,
    label: bt.label,
    icon: BOX_TYPE_ICONS[bt.key],
    subtitle: bt.hint,
  }));

  const themeItems = (suggestedThemes.length ? suggestedThemes : Object.values(themeMap).slice(0, 10)).map((t) => ({
    value: t.id,
    label: t.name,
    color: t.accentColor.replace('bg-', '#'), // Convert bg-blue-600 to approximate color
  }));

  const presetItems = (PRESETS as any)[type]?.map((p: any, i: number) => ({
    value: `preset_${i}`,
    label: p.title,
    icon: BOX_TYPE_ICONS[type],
  })) || [];

  const draftItems = history.map((h, idx) => {
    try {
      const parsed = JSON.parse(h);
      const date = new Date(parsed.ts);
      return {
        value: `draft_${idx}`,
        label: parsed.title || 'Untitled',
        subtitle: date.toLocaleString(),
        icon: '📝',
      };
    } catch {
      return {
        value: `draft_${idx}`,
        label: 'Draft',
        subtitle: '',
        icon: '📝',
      };
    }
  });

  return (
    <>
      {/* Admin Navigation Sidebar */}
      <AdminNavSidebar 
        isOpen={adminNavOpen} 
        onClose={() => setAdminNavOpen(false)} 
      />

      {/* Note Types Hamburger Sidebar */}
      <HamburgerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        selectedType={type}
        onTypeSelect={setType}
        onCreateNote={handleCreate}
        onResetForm={handleReset}
        activeUsers={activeUsers}
        editorId={editorId}
      />

      {/* Main Container with Top Toolbar */}
      <div className="flex flex-col min-h-screen">
        {/* Top Toolbar */}
        <div className="sticky top-0 h-16 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 z-30">
          <div className="flex items-center gap-4 px-6 h-full justify-between">
            <div className="flex items-center gap-4">
              {/* Admin Nav Button (NEW) */}
              <button
                onClick={() => setAdminNavOpen(true)}
                className="w-10 h-10 rounded-lg bg-linear-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 flex items-center justify-center text-white font-bold transition-all duration-200 hover:scale-105 shadow-lg"
                title="Admin Navigation (Ctrl+B)"
              >
                N
              </button>

              {/* Note Types Hamburger Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="w-10 h-10 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200 hover:scale-105"
                title="Note Types (Ctrl+\)"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Box Type Dropdown */}
              <ModernDropdown
                value={type}
                items={boxTypeItems}
                onChange={(val) => setType(val as NoteBoxType)}
                placeholder="Select box type..."
                icon="📦"
                className="w-56"
              />

              {/* Theme Dropdown */}
              <ModernDropdown
                value={themeId}
                items={themeItems}
                onChange={setThemeId}
                placeholder="Select theme..."
                icon="🎨"
                className="w-48"
              />

              {/* Presets Dropdown */}
              {presetItems.length > 0 && (
                <ModernDropdown
                  value=""
                  items={presetItems}
                  onChange={(val) => {
                    const idx = parseInt(val.split('_')[1]);
                    if (!isNaN(idx) && (PRESETS as any)[type]?.[idx]) {
                      applyPreset((PRESETS as any)[type][idx]);
                    }
                  }}
                  placeholder="Load preset..."
                  icon="⚡"
                  className="w-48"
                />
              )}

              {/* Drafts Dropdown */}
              {draftItems.length > 0 && (
                <ModernDropdown
                  value=""
                  items={draftItems}
                  onChange={(val) => {
                    const idx = parseInt(val.split('_')[1]);
                    if (!isNaN(idx)) {
                      restoreHistoryItem(idx);
                    }
                  }}
                  placeholder="Load draft..."
                  icon="💾"
                  className="w-48"
                />
              )}
            </div>

            <div className="flex-1" />

            {/* Save Status */}
            {lastSaved && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/30 border border-slate-700/50">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs text-slate-400">
                  Saved {new Date(lastSaved).toLocaleTimeString()}
                </span>
              </div>
            )}

            {/* Collaboration Widget - using PresenceBadge */}
            {activeUsers.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Active:</span>
                <PresenceBadge 
                  members={activeUsers.map(u => ({
                    userId: u.user_id,
                    displayName: u.display_name,
                    lastActive: u.last_active,
                    cursor: u.cursor,
                  }))}
                />
              </div>
            )}

            {/* Remote Changes Alert */}
            {remoteDraft && (
              <button
                onClick={applyRemoteDraft}
                className="px-4 py-2 rounded-lg bg-yellow-600/20 border border-yellow-600/40 text-yellow-400 text-sm font-medium hover:bg-yellow-600/30 transition-all duration-200 flex items-center gap-2 animate-pulse"
              >
                <span>🔔</span>
                <span>Apply Remote Changes</span>
              </button>
            )}
          </div>
        </div>

        {/* LWW Merge Conflict Alert (Step 5) */}
        {conflictServerMeta && (
          <div className="px-6 py-3 bg-yellow-950/40 border-b border-yellow-700/40">
            <MergeConflictAlert
              serverMeta={conflictServerMeta}
              onApplyServer={handleApplyServer}
              onApplyClient={handleApplyClient}
              onAttemptMerge={handleAttemptMerge}
            />
          </div>
        )}

        {/* Remote Draft Alert */}
        {remoteDraft && remoteChangedAt && (
          <div className="px-6 py-3 bg-blue-950/50 border-b border-blue-800/30">
            <RemoteDraftAlert
              remoteUser={remoteDraft.user_id || 'Another user'}
              remoteTimestamp={remoteChangedAt}
              onAccept={applyRemoteDraft}
              onDismiss={() => {
                setRemoteDraft(null);
                setRemoteChangedAt(null);
              }}
            />
          </div>
        )}

        {/* Context Selection Panel */}
        {subjects.length > 0 && (
          <div className="px-6 py-4 bg-slate-900/30 border-b border-white/10">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-slate-400">📍 Content Context</div>
                <div className="text-xs text-slate-500">
                  {subtopicId ? '📑 Subtopic Level' : topicId ? '📖 Topic Level' : '📚 Subject Level'}
                </div>
              </div>

              {/* Selectors Grid */}
              <div className="grid grid-cols-3 gap-3">
                {/* Subject Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-400">Subject</label>
                    <div className="flex gap-1">
                      {onAddSubject && (
                        <button
                          onClick={onAddSubject}
                          className="w-6 h-6 rounded bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-600/40 text-indigo-400 text-xs font-bold transition-all hover:scale-110"
                          title="Add new subject"
                        >
                          +
                        </button>
                      )}
                      {onDeleteSubject && (
                        <button
                          onClick={onDeleteSubject}
                          className="w-6 h-6 rounded bg-red-600/20 hover:bg-red-600/30 border border-red-600/40 text-red-400 text-xs font-bold transition-all hover:scale-110"
                          title="Delete subject"
                          disabled={!subjectId}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                  <select
                    value={subjectId}
                    onChange={(e) => onSubjectChange?.(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white text-sm hover:bg-slate-800/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.emoji || '📚'} {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Topic Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-400">Topic</label>
                    <div className="flex gap-1">
                      {onAddTopic && (
                        <button
                          onClick={onAddTopic}
                          className="w-6 h-6 rounded bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-600/40 text-indigo-400 text-xs font-bold transition-all hover:scale-110"
                          title="Add new topic"
                          disabled={!subjectId}
                        >
                          +
                        </button>
                      )}
                      {onDeleteTopic && (
                        <button
                          onClick={onDeleteTopic}
                          className="w-6 h-6 rounded bg-red-600/20 hover:bg-red-600/30 border border-red-600/40 text-red-400 text-xs font-bold transition-all hover:scale-110"
                          title="Delete topic"
                          disabled={!topicId}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                  <select
                    value={topicId}
                    onChange={(e) => onTopicChange?.(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white text-sm hover:bg-slate-800/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    disabled={!subjectId}
                  >
                    {subjects
                      .find(s => s.id === subjectId)
                      ?.topics?.map((t: any) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      )) || <option>No topics available</option>}
                  </select>
                </div>

                {/* Subtopic Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-slate-400">
                      Subtopic <span className="text-slate-600">(optional)</span>
                    </label>
                    <div className="flex gap-1">
                      {onAddSubtopic && (
                        <button
                          onClick={onAddSubtopic}
                          className="w-6 h-6 rounded bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-600/40 text-indigo-400 text-xs font-bold transition-all hover:scale-110"
                          title="Add new subtopic"
                          disabled={!topicId}
                        >
                          +
                        </button>
                      )}
                      {onDeleteSubtopic && (
                        <button
                          onClick={onDeleteSubtopic}
                          className="w-6 h-6 rounded bg-red-600/20 hover:bg-red-600/30 border border-red-600/40 text-red-400 text-xs font-bold transition-all hover:scale-110"
                          title="Delete subtopic"
                          disabled={!subtopicId}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                  <select
                    value={subtopicId}
                    onChange={(e) => onSubtopicChange?.(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white text-sm hover:bg-slate-800/70 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    disabled={!topicId}
                  >
                    <option value="">-- None (Add to Topic) --</option>
                    {subjects
                      .find(s => s.id === subjectId)
                      ?.topics?.find((t: any) => t.id === topicId)
                      ?.subtopics?.map((st: any) => (
                        <option key={st.id} value={st.id}>
                          {st.title}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="text-xs text-slate-500">
                  {subjectId && topicId ? (
                    <span>
                      ✓ Ready to create in: <span className="text-slate-300 font-medium">
                        {subjects.find(s => s.id === subjectId)?.title}
                      </span> → <span className="text-slate-300 font-medium">
                        {subjects.find(s => s.id === subjectId)?.topics?.find((t: any) => t.id === topicId)?.title}
                      </span>
                      {subtopicId && (
                        <>
                          {' → '}<span className="text-slate-300 font-medium">
                            {subjects.find(s => s.id === subjectId)?.topics?.find((t: any) => t.id === topicId)?.subtopics?.find((st: any) => st.id === subtopicId)?.title}
                          </span>
                        </>
                      )}
                    </span>
                  ) : (
                    <span className="text-yellow-500">⚠ Please select at least Subject and Topic</span>
                  )}
                </div>
                {subjectId && topicId && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-green-500/10 border border-green-500/20">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-xs text-green-400 font-medium">Ready</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Editor + Preview Grid - Equal Height */}
        <div className="flex-1 grid grid-cols-2 gap-6 p-6 overflow-hidden">
          {/* Editor Panel */}
          <div className="h-full flex flex-col overflow-hidden">
            <div className="h-full flex flex-col p-6 rounded-xl bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="mb-4 flex items-center justify-between shrink-0">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span>✏️</span>
                  <span>Editor</span>
                </h2>
                <div className="px-3 py-1 rounded-lg bg-slate-800/50 text-xs text-slate-400 font-mono">
                  {BOX_TYPE_ICONS[type]} {type}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {/* Title Input */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {type === 'mnemonic-magic' || type === 'mnemonic-card' ? '🎯 Mnemonic' : '📝 Title'}
                  </label>
                  <input
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder={
                      type === 'mnemonic-magic' || type === 'mnemonic-card'
                        ? 'Enter mnemonic (e.g., RRCSP, JLEF)'
                        : 'Enter note title'
                    }
                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700/50 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none transition-colors"
                  />
                </div>

                {/* Rich Text Editor for big-notes and container-notes */}
                {(type === 'big-notes' || type === 'container-notes') && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      📄 Content (Rich Text)
                    </label>
                    <RichTextEditor
                      key={`editor-${subjectId}-${topicId}-${subtopicId}-${type}-${editorLoadKey}`}
                      value={bodyHtml}
                      onChange={(html: string) => {
                        setBodyHtml(html);
                        setIsDirty(true);
                      }}
                      placeholder="Write detailed explanation here..."
                      minHeight={300}
                    />
                  </div>
                )}

                {/* Points/Statements Field */}
                {(type === 'small-notes' ||
                  type === 'big-notes' ||
                  type === 'container-notes' ||
                  type === 'mnemonic-magic' ||
                  type === 'mnemonic-card' ||
                  type === 'right-wrong' ||
                  type === 'quick-reference') && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {type === 'small-notes' && '📋 Points'}
                      {(type === 'big-notes' || type === 'container-notes') && '✨ Key Highlights'}
                      {(type === 'mnemonic-magic' || type === 'mnemonic-card') && '🔤 Breakdown'}
                      {type === 'right-wrong' && '✓✗ Statements'}
                      {type === 'quick-reference' && '📌 Facts'}
                    </label>

                    {/* Symbol Helper Buttons for Right/Wrong */}
                    {type === 'right-wrong' && (
                      <div className="flex gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => {
                            const textarea = document.querySelector('textarea[placeholder*="correct"]') as HTMLTextAreaElement;
                            if (textarea) {
                              const start = textarea.selectionStart;
                              const end = textarea.selectionEnd;
                              const text = textarea.value;
                              const newText = text.substring(0, start) + '✓ ' + text.substring(end);
                              setPointsText(newText);
                              setIsDirty(true);
                              setTimeout(() => {
                                textarea.focus();
                                textarea.setSelectionRange(start + 2, start + 2);
                              }, 0);
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-green-600/20 border border-green-600/40 text-green-400 text-xs hover:bg-green-600/30 transition-all duration-200 flex items-center gap-1.5"
                        >
                          <span className="text-base">✓</span> Insert Correct
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const textarea = document.querySelector('textarea[placeholder*="correct"]') as HTMLTextAreaElement;
                            if (textarea) {
                              const start = textarea.selectionStart;
                              const end = textarea.selectionEnd;
                              const text = textarea.value;
                              const newText = text.substring(0, start) + '✗ ' + text.substring(end);
                              setPointsText(newText);
                              setIsDirty(true);
                              setTimeout(() => {
                                textarea.focus();
                                textarea.setSelectionRange(start + 2, start + 2);
                              }, 0);
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-red-600/20 border border-red-600/40 text-red-400 text-xs hover:bg-red-600/30 transition-all duration-200 flex items-center gap-1.5"
                        >
                          <span className="text-base">✗</span> Insert Incorrect
                        </button>
                      </div>
                    )}

                    <textarea
                      value={pointsText}
                      onChange={(e) => {
                        setPointsText(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder={
                        type === 'small-notes'
                          ? 'Point 1\nPoint 2\nPoint 3'
                          : type === 'big-notes' || type === 'container-notes'
                          ? 'Highlight 1\nHighlight 2 (optional)'
                          : type === 'mnemonic-magic' || type === 'mnemonic-card'
                          ? 'R - Religion - Cannot discriminate based on religion\nR - Race - Cannot discriminate based on race'
                          : type === 'right-wrong'
                          ? '✓ This statement is correct\ntrue: You can also use text format\n✗ This statement is wrong\nfalse: Or use false: for incorrect'
                          : type === 'quick-reference'
                          ? 'Article Number | 15\nType | Fundamental Right'
                          : 'Enter content'
                      }
                      rows={type === 'big-notes' || type === 'container-notes' ? 4 : 8}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700/50 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none transition-colors font-mono text-sm resize-none"
                    />
                    <div className="mt-2 text-xs text-slate-500">
                      {type === 'right-wrong' &&
                        '💡 Use ✓/✗ symbols (click buttons above) OR type "true:"/"false:" OR "correct:"/"wrong:"'}
                      {(type === 'mnemonic-magic' || type === 'mnemonic-card') &&
                        '💡 Format: Letter - Word - Meaning (use "-" or ":" as separators)'}
                      {type === 'quick-reference' && '💡 Format: Label | Value (use "|" or ":")'}
                    </div>
                  </div>
                )}

                {/* Flashcard Field */}
                {type === 'flashcard' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      🎴 Flashcards
                    </label>
                    <textarea
                      value={flashText}
                      onChange={(e) => {
                        setFlashText(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder="What is Article 15? | Prohibition of discrimination\nWho can make laws? | Parliament and State Legislatures"
                      rows={8}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-700/50 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none transition-colors font-mono text-sm resize-none"
                    />
                    <div className="mt-2 text-xs text-slate-500">
                      💡 Format: Question | Answer (one flashcard per line)
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview Panel - Equal Height */}
          <div className="h-full flex flex-col overflow-hidden">
            <div className="h-full flex flex-col rounded-xl bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
              {/* Preview Header */}
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/70 shrink-0">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <span>🔍</span>
                  <span>Live Preview</span>
                </h2>
                <div className="px-3 py-1 rounded-lg bg-slate-800/50 text-xs text-slate-400 font-mono">
                  {BOX_TYPE_ICONS[type]} {type}
                </div>
              </div>

              {/* Preview Content */}
              <div className="flex-1 p-6 overflow-y-auto">
                <NoteBoxPreview note={previewNote} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
