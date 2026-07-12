'use client';

import React from 'react';
import { Brain, Printer, CheckCircle, ArrowLeft, Info } from 'lucide-react';
import type { SubjectFlashcard } from '@/lib/types';

interface Props {
  flashcards: SubjectFlashcard[];
  title: string;
  onClose: () => void;
}

export default function GenericFlashcardSummary({ flashcards, title, onClose }: Props) {
  const handleDownloadPdf = async () => {
    const element = document.getElementById('generic-pdf-summary-content');
    if (!element) return;
    
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
      logoImg.src = '/trickfunda-official-logo.png';
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
          const logoWidth = 45;
          const logoHeight = (logoImg.height * logoWidth) / logoImg.width;
          pdf.addImage(logoImg, 'PNG', pdfWidth / 2 - logoWidth / 2, 10, logoWidth, logoHeight);
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
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-white dark:bg-gray-950 overflow-y-auto p-4 md:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 print:hidden">
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
          
          <div className="flex gap-4">
            <button 
              onClick={handleDownloadPdf}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-bold transition-colors flex items-center gap-2"
            >
              <Printer className="w-5 h-5" /> Download PDF
            </button>
            <button 
              onClick={onClose}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Curriculum
            </button>
          </div>
        </div>

        {/* Printable List */}
        <div id="generic-pdf-summary-content" className="bg-white dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-12 shadow-2xl print:shadow-none print:border-none print:p-0">
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
  );
}
