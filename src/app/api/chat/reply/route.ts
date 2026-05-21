import { NextResponse } from 'next/server';

/**
 * POST /api/chat/reply
 * Endpoint to send reply back to provider/adapter.
 * In MVP with mock provider, this just returns the reply.
 * In production, this would forward to WhatsApp Cloud API or other gateway.
 */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const provider = process.env.WHATSAPP_PROVIDER || 'mock';
  const to = String(body.to || '');
  const message = String(body.message || '');

  if (!to || !message) {
    return NextResponse.json(
      { ok: false, error: 'Missing "to" or "message" field' },
      { status: 400 }
    );
  }

  if (provider === 'mock') {
    // Mock provider — just log and return success
    console.log(`[Mock Reply] To: ${to} | Message: ${message}`);
    return NextResponse.json({
      ok: true,
      provider: 'mock',
      to,
      message,
      delivered: true,
    });
  }

  // TODO: Add WhatsApp Business Cloud API integration here
  // const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  // const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  return NextResponse.json({
    ok: true,
    provider,
    to,
    message,
    delivered: false,
    note: `Provider "${provider}" not implemented yet`,
  });
}
