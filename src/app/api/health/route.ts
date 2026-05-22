import { NextResponse } from 'next/server';
import { normalizeIndonesianWhatsAppNumber } from '@/lib/whatsapp/number';

function isFilled(value?: string) {
  return Boolean(value && value.trim() && !value.includes('isi_') && !value.includes('REPLACE_WITH'));
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'sipandu',
    time: new Date().toISOString(),
    merchant: {
      id: process.env.DEFAULT_MERCHANT_ID || 'demo_warung_mendoan',
      whatsappNumber: normalizeIndonesianWhatsAppNumber(process.env.WHATSAPP_PHONE_NUMBER),
    },
    checks: {
      appUrl: isFilled(process.env.NEXT_PUBLIC_APP_URL),
      supabaseClientEnv:
        isFilled(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
        isFilled(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
      supabaseServerEnv:
        isFilled(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
        (isFilled(process.env.SUPABASE_SERVICE_ROLE_KEY) ||
          isFilled(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)),
      gemini: isFilled(process.env.GEMINI_API_KEY),
      chatWebhookSecret: isFilled(process.env.CHAT_WEBHOOK_SECRET),
      openClawWebhookSecret: isFilled(process.env.OPENCLAW_WEBHOOK_SECRET),
    },
  });
}
