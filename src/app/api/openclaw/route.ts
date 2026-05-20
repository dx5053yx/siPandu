import { NextResponse } from 'next/server';
import { handleIncomingMessage } from '@/lib/bot-engine';

export async function POST(request: Request) {
  const payload = await request.json();
  const message = String(payload.message || payload.text || payload.body || '');
  const customerName = String(payload.name || payload.customerName || 'Pelanggan');
  const phone = String(payload.phone || payload.from || 'unknown');
  const result = await handleIncomingMessage(message, customerName);

  return NextResponse.json({
    reply: result.reply,
    to: phone,
    order: result.order || null
  });
}
