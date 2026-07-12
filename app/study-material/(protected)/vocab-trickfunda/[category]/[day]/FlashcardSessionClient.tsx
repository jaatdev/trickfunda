'use client';

import React, { useState } from 'react';
import { useFullscreen } from '@/lib/fullscreen-context';
import FlashcardViewer, { Flashcard } from '@/components/vocab/FlashcardViewer';
import { Brain, ArrowRight, Printer, CheckCircle, Terminal, Shield, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Props {
  flashcards: Flashcard[];
  category: string;
  day: string;
}

export default function FlashcardSessionClient({ flashcards, category, day }: Props) {
  const { enterFullscreen, exitFullscreen } = useFullscreen();
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleStart = async () => {
    setIsStarted(true);
    await enterFullscreen();
  };

  const handleFinish = async () => {
    setIsFinished(true);
    await exitFullscreen();
  };

  if (isStarted && !isFinished) {
    return <FlashcardViewer flashcards={flashcards} onFinish={handleFinish} />;
  }

  const handleDownloadPdf = async () => {
    if (isGenerating) return;
    
    const element = document.getElementById('pdf-summary-content');
    if (!element) return;
    
    setIsGenerating(true);
    
    // Allow React to paint the overlay before blocking the main thread
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const { toJpeg } = await import('html-to-image');
      const { jsPDF } = await import('jspdf');

      const isDark = document.documentElement.classList.contains('dark');
      const bgColor = isDark ? '#111111' : '#ffffff';
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const addBackground = () => {
        pdf.setFillColor(bgColor);
        pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
        return 10;
      };

      let currentY = addBackground();

      const headerEl = element.querySelector('.pdf-header') as HTMLElement;
      
      if (headerEl) {
        const headerData = await toJpeg(headerEl, { quality: 0.92, pixelRatio: 2, backgroundColor: bgColor });
        const hProps = pdf.getImageProperties(headerData);
        const hHeight = (hProps.height * (pdfWidth - 20)) / hProps.width;
        pdf.addImage(headerData, 'JPEG', 10, currentY, pdfWidth - 20, hHeight);
        currentY += hHeight + 10;
      }
      
      const cards = element.querySelectorAll('.pdf-card-item');
      
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i] as HTMLElement;
        const dataUrl = await toJpeg(card, { 
          quality: 0.92, 
          pixelRatio: 2,
          backgroundColor: bgColor
        });
        
        const imgProps = pdf.getImageProperties(dataUrl);
        const renderWidth = pdfWidth - 20; 
        const imgHeight = (imgProps.height * renderWidth) / imgProps.width;
        
        if (currentY + imgHeight > pdfHeight - 10) {
          pdf.addPage();
          currentY = addBackground();
        }
        
        pdf.addImage(dataUrl, 'JPEG', 10, currentY, renderWidth, imgHeight);
        currentY += imgHeight + 10;
      }
      
      pdf.save(`TrickFunda-${category}-${day}.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try printing the page instead.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isFinished) {
    return (
      <>
        {isGenerating && (
          <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center text-emerald-400 font-mono animate-in fade-in duration-300 px-4 text-center">
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
              <Shield className="w-12 h-12 md:w-16 md:h-16 text-emerald-500 animate-pulse relative z-10" />
              <Loader2 className="w-20 h-20 md:w-24 md:h-24 absolute animate-spin text-emerald-500/50" />
            </div>
            <h2 className="text-xl md:text-3xl font-bold tracking-[0.1em] md:tracking-[0.3em] mb-4 text-emerald-500 flex items-center justify-center gap-3 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]">
              <Terminal className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />
              SYSTEM COMPILING
            </h2>
            <div className="flex flex-col items-center gap-2">
              <p className="text-emerald-400/80 animate-pulse text-xs md:text-base tracking-widest">ENCRYPTING PDF DATASTREAM...</p>
              <div className="w-48 md:w-64 h-1.5 bg-gray-900 border border-emerald-500/30 rounded-full overflow-hidden mt-6 relative">
                <div className="absolute top-0 left-0 h-full bg-emerald-500 w-full animate-[shimmer_2s_infinite] opacity-50" />
                <div className="h-full bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-[pulse_1s_ease-in-out_infinite] w-[70%]" />
              </div>
            </div>
          </div>
        )}
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-16">
          <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 print:hidden text-center md:text-left">
            <div className="space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-3 text-emerald-500 font-bold mb-2">
                <CheckCircle className="w-6 h-6" /> Session Complete!
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white capitalize">
                {category} - {day.replace('-', ' ')} Summary
              </h1>
              <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                You've mastered {flashcards.length} words today. Review them below or download as PDF.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3 md:gap-4">
              <button 
                onClick={handleDownloadPdf}
                className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Printer className="w-5 h-5" /> Download PDF
              </button>
              <Link 
                href={`/study-material/vocab-trickfunda/${category}`}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
              >
                Back to Curriculum
              </Link>
            </div>
          </div>

          <div id="pdf-summary-content" className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-3xl p-4 md:p-12 shadow-sm md:shadow-2xl print:shadow-none print:border-none print:p-0">
            <div className="text-center mb-8 md:mb-10 pdf-header">
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white capitalize mb-2">Vocab TrickFunda</h1>
              <h2 className="text-xl text-gray-600 dark:text-gray-400 capitalize">{category} - {day.replace('-', ' ')}</h2>
            </div>

            <div className="space-y-8 divide-y divide-gray-100 dark:divide-white/5 print:divide-gray-300">
              {flashcards.map((card, index) => (
                <div key={card.id} className="pt-8 first:pt-0 print:break-inside-avoid pdf-card-item">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3 space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm shrink-0">
                          {index + 1}
                        </span>
                        <h3 className="text-2xl font-black text-emerald-500">{card.word}</h3>
                      </div>
                      <p className="text-lg text-gray-700 dark:text-gray-300 print:text-gray-800 italic leading-relaxed">
                        "{card.meaning}"
                      </p>
                    </div>

                    <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {card.synonyms && card.synonyms.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-emerald-500 uppercase tracking-wider">Synonyms</h4>
                          <div className="flex flex-wrap gap-2">
                            {card.synonyms.map(syn => (
                              <span key={syn} className="px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 print:border print:border-gray-300">{syn}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {card.antonyms && card.antonyms.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-rose-500 uppercase tracking-wider">Antonyms</h4>
                          <div className="flex flex-wrap gap-2">
                            {card.antonyms.map(ant => (
                              <span key={ant} className="px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 print:border print:border-gray-300">{ant}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="sm:col-span-2 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 print:bg-white print:border-emerald-500 mt-2">
                        <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                          <Brain className="w-4 h-4" /> KD Hack
                        </h4>
                        <p className="text-gray-900 dark:text-white font-bold print:text-black leading-relaxed">
                          {card.kdHack}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      </>
    );
  }

  return (
    <div className="min-h-[80vh] bg-gray-50 dark:bg-gray-950 p-8 md:p-16 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl text-center space-y-8 animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
          <Brain className="w-12 h-12 text-emerald-500" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-gray-900 dark:text-white capitalize">
            {category} - {day.replace('-', ' ')}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {flashcards.length} flashcards in this session.
          </p>
        </div>

        <button
          onClick={handleStart}
          className="w-full py-5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20"
        >
          Enter Fullscreen & Start <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
