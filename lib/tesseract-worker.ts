import { createWorker, Worker } from 'tesseract.js';

let worker: Worker | null = null;
let currentLanguage = 'eng';

export async function initWorker(lang: 'eng' | 'hin' = 'eng') {
  if (worker && currentLanguage === lang) return worker;
  
  if (worker) {
    await worker.terminate();
  }

  // Tesseract v5 creates worker with languages implicitly inside createWorker
  worker = await createWorker(lang);
  currentLanguage = lang;
  return worker;
}

export async function recognizeText(
  imageData: string | HTMLCanvasElement | HTMLImageElement,
  lang: 'eng' | 'hin' = 'eng'
) {
  const w = await initWorker(lang);
  const { data } = await w.recognize(imageData);
  const text = data.text;
  const confidence = data.confidence;
  const words = (data as any).words || [];
  const lines = data.lines || [];
  
  return {
    text: text.trim(),
    confidence,
    words,
    lines,
    lang,
  };
}

export async function terminateWorker() {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}
