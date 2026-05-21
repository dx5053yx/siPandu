import { NextResponse } from 'next/server';
import { geminiRespondSchema } from '@/lib/validators';
import { callGemini, isGeminiAvailable } from '@/lib/gemini/client';
import { buildFullPrompt, FALLBACK_RESPONSE } from '@/lib/chat/prompts';
import { geminiOutputSchema } from '@/lib/validators';
import { demoMerchant, demoProducts } from '@/lib/firebase/seed';
import type { Merchant } from '@/types/merchant';
import type { Product } from '@/types/product';

/**
 * POST /api/gemini/respond
 * Internal endpoint to generate AI response.
 * Should be server-side only or protected by admin token.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const parsed = geminiRespondSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Validation failed', details: parsed.error.issues },
      { status: 400 }
    );
  }

  if (!isGeminiAvailable()) {
    return NextResponse.json({
      ...FALLBACK_RESPONSE,
      note: 'Gemini API key not configured, using fallback',
    });
  }

  try {
    // For MVP, use demo data. In production, fetch from Firestore.
    const merchant = demoMerchant as unknown as Merchant;
    const products = demoProducts as unknown as Product[];

    const prompt = buildFullPrompt(merchant, products, parsed.data.message);
    const rawResponse = await callGemini(prompt);
    const jsonParsed = JSON.parse(rawResponse);
    const validated = geminiOutputSchema.safeParse(jsonParsed);

    if (validated.success) {
      return NextResponse.json(validated.data);
    }

    return NextResponse.json({
      ...FALLBACK_RESPONSE,
      note: 'Gemini response validation failed',
    });
  } catch (error) {
    console.error('Gemini respond error:', error);
    return NextResponse.json({
      ...FALLBACK_RESPONSE,
      note: 'Gemini API error',
    });
  }
}
