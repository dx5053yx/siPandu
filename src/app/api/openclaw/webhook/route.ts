import { NextResponse } from 'next/server';
import { openclawWebhookSchema } from '@/lib/validators';
import { getSupabaseServerClient } from '@/lib/supabase/server';

/**
 * POST /api/openclaw/webhook
 * Bridge endpoint from/to OpenClaw for agent automation.
 * Protected by Bearer token.
 */
export async function POST(request: Request) {
  // 1. Verify bearer token
  const expectedSecret = process.env.OPENCLAW_WEBHOOK_SECRET;
  if (expectedSecret && expectedSecret !== 'buat_secret_random_min_32_char') {
    const authHeader = request.headers.get('authorization');
    const bearer = authHeader?.replace('Bearer ', '');
    const headerSecret = request.headers.get('x-openclaw-secret');
    const incomingSecret = bearer || headerSecret;

    if (incomingSecret !== expectedSecret) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized webhook' },
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

  const parsed = openclawWebhookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Validation failed', details: parsed.error.issues },
      { status: 400 }
    );
  }

  const event = parsed.data;

  // 3. Save event to Supabase
  try {
    const supabase = getSupabaseServerClient();
    await supabase.from('openclaw_events').insert({
      type: event.type,
      merchant_id: event.merchantId,
      chat_id: event.chatId ?? null,
      customer_phone: event.customerPhone ?? null,
      summary: event.summary ?? null,
      priority: event.priority ?? null,
      date: event.date ?? null,
      action: event.action ?? null,
      payload: event,
      processed: false,
      received_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Failed to save OpenClaw event to Supabase:', err);
  }

  // 4. Handle event types
  switch (event.type) {
    case 'needs_human_followup':
      console.log(`[OpenClaw] Human follow-up needed for merchant ${event.merchantId}, chat ${event.chatId}`);
      break;

    case 'daily_report':
      console.log(`[OpenClaw] Daily report requested for merchant ${event.merchantId}, date ${event.date}`);
      break;

    default:
      console.log(`[OpenClaw] Event received: ${event.type}`);
  }

  return NextResponse.json({
    ok: true,
    type: event.type,
    merchantId: event.merchantId,
    received: true,
  });
}
