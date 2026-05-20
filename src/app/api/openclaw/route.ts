import { NextResponse } from 'next/server';
import { handleIncomingMessage } from '@/lib/bot-engine';
import { saveIncomingOrder } from '@/lib/order-store';

function getWebhookSecret(request: Request, payload: Record<string, unknown>) {
  const headerSecret = request.headers.get('x-openclaw-secret');
  const bearer = request.headers.get('authorization')?.replace('Bearer ', '');
  const payloadSecret = typeof payload.secret === 'string' ? payload.secret : undefined;
  return headerSecret || bearer || payloadSecret;
}

export async function POST(request: Request) {
  const payload = await request.json();
  const expectedSecret = process.env.OPENCLAW_WEBHOOK_SECRET;

  if (expectedSecret) {
    const incomingSecret = getWebhookSecret(request, payload);
    if (incomingSecret !== expectedSecret) {
      return NextResponse.json({ ok: false, error: 'unauthorized webhook' }, { status: 401 });
    }
  }

  const message = String(payload.message || payload.text || payload.body || '');
  const customerName = String(payload.name || payload.customerName || 'Pelanggan');
  const phone = String(payload.phone || payload.from || 'unknown');
  const umkmId = String(payload.umkmId || 'demo-geprek-maju');
  const result = await handleIncomingMessage(message, customerName);

  let orderId: string | null = null;
  if (result.order) {
    orderId = await saveIncomingOrder({
      umkmId,
      customerName: result.order.customerName,
      customerPhone: phone,
      items: result.order.items,
      total: result.order.total,
      source: 'openclaw'
    });
  }

  return NextResponse.json({
    ok: true,
    reply: result.reply,
    to: phone,
    order: result.order || null,
    orderId
  });
}
