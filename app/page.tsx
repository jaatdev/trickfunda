import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import { brandMap, type BrandKey } from '@/lib/brand'
import StudentCarousel from '@/components/StudentCarousel'
import ScrollAnimation from '@/components/ScrollAnimation'
import HeroSection from '@/components/home/HeroSection'
import StatsSection from '@/components/home/StatsSection'
import FeaturesShowcase from '@/components/home/FeaturesShowcase'
import SubjectsGrid from '@/components/home/SubjectsGrid'
import TestimonialsSection from '@/components/home/TestimonialsSection'
import CTASection from '@/components/home/CTASection'
import FloatingElements from '@/components/home/FloatingElements'
import { getKDChapters, getAllKDStats } from '@/utils/studyMaterialParser'

export default async function HomePage() {
  const kdMethodDir = path.join(process.cwd(), 'data', 'study-material')
  let folders: string[] = []
  if (fs.existsSync(kdMethodDir)) {
    const entries = fs.readdirSync(kdMethodDir, { withFileTypes: true })
    folders = entries.filter(e => e.isDirectory()).map(e => e.name)
  }

  // Transform kdSubjects into the format expected by SubjectsGrid
  const subjects = await Promise.all(folders.map(async (slug) => {
    // English 100 concepts has different internal structure (flat) than others (nested)
    // but we can just mock topics count for the landing page grid.
    let topicsCount = 0;
    try {
      if (slug === 'english-100-concepts') {
        topicsCount = fs.readdirSync(path.join(kdMethodDir, slug), { withFileTypes: true }).filter(e => e.isDirectory()).length;
      } else {
        const chapters = await getKDChapters(slug);
        topicsCount = chapters.reduce((acc, c) => acc + c.typesCount, 0) || chapters.length;
      }
    } catch(e) {}
    
    // Map KD subjects to visually appealing brand colors and emojis
    let brandColor: BrandKey = 'emerald';
    let emoji = '📚';
    let title = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    if (slug === 'maths-trickfunda') { brandColor = 'blue'; emoji = '➗'; title = 'Maths TrickFunda'; }
    if (slug === 'english-100-concepts') { brandColor = 'purple'; emoji = '📝'; title = 'English 100 Rules'; }
    if (slug === 'gs-trickfunda') { brandColor = 'amber'; emoji = '🌍'; title = 'GS TrickFunda'; }
    if (slug === 'reasoning-trickfunda') { brandColor = 'pink'; emoji = '🧠'; title = 'Reasoning TrickFunda'; }
    if (slug === 'vocab-trickfunda') { brandColor = 'red'; emoji = '📖'; title = 'Vocab TrickFunda'; }

    return {
      title,
      slug,
      emoji,
      description: `Master ${title} with interactive notes and quizzes.`,
      brandColor,
      topics: Array(topicsCount).fill({}) // mock topics array for length
    }
  }));

  // Ensure maths is first, english is second
  subjects.sort((a, b) => {
    if (a.slug === 'maths-trickfunda') return -1;
    if (b.slug === 'maths-trickfunda') return 1;
    if (a.slug === 'english-100-concepts') return -1;
    if (b.slug === 'english-100-concepts') return 1;
    return a.title.localeCompare(b.title);
  });

  const kdStats = await getAllKDStats();

  return (
    <div className="relative overflow-hidden">
      <FloatingElements />
      
      <HeroSection />
      
      <StatsSection 
        subjects={kdStats.subjects}
        concepts={kdStats.concepts}
        videos={kdStats.videos}
        quizzes={kdStats.quizzes}
        questions={kdStats.questions}
        flashcards={kdStats.flashcards}
      />
      
      <FeaturesShowcase />
      
      <SubjectsGrid subjects={subjects} />
      
      <TestimonialsSection />
      
      <StudentCarousel />
      
      <CTASection />
    </div>
  )
}
