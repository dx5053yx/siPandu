import { NextResponse } from 'next/server';
import { chatReplySchema } from '@/lib/validators';
import { sendChatReply } from '@/lib/chat/reply';

export const runtime = 'nodejs';

/**
 * POST /api/chat/reply
 * Endpoint to send reply back to provider/adapter.
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

  const parsed = chatReplySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Validation failed', details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { to, message } = parsed.data;
  const result = await sendChatReply({ to, message });
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
