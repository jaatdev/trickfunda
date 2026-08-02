import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { withKeyRotation } from '@/lib/ai-keys';

export async function POST(req: Request) {
  try {
    const { imageData, lang } = await req.json();

    if (!imageData || !imageData.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Invalid image data' }, { status: 400 });
    }

    // Extract base64 part
    const base64Data = imageData.split(',')[1];
    const mimeType = imageData.split(';')[0].split(':')[1];
    const prompt = `You are an expert handwriting transcriber. Transcribe the handwriting in this image exactly. The language could be English, Hindi, or a mix of both. Fix any obvious spelling mistakes to form coherent words based on the context, but do not change the core meaning. Return ONLY the transcribed text. Do not include markdown, explanations, or quotes.`;

    const response = await withKeyRotation(async (apiKey) => {
      const ai = new GoogleGenAI({ apiKey });
      return await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
        config: {
           temperature: 0.1, // Low temperature for reliable transcription
        }
      });
    });

    const text = response.text?.trim() || '';

    return NextResponse.json({ text, confidence: 99 });
  } catch (error: any) {
    console.error('Gemini OCR Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

