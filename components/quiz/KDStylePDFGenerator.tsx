'use client';

import React, { useRef, useState } from 'react';
import { QuizQuestion } from '@/lib/types';
import { Download, Loader2 } from 'lucide-react';

interface Props {
  questions: QuizQuestion[];
  title: string;
  selectedCount?: number;
}

export default function KDStylePDFGenerator({ questions, title, selectedCount }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSlides, setShowSlides] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<QuizQuestion[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    // 1. Pick random questions based on selectedCount
    let sliced = [...questions];
    if (selectedCount && selectedCount < questions.length) {
      sliced = sliced.sort(() => 0.5 - Math.random()).slice(0, selectedCount);
    }
    setSelectedQuestions(sliced);
    
    // 2. Trigger hacker loading animation and show slides in the viewport (behind loader)
    setIsGenerating(true);
    setShowSlides(true);

    // 3. Give the browser time to paint the slides and fonts
    setTimeout(async () => {
      if (!containerRef.current) {
        setIsGenerating(false);
        setShowSlides(false);
        return;
      }
      try {
        const html2pdfModule = await import('html2pdf.js');
        const html2pdf = (html2pdfModule.default ? html2pdfModule.default : html2pdfModule) as any;
        
        const opt = {
          margin:       0,
          filename:     `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_slides.pdf`,
          image:        { type: 'jpeg', quality: 1 },
          html2canvas:  { scale: 2, useCORS: true, logging: false },
          jsPDF:        { unit: 'px', format: [1280, 720], orientation: 'landscape' },
          pagebreak:    { mode: 'css' }
        };

        await html2pdf().set(opt).from(containerRef.current).save();
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF slides. Please try again.');
      } finally {
        setIsGenerating(false);
        setShowSlides(false);
      }
    }, 1500); // 1.5s delay for rendering
  };

  return (
    <>
      <button 
        onClick={generatePDF}
        disabled={isGenerating || !questions || questions.length === 0}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 mt-4 rounded-xl border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50"
      >
        {isGenerating ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Download className="w-5 h-5" />
        )}
        {isGenerating ? 'Preparing PDF...' : 'Download Teaching Slides (PDF)'}
      </button>

      {/* Full Screen Hacker Loading Animation */}
      {isGenerating && (
        <div className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center font-mono">
          <div className="text-emerald-500 text-4xl mb-6 flex items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin" />
            <span className="animate-pulse">INITIALIZING PDF GENERATOR...</span>
          </div>
          <div className="text-emerald-600/70 text-lg space-y-2 max-w-xl">
            <p>&gt; Securing rendering context...</p>
            <p>&gt; Slicing {selectedQuestions.length} selected questions...</p>
            <p>&gt; Injecting KD-Style visual assets...</p>
            <p className="text-emerald-400 font-bold">&gt; STAND BY...</p>
          </div>
        </div>
      )}

      {/* Hidden container for PDF rendering (In Viewport, behind loader) */}
      {showSlides && (
        <div 
          style={{ position: 'fixed', left: 0, top: 0, width: '1280px', zIndex: 99998 }}
          ref={containerRef}
        >
          <div id="slide-to-print" className="bg-white">
            {selectedQuestions?.map((q, index) => {
            const num = index + 1;
            return (
              <div 
                key={q.id || index}
                className="bg-white flex flex-col relative box-border"
                style={{
                  width: '1280px',
                  height: '720px',
                  pageBreakAfter: 'always',
                  pageBreakInside: 'avoid',
                  fontFamily: '"Poppins", sans-serif'
                }}
              >
                {/* Header */}
                <div style={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '15px 40px',
                  borderBottom: '5px solid #ff4500'
                }}>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#ff4500', letterSpacing: '1px' }}>
                    🎯 TrickFunda
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 600, color: '#f8fafc', textTransform: 'uppercase' }}>
                    {title}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: '#cbd5e1' }}>
                    ▶ youtube.com/@TrickFunda
                  </div>
                </div>

                {/* Content Area */}
                <div style={{
                  display: 'flex',
                  flex: 1,
                  padding: '30px 40px',
                  gap: '40px'
                }}>
                  {/* Left Side: Question */}
                  <div style={{
                    flex: 1,
                    borderRight: '3px dashed #cbd5e1',
                    paddingRight: '30px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: '#ff4500' }}>
                        Q. {num} / प्र. {num}
                      </div>
                      {q.examTag && (
                        <div style={{
                          backgroundColor: '#fef08a',
                          color: '#b45309',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: 800,
                          marginLeft: '15px',
                          border: '1px solid #fde047',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          {q.examTag}
                        </div>
                      )}
                    </div>

                    {q.prompt_hi && (
                      <div style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', marginBottom: '12px', lineHeight: 1.5 }}>
                        {q.prompt_hi}
                      </div>
                    )}
                    <div style={{ fontSize: '22px', fontWeight: 600, color: '#334155', marginBottom: '30px', lineHeight: 1.5 }}>
                      {q.prompt}
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '20px',
                      fontSize: '22px',
                      fontWeight: 600,
                      color: '#0f172a'
                    }}>
                      {q.options?.map((opt, i) => {
                        const letter = String.fromCharCode(65 + i);
                        const hiOpt = q.options_hi?.[i];
                        return (
                          <div key={i} style={{
                            backgroundColor: '#f1f5f9',
                            padding: '15px 20px',
                            borderRadius: '8px',
                            borderLeft: '5px solid #cbd5e1'
                          }}>
                            ({letter}) {opt}
                            {hiOpt && opt !== hiOpt && ` / ${hiOpt}`}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Side: Solving Space */}
                  <div style={{
                    flex: 1,
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                    <div style={{
                      position: 'absolute',
                      fontSize: '70px',
                      fontWeight: 800,
                      color: 'rgba(15, 23, 42, 0.03)',
                      textAlign: 'center',
                      lineHeight: 1.2,
                      transform: 'rotate(-30deg)',
                      pointerEvents: 'none',
                      userSelect: 'none'
                    }}>
                      TrickFunda<br/>KD Method<br/>🚫 Ratta Mana Hai
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div style={{
                  textAlign: 'center',
                  padding: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#94a3b8',
                  background: '#f8fafc'
                }}>
                  TrickFunda App | Smart Learning Platform
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}
    </>
  );
}
