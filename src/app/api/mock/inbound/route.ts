import { NextResponse } from 'next/server';
import { mockInboundSchema } from '@/lib/validators';
import { processIncomingChat } from '@/lib/chat/processor';

/**
 * POST /api/mock/inbound
 * Simulate incoming chat without real WhatsApp.
 * No secret verification needed — this is for development/demo only.
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

  const parsed = mockInboundSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Validation failed', details: parsed.error.issues },
      { status: 400 }
    );
  }

  const input = parsed.data;

  try {
    const result = await processIncomingChat({
      merchantId: input.merchantId,
      customerPhone: input.customerPhone,
      customerName: input.customerName || 'Pelanggan',
      message: input.message,
      channel: 'mock',
    });

    return NextResponse.json({
      ok: true,
      reply: result.reply,
      intent: result.intent,
      needsHuman: result.needsHuman,
      orderDraft: result.orderDraft,
      chatId: result.chatId,
    });
  } catch (error) {
    console.error('Mock inbound error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
