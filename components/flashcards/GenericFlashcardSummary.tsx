'use client';

import React, { useState } from 'react';
import { Brain, Printer, CheckCircle, ArrowLeft, Info, Terminal, Shield, Loader2 } from 'lucide-react';
import type { SubjectFlashcard } from '@/lib/types';

interface Props {
  flashcards: SubjectFlashcard[];
  title: string;
  onClose: () => void;
}

export default function GenericFlashcardSummary({ flashcards, title, onClose }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPdf = async () => {
    if (isGenerating) return;
    
    const element = document.getElementById('generic-pdf-summary-content');
    if (!element) return;
    
    setIsGenerating(true);
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
      
      const logoImg = new Image();
      logoImg.src = '/trickfunda-official-logo.jpeg';
      let logoLoaded = false;
      try {
        await new Promise((resolve, reject) => {
          logoImg.onload = () => { logoLoaded = true; resolve(null); };
          logoImg.onerror = reject;
        });
      } catch (e) {
        console.warn('Could not load logo for PDF', e);
      }

      const addBackground = () => {
        pdf.setFillColor(bgColor);
        pdf.rect(0, 0, pdfWidth, pdfHeight, 'F');
        
        if (logoLoaded) {
          const logoWidth = 15; // Small VIP logo size
          const logoHeight = (logoImg.height * logoWidth) / logoImg.width;
          // Position at Top Right (with 10mm margin from right edge)
          pdf.addImage(logoImg, 'JPEG', pdfWidth - logoWidth - 10, 10, logoWidth, logoHeight);
          return 10 + logoHeight + 10; // return new starting Y
        }
        return 10;
      };

      let currentY = addBackground();

      // Capture header first
      const headerEl = element.querySelector('.pdf-header') as HTMLElement;
      
      if (headerEl) {
        const headerData = await toJpeg(headerEl, { quality: 0.92, pixelRatio: 2, backgroundColor: bgColor });
        const hProps = pdf.getImageProperties(headerData);
        const hHeight = (hProps.height * (pdfWidth - 20)) / hProps.width;
        pdf.addImage(headerData, 'JPEG', 10, currentY, pdfWidth - 20, hHeight);
        currentY += hHeight + 10;
      }
      
      const cards = element.querySelectorAll('.pdf-card-item');
      
      // Process each card individually to prevent page breaks inside a card
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i] as HTMLElement;
        const dataUrl = await toJpeg(card, { 
          quality: 0.92, 
          pixelRatio: 2,
          backgroundColor: bgColor
        });
        
        const imgProps = pdf.getImageProperties(dataUrl);
        // Add 20mm padding (10mm left, 10mm right)
        const renderWidth = pdfWidth - 20; 
        const imgHeight = (imgProps.height * renderWidth) / imgProps.width;
        
        // If this card exceeds the remaining page height, add a new page
        if (currentY + imgHeight > pdfHeight - 10) {
          pdf.addPage();
          currentY = addBackground();
        }
        
        pdf.addImage(dataUrl, 'JPEG', 10, currentY, renderWidth, imgHeight);
        currentY += imgHeight + 10; // gap between cards
      }
      
      pdf.save(`TrickFunda-${title.replace(/\s+/g, '-')}-Summary.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try printing the page instead.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {isGenerating && (
        <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center text-emerald-400 font-mono animate-in fade-in duration-300">
          <div className="relative flex items-center justify-center mb-8">
            <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
            <Shield className="w-16 h-16 text-emerald-500 animate-pulse relative z-10" />
            <Loader2 className="w-24 h-24 absolute animate-spin text-emerald-500/50" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-[0.3em] mb-4 text-emerald-500 flex items-center gap-3 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]">
            <Terminal className="w-6 h-6 animate-pulse" />
            SYSTEM COMPILING
          </h2>
          <div className="flex flex-col items-center gap-2">
            <p className="text-emerald-400/80 animate-pulse text-sm md:text-base tracking-widest">ENCRYPTING PDF DATASTREAM...</p>
            <div className="w-64 h-1.5 bg-gray-900 border border-emerald-500/30 rounded-full overflow-hidden mt-6 relative">
              <div className="absolute top-0 left-0 h-full bg-emerald-500 w-full animate-[shimmer_2s_infinite] opacity-50" />
              <div className="h-full bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-[pulse_1s_ease-in-out_infinite] w-[70%]" />
            </div>
          </div>
        </div>
      )}
      <div className="fixed inset-0 z-[200] bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm overflow-y-auto p-4 md:p-8">
        <div className="w-full max-w-6xl mx-auto bg-gray-50/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] p-6 md:p-10 shadow-2xl animate-in fade-in zoom-in-95 duration-500 my-4 md:my-10">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 print:hidden mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-emerald-500 font-bold mb-2">
              <CheckCircle className="w-6 h-6" /> Session Complete!
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white capitalize">
              {title} Summary
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              You've mastered {flashcards.length} cards today. Review them below or download as PDF.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={handleDownloadPdf}
              className="px-6 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold transition-colors flex items-center gap-2 shadow-sm"
            >
              <Printer className="w-5 h-5" /> Download PDF
            </button>
            <button 
              onClick={onClose}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Notes
            </button>
          </div>
        </div>

        {/* Printable List */}
        <div id="generic-pdf-summary-content" className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-12 shadow-sm print:shadow-none print:border-none print:p-0">
          <div className="text-center mb-10 pdf-header">
            <h1 className="text-4xl font-black text-gray-900 dark:text-white capitalize mb-2">TrickFunda</h1>
            <h2 className="text-xl text-gray-600 dark:text-gray-400 capitalize">{title}</h2>
          </div>

          <div className="space-y-8 divide-y divide-gray-100 dark:divide-white/5 print:divide-gray-300">
            {flashcards.map((card, index) => {
              const displayTrick = card.kdHack || card.trick;
              const displayTrickHi = card.kdHack_hi || card.trick_hi;
              const hasTrick = !!displayTrick || !!displayTrickHi;

              return (
                <div key={index} className="pt-8 first:pt-0 print:break-inside-avoid pdf-card-item">
                  <div className="flex flex-col lg:flex-row gap-6">
                    
                    {/* Left: Front / Term */}
                    <div className="lg:w-1/3 space-y-4">
                      <div className="flex items-start gap-3">
                        <span className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm shrink-0 mt-1">
                          {index + 1}
                        </span>
                        <div>
                          {card.type && (
                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-xs font-bold uppercase rounded mb-2 inline-block">
                              {card.type}
                            </span>
                          )}
                          <h3 className="text-2xl font-black text-blue-500 dark:text-blue-400 text-balance leading-tight">{card.front}</h3>
                          {card.front_hi && <p className="text-blue-400/80 mt-1">{card.front_hi}</p>}
                        </div>
                      </div>
                      
                      {(card.hint || card.hint_hi) && (
                        <div className="pl-11 text-sm text-yellow-600 dark:text-yellow-500/80 italic">
                          <span className="font-bold">Hint: </span>
                          {card.hint} {card.hint_hi}
                        </div>
                      )}
                    </div>

                    {/* Right: Back / Explanation / Lists / Tricks */}
                    <div className="lg:w-2/3 space-y-6">
                      
                      {/* Main Meaning */}
                      <div className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Meaning / Answer</h4>
                        <p className="text-xl text-gray-900 dark:text-gray-100 leading-relaxed font-medium">
                          {card.back}
                        </p>
                        {card.back_hi && (
                          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
                            {card.back_hi}
                          </p>
                        )}
                        
                        {(card.explanation || card.explanation_hi) && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider mb-2">Explanation</h4>
                            {card.explanation && <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{card.explanation}</p>}
                            {card.explanation_hi && <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 leading-relaxed">{card.explanation_hi}</p>}
                          </div>
                        )}
                      </div>

                      {/* Lists */}
                      {card.lists && card.lists.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {card.lists.map((list, lIdx) => {
                             const theme = list.colorTheme || (lIdx % 2 === 0 ? 'emerald' : 'rose');
                             let titleColor = "text-emerald-500";
                             let bgItem = "bg-emerald-50 dark:bg-emerald-500/10";
                             let borderItem = "border-emerald-200 dark:border-emerald-500/20";
                             let textItem = "text-emerald-800 dark:text-emerald-200";

                             if (theme === 'rose') {
                               titleColor = "text-rose-500";
                               bgItem = "bg-rose-50 dark:bg-rose-500/10";
                               borderItem = "border-rose-200 dark:border-rose-500/20";
                               textItem = "text-rose-800 dark:text-rose-200";
                             } else if (theme === 'blue') {
                               titleColor = "text-blue-500";
                               bgItem = "bg-blue-50 dark:bg-blue-500/10";
                               borderItem = "border-blue-200 dark:border-blue-500/20";
                               textItem = "text-blue-800 dark:text-blue-200";
                             } else if (theme === 'amber') {
                               titleColor = "text-amber-500";
                               bgItem = "bg-amber-50 dark:bg-amber-500/10";
                               borderItem = "border-amber-200 dark:border-amber-500/20";
                               textItem = "text-amber-800 dark:text-amber-200";
                             } else if (theme === 'purple') {
                               titleColor = "text-purple-500";
                               bgItem = "bg-purple-50 dark:bg-purple-500/10";
                               borderItem = "border-purple-200 dark:border-purple-500/20";
                               textItem = "text-purple-800 dark:text-purple-200";
                             }

                            return (
                              <div key={lIdx} className="space-y-2">
                                <h4 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-1 ${titleColor}`}>
                                  <Info className="w-3.5 h-3.5" /> {list.title}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {list.items.map((item, i) => (
                                    <span key={i} className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${bgItem} ${borderItem} ${textItem}`}>
                                      {item}
                                      {list.items_hi && list.items_hi[i] && (
                                        <span className="block text-xs opacity-70 mt-0.5">{list.items_hi[i]}</span>
                                      )}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* KD Hack */}
                      {hasTrick && (
                        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-5 print:bg-white print:border-emerald-500">
                          <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                            <Brain className="w-4 h-4" /> KD Hack
                          </h4>
                          {displayTrick && (
                            <p className="text-gray-900 dark:text-white font-bold text-lg print:text-black leading-relaxed">
                              {displayTrick}
                            </p>
                          )}
                          {displayTrickHi && (
                            <p className="text-emerald-700 dark:text-emerald-300 font-medium text-base mt-2 leading-relaxed">
                              {displayTrickHi}
                            </p>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
    </>
  );
}
