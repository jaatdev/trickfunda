// components/admin/BulkOperationsBar.tsx
'use client';

import React, { useState } from 'react';
import { NotesManager } from '@/lib/notesManager';
import { themeMap } from '@/lib/admin-themes';

interface Props {
  selectedIds: string[];
  manager: NotesManager;
  subjectId: string;
  topicId: string;
  subtopicId: string;
  onComplete: () => void;
}

export default function BulkOperationsBar({
  selectedIds,
  manager,
  subjectId,
  topicId,
  subtopicId,
  onComplete
}: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  if (selectedIds.length === 0) return null;

  const performBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.length} notes? This cannot be undone.`)) {
      return;
    }

    setIsProcessing(true);
    
    for (const noteId of selectedIds) {
      manager.deleteNoteBox(subjectId, topicId, subtopicId, noteId);
    }
    
    setIsProcessing(false);
    onComplete();
  };

  const performBulkThemeChange = async (themeId: string) => {
    setIsProcessing(true);
    
    const subject = manager.getSubject(subjectId);
    if (!subject) return;

    const topic = subject.topics.find(t => t.id === topicId);
    if (!topic) return;

    const subtopic = topic.subtopics.find(st => st.id === subtopicId);
    if (!subtopic) return;

    // Update theme for selected notes
    subtopic.notes = subtopic.notes.map(note => {
      if (selectedIds.includes(note.id)) {
        return { ...note, themeId };
      }
      return note;
    });

    manager.updateSubject(subject.id, subject);
    
    setIsProcessing(false);
    setShowThemeMenu(false);
    onComplete();
  };

  const performBulkDuplicate = async () => {
    setIsProcessing(true);
    
    const subject = manager.getSubject(subjectId);
    if (!subject) return;

    const topic = subject.topics.find(t => t.id === topicId);
    if (!topic) return;

    const subtopic = topic.subtopics.find(st => st.id === subtopicId);
    if (!subtopic) return;

    for (const noteId of selectedIds) {
      const note = subtopic.notes.find(n => n.id === noteId);
      if (note) {
        manager.createNoteBox(
          subjectId,
          topicId,
          subtopicId,
          note.type,
          note.content,
          note.themeId
        );
      }
    }
    
    setIsProcessing(false);
    onComplete();
  };

  const performBulkExport = () => {
    const subject = manager.getSubject(subjectId);
    if (!subject) return;

    const topic = subject.topics.find(t => t.id === topicId);
    if (!topic) return;

    const subtopic = topic.subtopics.find(st => st.id === subtopicId);
    if (!subtopic) return;

    const selectedNotes = subtopic.notes.filter(n => selectedIds.includes(n.id));
    
    const exportData = {
      exportDate: new Date().toISOString(),
      subject: subject.title,
      topic: topic.title,
      subtopic: subtopic.title,
      notes: selectedNotes
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">
              {selectedIds.length} note{selectedIds.length !== 1 ? 's' : ''} selected
            </span>
            
            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={performBulkDuplicate}
                disabled={isProcessing}
                className="px-3 py-1.5 text-sm rounded-md bg-slate-100 hover:bg-slate-200 disabled:opacity-50 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Duplicate
                </span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowThemeMenu(!showThemeMenu)}
                  disabled={isProcessing}
                  className="px-3 py-1.5 text-sm rounded-md bg-slate-100 hover:bg-slate-200 disabled:opacity-50 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    Change Theme
                  </span>
                </button>
                
                {showThemeMenu && (
                  <div className="absolute bottom-full mb-2 left-0 bg-white rounded-lg shadow-lg border border-slate-200 py-1 min-w-[200px]">
                    {Object.entries(themeMap).map(([id, theme]) => (
                      <button
                        key={id}
                        onClick={() => performBulkThemeChange(id)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full bg-linear-to-br ${theme.gradient}`} />
                          {theme.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={performBulkExport}
                disabled={isProcessing}
                className="px-3 py-1.5 text-sm rounded-md bg-slate-100 hover:bg-slate-200 disabled:opacity-50 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Export
                </span>
              </button>

              <button
                onClick={performBulkDelete}
                disabled={isProcessing}
                className="px-3 py-1.5 text-sm rounded-md bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </span>
              </button>
            </div>
          </div>

          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-500 border-t-transparent" />
              Processing...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
