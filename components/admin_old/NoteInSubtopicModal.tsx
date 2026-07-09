// components/admin/NoteInSubtopicModal.tsx
'use client';
import React from 'react';
import Modal from '@/components/ui/Modal';
import NoteBoxCreator from '@/components/admin/NoteBoxCreator';
import { NoteBox } from '@/lib/admin-types';

type Props = {
  open: boolean;
  subjectId?: string;
  topicId?: string;
  subtopicId?: string;
  onClose: () => void;
  onCreated?: (note: NoteBox) => void;
};

export default function NoteInSubtopicModal({ open, subjectId, topicId, subtopicId, onClose, onCreated }: Props) {
  if (!open) return null;
  if (!subjectId || !topicId || !subtopicId) return null;

  return (
    <Modal open={open} title="Create note in subtopic" onClose={onClose}>
      <div>
        <NoteBoxCreator
          subjectId={subjectId}
          topicId={topicId}
          subtopicId={subtopicId}
          onCreated={(n) => {
            if (onCreated) onCreated(n);
            onClose();
          }}
        />
      </div>
    </Modal>
  );
}
