import fs from 'fs';
import path from 'path';
import { QuizQuestion } from '@/lib/types';
import { KDConcept, KDQuiz, KDStats } from '@/types/kdMethod';
import { NoteBox } from '@/lib/admin-types';

const KD_METHOD_DIR = path.join(process.cwd(), 'data', 'kd-method');

function getYoutubeEmbedUrl(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11)
    ? `https://www.youtube.com/embed/${match[2]}`
    : null;
}

function formatTitle(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function getKDConcepts(categorySlug: string): Promise<KDConcept[]> {
  const categoryPath = path.join(KD_METHOD_DIR, categorySlug);
  
  if (!fs.existsSync(categoryPath)) {
    return [];
  }

  const entries = await fs.promises.readdir(categoryPath, { withFileTypes: true });
  const folders = entries.filter((entry) => entry.isDirectory());

  const concepts: KDConcept[] = [];

  for (const folder of folders) {
    const slug = folder.name;
    const concept = await getKDConceptBySlug(categorySlug, slug);
    if (concept) {
      concepts.push(concept);
    }
  }

  return concepts;
}

export async function getKDConceptBySlug(categorySlug: string, slug: string): Promise<KDConcept | null> {
  const conceptDir = path.join(KD_METHOD_DIR, categorySlug, slug);
  
  if (!fs.existsSync(conceptDir)) {
    return null;
  }

  const notesPath = path.join(conceptDir, 'notes.md');
  const noteboxesPath = path.join(conceptDir, 'noteboxes.json');

  let notesMarkdown = null;
  if (fs.existsSync(notesPath)) {
    notesMarkdown = await fs.promises.readFile(notesPath, 'utf8');
  }

  let noteBoxes: NoteBox[] | null = null;
  if (fs.existsSync(noteboxesPath)) {
    try {
      const content = await fs.promises.readFile(noteboxesPath, 'utf8');
      noteBoxes = JSON.parse(content) as NoteBox[];
    } catch (e) {
      console.error(`Error parsing noteboxes JSON in ${conceptDir}:`, e);
    }
  }

  const pdfPath = path.join(conceptDir, 'notes.pdf');
  let pdfUrl: string | null = null;
  if (fs.existsSync(pdfPath)) {
    // URL path matches the structure defined in the new API route
    const uniqueFilename = `${categorySlug}-${slug}.pdf`;
    pdfUrl = `/api/kd-method/files/${categorySlug}/${slug}/${uniqueFilename}`;
  }

  const youtubePath = path.join(conceptDir, 'youtube.txt');
  let youtubeUrls: string[] | null = null;
  if (fs.existsSync(youtubePath)) {
    try {
      const rawText = await fs.promises.readFile(youtubePath, 'utf8');
      const parsedUrls = rawText
        .split('\n')
        .map(line => getYoutubeEmbedUrl(line.trim()))
        .filter((url): url is string => url !== null);
      
      if (parsedUrls.length > 0) {
        youtubeUrls = parsedUrls;
      }
    } catch (e) {
      console.error(`Error reading youtube.txt in ${conceptDir}:`, e);
    }
  }

  const quizzes: KDQuiz[] = [];
  try {
    const files = await fs.promises.readdir(conceptDir);
    for (const file of files) {
      if (file.startsWith('quiz') && file.endsWith('.json')) {
        try {
          const rawQuiz = await fs.promises.readFile(path.join(conceptDir, file), 'utf8');
          const questions = JSON.parse(rawQuiz) as QuizQuestion[];
          
          const titlePart = file.replace('.json', '');
          const title = titlePart === 'quiz' ? 'Quiz' : formatTitle(titlePart.replace('quiz-', ''));
          
          quizzes.push({ id: titlePart, title, questions });
        } catch (e) {
          console.error(`Error parsing ${file} in ${slug}`, e);
        }
      }
    }
  } catch (e) {
    console.error(`Error reading directory ${conceptDir} for quizzes:`, e);
  }
  
  quizzes.sort((a, b) => a.id.localeCompare(b.id));

  return {
    slug,
    title: formatTitle(slug),
    notesMarkdown,
    noteBoxes,
    pdfUrl,
    youtubeUrls,
    quizzes,
  };
}

export async function getKDChapterSubjects(): Promise<string[]> {
  return [
    'english-chapterwise',
    'maths-trickfunda',
    'gs-trickfunda',
    'reasoning-trickfunda',
    'vocab-trickfunda'
  ];
}

export async function getKDChapters(subjectSlug: string): Promise<{slug: string; title: string; typesCount: number}[]> {
  const subjectDir = path.join(KD_METHOD_DIR, subjectSlug);
  if (!fs.existsSync(subjectDir)) return [];

  const entries = await fs.promises.readdir(subjectDir, { withFileTypes: true });
  const chapters = entries.filter((entry) => entry.isDirectory());

  const results = [];
  for (const chapter of chapters) {
    const chapterPath = path.join(subjectDir, chapter.name);
    const typeEntries = await fs.promises.readdir(chapterPath, { withFileTypes: true });
    const typesCount = typeEntries.filter((t) => t.isDirectory()).length;
    
    results.push({
      slug: chapter.name,
      title: formatTitle(chapter.name),
      typesCount
    });
  }
  return results;
}

export function aggregateKDStats(concepts: KDConcept[]): KDStats {
  return concepts.reduce((acc, c) => ({
    concepts: acc.concepts + 1,
    videos: acc.videos + (c.youtubeUrls?.length || 0),
    pdfs: acc.pdfs + (c.pdfUrl ? 1 : 0),
    quizzes: acc.quizzes + (c.quizzes?.length || 0),
    questions: acc.questions + (c.quizzes?.reduce((qAcc, q) => qAcc + (q.questions?.length || 0), 0) || 0)
  }), { concepts: 0, videos: 0, pdfs: 0, quizzes: 0, questions: 0 });
}

export async function getKDChapterStats(subjectSlug: string, chapterSlug: string): Promise<KDStats> {
  const concepts = await getKDChapterTypes(subjectSlug, chapterSlug);
  return aggregateKDStats(concepts);
}

export async function getKDSubjectStats(subjectSlug: string): Promise<KDStats> {
  if (subjectSlug === 'english-100-concepts') {
    const concepts = await getKDConcepts(subjectSlug);
    return aggregateKDStats(concepts);
  }

  const chapters = await getKDChapters(subjectSlug);
  const subjectStats: KDStats = { concepts: 0, videos: 0, pdfs: 0, quizzes: 0, questions: 0 };
  
  for (const chapter of chapters) {
    const chapterStats = await getKDChapterStats(subjectSlug, chapter.slug);
    subjectStats.concepts += chapterStats.concepts;
    subjectStats.videos += chapterStats.videos;
    subjectStats.pdfs += chapterStats.pdfs;
    subjectStats.quizzes += chapterStats.quizzes;
    subjectStats.questions += chapterStats.questions;
  }
  
  return subjectStats;
}

export async function getAllKDStats(): Promise<KDStats & { subjects: number }> {
  const subjects = await getKDChapterSubjects();
  // English is special because it's at the top level
  subjects.push('english-100-concepts');
  
  const allStats = { subjects: subjects.length, concepts: 0, videos: 0, pdfs: 0, quizzes: 0, questions: 0 };
  
  for (const subject of subjects) {
    const stats = await getKDSubjectStats(subject);
    allStats.concepts += stats.concepts;
    allStats.videos += stats.videos;
    allStats.pdfs += stats.pdfs;
    allStats.quizzes += stats.quizzes;
    allStats.questions += stats.questions;
  }
  
  return allStats;
}

export async function getKDChapterTypes(subjectSlug: string, chapterSlug: string): Promise<KDConcept[]> {
  const chapterPath = path.join(KD_METHOD_DIR, subjectSlug, chapterSlug);
  if (!fs.existsSync(chapterPath)) return [];

  const entries = await fs.promises.readdir(chapterPath, { withFileTypes: true });
  const types = entries.filter((entry) => entry.isDirectory());

  const concepts: KDConcept[] = [];
  for (const type of types) {
    const concept = await getKDChapterTypeData(subjectSlug, chapterSlug, type.name);
    if (concept) {
      concepts.push(concept);
    }
  }
  return concepts;
}

export async function getKDChapterTypeData(subjectSlug: string, chapterSlug: string, typeSlug: string): Promise<KDConcept | null> {
  const conceptDir = path.join(KD_METHOD_DIR, subjectSlug, chapterSlug, typeSlug);
  
  if (!fs.existsSync(conceptDir)) return null;

  const notesPath = path.join(conceptDir, 'notes.md');
  const noteboxesPath = path.join(conceptDir, 'noteboxes.json');

  let notesMarkdown = null;
  if (fs.existsSync(notesPath)) {
    notesMarkdown = await fs.promises.readFile(notesPath, 'utf8');
  }

  let noteBoxes: NoteBox[] | null = null;
  if (fs.existsSync(noteboxesPath)) {
    try {
      const content = await fs.promises.readFile(noteboxesPath, 'utf8');
      noteBoxes = JSON.parse(content) as NoteBox[];
    } catch (e) {
      console.error(`Error parsing noteboxes JSON in ${conceptDir}:`, e);
    }
  }

  const pdfPath = path.join(conceptDir, 'notes.pdf');
  let pdfUrl: string | null = null;
  if (fs.existsSync(pdfPath)) {
    const uniqueFilename = `${subjectSlug}-${chapterSlug}-${typeSlug}.pdf`;
    pdfUrl = `/api/kd-method/files/${subjectSlug}/${chapterSlug}/${typeSlug}/${uniqueFilename}`;
  }

  const youtubePath = path.join(conceptDir, 'youtube.txt');
  let youtubeUrls: string[] | null = null;
  if (fs.existsSync(youtubePath)) {
    try {
      const rawText = await fs.promises.readFile(youtubePath, 'utf8');
      const parsedUrls = rawText
        .split('\n')
        .map(line => getYoutubeEmbedUrl(line.trim()))
        .filter((url): url is string => url !== null);
      
      if (parsedUrls.length > 0) {
        youtubeUrls = parsedUrls;
      }
    } catch (e) {
      console.error(`Error reading youtube.txt in ${conceptDir}:`, e);
    }
  }

  const quizzes: KDQuiz[] = [];
  try {
    const files = await fs.promises.readdir(conceptDir);
    for (const file of files) {
      if (file.startsWith('quiz') && file.endsWith('.json')) {
        try {
          const rawQuiz = await fs.promises.readFile(path.join(conceptDir, file), 'utf8');
          const questions = JSON.parse(rawQuiz) as QuizQuestion[];
          
          const titlePart = file.replace('.json', '');
          const title = titlePart === 'quiz' ? 'Quiz' : formatTitle(titlePart.replace('quiz-', ''));
          
          quizzes.push({ id: titlePart, title, questions });
        } catch (e) {
          console.error(`Error parsing ${file} in ${typeSlug}`, e);
        }
      }
    }
  } catch (e) {
    console.error(`Error reading directory ${conceptDir} for quizzes:`, e);
  }
  
  quizzes.sort((a, b) => a.id.localeCompare(b.id));

  return {
    slug: typeSlug,
    title: formatTitle(typeSlug),
    notesMarkdown,
    noteBoxes,
    pdfUrl,
    youtubeUrls,
    quizzes,
  };
}
