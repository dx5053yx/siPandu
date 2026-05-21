import { NextResponse } from 'next/server';
import { getOpenClawWhatsAppQr } from '@/lib/openclaw/client';
import { normalizeIndonesianWhatsAppNumber } from '@/lib/whatsapp/number';

export const runtime = 'nodejs';

export async function GET() {
  const number = normalizeIndonesianWhatsAppNumber(process.env.WHATSAPP_PHONE_NUMBER);
  const sessionId = process.env.OPENCLAW_WA_SESSION_ID || `sipandu-${number}`;
  const result = await getOpenClawWhatsAppQr({ number, sessionId });

  return NextResponse.json({
    ...result,
    inboundWebhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/chat/inbound`,
    automationWebhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/openclaw/webhook`,
    requiredInboundHeader: 'x-sipandu-signature',
    requiredOpenClawHeader: 'x-openclaw-secret',
    merchantId: process.env.DEFAULT_MERCHANT_ID || 'demo_warung_mendoan',
  });
}
