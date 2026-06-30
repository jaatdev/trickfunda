import { QuizQuestion } from '../lib/types';
import { NoteBox } from '../lib/admin-types';

export interface KDQuiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

export interface KDConcept {
  slug: string;
  title: string;
  notesMarkdown: string | null;
  noteBoxes: NoteBox[] | null;
  pdfUrl: string | null;
  youtubeUrls: string[] | null;
  quizzes: KDQuiz[];
}

export interface KDStats {
  concepts: number;
  videos: number;
  quizzes: number;
  questions: number;
  pdfs: number;
}

export interface KDCategory {
  title: string;
  slug: string;
  description: string;
}
export interface KDMathsChapter { slug: string; title: string; typesCount: number; }
