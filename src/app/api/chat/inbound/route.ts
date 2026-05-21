import { NextResponse } from 'next/server';
import { chatInboundSchema } from '@/lib/validators';
import { processIncomingChat } from '@/lib/chat/processor';
import { sendChatReply } from '@/lib/chat/reply';
import { triggerOpenClawEvent } from '@/lib/openclaw/client';

export const runtime = 'nodejs';

/**
 * POST /api/chat/inbound
 * Main webhook for incoming chat messages from WhatsApp gateway/mock.
 * Protected by x-sipandu-signature header.
 */
export async function POST(request: Request) {
  const respondOnly = request.headers.get('x-sipandu-respond-only') === 'true';

  // 1. Verify webhook secret
  const expectedSecret = process.env.CHAT_WEBHOOK_SECRET;
  if (expectedSecret && expectedSecret !== 'buat_secret_random_min_32_char') {
    const signature = request.headers.get('x-sipandu-signature');
    if (signature !== expectedSecret) {
      return NextResponse.json(
        { ok: false, error: 'Invalid signature' },
        { status: 401 }
      );
    }
  }

  // 2. Parse and validate body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const parsed = chatInboundSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Validation failed', details: parsed.error.issues },
      { status: 400 }
    );
  }

  const input = parsed.data;

  // 3. Process chat
  try {
    const result = await processIncomingChat({
      merchantId: input.merchantId,
      customerPhone: input.customerPhone,
      customerName: input.customerName || 'Pelanggan',
      message: input.message,
      channel: input.channel,
    });

    // 4. Trigger OpenClaw if needs human
    if (result.needsHuman) {
      await triggerOpenClawEvent({
        type: 'needs_human_followup',
        merchantId: input.merchantId,
        chatId: result.chatId,
        customerPhone: input.customerPhone,
        summary: `Pelanggan: "${input.message}" — Bot menandai butuh admin.`,
        priority: 'medium',
      }).catch((err) => console.warn('OpenClaw trigger failed:', err));
    }

    const delivery = input.channel === 'mock' || respondOnly
      ? null
      : await sendChatReply({
          to: input.customerPhone,
          message: result.reply,
          provider: process.env.WHATSAPP_PROVIDER || input.channel,
        });

    return NextResponse.json({
      ok: true,
      reply: result.reply,
      intent: result.intent,
      needsHuman: result.needsHuman,
      orderDraft: result.orderDraft,
      chatId: result.chatId,
      delivery,
    });
  } catch (error) {
    console.error('Chat processing error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
