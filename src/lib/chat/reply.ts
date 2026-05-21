import { sendOpenClawWhatsAppMessage } from '@/lib/openclaw/client';

export type SendChatReplyResult = {
  ok: boolean;
  provider: string;
  to: string;
  message: string;
  delivered: boolean;
  raw?: unknown;
  error?: string;
  note?: string;
};

export async function sendChatReply(input: {
  to: string;
  message: string;
  provider?: string;
}): Promise<SendChatReplyResult> {
  const provider = input.provider || process.env.WHATSAPP_PROVIDER || 'mock';

  if (provider === 'mock') {
    console.log(`[Mock Reply] To: ${input.to} | Message: ${input.message}`);
    return {
      ok: true,
      provider: 'mock',
      to: input.to,
      message: input.message,
      delivered: true,
    };
  }

  if (provider === 'openclaw') {
    return sendOpenClawWhatsAppMessage({
      to: input.to,
      message: input.message,
    });
  }

  return {
    ok: true,
    provider,
    to: input.to,
    message: input.message,
    delivered: false,
    note: `Provider "${provider}" belum diimplementasikan.`,
  };
}
