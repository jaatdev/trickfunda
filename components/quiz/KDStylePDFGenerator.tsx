'use client';

import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '@/lib/types';
import { Download, Loader2, Sparkles } from 'lucide-react';
import { MathJax } from 'better-react-mathjax';
import { compressPDF } from '@/lib/pdf-compressor/pipeline';

interface Props {
  questions: QuizQuestion[];
  title: string;
  selectedCount?: number;
}

export default function KDStylePDFGenerator({ questions, title, selectedCount }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<QuizQuestion[]>([]);
  const [customTitle, setCustomTitle] = useState(title);
  const [customYoutube, setCustomYoutube] = useState('youtube.com/@TrickFunda');
  const [customBrand, setCustomBrand] = useState('🎯 TrickFunda');
  const [compressionProgress, setCompressionProgress] = useState<string>('');

  const handleStartGeneration = () => {
    let sliced = questions;
    if (selectedCount && selectedCount > 0 && selectedCount <= questions.length) {
      sliced = questions.slice(0, selectedCount);
    }
    setSelectedQuestions(sliced);
    setIsGenerating(true);
  };

  useEffect(() => {
    if (isGenerating && selectedQuestions.length > 0) {
      let isCancelled = false;
      const captureSlides = async () => {
        try {
          const htmlToImage = await import('html-to-image');
          const { jsPDF } = await import('jspdf');

          // Wait heavily for React to render the new MathJax components natively
          // and for MathJax to download/apply all its CDN fonts and stylesheets.
          await document.fonts.ready;
          await new Promise(r => setTimeout(r, 2500));
          
          if (isCancelled) return;

          const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [1280, 720],
            compress: true
          });
          const slideElements = Array.from(document.querySelectorAll('.pdf-slide-capture')) as HTMLElement[];

          for (let i = 0; i < slideElements.length; i++) {
            const slideEl = slideElements[i];
            
            const dataUrl = await htmlToImage.toJpeg(slideEl, {
              quality: 0.8,
              backgroundColor: '#ffffff',
              pixelRatio: 1.5,
              style: {
                transform: 'scale(1)',
                transformOrigin: 'top left',
                margin: '0',
              }
            });

            if (i > 0) {
              pdf.addPage([1280, 720], 'landscape');
            }
            
            pdf.addImage(dataUrl, 'JPEG', 0, 0, 1280, 720, undefined, 'FAST');
          }

            const pdfFilename = `${customTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_slides.pdf`;
            
            setCompressionProgress('Compressing with internal engine...');
            const pdfBuffer = pdf.output('arraybuffer');
            
            try {
              const compressedResult = await compressPDF(pdfBuffer, {
                  quality: 'maximum',
                  imageQuality: 0.6,
                  downscaleOversized: true,
                  stripMetadata: true,
                  deduplicateStreams: true,
                  optimizeFonts: true,
              }, (progress) => {
                  setCompressionProgress(`Compressing... ${progress.percentage}%`);
              });

              if (compressedResult.compressedBytes) {
                  const blob = new Blob([compressedResult.compressedBytes as any], { type: 'application/pdf' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = pdfFilename;
                  a.click();
                  URL.revokeObjectURL(url);
              } else {
                  pdf.save(pdfFilename);
              }
            } catch (compressErr) {
              console.warn("Compression failed, falling back to uncompressed", compressErr);
              pdf.save(pdfFilename);
            }

          } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF slides. Please try again.');
          } finally {
            setIsGenerating(false);
            setCompressionProgress('');
          }
      };

      captureSlides();
      
      return () => { isCancelled = true; };
    }
  }, [isGenerating, selectedQuestions, customTitle, customYoutube, customBrand]);

  return (
    <>
      <div className="w-full mt-6 space-y-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">PDF Topic Name (Header)</label>
            <input 
              type="text" 
              value={customTitle} 
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="e.g. LEVEL-2"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">YouTube / Channel URL</label>
            <input 
              type="text" 
              value={customYoutube} 
              onChange={(e) => setCustomYoutube(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="youtube.com/@TrickFunda"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Brand Name (Left Header)</label>
            <input 
              type="text" 
              value={customBrand} 
              onChange={(e) => setCustomBrand(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="🎯 TrickFunda"
            />
          </div>
        </div>
        <button 
          onClick={handleStartGeneration}
          disabled={isGenerating || !questions || questions.length === 0}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          {isGenerating ? (compressionProgress || 'Preparing PDF...') : 'Download Teaching Slides (PDF)'}
        </button>
      </div>

      {/* Full Screen Hacker Loading Animation */}
      {isGenerating && (
        <div className="fixed inset-0 z-[99999] bg-black flex flex-col items-center justify-center font-mono">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-black to-black" />
          
          <div className="relative z-10 flex flex-col items-center max-w-2xl w-full px-6">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-emerald-500/30 rounded-full animate-[spin_3s_linear_infinite]" />
              <div className="absolute inset-2 border-4 border-emerald-400/50 rounded-full animate-[spin_2s_linear_infinite_reverse]" />
              <div className="absolute inset-4 border-4 border-emerald-300 rounded-full animate-pulse" />
              <Loader2 className="absolute inset-0 m-auto w-8 h-8 text-emerald-400 animate-spin" />
            </div>

            <h2 className="text-3xl font-bold text-emerald-500 mb-2 tracking-[0.2em] uppercase text-center drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
              PDF COMPILER ENGAGED
            </h2>
            <div className="text-emerald-600/70 text-lg space-y-2 max-w-xl">
              <p>&gt; Securing React rendering context...</p>
              <p>&gt; Spawning {selectedQuestions.length} virtual slide instances...</p>
              <p>&gt; Firing up native MathJax CHTML engine...</p>
              <p className="text-emerald-400 font-bold">&gt; STAND BY FOR HIGH-RES SNAPSHOTS...</p>
              {compressionProgress && <p className="text-amber-400 font-bold">&gt; {compressionProgress}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Hidden Render Container */}
      {isGenerating && (
        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px', width: '1280px', overflow: 'hidden' }}>
          {selectedQuestions.map((q, i) => (
            <SlideComponent key={q.id || i} question={q} index={i} title={customTitle} youtubeUrl={customYoutube} brand={customBrand} />
          ))}
        </div>
      )}
    </>
  );
}

function SlideComponent({ question: q, index, title, youtubeUrl, brand }: { question: QuizQuestion, index: number, title: string, youtubeUrl: string, brand: string }) {
  const num = index + 1;
  return (
    <div 
      className="pdf-slide-capture" 
      style={{ 
        width: '1280px', 
        height: '720px', 
        display: 'flex', 
        flexDirection: 'column', 
        backgroundColor: '#ffffff',
        fontFamily: "'Poppins', 'Noto Sans Devanagari', sans-serif",
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{ flexShrink: 0, backgroundColor: '#0f172a', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', borderBottom: '5px solid #ff4500' }}>
        <div style={{ fontSize: '28px', fontWeight: 800, color: '#ff4500', letterSpacing: '1px', whiteSpace: 'nowrap', flexShrink: 0 }}>{brand}</div>
        <div style={{ fontSize: '24px', fontWeight: 600, color: '#f8fafc', textTransform: 'uppercase', whiteSpace: 'nowrap', margin: '0 20px', textAlign: 'center' }}>{title}</div>
        <div style={{ fontSize: '18px', fontWeight: 600, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', flexShrink: 0 }}>
          <svg viewBox="0 0 24 24" fill="#ff0000" width="32" height="32" style={{ display: 'block' }}>
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
          <span style={{ lineHeight: 1, paddingTop: '2px' }}>{youtubeUrl}</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ display: 'flex', flex: 1, padding: '20px 40px', gap: '30px', minHeight: 0 }}>
        {/* Left Column (Question + Options) */}
        <div style={{ flex: 1, borderRight: '3px dashed #cbd5e1', paddingRight: '30px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px', gap: '15px' }}>
            <div style={{ flexShrink: 0, backgroundColor: '#ff4500', color: 'white', padding: '6px 16px', borderRadius: '8px', fontSize: '18px', fontWeight: 800, whiteSpace: 'nowrap', boxShadow: '0 4px 6px -1px rgba(255, 69, 0, 0.2)' }}>
              Q. {num}
            </div>
            {q.examTag && (
              <div style={{ flexShrink: 0, backgroundColor: '#fef08a', color: '#b45309', padding: '6px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 800, border: '2px solid #fde047', textTransform: 'uppercase', whiteSpace: 'nowrap', boxShadow: '0 4px 6px -1px rgba(253, 224, 71, 0.3)' }}>
                {q.examTag}
              </div>
            )}
          </div>
          
          {q.prompt_hi && (
            <MathJax>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#1e293b', lineHeight: 1.4 }} dangerouslySetInnerHTML={{ __html: q.prompt_hi }} />
            </MathJax>
          )}
          
          <MathJax>
             <div style={{ fontSize: '20px', fontWeight: 600, color: '#475569', lineHeight: 1.4 }} dangerouslySetInnerHTML={{ __html: q.prompt }} />
          </MathJax>

          {q.image_url && (
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
               <img src={q.image_url} alt="Question" style={{ maxHeight: '160px', maxWidth: '100%', objectFit: 'contain', borderRadius: '12px', border: '2px solid #e2e8f0' }} />
            </div>
          )}

          {/* Options at the bottom of left col - Using a 2x2 Grid to save vertical space! */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: 'auto' }}>
            {q.options?.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const hiOpt = q.options_hi?.[idx];
              const displayOpt = (hiOpt && opt !== hiOpt) ? `${opt} / ${hiOpt}` : opt;
              return (
                <div key={idx} style={{ backgroundColor: '#f1f5f9', borderRadius: '12px', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#ff4500', flexShrink: 0 }}>({letter})</span>
                  <MathJax>
                     <div style={{ fontSize: '18px', fontWeight: 700, color: '#000000' }} dangerouslySetInnerHTML={{ __html: displayOpt }} />
                  </MathJax>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (Solving Area) */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: '16px', backgroundColor: '#ffffff' }}>
          {/* Watermark */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', overflow: 'hidden' }}>
             <div style={{ fontSize: '80px', letterSpacing: '12px', fontWeight: 900, color: '#f1f5f9', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>TRICKFUNDA</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ flexShrink: 0, backgroundColor: '#0f172a', color: '#64748b', fontSize: '14px', fontWeight: 600, padding: '10px 40px', textAlign: 'center', borderTop: '2px solid #1e293b' }}>
        {brand.replace(/🎯 /g, '')} | Smart Learning Platform
      </div>
    </div>
  );
}
