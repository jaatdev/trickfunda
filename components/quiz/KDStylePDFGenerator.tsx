'use client';

import React, { useRef, useState } from 'react';
import { QuizQuestion } from '@/lib/types';
import { Download, Loader2 } from 'lucide-react';

interface Props {
  questions: QuizQuestion[];
  title: string;
}

export default function KDStylePDFGenerator({ questions, title }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!containerRef.current) return;
    setIsGenerating(true);
    try {
      // dynamically import html2pdf
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = (html2pdfModule.default ? html2pdfModule.default : html2pdfModule) as any;
      
      const element = containerRef.current;
      const opt = {
        margin:       0,
        filename:     `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_slides.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'px', format: [1280, 720], orientation: 'landscape' }
      };

      // We need to briefly unhide it for html2canvas to render it properly
      element.style.display = 'block';
      await html2pdf().set(opt).from(element).save();
      element.style.display = 'none';
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF slides.');
    } finally {
      setIsGenerating(false);
      if (containerRef.current) {
        containerRef.current.style.display = 'none';
      }
    }
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
        {isGenerating ? 'Generating Slides...' : 'Download Teaching Slides (PDF)'}
      </button>

      {/* Hidden container for PDF rendering */}
      <div 
        className="fixed top-0 left-[-9999px] z-[-1]" 
        style={{ width: '1280px', display: 'none' }}
        ref={containerRef}
      >
        <div id="slide-to-print" className="bg-white">
          {questions?.map((q, index) => {
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
    </>
  );
}
