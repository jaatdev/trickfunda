// components/admin/NoteBoxCreator.tsx
'use client';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createNotesManager } from '@/lib/notesManager';
import { NoteBoxType, NoteBox } from '@/lib/admin-types';
import { boxThemes, themeMap } from '@/lib/admin-themes';
import NoteBoxPreview from './NoteBoxPreview';
import RichTextEditor from './RichTextEditor';
import { getSupabaseClient } from '@/lib/supabaseClient';

const NOTES_MANAGER = createNotesManager();

const BOX_TYPES: { key: NoteBoxType; label: string; hint?: string; category: string }[] = [
  // Content Presentation
  { key: 'big-notes', label: 'Big Notes', hint: 'Long explanation', category: 'Content' },
  { key: 'small-notes', label: 'Small Notes', hint: 'Bullet points', category: 'Content' },
  { key: 'container-notes', label: 'Container', hint: 'Sections', category: 'Content' },
  { key: 'rich-content', label: 'Rich Content', hint: 'Media rich', category: 'Content' },
  { key: 'story-box', label: 'Story', hint: 'Narrative', category: 'Content' },
  { key: 'definition-box', label: 'Definition', hint: 'Term definition', category: 'Content' },
  { key: 'example-box', label: 'Examples', hint: 'Code examples', category: 'Content' },
  { key: 'summary-box', label: 'Summary', hint: 'Key takeaways', category: 'Content' },
  // Memory & Learning
  { key: 'mnemonic-magic', label: 'Mnemonic Magic', hint: 'Letter breakdown', category: 'Memory' },
  { key: 'mnemonic-card', label: 'Mnemonic Card', hint: 'Quick recall', category: 'Memory' },
  { key: 'flashcard', label: 'Flashcard', hint: 'Q/A pairs', category: 'Memory' },
  { key: 'acronym-box', label: 'Acronym', hint: 'Acronym expansion', category: 'Memory' },
  { key: 'analogy-box', label: 'Analogy', hint: 'Concept analogy', category: 'Memory' },
  { key: 'pattern-box', label: 'Pattern', hint: 'Pattern recognition', category: 'Memory' },
  { key: 'memory-palace', label: 'Memory Palace', hint: 'Location memory', category: 'Memory' },
  // Assessment
  { key: 'right-wrong', label: 'Right/Wrong', hint: 'T/F statements', category: 'Assessment' },
  { key: 'quiz-box', label: 'Quiz', hint: 'MCQ questions', category: 'Assessment' },
  { key: 'case-study', label: 'Case Study', hint: 'Scenario analysis', category: 'Assessment' },
  { key: 'problem-solution', label: 'Problem/Solution', hint: 'Step-by-step', category: 'Assessment' },
  { key: 'practice-box', label: 'Practice', hint: 'Practice problems', category: 'Assessment' },
  { key: 'challenge-box', label: 'Challenge', hint: 'Timed challenge', category: 'Assessment' },
  // Reference
  { key: 'quick-reference', label: 'Quick Reference', hint: 'Label/value pairs', category: 'Reference' },
  { key: 'formula-box', label: 'Formula', hint: 'Math formulas', category: 'Reference' },
  { key: 'timeline-box', label: 'Timeline', hint: 'Chronological events', category: 'Reference' },
  { key: 'comparison-box', label: 'Comparison', hint: 'Side-by-side', category: 'Reference' },
  { key: 'checklist-box', label: 'Checklist', hint: 'Task checklist', category: 'Reference' },
  // Visual
  { key: 'diagram-box', label: 'Diagram', hint: 'Annotated diagram', category: 'Visual' },
  { key: 'flowchart-box', label: 'Flowchart', hint: 'Process flow', category: 'Visual' },
  { key: 'infographic-box', label: 'Infographic', hint: 'Data visualization', category: 'Visual' },
  { key: 'gallery-box', label: 'Gallery', hint: 'Image gallery', category: 'Visual' },
  // Special
  { key: 'warning-box', label: 'Warning', hint: 'Important warning', category: 'Special' },
  { key: 'tip-box', label: 'Tip', hint: 'Helpful tip', category: 'Special' },
  { key: 'quote-box', label: 'Quote', hint: 'Inspirational quote', category: 'Special' },
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
      pointsText: '? Article 15 prohibits discrimination\n? Article 15 allows discrimination on all grounds\n? Special provisions can be made for women and children'
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
};

