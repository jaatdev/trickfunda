import { createWorker, Worker } from 'tesseract.js';

let worker: Worker | null = null;
let currentLanguage = 'eng';

export async function initWorker(lang: 'eng' | 'hin' = 'eng') {
  if (worker && currentLanguage === lang) return worker;
  
  if (worker) {
    await worker.terminate();
  }

  worker = await createWorker(lang);
  
  await worker.setParameters({
    tessedit_pageseg_mode: '6' 
  } as any);
  
  currentLanguage = lang;
  return worker;
}

export async function recognizeText(
  imageData: string | HTMLCanvasElement | HTMLImageElement,
  lang: 'eng' | 'hin' = 'eng'
) {
  let dataUrl = typeof imageData === 'string' ? imageData : '';
  if (typeof imageData !== 'string') {
     const canvas = imageData as HTMLCanvasElement;
     if (canvas.toDataURL) dataUrl = canvas.toDataURL('image/png');
  }

  // 1. Try Gemini Cloud AI API first for perfect contextual accuracy
  if (dataUrl) {
    try {
      const res = await fetch('/api/ai/recognize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageData: dataUrl, lang })
      });
      
      if (res.ok) {
        const json = await res.json();
        if (json.text) {
           console.log("Handwriting transcribed via Gemini AI");
           return {
             text: json.text,
             confidence: json.confidence || 99,
             words: [],
             lines: [],
             lang,
           };
        }
      } else {
        console.warn("Gemini AI API returned error, falling back to Tesseract.", await res.text());
      }
    } catch (e) {
      console.warn("Failed to reach Gemini AI API, falling back to Tesseract.", e);
    }
  }

  // 2. Fallback to Local Tesseract
  console.log("Falling back to local Tesseract OCR");
  const w = await initWorker(lang);
  const { data } = await w.recognize(imageData);
  
  return {
    text: data.text.trim(),
    confidence: data.confidence,
    words: (data as any).words || [],
    lines: (data as any).lines || [],
    lang,
  };
}

export async function terminateWorker() {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}
