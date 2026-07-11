import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import { QuizQuestion } from '@/lib/types';

const KD_METHOD_DIR = path.join(process.cwd(), 'data', 'study-material');

function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

async function findQuizFiles(dir: string, currentPath: string[]): Promise<string[]> {
  const results: string[] = [];
  try {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subResults = await findQuizFiles(path.join(dir, entry.name), [...currentPath, entry.name]);
        results.push(...subResults);
      } else if (entry.isFile() && entry.name.startsWith('quiz') && entry.name.endsWith('.json')) {
        results.push(path.join(dir, entry.name));
      }
    }
  } catch (e) {
    console.error(`Error reading directory ${dir}:`, e);
  }
  return results;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { paths, questionCount } = body;

    let targetDir = KD_METHOD_DIR;
    const allQuizFiles = await findQuizFiles(targetDir, []);
    
    let allQuestions: QuizQuestion[] = [];
    
    for (const filePath of allQuizFiles) {
      // Path format is something like data/study-material/subject/topic/concept/quiz.json
      const relativePath = path.relative(KD_METHOD_DIR, filePath).replace(/\\/g, '/');
      const dirPath = path.dirname(relativePath).replace(/\\/g, '/');
      
      // If filters are provided, check them
      if (paths && paths.length > 0) {
        // A file is included if its directory or any of its parent directories is in the selected paths
        const isIncluded = paths.some((selectedPath: string) => {
          return dirPath === selectedPath || dirPath.startsWith(`${selectedPath}/`);
        });
        
        if (!isIncluded) {
          continue;
        }
      }

      try {
        const fileContent = await fs.promises.readFile(filePath, 'utf8');
        const parsed = JSON.parse(fileContent);
        if (Array.isArray(parsed)) {
          allQuestions.push(...parsed);
        }
      } catch (e) {
        console.error(`Failed to parse ${filePath}:`, e);
      }
    }

    if (allQuestions.length === 0) {
      return NextResponse.json({ error: 'No questions found for the selected filters.' }, { status: 404 });
    }

    // De-duplicate questions by ID (sometimes identical questions might exist)
    const uniqueMap = new Map<string, QuizQuestion>();
    for (const q of allQuestions) {
      if (q.id) {
        uniqueMap.set(q.id, q);
      }
    }
    let uniqueQuestions = Array.from(uniqueMap.values());
    if (uniqueQuestions.length === 0) {
        uniqueQuestions = allQuestions; // fallback if no IDs
    }

    // Shuffle
    const shuffled = shuffleArray(uniqueQuestions);
    
    // Slice
    const limit = questionCount ? Math.min(questionCount, shuffled.length) : shuffled.length;
    const finalQuestions = shuffled.slice(0, limit);

    return NextResponse.json({
      id: 'custom-quiz-' + Date.now(),
      title: 'Custom Aggregate Quiz',
      questions: finalQuestions,
      totalAvailable: uniqueQuestions.length
    });

  } catch (error) {
    console.error('Quiz Generation Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
