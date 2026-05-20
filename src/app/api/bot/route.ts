import { NextResponse } from 'next/server';
import { handleIncomingMessage } from '@/lib/bot-engine';

export async function POST(request: Request) {
  const body = await request.json();
  const message = String(body.message || body.text || '');
  const name = String(body.customerName || 'Pelanggan');
  const result = await handleIncomingMessage(message, name);
  return NextResponse.json(result);
}
