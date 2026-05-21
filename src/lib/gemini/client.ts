import { GoogleGenAI } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'isi_dari_google_ai_studio') {
      throw new Error('GEMINI_API_KEY belum dikonfigurasi di .env.local');
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export function getModelName(): string {
  return process.env.GEMINI_MODEL || 'gemini-2.0-flash';
}

/**
 * Call Gemini with a prompt and expect JSON output.
 * Returns the raw text response.
 */
export async function callGemini(prompt: string): Promise<string> {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: getModelName(),
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.3,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error('Gemini returned empty response');
  }
  return text;
}

/**
 * Check if Gemini API is available (key configured).
 */
export function isGeminiAvailable(): boolean {
  const key = process.env.GEMINI_API_KEY;
  return !!key && key !== 'isi_dari_google_ai_studio';
}
