// components/admin/SubjectManager.tsx
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { createNotesManager, NotesManager, Subject, NoteTopic, NoteSubtopic } from '@/lib/notesManager';
import Modal from '@/components/ui/Modal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import reorderArray from '@/utils/drag';
import NoteInSubtopicModal from '@/components/admin/NoteInSubtopicModal';

const manager: NotesManager = createNotesManager();

type EditingState = {
  mode: 'create-subject' | 'edit-subject' | 'create-topic' | 'edit-topic' | 'create-subtopic' | 'edit-subtopic' | null;
  subject?: Subject | null;
  topic?: NoteTopic | null;
  subtopic?: NoteSubtopic | null;
};

export default function SubjectManager() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [editing, setEditing] = useState<EditingState>({ mode: null });
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; onConfirm?: () => void }>({ open: false, title: '' });

  // Note modal state
  const [noteModal, setNoteModal] = useState<{ open: boolean; subjectId?: string; topicId?: string; subtopicId?: string }>({ open: false });

  // form fields reused for create/edit
  const [formTitle, setFormTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');

  // subject-level extra fields
  const [formDescription, setFormDescription] = useState('');
  const [formBrandColor, setFormBrandColor] = useState<string | undefined>(undefined);

  useEffect(() => {
    setSubjects(manager.listSubjects());
    // subscribe to storage changes? For now re-read on focus
    const onFocus = () => setSubjects(manager.listSubjects());
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  function refresh() {
    setSubjects(manager.listSubjects());
  }

  /* ------------------------
     Subject CRUD
     ------------------------ */
  function openCreateSubject() {
    setFormTitle('');
    setFormSlug('');
    setFormDescription('');
    setFormBrandColor(undefined);
    setEditing({ mode: 'create-subject' });
  }

  function openEditSubject(s: Subject) {
    setFormTitle(s.title);
    setFormSlug(s.slug || '');
    setFormDescription(s.description || '');
    setFormBrandColor(s.brandColor || undefined);
    setEditing({ mode: 'edit-subject', subject: s });
  }

  function submitCreateSubject() {
    if (!formTitle.trim()) return alert('Enter a title');
    const created = manager.createSubject(formTitle.trim(), formSlug?.trim() || undefined);
    if (created) {
      manager.updateSubject(created.id, { 
        description: formDescription.trim() || undefined, 
        brandColor: formBrandColor || undefined 
      });
    }
    refresh();
    setEditing({ mode: null });
  }

  function submitEditSubject() {
    if (!editing.subject) return;
    manager.updateSubject(editing.subject.id, { 
      title: formTitle.trim(), 
      slug: formSlug.trim() || undefined,
      description: formDescription.trim() || undefined,
      brandColor: formBrandColor || undefined
    });
    refresh();
    setEditing({ mode: null, subject: null });
  }

  function deleteSubject(s: Subject) {
    setConfirm({
      open: true,
      title: `Delete subject "${s.title}"? This removes all topics & subtopics.`,
      onConfirm: () => {
        manager.deleteSubject(s.id);
        refresh();
        setConfirm({ open: false, title: '' });
      },
    });
  }

  /* ------------------------
     Topic CRUD
     ------------------------ */
  function openCreateTopic(subject: Subject) {
    setFormTitle('');
    setFormSlug('');
    setEditing({ mode: 'create-topic', subject });
  }

  function openEditTopic(subject: Subject, topic: NoteTopic) {
    setFormTitle(topic.title);
    setFormSlug(topic.slug || '');
    setEditing({ mode: 'edit-topic', subject, topic });
  }

  function submitCreateTopic() {
    if (!editing.subject) return;
    if (!formTitle.trim()) return alert('Enter a title');
    manager.createTopic(editing.subject.id, formTitle.trim(), formSlug?.trim() || undefined);
    refresh();
    setEditing({ mode: null });
  }

  function submitEditTopic() {
    if (!editing.subject || !editing.topic) return;
    manager.updateTopic(editing.subject.id, editing.topic.id, { title: formTitle.trim(), slug: formSlug.trim() || undefined });
    refresh();
    setEditing({ mode: null });
  }

  function deleteTopic(subject: Subject, topic: NoteTopic) {
    setConfirm({
      open: true,
      title: `Delete topic "${topic.title}" from subject "${subject.title}"? This removes all subtopics.`,
      onConfirm: () => {
        manager.deleteTopic(subject.id, topic.id);
        refresh();
        setConfirm({ open: false, title: '' });
      },
    });
  }

  /* ------------------------
     Subtopic CRUD
     ------------------------ */
  function openCreateSubtopic(subject: Subject, topic: NoteTopic) {
    setFormTitle('');
    setFormSlug('');
    setEditing({ mode: 'create-subtopic', subject, topic });
  }

  function openEditSubtopic(subject: Subject, topic: NoteTopic, subtopic: NoteSubtopic) {
    setFormTitle(subtopic.title);
    setFormSlug(subtopic.slug || '');
    setEditing({ mode: 'edit-subtopic', subject, topic, subtopic });
  }

  function submitCreateSubtopic() {
    if (!editing.subject || !editing.topic) return;
    if (!formTitle.trim()) return alert('Enter a title');
    manager.createSubtopic(editing.subject.id, editing.topic.id, formTitle.trim(), formSlug?.trim() || undefined);
    refresh();
    setEditing({ mode: null });
  }

  function submitEditSubtopic() {
    if (!editing.subject || !editing.topic || !editing.subtopic) return;
    manager.updateSubtopic(editing.subject.id, editing.topic.id, editing.subtopic.id, { title: formTitle.trim(), slug: formSlug.trim() || undefined });
    refresh();
    setEditing({ mode: null });
  }

  function deleteSubtopic(subject: Subject, topic: NoteTopic, subtopic: NoteSubtopic) {
    setConfirm({
      open: true,
      title: `Delete subtopic "${subtopic.title}"? This removes all notes inside it.`,
      onConfirm: () => {
        manager.deleteSubtopic(subject.id, topic.id, subtopic.id);
        refresh();
        setConfirm({ open: false, title: '' });
      },
    });
  }

  /* ------------------------
     Reordering (topics, subtopics)
     ------------------------ */
  function handleTopicDragStart(e: React.DragEvent, subjectId: string, topicIndex: number) {
    e.dataTransfer.setData('text/plain', JSON.stringify({ kind: 'topic', subjectId, topicIndex }));
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleTopicDrop(e: React.DragEvent, subjectId: string, dropIndex: number) {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;
    try {
      const parsed = JSON.parse(data);
      if (parsed.kind === 'topic' && parsed.subjectId === subjectId) {
        const s = manager.getSubject(subjectId);
        if (!s) return;
        const topics = [...s.topics];
        const [moved] = topics.splice(parsed.topicIndex, 1);
        topics.splice(dropIndex, 0, moved);
        // persist by updating subject with new topics array
        manager.updateSubject(subjectId, { topics });
        refresh();
      }
    } catch (err) {
      console.warn('drag drop parse', err);
    }
  }

  function handleAllowDrop(e: React.DragEvent) {
    e.preventDefault();
  }

  // Subtopic drag (within same topic)
  function handleSubtopicDragStart(e: React.DragEvent, subjectId: string, topicId: string, subIndex: number) {
    e.dataTransfer.setData('text/plain', JSON.stringify({ kind: 'subtopic', subjectId, topicId, subIndex }));
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleSubtopicDrop(e: React.DragEvent, subjectId: string, topicId: string, dropIndex: number) {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (!data) return;
    try {
      const parsed = JSON.parse(data);
      if (parsed.kind === 'subtopic' && parsed.subjectId === subjectId && parsed.topicId === topicId) {
        const subject = manager.getSubject(subjectId);
        if (!subject) return;
        const topic = subject.topics.find(t => t.id === topicId);
        if (!topic) return;
        const subs = [...topic.subtopics];
        const [moved] = subs.splice(parsed.subIndex, 1);
        subs.splice(dropIndex, 0, moved);
        // persist by updating topic within subject
        manager.updateTopic(subjectId, topicId, { subtopics: subs });
        refresh();
      }
    } catch (err) {
      console.warn('drag drop parse', err);
    }
  }

  /* ------------------------
     Renderers
     ------------------------ */

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">Manage Subjects, Topics & Subtopics</div>
          <div>
            <button onClick={openCreateSubject} className="rounded-md bg-linear-to-r from-indigo-600 to-cyan-500 px-3 py-1 text-sm text-white">New Subject</button>
          </div>
        </div>

        <div className="space-y-4">
          {subjects.length === 0 && (
            <div className="admin-card p-4">No subjects yet. Click "New Subject" to create one.</div>
          )}

          {subjects.map((s) => (
            <div key={s.id} className="admin-card p-4 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="font-semibold text-lg">{s.title}</div>
                    <div className="text-xs text-slate-400">/{s.slug}</div>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{s.topics.length} topics</div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => openCreateTopic(s)} className="px-2 py-1 rounded bg-slate-800/30 text-sm">New Topic</button>
                  <button onClick={() => openEditSubject(s)} className="px-2 py-1 rounded bg-slate-800/30 text-sm">Edit</button>
                  <button onClick={() => deleteSubject(s)} className="px-2 py-1 rounded border border-rose-600 text-rose-300 text-sm">Delete</button>
                </div>
              </div>

              {/* Topics list */}
              <div className="mt-4 space-y-3">
                {s.topics.length === 0 && <div className="text-xs text-slate-400 p-2">No topics. Add one.</div>}

                {s.topics.map((t, tIndex) => (
                  <div
                    key={t.id}
                    className="rounded-md border border-slate-700 p-3 bg-slate-900/20"
                    draggable
                    onDragStart={(e) => handleTopicDragStart(e, s.id, tIndex)}
                    onDragOver={handleAllowDrop}
                    onDrop={(e) => handleTopicDrop(e, s.id, tIndex)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{t.title}</div>
                        <div className="text-xs text-slate-400">/{t.slug} • {t.subtopics.length} subtopics</div>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => openCreateSubtopic(s, t)} className="px-2 py-1 rounded text-sm bg-slate-800/30">New Subtopic</button>
                        <button onClick={() => openEditTopic(s, t)} className="px-2 py-1 rounded text-sm bg-slate-800/30">Edit</button>
                        <button onClick={() => deleteTopic(s, t)} className="px-2 py-1 rounded text-sm border border-rose-600 text-rose-300">Delete</button>
                      </div>
                    </div>

                    {/* Subtopics list */}
                    <div className="mt-3 grid gap-2">
                      {t.subtopics.length === 0 && <div className="text-xs text-slate-400 p-2">No subtopics</div>}

                      {t.subtopics.map((st, stIndex) => (
                        <div
                          key={st.id}
                          className="flex items-center justify-between rounded p-2 bg-slate-800/10 border border-slate-700"
                          draggable
                          onDragStart={(e) => handleSubtopicDragStart(e, s.id, t.id, stIndex)}
                          onDragOver={handleAllowDrop}
                          onDrop={(e) => handleSubtopicDrop(e, s.id, t.id, stIndex)}
                        >
                          <div>
                            <div className="text-sm">{st.title}</div>
                            <div className="text-xs text-slate-400">/{st.slug} • {st.notes?.length ?? 0} notes</div>
                          </div>

                          <div className="flex gap-2">
                            <button onClick={() => setNoteModal({ open: true, subjectId: s.id, topicId: t.id, subtopicId: st.id })} className="px-2 py-1 rounded text-sm bg-indigo-700/30">Add Note</button>
                            <button onClick={() => openEditSubtopic(s, t, st)} className="px-2 py-1 rounded text-sm bg-slate-800/30">Edit</button>
                            <button onClick={() => deleteSubtopic(s, t, st)} className="px-2 py-1 rounded text-sm border border-rose-600 text-rose-300">Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for create / edit actions */}
      <Modal open={Boolean(editing.mode)} title={
        editing.mode === 'create-subject' ? 'Create Subject' :
        editing.mode === 'edit-subject' ? `Edit Subject` :
        editing.mode === 'create-topic' ? `Create Topic in ${editing.subject?.title}` :
        editing.mode === 'edit-topic' ? `Edit Topic in ${editing.subject?.title}` :
        editing.mode === 'create-subtopic' ? `Create Subtopic in ${editing.topic?.title}` :
        editing.mode === 'edit-subtopic' ? `Edit Subtopic in ${editing.topic?.title}` : ''
      } onClose={() => setEditing({ mode: null })}>
        <div className="space-y-3">
          <label className="block text-sm text-slate-300">Title</label>
          <input className="w-full px-3 py-2 rounded bg-slate-900/50 border border-slate-700" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />

          <label className="block text-sm text-slate-300">Slug (optional)</label>
          <input className="w-full px-3 py-2 rounded bg-slate-900/50 border border-slate-700" value={formSlug} onChange={(e) => setFormSlug(e.target.value)} />

          {editing.mode && (editing.mode === 'create-subject' || editing.mode === 'edit-subject') && (
            <>
              <label className="block text-sm text-slate-300 mt-3">Description (optional)</label>
              <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={3} className="w-full px-3 py-2 rounded bg-slate-900/50 border border-slate-700" />

              <label className="block text-sm text-slate-300 mt-3">Brand Color (optional)</label>
              <input value={formBrandColor || ''} onChange={(e) => setFormBrandColor(e.target.value || undefined)} placeholder="e.g. indigo, emerald" className="w-full px-3 py-2 rounded bg-slate-900/50 border border-slate-700" />
            </>
          )}

          <div className="flex gap-2 justify-end mt-2">
            <button onClick={() => setEditing({ mode: null })} className="px-3 py-1 rounded border border-slate-700">Cancel</button>
            {editing.mode === 'create-subject' && <button onClick={submitCreateSubject} className="px-3 py-1 rounded bg-linear-to-r from-indigo-600 to-cyan-500 text-white">Create</button>}
            {editing.mode === 'edit-subject' && <button onClick={submitEditSubject} className="px-3 py-1 rounded bg-linear-to-r from-indigo-600 to-cyan-500 text-white">Save</button>}

            {editing.mode === 'create-topic' && <button onClick={submitCreateTopic} className="px-3 py-1 rounded bg-linear-to-r from-indigo-600 to-cyan-500 text-white">Create Topic</button>}
            {editing.mode === 'edit-topic' && <button onClick={submitEditTopic} className="px-3 py-1 rounded bg-linear-to-r from-indigo-600 to-cyan-500 text-white">Save</button>}

            {editing.mode === 'create-subtopic' && <button onClick={submitCreateSubtopic} className="px-3 py-1 rounded bg-linear-to-r from-indigo-600 to-cyan-500 text-white">Create Subtopic</button>}
            {editing.mode === 'edit-subtopic' && <button onClick={submitEditSubtopic} className="px-3 py-1 rounded bg-linear-to-r from-indigo-600 to-cyan-500 text-white">Save</button>}
          </div>
        </div>
      </Modal>

      <NoteInSubtopicModal
        open={noteModal.open}
        subjectId={noteModal.subjectId}
        topicId={noteModal.topicId}
        subtopicId={noteModal.subtopicId}
        onClose={() => setNoteModal({ open: false })}
        onCreated={() => {
          refresh();
        }}
      />

      <ConfirmDialog open={confirm.open} title={confirm.title} onCancel={() => setConfirm({ open: false, title: '' })} onConfirm={() => { confirm.onConfirm && confirm.onConfirm(); }} />
    </>
  );
}
