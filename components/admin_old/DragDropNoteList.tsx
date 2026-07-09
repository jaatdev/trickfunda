// components/admin/DragDropNoteList.tsx
'use client';

import React, { useState, DragEvent, useEffect } from 'react';
import { NoteBox } from '@/lib/admin-types';
import { NotesManager } from '@/lib/notesManager';
import NoteBoxPreview from '@/components/admin/NoteBoxPreview';

interface Props {
  subjectId: string;
  topicId: string;
  subtopicId: string;
  manager: NotesManager;
  onSelectionChange?: (ids: string[]) => void;
  selectedIds?: string[];
}

interface DraggableNote extends NoteBox {
  order: number;
}

export default function DragDropNoteList({
  subjectId,
  topicId,
  subtopicId,
  manager,
  onSelectionChange,
  selectedIds = []
}: Props) {
  const [notes, setNotes] = useState<DraggableNote[]>([]);
  const [draggedNote, setDraggedNote] = useState<DraggableNote | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load notes
  useEffect(() => {
    loadNotes();
  }, [subjectId, topicId, subtopicId]);

  const loadNotes = () => {
    const subject = manager.getSubject(subjectId);
    const topic = subject?.topics.find(t => t.id === topicId);
    const subtopic = topic?.subtopics.find(st => st.id === subtopicId);
    
    if (subtopic?.notes) {
      const notesWithOrder = subtopic.notes.map((note: NoteBox, index: number) => ({
        ...note,
        order: index
      }));
      setNotes(notesWithOrder);
    } else {
      setNotes([]);
    }
    setIsLoading(false);
  };

  // Drag handlers
  const handleDragStart = (e: DragEvent<HTMLDivElement>, note: DraggableNote) => {
    setDraggedNote(note);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', note.id);
    
    // Add dragging class after a small delay to prevent flash
    setTimeout(() => {
      const element = document.getElementById(`note-${note.id}`);
      element?.classList.add('opacity-50');
    }, 0);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    // Only clear if we're leaving the container
    if (e.currentTarget === e.target) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (!draggedNote) return;

    const dragIndex = notes.findIndex(n => n.id === draggedNote.id);
    if (dragIndex === dropIndex) return;

    // Reorder notes
    const reorderedNotes = [...notes];
    const [removed] = reorderedNotes.splice(dragIndex, 1);
    reorderedNotes.splice(dropIndex, 0, removed);

    // Update order values
    const updatedNotes = reorderedNotes.map((note, index) => ({
      ...note,
      order: index
    }));

    setNotes(updatedNotes);

    // Save to manager
    saveNotesOrder(updatedNotes);

    // Clear dragging state
    const element = document.getElementById(`note-${draggedNote.id}`);
    element?.classList.remove('opacity-50');
    setDraggedNote(null);
  };

  const handleDragEnd = () => {
    if (draggedNote) {
      const element = document.getElementById(`note-${draggedNote.id}`);
      element?.classList.remove('opacity-50');
    }
    setDraggedNote(null);
    setDragOverIndex(null);
  };

  const saveNotesOrder = (orderedNotes: DraggableNote[]) => {
    // Update the notes order in the manager
    const subject = manager.getSubject(subjectId);
    if (!subject) return;

    const topic = subject.topics.find(t => t.id === topicId);
    if (!topic) return;

    const subtopic = topic.subtopics.find(st => st.id === subtopicId);
    if (!subtopic) return;

    // Update the notes array with new order
    subtopic.notes = orderedNotes.map(({ order, ...note }) => note);
    
    // Save to localStorage through manager
    manager.updateSubject(subject.id, subject);
  };

  // Selection handling
  const toggleSelection = (noteId: string) => {
    const newSelection = selectedIds.includes(noteId)
      ? selectedIds.filter(id => id !== noteId)
      : [...selectedIds, noteId];
    
    onSelectionChange?.(newSelection);
  };

  const selectAll = () => {
    onSelectionChange?.(notes.map(n => n.id));
  };

  const deselectAll = () => {
    onSelectionChange?.([]);
  };

  // Delete note
  const deleteNote = (noteId: string) => {
    if (!confirm('Delete this note?')) return;
    
    manager.deleteNoteBox(subjectId, topicId, subtopicId, noteId);
    loadNotes();
    
    // Remove from selection if selected
    if (selectedIds.includes(noteId)) {
      onSelectionChange?.(selectedIds.filter(id => id !== noteId));
    }
  };

  // Duplicate note
  const duplicateNote = (note: NoteBox) => {
    const duplicated = manager.createNoteBox(
      subjectId,
      topicId,
      subtopicId,
      note.type,
      note.content,
      note.themeId
    );
    
    if (duplicated) {
      loadNotes();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-pulse text-slate-400">Loading notes...</div>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
        <div className="text-slate-500">
          <p className="text-lg font-medium">No notes yet</p>
          <p className="text-sm mt-1">Create your first note to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selection controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={selectAll}
            className="text-sm px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Select All ({notes.length})
          </button>
          {selectedIds.length > 0 && (
            <>
              <button
                onClick={deselectAll}
                className="text-sm px-3 py-1 rounded-md bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Clear Selection
              </button>
              <span className="text-sm text-slate-500">
                {selectedIds.length} selected
              </span>
            </>
          )}
        </div>
        
        <div className="text-sm text-slate-500">
          Drag to reorder
        </div>
      </div>

      {/* Notes grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note, index) => (
          <div
            key={note.id}
            id={`note-${note.id}`}
            draggable
            onDragStart={(e) => handleDragStart(e, note)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`
              relative group cursor-move transition-all duration-200
              ${dragOverIndex === index ? 'scale-105' : ''}
              ${draggedNote?.id === note.id ? 'opacity-50' : ''}
            `}
          >
            {/* Drop indicator */}
            {dragOverIndex === index && (
              <div className="absolute inset-0 border-2 border-indigo-500 rounded-xl pointer-events-none z-10" />
            )}

            {/* Selection checkbox */}
            <div className="absolute top-2 left-2 z-20">
              <input
                type="checkbox"
                checked={selectedIds.includes(note.id)}
                onChange={() => toggleSelection(note.id)}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            {/* Actions menu */}
            <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-1 bg-white rounded-lg shadow-lg border border-slate-200 p-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateNote(note);
                  }}
                  className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                  title="Duplicate"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(note.id);
                  }}
                  className="p-1.5 hover:bg-red-100 text-red-600 rounded transition-colors"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Note preview */}
            <div className="pt-8">
              <NoteBoxPreview note={note} interactive={false} />
            </div>

            {/* Drag handle indicator */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-0.5">
                <div className="w-1 h-1 bg-slate-400 rounded-full" />
                <div className="w-1 h-1 bg-slate-400 rounded-full" />
                <div className="w-1 h-1 bg-slate-400 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
