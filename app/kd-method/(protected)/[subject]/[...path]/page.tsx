import { notFound } from 'next/navigation';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { getKDNode, getKDChapterSubjects } from '@/utils/kdMethodParser';
import { ConceptInteractiveViewer } from '@/components/kd-method/ConceptInteractiveViewer';
import ChapterTypesClient from '@/components/kd-method/ChapterTypesClient';
import StatsBanner from '@/components/kd-method/StatsBanner';
import { Metadata } from 'next';
import { GSHologramTheme } from '@/components/kd-method/themes/gs/GSHologramTheme';
import { VocabLexiconTheme } from '@/components/kd-method/themes/vocab/VocabLexiconTheme';
import { MathConstructorTheme } from '@/components/kd-method/themes/math/MathConstructorTheme';
import { ReasoningQuantumTheme } from '@/components/kd-method/themes/reasoning/ReasoningQuantumTheme';
import { EnglishClockworkTheme } from '@/components/kd-method/themes/english-steampunk/EnglishClockworkTheme';

type Props = {
  params: Promise<{ subject: string; path: string[] }>;
};

// Recursive helper to get all paths
async function getAllPathsForDir(dir: string, basePath: string[] = []): Promise<string[][]> {
  let paths: string[][] = [];
  try {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const currentPath = [...basePath, entry.name];
        paths.push(currentPath);
        const subPaths = await getAllPathsForDir(path.join(dir, entry.name), currentPath);
        paths = paths.concat(subPaths);
      }
    }
  } catch (e) {
    // ignore
  }
  return paths;
}

export async function generateStaticParams() {
  const subjects = await getKDChapterSubjects();
  // We need to also include english-100-concepts if it has subfolders that use this route.
  // Actually english-100-concepts uses its own route app/kd-method/english-100-concepts/[slug]/page.tsx
  // So we just iterate normal subjects.
  const KD_METHOD_DIR = path.join(process.cwd(), 'data', 'kd-method');
  const paramsList = [];
  
  for (const subject of subjects) {
    const subjectDir = path.join(KD_METHOD_DIR, subject);
    const allPaths = await getAllPathsForDir(subjectDir);
    for (const p of allPaths) {
      paramsList.push({
        subject,
        path: p,
      });
    }
  }
  
  return paramsList;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const node = await getKDNode([params.subject, ...params.path]);
  
  if (!node) {
    return { title: 'Not Found' };
  }

  const subjectTitle = params.subject.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').replace('Gs', 'GS');

  return {
    title: `${node.title} | ${subjectTitle} | KD Method`,
    description: `Learn about ${node.title}`,
  };
}

export default async function RecursiveKDMethodPage(props: Props) {
  const params = await props.params;
  
  const node = await getKDNode([params.subject, ...params.path]);

  if (!node) {
    notFound();
  }

  const subjectTitle = params.subject.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ').replace('Gs', 'GS');

  // ==========================================
  // INNER THEME ORCHESTRATION ENGINE
  // ==========================================
  if (params.subject === 'english-chapterwise') {
    return <EnglishClockworkTheme node={node} path={params.path} subjectTitle={subjectTitle} subjectSlug={params.subject} />;
  }

  if (params.subject === 'maths-trickfunda' || params.subject === 'abhinay-sir-maths') {
    return <MathConstructorTheme node={node} path={params.path} subjectTitle={subjectTitle} subjectSlug={params.subject} />;
  }

  if (params.subject === 'reasoning-trickfunda') {
    return <ReasoningQuantumTheme node={node} path={params.path} subjectTitle={subjectTitle} subjectSlug={params.subject} />;
  }

  if (params.subject === 'vocab-trickfunda') {
    return <VocabLexiconTheme node={node} path={params.path} subjectTitle={subjectTitle} subjectSlug={params.subject} />;
  }

  if (params.subject === 'gs-trickfunda') {
    return <GSHologramTheme node={node} path={params.path} subjectTitle={subjectTitle} subjectSlug={params.subject} />;
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12 px-4 md: md:pb-8 md:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Breadcrumb Navigation */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link href="/kd-method" className="hover:text-emerald-500 transition-colors whitespace-nowrap">KD Method</Link>
          <span>/</span>
          <Link href={`/kd-method/${params.subject}`} className="hover:text-emerald-500 transition-colors whitespace-nowrap">{subjectTitle}</Link>
          {params.path.map((segment, index) => {
            const isLast = index === params.path.length - 1;
            const title = segment.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            
            if (isLast) {
              return (
                <span key={index} className="flex items-center gap-x-2">
                  <span>/</span>
                  <span className="text-gray-900 dark:text-gray-100 truncate max-w-[200px] sm:max-w-none">{title}</span>
                </span>
              );
            }
            
            const href = `/kd-method/${params.subject}/${params.path.slice(0, index + 1).join('/')}`;
            return (
              <span key={index} className="flex items-center gap-x-2">
                <span>/</span>
                <Link href={href} className="hover:text-emerald-500 transition-colors whitespace-nowrap">{title}</Link>
              </span>
            );
          })}
        </div>

        <StatsBanner stats={node.stats} subjectSlug={params.subject} label={`${node.title} Totals`} />

        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            {node.title}
          </h1>
          {node.children && node.children.length > 0 && !node.concept && (
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
              Select a sub-topic to continue learning.
            </p>
          )}
        </header>

        {/* If node has sub-folders, render them as cards */}
        {node.children && node.children.length > 0 && (
          <div className="mb-12">
            <ChapterTypesClient 
              subjectSlug={params.subject} 
              baseRoute={`/kd-method/${params.subject}/${params.path.join('/')}`} 
              types={node.children} 
            />
          </div>
        )}

        {/* If node has local files, render the Interactive Viewer */}
        {node.concept && (
          <div className="max-w-4xl mx-auto">
            <ConceptInteractiveViewer 
              title={node.title}
              notesMarkdown={node.concept.notesMarkdown}
              noteBoxes={node.concept.noteBoxes}
              pdfUrl={node.concept.pdfUrl}
              youtubeUrls={node.concept.youtubeUrls}
              quizzes={node.concept.quizzes}
              slug={node.concept.slug}
            />
          </div>
        )}
      </div>
    </main>
  );
}
