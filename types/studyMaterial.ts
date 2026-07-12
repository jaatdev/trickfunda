import { QuizQuestion, SubjectFlashcard } from '../lib/types';
import { NoteBox } from '../lib/admin-types';

export interface KDQuiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

export interface KDFlashcardSet {
  id: string;
  title: string;
  flashcards: SubjectFlashcard[];
}

export interface KDConcept {
  slug: string;
  title: string;
  notesMarkdown: string | null;
  noteBoxes: NoteBox[] | null;
  pdfUrl: string | null;
  youtubeUrls: string[] | null;
  quizzes: KDQuiz[];
  flashcardSets?: KDFlashcardSet[];
}

export interface KDStats {
  concepts: number;
  videos: number;
  quizzes: number;
  questions: number;
  pdfs: number;
  flashcards: number;
}

export interface KDCategory {
  title: string;
  slug: string;
  description: string;
}
export interface KDMathsChapter { slug: string; title: string; typesCount: number; }

export interface KDNode {
  slug: string;
  title: string;
  // Local files found in this directory
  concept: KDConcept | null;
  // Sub-directories found in this directory
  children: {
    slug: string;
    title: string;
    stats: KDStats;
  }[] | null;
  // Aggregated stats of this directory and all descendants
  stats: KDStats;
}
