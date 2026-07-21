'use client';

import React, { useState } from 'react';
import { QuizQuestion } from '@/lib/types';
import { Download, Loader2 } from 'lucide-react';

interface Props {
  questions: QuizQuestion[];
  title: string;
  selectedCount?: number;
}

export default function KDStylePDFGenerator({ questions, title, selectedCount }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<QuizQuestion[]>([]);

  const generateSlidesHTML = (selected: QuizQuestion[]) => {
    let slidesHTML = '';
    
    selected.forEach((q, i) => {
      const num = i + 1;
      
      let optionsHTML = '';
      q.options?.forEach((opt, idx) => {
        const letter = String.fromCharCode(65 + idx);
        const hiOpt = q.options_hi?.[idx];
        const displayOpt = (hiOpt && opt !== hiOpt) ? `${opt} / ${hiOpt}` : opt;
        
        optionsHTML += `
          <div class="option-box">
            <span class="opt-letter">(${letter})</span>
            <div class="opt-text">${displayOpt}</div>
          </div>
        `;
      });

      const examTagHTML = q.examTag ? `<div class="exam-tag">${q.examTag}</div>` : '';
      const hindiPrompt = q.prompt_hi ? `<div class="prompt-hi">${q.prompt_hi}</div>` : '';

      slidesHTML += `
        <div class="slide">
          <a href="https://www.youtube.com/@TrickFunda" target="_blank" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; width: 100%; height: 100%;">
            <div class="header">
              <div class="logo">🎯 TrickFunda</div>
              <div class="title">${title}</div>
              <div class="url" style="display: flex; align-items: center; gap: 8px;">
                <svg viewBox="0 0 24 24" fill="#ff0000" width="32" height="32" style="display: block;">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                <span style="line-height: 1; padding-top: 2px;">youtube.com/@TrickFunda</span>
              </div>
            </div>
          
          <div class="content">
            <div class="left-col">
              <div class="q-header">
                <div class="q-num">Q. ${num} / प्र. ${num}</div>
                ${examTagHTML}
              </div>
              ${hindiPrompt}
              <div class="prompt-en">${q.prompt}</div>
              
              <div class="options-grid">
                ${optionsHTML}
              </div>
            </div>
            
            <div class="right-col">
              <div class="watermark">TrickFunda<br/>KD Method<br/>🚫 Ratta Mana Hai</div>
            </div>
          </div>
          
            <div class="footer">
              TrickFunda App | Smart Learning Platform
            </div>
          </a>
        </div>
      `;
    });

    return slidesHTML;
  };

  const getBaseCSS = () => `
    body { 
      margin: 0; 
      padding: 0; 
      background: #ffffff;
      -webkit-print-color-adjust: exact;
    }
    * { box-sizing: border-box; font-family: 'Poppins', 'Noto Sans Devanagari', sans-serif; }
    .slide {
      width: 1280px;
      height: 720px;
      page-break-after: always;
      page-break-inside: avoid;
      display: flex;
      flex-direction: column;
      background: #ffffff;
      position: relative;
      overflow: hidden;
    }
    .header {
      background-color: #0f172a;
      color: #ffffff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 40px;
      border-bottom: 5px solid #ff4500;
    }
    .logo { font-size: 28px; font-weight: 800; color: #ff4500; letter-spacing: 1px; }
    .title { font-size: 24px; font-weight: 600; color: #f8fafc; text-transform: uppercase; }
    .url { font-size: 18px; font-weight: 600; color: #cbd5e1; }
    
    .content {
      display: flex;
      flex: 1;
      padding: 30px 40px;
      gap: 40px;
    }
    .left-col {
      flex: 1;
      border-right: 3px dashed #cbd5e1;
      padding-right: 30px;
      display: flex;
      flex-direction: column;
    }
    .q-header { display: flex; align-items: center; margin-bottom: 15px; }
    .q-num { font-size: 22px; font-weight: 800; color: #ff4500; }
    .exam-tag {
      background-color: #fef08a;
      color: #b45309;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 800;
      margin-left: 15px;
      border: 1px solid #fde047;
      text-transform: uppercase;
    }
    
    .prompt-hi { font-size: 24px; font-weight: 800; color: #1e293b; margin-bottom: 12px; line-height: 1.8; }
    .prompt-en { font-size: 22px; font-weight: 600; color: #334155; margin-bottom: 24px; line-height: 1.8; }
    
    .options-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
    }
    .option-box {
      background-color: #f1f5f9;
      padding: 12px 20px;
      border-radius: 12px;
      border-left: 6px solid #cbd5e1;
      display: flex;
      align-items: center;
      min-height: 64px;
    }
    .opt-letter {
      font-size: 22px;
      font-weight: 800;
      color: #ff4500;
      margin-right: 16px;
      flex-shrink: 0;
    }
    .opt-text {
      font-size: 22px;
      font-weight: 600;
      color: #0f172a;
      line-height: 1.6;
    }
    
    .right-col {
      flex: 1;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .watermark {
      position: absolute;
      font-size: 70px;
      font-weight: 800;
      color: rgba(15, 23, 42, 0.03);
      text-align: center;
      line-height: 1.2;
      transform: rotate(-30deg);
      pointer-events: none;
      user-select: none;
    }
    
    .footer {
      text-align: center;
      padding: 10px;
      font-size: 14px;
      font-weight: 600;
      color: #94a3b8;
      background: #f8fafc;
    }
  `;

  const generatePDF = async () => {
    // 1. Pick random questions based on selectedCount
    let sliced = [...questions];
    if (selectedCount && selectedCount < questions.length) {
      sliced = sliced.sort(() => 0.5 - Math.random()).slice(0, selectedCount);
    }
    setSelectedQuestions(sliced);
    
    // 2. Trigger hacker loading animation
    setIsGenerating(true);

    // 3. Give the animation time to play before freezing the main thread for PDF gen
    setTimeout(async () => {
      try {
        const html2pdfModule = await import('html2pdf.js');
        const html2pdf = (html2pdfModule.default ? html2pdfModule.default : html2pdfModule) as any;
        
        let processedSlidesHTML = generateSlidesHTML(sliced);
        let mathJaxStyleString = '';

        // If MathJax is globally available (from better-react-mathjax in the app),
        // let it parse and convert equations into SVGs dynamically on our raw HTML string.
        if ((window as any).MathJax && (window as any).MathJax.typesetPromise) {
          const hiddenContainer = document.createElement('div');
          hiddenContainer.style.position = 'fixed';
          hiddenContainer.style.top = '0';
          hiddenContainer.style.left = '0';
          hiddenContainer.style.width = '1280px';
          hiddenContainer.style.zIndex = '-9999';
          hiddenContainer.style.opacity = '0.001';
          // Inject Poppins and our CSS so MathJax can accurately measure ex/em heights!
          hiddenContainer.innerHTML = `
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&family=Noto+Sans+Devanagari:wght@400;600;800&display=swap" rel="stylesheet">
            <style>${getBaseCSS()}</style>
            ${processedSlidesHTML}
          `;
          document.body.appendChild(hiddenContainer);

          // Let MathJax render everything inside the hidden container
          await (window as any).MathJax.typesetPromise([hiddenContainer]);
          
          // MathJax processed our string. We need to extract the slides HTML back out
          // ignoring the link and style tags we injected at the top.
          const slideDivs = Array.from(hiddenContainer.querySelectorAll('.slide'));
          processedSlidesHTML = slideDivs.map(el => el.outerHTML).join('');

          // Extract the global MathJax stylesheet that it injects so the SVGs render correctly in html2pdf
          const mathStyles = document.getElementById('MathJax-SVG-styles') || document.getElementById('MJX-CHTML-styles');
          if (mathStyles) {
            mathJaxStyleString = mathStyles.outerHTML;
          }

          document.body.removeChild(hiddenContainer);
        }

        const finalHtmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&family=Noto+Sans+Devanagari:wght@400;600;800&display=swap" rel="stylesheet">
            ${mathJaxStyleString}
            <style>${getBaseCSS()}</style>
          </head>
          <body>
            ${processedSlidesHTML}
          </body>
          </html>
        `;

        const opt = {
          margin:       0,
          filename:     `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_slides.pdf`,
          image:        { type: 'jpeg', quality: 1 },
          html2canvas:  { scale: 2, useCORS: true, logging: false },
          jsPDF:        { unit: 'px', format: [1280, 720], orientation: 'landscape' },
          pagebreak:    { mode: 'css' },
          enableLinks:  true
        };

        // Pass the raw HTML string directly to html2pdf
        await html2pdf().set(opt).from(finalHtmlContent).save();
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Failed to generate PDF slides. Please try again.');
      } finally {
        setIsGenerating(false);
      }
    }, 1500); // 1.5s delay for loading screen
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
            <p>&gt; Securing raw HTML context...</p>
            <p>&gt; Typesetting MathJax equations...</p>
            <p>&gt; Slicing {selectedQuestions.length} selected questions...</p>
            <p>&gt; Injecting KD-Style visual assets...</p>
            <p className="text-emerald-400 font-bold">&gt; STAND BY...</p>
          </div>
        </div>
      )}
    </>
  );
}
