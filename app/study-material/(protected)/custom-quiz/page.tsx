export const runtime = 'edge';
import React from 'react';
import { getKDQuizTree, QuizTreeItem } from '@/utils/studyMaterialParser';
import CustomQuizBuilderClient from './CustomQuizBuilderClient';

export default async function CustomQuizPage() {
  const quizTree: QuizTreeItem[] = await getKDQuizTree();

  return <CustomQuizBuilderClient quizTree={quizTree} />;
}

