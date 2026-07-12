import React from 'react';
import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import FlashcardSessionClient from './FlashcardSessionClient';
import { Flashcard } from '@/components/vocab/FlashcardViewer';

interface Props {
  params: Promise<{ category: string, day: string }>;
}

export default async function FlashcardDayPage({ params }: Props) {
  const { category, day } = await params;

  const dataPath = path.join(process.cwd(), 'data', 'vocab-trickfunda', category, `${day}.json`);

  if (!fs.existsSync(dataPath)) {
    notFound();
  }

  let flashcards: Flashcard[] = [];
  try {
    const fileContent = fs.readFileSync(dataPath, 'utf-8');
    const parsed = JSON.parse(fileContent);
    flashcards = parsed.flashcards || [];
  } catch (e) {
    console.error(e);
    notFound();
  }

  if (flashcards.length === 0) {
    notFound();
  }

  return (
    <FlashcardSessionClient 
      flashcards={flashcards} 
      category={category} 
      day={day} 
    />
  );
}
