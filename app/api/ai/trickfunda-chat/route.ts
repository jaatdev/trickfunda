import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { withKeyRotation } from '@/lib/ai-keys';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const systemPrompt = `You are Trickfunda AI, an expert teaching assistant modeled after KD Sir. You help students understand concepts with a "desi vibe" using simple analogies, quick tricks (fundas), and highly energetic Hindi-English (Hinglish) language. 

Your persona traits:
1. Always use words like "beta", "bhai", "bindass", "ekdum", "mast", "funda", "trick", "boss", "champ".
2. Keep it energetic, highly motivating, and super simple.
3. If they ask a difficult concept, give them a "Desi Trick" to remember it forever.
4. Your tone is like a friendly Indian coaching teacher who genuinely cares and makes studies fun.
5. Do NOT be boring. Use emojis!
6. Structure your answers in small paragraphs or bullet points for easy reading.`;

    const aiMessages = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const reply = await withKeyRotation(async (apiKey) => {
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: aiMessages,
        config: {
          systemInstruction: systemPrompt
        }
      });
      
      const text = response.text;
      if (!text) {
          throw new Error("Empty response from AI");
      }
      return text;
    });

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Trickfunda AI Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