export default function NoteBoxCreator({ subjectId, topicId, subtopicId, onCreated }: Props) {
  // Clerk auth state (client-side)
  const { isSignedIn, isLoaded } = useAuth();

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

  // Optional display name
  const [displayName] = useState(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('notty_editor_display')) || null;
  });

  const supabase = typeof window !== 'undefined' ? getSupabaseClient() : null;
  const channelRef = useRef<any>(null);
  const heartbeatRef = useRef<number | null>(null);

  const [type, setType] = useState<NoteBoxType>('big-notes');
  const [themeId, setThemeId] = useState<string>(() => Object.keys(themeMap)[0] || '');

  const [title, setTitle] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [pointsText, setPointsText] = useState('');
  const [flashText, setFlashText] = useState('');

  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [lastCreatedNote, setLastCreatedNote] = useState<NoteBox | null>(null);

  // Realtime collaboration state
  const [activeUsers, setActiveUsers] = useState<{ user_id: string; display_name?: string; last_active?: string }[]>([]);
  const [remoteDraft, setRemoteDraft] = useState<any | null>(null);
  const [remoteChangedAt, setRemoteChangedAt] = useState<string | null>(null);

  useEffect(() => {
    try {
      const key = DRAFT_KEY(subjectId, topicId, subtopicId, type);
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        setTitle(parsed.title || '');
        setBodyHtml(parsed.bodyHtml || '');
        setPointsText(parsed.pointsText || '');
        setFlashText(parsed.flashText || '');
        setLastSaved(parsed.savedAt || null);
      }
    } catch (e) {
      console.warn('draft parse fail', e);
    }
    try {
      const hk = DRAFT_HISTORY_KEY(subjectId, topicId, subtopicId, type);
      const hr = localStorage.getItem(hk);
      if (hr) setHistory(JSON.parse(hr));
    } catch {}
  }, [subjectId, topicId, subtopicId, type]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDirty) return;
      saveDraft();
    }, 5000);
    return () => clearInterval(interval);
  }, [isDirty, title, bodyHtml, pointsText, flashText, subjectId, topicId, subtopicId, type]);

  async function saveDraft() {
    try {
      const key = DRAFT_KEY(subjectId, topicId, subtopicId, type);
      const payload = { title, bodyHtml, pointsText, flashText, savedAt: Date.now() };
      
      // Save to localStorage first (immediate, offline-safe)
      localStorage.setItem(key, JSON.stringify(payload));
      setLastSaved(payload.savedAt);
      setIsDirty(false);
      
      // Update history
      const hk = DRAFT_HISTORY_KEY(subjectId, topicId, subtopicId, type);
      const entry = JSON.stringify({ ...payload, ts: payload.savedAt });
      const existing = localStorage.getItem(hk);
      const arr = existing ? JSON.parse(existing) as string[] : [];
      arr.unshift(entry);
      const sliced = arr.slice(0, 5);
      localStorage.setItem(hk, JSON.stringify(sliced));
      setHistory(sliced);

      // Sync to server (best-effort, non-blocking)
      try {
        await fetch('/api/drafts/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            noteKey: key,
            subjectId,
            topicId,
            subtopicId,
            type,
            userId: editorId, // Use editorId for collaboration tracking
            payload,
          }),
        });
      } catch (serverErr) {
        console.warn('Server draft save failed (offline or error):', serverErr);
        // Continue - localStorage still works
      }
    } catch (err) {
      console.warn('draft save failed', err);
    }
  }

  function clearDraft() {
    try {
      const key = DRAFT_KEY(subjectId, topicId, subtopicId, type);
      localStorage.removeItem(key);
    } catch {}
    setTitle('');
    setBodyHtml('');
    setPointsText('');
    setFlashText('');
    setLastSaved(null);
    setIsDirty(false);
  }

  function restoreHistoryItem(index: number) {
    try {
      const hk = DRAFT_HISTORY_KEY(subjectId, topicId, subtopicId, type);
      const existing = localStorage.getItem(hk);
      if (!existing) return;
      const arr = JSON.parse(existing) as string[];
      const item = arr[index];
      if (!item) return;
      const parsed = JSON.parse(item);
      setTitle(parsed.title || '');
      setBodyHtml(parsed.bodyHtml || '');
      setPointsText(parsed.pointsText || '');
      setFlashText(parsed.flashText || '');
      setIsDirty(true);
    } catch (e) {
      console.warn('restore history failed', e);
    }
  }

  useEffect(() => {
    setIsDirty(true);
  }, [title, bodyHtml, pointsText, flashText, type]);

  // Realtime presence subscription + heartbeat
  useEffect(() => {
    if (!supabase) return;

    const noteDraftKey = DRAFT_KEY(subjectId, topicId, subtopicId, type);
    console.log('?? Setting up realtime for noteKey:', noteDraftKey, 'editorId:', editorId);

    // Helper function to fetch and update active users
    const fetchActiveUsers = async () => {
      try {
        const { data } = await supabase
          .from('note_edit_presence')
          .select('*')
          .eq('note_key', noteDraftKey);
        console.log('?? Fetched active users:', data);
        if (data) {
          setActiveUsers(
            data.map((r: any) => ({
              user_id: r.user_id,
              display_name: r.display_name,
              last_active: r.last_active,
            }))
          );
        }
      } catch (err) {
        console.warn('presence fetch error', err);
      }
    };

    // Subscribe to presence and drafts for this noteKey
    const channel = supabase
      .channel(`notty-note-${noteDraftKey}`)
      // Listen to presence table changes
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'note_edit_presence', filter: `note_key=eq.${noteDraftKey}` },
        async () => {
          console.log('?? Presence change detected for', noteDraftKey);
          await fetchActiveUsers();
        }
      )
      // Listen to note_drafts changes to pick up remote saves
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'note_drafts', filter: `note_key=eq.${noteDraftKey}` },
        (payload) => {
          console.log('?? Draft change detected:', payload);
          try {
            const rec = (payload as any).record;
            if (!rec) return;
            // If the saving user is not this editor, set remoteDraft notification
            if (rec.user_id && rec.user_id !== editorId) {
              console.log('?? Remote draft from user:', rec.user_id);
              setRemoteDraft(rec.payload || rec);
              setRemoteChangedAt(rec.updated_at || new Date().toISOString());
            }
          } catch (err) {
            console.warn('draft payload parse', err);
          }
        }
      )
      .subscribe((status) => {
        console.log('?? Subscription status:', status);
      });

    channelRef.current = channel;

    // Init presence heartbeat loop (POST to our server)
    const heartbeat = async () => {
      try {
        // Only send heartbeat if the user is signed in
        if (!isSignedIn) return;

        console.log('?? Sending heartbeat for', noteDraftKey);
        const response = await fetch('/api/presence/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ noteKey: noteDraftKey, userId: editorId, displayName }),
        });
        const result = await response.json();
        console.log('?? Heartbeat response:', result);
        
        // After successful heartbeat, fetch the updated user list
        await fetchActiveUsers();
      } catch (err) {
        console.warn('heartbeat failed', err);
      }
    };

    // Run heartbeat now (which will also fetch users) and then every 10s
    void heartbeat();
    heartbeatRef.current = window.setInterval(heartbeat, 10000);

    const leaveHandler = async () => {
      try {
        await fetch('/api/presence/leave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Include cookies (required for Clerk auth)
          body: JSON.stringify({ noteKey: noteDraftKey, userId: editorId }),
        });
      } catch (err) {
        // ignore
      }
    };

    window.addEventListener('beforeunload', leaveHandler);

    return () => {
      // Cleanup
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      window.removeEventListener('beforeunload', leaveHandler);
      
      // Call leave once
      (async () => {
        try {
          await fetch('/api/presence/leave', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Include cookies (required for Clerk auth)
            body: JSON.stringify({ noteKey: noteDraftKey, userId: editorId }),
          });
        } catch (e) {}
      })();
      
      // Unsubscribe channel
      try {
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
        }
      } catch (e) {
        // ignore
      }
    };
  }, [supabase, subjectId, topicId, subtopicId, type, editorId, displayName, isSignedIn]);

  // Apply remote draft helper
  function applyRemoteDraft() {
    if (!remoteDraft) return;
    try {
      setTitle(remoteDraft.title || '');
      setBodyHtml(remoteDraft.bodyHtml || '');
      setPointsText(remoteDraft.pointsText || '');
      setFlashText(remoteDraft.flashText || '');
      setRemoteDraft(null);
      setRemoteChangedAt(null);
      setIsDirty(true);
      alert('Remote draft applied to your editor');
    } catch (err) {
      console.warn(err);
    }
  }

  useEffect(() => {
    const tlist = (boxThemes as any)[type] || [];
    if (tlist.length && !tlist.find((t: any) => t.id === themeId)) {
      setThemeId(tlist[0].id);
    }
  }, [type, themeId]);

  const suggestedThemes = (boxThemes as any)[type] || [];

  const contentForType = useMemo(() => {
    switch (type) {
      case 'big-notes': {
        const highlights = pointsText ? pointsText.split('\n').filter(Boolean) : [];
        return { 
          heading: title || 'Heading', 
          body: bodyHtml || '<p>Long-form explanation...</p>',
          highlights: highlights.length > 0 ? highlights : undefined
        };
      }
      case 'small-notes': {
        const points = pointsText ? pointsText.split('\n').filter(Boolean) : ['Point 1', 'Point 2'];
        return { 
          title: title || 'Quick points', 
          points 
        };
      }
      case 'right-wrong': {
        const lines = pointsText ? pointsText.split('\n').filter(Boolean) : [];
        const statements = lines.map((line, i) => {
          // Format: ? OR true: OR correct: = correct statement
          // Format: ? OR false: OR wrong: OR incorrect: = incorrect statement
          const trimmedLine = line.trim();
          let isCorrect = true; // default
          let statement = trimmedLine;
          
          // Check for symbols or text prefixes
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
            explanation: '' // Optional, can be added with || separator
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
          // Format: Letter - Word - Meaning OR Letter: Word: Meaning
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
        const breakdown = lines.map((line, i) => {
          const parts = line.split(/[-:]/).map(s => s.trim());
          return {
            letter: parts[0] || mnemonic[i] || 'X',
            word: parts[1] || 'Word',
            meaning: parts[2] || 'Meaning'
          };
        });
        return { 
          mnemonic,
          breakdown: breakdown.length > 0 ? breakdown : mnemonic.split('').map((letter, i) => ({
            letter,
            word: `Word ${i + 1}`,
            meaning: `Meaning ${i + 1}`
          }))
        };
      }
      case 'container-notes': {
        const highlights = pointsText ? pointsText.split('\n').filter(Boolean) : [];
        return { 
          heading: title || 'Container', 
          body: bodyHtml || '<p>Container content...</p>',
          highlights: highlights.length > 0 ? highlights : undefined
        };
      }
      case 'quick-reference': {
        const lines = pointsText ? pointsText.split('\n').filter(Boolean) : [];
        const facts = lines.map((line, i) => {
          // Format: Label | Value OR Label: Value
          const parts = line.split(/[|:]/).map(s => s.trim());
          return {
            id: `fact_${i}`,
            label: parts[0] || `Label ${i + 1}`,
            value: parts[1] || `Value ${i + 1}`
          };
        });
        return { 
          title: title || 'Quick Reference', 
          facts: facts.length > 0 ? facts : [
            { id: 'fact_0', label: 'Label 1', value: 'Value 1' }
          ]
        };
      }
      case 'flashcard': {
        const lines = flashText ? flashText.split('\n').filter(Boolean) : [];
        const cards = lines.map((line, i) => {
          // Format: Question | Answer
          const [q, a] = line.split('|').map(s => s?.trim() || '');
          return { 
            id: `flash_${i}`, 
            question: q || `Question ${i + 1}`, 
            answer: a || `Answer ${i + 1}` 
          };
        });
        return {
          title: title || 'Flashcards',
          cards: cards.length > 0 ? cards : [
            { id: 'flash_0', question: 'What is X?', answer: 'X is Y' }
          ]
        };
      }
      default:
        return {};
    }
  }, [type, title, bodyHtml, pointsText, flashText]);

  function applyPreset(preset: any) {
    if (!preset) return;
    if (preset.title) setTitle(preset.title);
    if (preset.bodyHtml) setBodyHtml(preset.bodyHtml);
    if (preset.pointsText) setPointsText(preset.pointsText);
    if (preset.flashText) setFlashText(preset.flashText);
    setIsDirty(true);
  }

  async function handleCreate() {
    if (!subjectId || !topicId || !subtopicId) {
      alert('Missing target IDs');
      return;
    }
    
    console.log('?? Creating note with:', { subjectId, topicId, subtopicId, type });
    
    // Verify the IDs exist
    const subject = NOTES_MANAGER.getSubject(subjectId);
    if (!subject) {
      alert(`? Subject not found: ${subjectId}\n\nPlease make sure the subject exists in notesManager.`);
      return;
    }
    
    const topic = subject.topics.find(t => t.id === topicId);
    if (!topic) {
      alert(`? Topic not found: ${topicId}\n\nPlease make sure the topic exists in the selected subject.`);
      return;
    }
    
    const subtopic = topic.subtopics.find(st => st.id === subtopicId);
    if (!subtopic) {
      alert(`? Subtopic not found: ${subtopicId}\n\nPlease make sure the subtopic exists in the selected topic.`);
      return;
    }
    
    const nb = NOTES_MANAGER.createNoteBox(subjectId, topicId, subtopicId, type, contentForType, themeId);
    if (nb) {
      saveDraft();
      clearDraft();
      setLastCreatedNote(nb);
      if (onCreated) onCreated(nb);
      
      // Get the count of existing notes in this subtopic
      const updatedSubject = NOTES_MANAGER.getSubject(subjectId);
      const updatedTopic = updatedSubject?.topics.find(t => t.id === topicId);
      const updatedSubtopic = updatedTopic?.subtopics.find(st => st.id === subtopicId);
      const noteCount = updatedSubtopic?.notes.length || 0;
      
      alert(`? Note created successfully!\n\nThis subtopic now has ${noteCount} note${noteCount !== 1 ? 's' : ''}.\nYour new note was added to the end of the list.`);
    } else {
      alert('Failed to create note. Check IDs');
    }
  }

  async function handlePublish() {
    if (!lastCreatedNote) {
      alert('No note to publish. Please create a note first.');
      return;
    }

    setIsPublishing(true);
    try {
      const response = await fetch('/api/published/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noteKey: `${subjectId}-${topicId}-${subtopicId}`,
          noteBoxId: lastCreatedNote.id,
          subjectSlug: subjectId,
          topicId,
          subtopicId,
          title: lastCreatedNote.content?.title || title,
          bodyHtml: lastCreatedNote.content?.body || bodyHtml,
          payload: lastCreatedNote.content,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`? Failed to publish: ${error.message}`);
        return;
      }

      const result = await response.json();
      alert(`? Note published successfully!\n\nPublic URL: /notes/${result.noteKey}\n\nStudents can now see this note in the published section.`);
      setLastCreatedNote(null);
    } catch (error) {
      console.error('Publish error:', error);
      alert(`? Error publishing note: ${(error as Error).message}`);
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-1 space-y-4">
        <div className="p-4 rounded-lg admin-card max-h-[600px] overflow-y-auto">
          <div className="text-sm text-slate-300 mb-2">Box type (33 types)</div>
          {['Content', 'Memory', 'Assessment', 'Reference', 'Visual', 'Special'].map(cat => (
            <div key={cat} className="mb-4">
              <div className="text-xs font-semibold text-slate-500 mb-2">{cat}</div>
              <div className="grid gap-2">
                {BOX_TYPES.filter(b => b.category === cat).map(b => (
                  <button
                    key={b.key}
                    onClick={() => setType(b.key)}
                    className={`text-left px-3 py-2 rounded-md border ${type === b.key ? 'border-indigo-500 bg-slate-800/30' : 'border-slate-700'}`}
                  >
                    <div className="font-medium text-sm">{b.label}</div>
                    <div className="text-xs text-slate-400">{b.hint}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-lg admin-card">
          <div className="text-sm text-slate-300 mb-2">Theme</div>
          <div className="flex flex-wrap gap-2">
            {suggestedThemes.length ? (suggestedThemes as any).map((t: any) => (
              <button
                key={t.id}
                onClick={() => setThemeId(t.id)}
                className={`px-2 py-1 rounded-md text-sm ${themeId === t.id ? 'ring-2 ring-indigo-500' : 'opacity-90'}`}
              >
                {t.name}
              </button>
            )) : (
              Object.values(themeMap).slice(0, 6).map((t: any) => (
                <button key={t.id} onClick={() => setThemeId(t.id)} className={`px-2 py-1 rounded-md text-sm ${themeId === t.id ? 'ring-2 ring-indigo-500' : ''}`}>{t.name}</button>
              ))
            )}
          </div>
        </div>

        <div className="p-4 rounded-lg admin-card">
          <div className="text-sm text-slate-300 mb-2">Presets</div>
          <div className="flex flex-col gap-2">
            {(PRESETS as any)[type] ? (PRESETS as any)[type].map((p: any, i: number) => (
              <button key={i} className="text-left px-3 py-2 rounded bg-slate-800/30" onClick={() => applyPreset(p)}>{p.title}</button>
            )) : null}
            <button className="text-left px-3 py-2 rounded border border-slate-700" onClick={() => {
              setTitle(''); setBodyHtml(''); setPointsText(''); setFlashText('');
            }}>Clear</button>
          </div>
        </div>

        <div className="p-4 rounded-lg admin-card">
          <div className="text-sm text-slate-300 mb-2">Drafts</div>
          <div className="text-xs text-slate-400 mb-3">Autosave every 5s. Manual save on Create.</div>
          <div className="flex flex-col gap-2">
            <div className="text-xs text-slate-300">Last saved: {lastSaved ? new Date(lastSaved).toLocaleString() : '�'}</div>
            <button onClick={saveDraft} className="px-2 py-1 rounded bg-slate-800/30 text-sm">Save Draft</button>
            <button onClick={clearDraft} className="px-2 py-1 rounded border border-slate-700 text-sm">Clear Draft</button>
            {history.length > 0 && (
              <div className="mt-2">
                <div className="text-xs text-slate-400 mb-1">History</div>
                <div className="flex flex-col gap-1">
                  {history.map((h, idx) => {
                    const parsed = JSON.parse(h);
                    return (
                      <button key={idx} onClick={() => restoreHistoryItem(idx)} className="text-left px-2 py-1 rounded bg-slate-800/20 text-xs">
                        {new Date(parsed.ts).toLocaleString()}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Collaboration Status - Always Visible for Debugging */}
        <div className="p-3 rounded-lg admin-card">
          <div className="text-sm text-slate-300 mb-2">Collaboration</div>
          <div className="text-xs text-slate-400 mb-2">
            My ID: {editorId.slice(0, 8)} | Total users: {activeUsers.length}
          </div>
          <div className="text-xs text-slate-500 mb-2 font-mono break-all">
            NoteKey: {DRAFT_KEY(subjectId, topicId, subtopicId, type).slice(0, 40)}...
          </div>
          
          {activeUsers.filter(u => u.user_id !== editorId).length > 0 ? (
            <div className="mb-3">
              <div className="text-xs text-slate-400 mb-1">Active editors ({activeUsers.filter(u => u.user_id !== editorId).length})</div>
              <div className="flex flex-wrap gap-2">
                {activeUsers.filter(u => u.user_id !== editorId).map(u => (
                  <div key={u.user_id} className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800/30 text-xs">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span>{u.display_name || u.user_id.slice(0, 8)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 mb-2">No other editors online</div>
          )}

          {remoteDraft && (
            <div className="p-2 rounded border border-yellow-600 bg-yellow-900/10">
              <div className="text-xs font-medium text-yellow-300 mb-1">Remote changes</div>
              <button 
                onClick={applyRemoteDraft} 
                className="px-2 py-1 rounded bg-yellow-600 text-white text-xs hover:bg-yellow-700 w-full"
              >
                Apply changes
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button onClick={handleCreate} className="rounded-md px-4 py-2 bg-linear-to-r from-indigo-600 to-cyan-500 text-white">Create Note</button>
            <button onClick={() => { setTitle(''); setBodyHtml(''); setPointsText(''); setFlashText(''); }} className="rounded-md px-4 py-2 border border-slate-700">Reset</button>
          </div>
          
          {lastCreatedNote && (
            <button 
              onClick={handlePublish}
              disabled={isPublishing}
              className={`rounded-md px-4 py-2 flex items-center gap-2 justify-center text-white transition-all ${
                isPublishing 
                  ? 'bg-slate-700 cursor-not-allowed opacity-50' 
                  : 'bg-linear-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600'
              }`}
            >
              {isPublishing ? (
                <>
                  <span className="inline-block animate-spin">?</span>
                  Publishing...
                </>
              ) : (
                <>
  Publish to Student View
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="col-span-2 grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg admin-card col-span-1">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm text-slate-300">Editor</div>
            <div className="text-xs text-slate-400 px-2 py-1 rounded bg-slate-800/30">{type}</div>
          </div>

          <div className="space-y-3">
            {/* Title Field - Universal */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                {type === 'mnemonic-magic' || type === 'mnemonic-card' ? 'Mnemonic (e.g., RRCSP)' : 'Title'}
              </label>
              <input 
                value={title} 
                onChange={(e) => { setTitle(e.target.value); setIsDirty(true); }} 
                placeholder={
                  type === 'mnemonic-magic' || type === 'mnemonic-card' 
                    ? 'Enter mnemonic (e.g., RRCSP, JLEF)' 
                    : 'Enter note title'
                } 
                className="w-full px-3 py-2 rounded bg-slate-900/50 border border-slate-700 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Body Field - Rich Text for big-notes and container-notes */}
            {(type === 'big-notes' || type === 'container-notes') && (
              <div>
                <label className="block text-xs text-slate-400 mb-1">Content (Rich Text)</label>
                <RichTextEditor 
                  value={bodyHtml} 
                  onChange={(val) => { setBodyHtml(val); setIsDirty(true); }} 
                  placeholder="Write detailed explanation here... (supports bold, lists, images, etc.)" 
                />
              </div>
            )}

            {/* Points Field - For various types */}
            {(type === 'small-notes' || type === 'big-notes' || type === 'container-notes' || 
              type === 'mnemonic-magic' || type === 'mnemonic-card' || 
              type === 'right-wrong' || type === 'quick-reference') && (
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  {type === 'small-notes' && 'Points (one per line)'}
                  {(type === 'big-notes' || type === 'container-notes') && 'Key Highlights (one per line, optional)'}
                  {(type === 'mnemonic-magic' || type === 'mnemonic-card') && 'Breakdown (Format: Letter - Word - Meaning)'}
                  {type === 'right-wrong' && 'Statements (Use correct/incorrect symbols OR true:/false: text)'}
                  {type === 'quick-reference' && 'Facts (Format: Label | Value OR Label: Value)'}
                </label>
                
                {/* Symbol helper buttons for right-wrong */}
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
                          const newText = text.substring(0, start) + '? ' + text.substring(end);
                          setPointsText(newText);
                          setIsDirty(true);
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(start + 2, start + 2);
                          }, 0);
                        }
                      }}
                      className="px-3 py-1 rounded bg-green-600/20 border border-green-600/40 text-green-400 text-xs hover:bg-green-600/30 transition-colors flex items-center gap-1"
                    >
                      <span className="text-base">?</span> Insert Correct
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const textarea = document.querySelector('textarea[placeholder*="correct"]') as HTMLTextAreaElement;
                        if (textarea) {
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = textarea.value;
                          const newText = text.substring(0, start) + '? ' + text.substring(end);
                          setPointsText(newText);
                          setIsDirty(true);
                          setTimeout(() => {
                            textarea.focus();
                            textarea.setSelectionRange(start + 2, start + 2);
                          }, 0);
                        }
                      }}
                      className="px-3 py-1 rounded bg-red-600/20 border border-red-600/40 text-red-400 text-xs hover:bg-red-600/30 transition-colors flex items-center gap-1"
                    >
                      <span className="text-base">?</span> Insert Incorrect
                    </button>
                  </div>
                )}
                
                <textarea 
                  value={pointsText} 
                  onChange={(e) => { setPointsText(e.target.value); setIsDirty(true); }} 
                  placeholder={
                    type === 'small-notes' ? 'Point 1\nPoint 2\nPoint 3' :
                    (type === 'big-notes' || type === 'container-notes') ? 'Highlight 1\nHighlight 2 (optional)' :
                    (type === 'mnemonic-magic' || type === 'mnemonic-card') ? 'R - Religion - Cannot discriminate based on religion\nR - Race - Cannot discriminate based on race\nC - Caste - No caste discrimination' :
                    type === 'right-wrong' ? '? This statement is correct\ntrue: You can also use text format\n? This statement is wrong\nfalse: Or use false: for incorrect' :
                    type === 'quick-reference' ? 'Article Number | 15\nType | Fundamental Right\nYear Enacted: 1950' :
                    'Enter content'
                  } 
                  rows={type === 'big-notes' || type === 'container-notes' ? 4 : 8}
                  className="w-full px-3 py-2 rounded bg-slate-900/50 border border-slate-700 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none transition-colors font-mono text-sm"
                />
                <div className="mt-1 text-xs text-slate-500">
                  {type === 'small-notes' && 'Each line becomes a bullet point'}
                  {(type === 'big-notes' || type === 'container-notes') && 'Optional: Add key highlights to display as badges'}
                  {(type === 'mnemonic-magic' || type === 'mnemonic-card') && 'Use "-" or ":" as separators. Each line = one letter breakdown'}
                  {type === 'right-wrong' && 'Use correct/incorrect symbols (click buttons above) OR type "true:"/"false:" OR "correct:"/"wrong:"'}
                  {type === 'quick-reference' && 'Use "|" or ":" to separate label from value'}
                </div>
              </div>
            )}

            {/* Flashcard Field */}
            {type === 'flashcard' && (
              <div>
                <label className="block text-xs text-slate-400 mb-1">Flashcards (Format: Question | Answer)</label>
                <textarea 
                  value={flashText} 
                  onChange={(e) => { setFlashText(e.target.value); setIsDirty(true); }} 
                  placeholder="What is Article 15? | Prohibition of discrimination on grounds of religion, race, caste, sex, or place of birth\nWho can make laws? | Parliament and State Legislatures\nWhat is a fundamental right? | Basic human rights guaranteed by the Constitution"
                  rows={8}
                  className="w-full px-3 py-2 rounded bg-slate-900/50 border border-slate-700 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none transition-colors font-mono text-sm"
                />
                <div className="mt-1 text-xs text-slate-500">
                  Each line is one flashcard. Use "|" to separate question from answer
                </div>
              </div>
            )}
          </div>

          {/* JSON Preview - Collapsible */}
          <details className="mt-4">
            <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-300 transition-colors">
              Advanced: View/Edit Raw JSON
            </summary>
            <pre className="mt-2 rounded bg-[#061022] p-3 text-xs overflow-auto max-h-64 border border-slate-800">{JSON.stringify(contentForType, null, 2)}</pre>
          </details>
        </div>

        <div className="p-4 rounded-lg admin-card">
          <div className="mb-3 text-sm text-slate-300">Preview</div>
          <NoteBoxPreview note={{
            id: 'preview',
            type,
            title: title || 'Preview Title',
            content: contentForType as any,
            themeId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }} />
        </div>
      </div>
    </div>
  );
}
