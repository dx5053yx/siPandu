import { execFile } from 'node:child_process';
import { normalizeIndonesianWhatsAppNumber } from '@/lib/whatsapp/number';

/**
 * OpenClaw client for sending events to the OpenClaw gateway.
 * Used for agent automation, follow-up tasks, and monitoring.
 */

type OpenClawEventInput = {
  type: 'needs_human_followup' | 'daily_report' | 'run_task';
  merchantId: string;
  chatId?: string;
  customerPhone?: string;
  summary?: string;
  priority?: 'low' | 'medium' | 'high';
  date?: string;
};

export type OpenClawWhatsAppQr = {
  ok: boolean;
  configured: boolean;
  connected: boolean;
  status: 'connected' | 'waiting_qr' | 'not_configured' | 'gateway_error';
  number: string;
  sessionId: string;
  qrDataUrl: string | null;
  message: string;
  gatewayUrl?: string;
  qrPath?: string;
  source?: 'cli' | 'http';
  raw?: unknown;
};

export type OpenClawSendResult = {
  ok: boolean;
  provider: 'openclaw';
  to: string;
  message: string;
  delivered: boolean;
  raw?: unknown;
  error?: string;
};

/**
 * Check if OpenClaw gateway is configured.
 */
export function isOpenClawConfigured(): boolean {
  const url = process.env.OPENCLAW_GATEWAY_URL;
  const secret = process.env.OPENCLAW_WEBHOOK_SECRET;
  return !!url && url !== '' && !!secret && secret !== 'buat_secret_random_min_32_char';
}

/**
 * Trigger an event to OpenClaw gateway.
 * Fails silently if OpenClaw is not configured (MVP behavior).
 */
export async function triggerOpenClawEvent(event: OpenClawEventInput): Promise<boolean> {
  if (!isOpenClawConfigured()) {
    console.log('[OpenClaw] Gateway not configured, skipping event:', event.type);
    return false;
  }

  const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL!;
  const routePath = process.env.OPENCLAW_ROUTE_PATH || '/plugins/webhooks/sipandu';
  const secret = process.env.OPENCLAW_WEBHOOK_SECRET!;

  try {
    const response = await fetch(`${gatewayUrl}${routePath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-openclaw-secret': secret,
        'Authorization': `Bearer ${secret}`,
      },
      body: JSON.stringify({
        action: 'run_task',
        ...event,
      }),
    });

    if (!response.ok) {
      console.warn(`[OpenClaw] Gateway returned ${response.status}:`, await response.text());
      return false;
    }

    console.log(`[OpenClaw] Event "${event.type}" sent successfully`);
    return true;
  } catch (error) {
    console.warn('[OpenClaw] Failed to reach gateway:', error);
    return false;
  }
}

function resolveGatewayUrl(path: string): string {
  const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL || 'http://localhost:7331';
  return `${gatewayUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

function getOpenClawCliPath(): string {
  return process.env.OPENCLAW_CLI_PATH || 'openclaw';
}

function getOpenClawCliEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  delete env.OPENCLAW_GATEWAY_URL;
  return env;
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return !!input && typeof input === 'object' && !Array.isArray(input);
}

function runOpenClawCli(args: string[], timeoutMs = 15000): Promise<unknown> {
  return new Promise((resolve, reject) => {
    execFile(
      getOpenClawCliPath(),
      args,
      {
        env: getOpenClawCliEnv(),
        maxBuffer: 1024 * 1024,
        timeout: timeoutMs,
      },
      (error, stdout, stderr) => {
        if (error) {
          const message = stderr?.toString().trim() || error.message;
          reject(new Error(message));
          return;
        }

        const output = stdout?.toString().trim();
        if (!output) {
          resolve(null);
          return;
        }

        try {
          resolve(JSON.parse(output));
        } catch {
          resolve(output);
        }
      }
    );
  });
}

function getStringField(input: unknown, keys: string[]): string | null {
  if (!input || typeof input !== 'object') return null;
  const record = input as Record<string, unknown>;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value;
  }

  return null;
}

function getBooleanField(input: unknown, keys: string[]): boolean {
  if (!input || typeof input !== 'object') return false;
  const record = input as Record<string, unknown>;

  return keys.some((key) => record[key] === true);
}

function getObjectField(input: unknown, key: string): Record<string, unknown> | null {
  if (!isRecord(input)) return null;
  const value = input[key];
  return isRecord(value) ? value : null;
}

function getArrayField(input: unknown, key: string): unknown[] {
  if (!isRecord(input)) return [];
  const value = input[key];
  return Array.isArray(value) ? value : [];
}

function asDataUrl(value: string | null): string | null {
  if (!value) return null;
  if (value.startsWith('data:image/')) return value;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;

  return `data:image/png;base64,${value}`;
}

function extractConnectedWhatsAppStatus(payload: unknown, input: {
  number: string;
  sessionId: string;
}): OpenClawWhatsAppQr | null {
  const channels = getObjectField(payload, 'channels');
  const whatsapp = getObjectField(channels, 'whatsapp');
  const channelAccounts = getObjectField(payload, 'channelAccounts');
  const whatsappAccounts = getArrayField(channelAccounts, 'whatsapp').filter(isRecord);
  const account = whatsappAccounts.find((item) => item.accountId === input.sessionId) || whatsappAccounts[0];

  if (!whatsapp && !account) return null;

  const configured = getBooleanField(whatsapp, ['configured']) || getBooleanField(account, ['configured']);
  const connected = getBooleanField(whatsapp, ['connected']) || getBooleanField(account, ['connected']);
  const linked = getBooleanField(whatsapp, ['linked']) || getBooleanField(account, ['linked']);
  const self = getObjectField(whatsapp, 'self');
  const selfNumber = getStringField(self, ['e164', 'jid']);
  const number = selfNumber ? normalizeIndonesianWhatsAppNumber(selfNumber) : input.number;

  if (!configured) return null;

  if (connected || linked) {
    return {
      ok: true,
      configured: true,
      connected: true,
      status: 'connected',
      number,
      sessionId: input.sessionId,
      qrDataUrl: null,
      message: `WhatsApp sudah terhubung${number ? ` ke +${number}` : ''}.`,
      gatewayUrl: process.env.OPENCLAW_GATEWAY_URL,
      source: 'cli',
      raw: payload,
    };
  }

  return {
    ok: true,
    configured: true,
    connected: false,
    status: 'waiting_qr',
    number,
    sessionId: input.sessionId,
    qrDataUrl: null,
    message: 'WhatsApp belum terhubung. QR bisa dibuat dari OpenClaw.',
    gatewayUrl: process.env.OPENCLAW_GATEWAY_URL,
    source: 'cli',
    raw: payload,
  };
}

async function getWhatsAppStatusFromCli(input: {
  number: string;
  sessionId: string;
}): Promise<OpenClawWhatsAppQr | null> {
  const payload = await runOpenClawCli(['channels', 'status', '--json', '--deep', '--probe'], 20000);
  return extractConnectedWhatsAppStatus(payload, input);
}

async function startWhatsAppQrFromCli(input: {
  number: string;
  sessionId: string;
}): Promise<OpenClawWhatsAppQr> {
  const raw = await runOpenClawCli(
    [
      'gateway',
      'call',
      'web.login.start',
      '--json',
      '--params',
      JSON.stringify({
        accountId: input.sessionId,
        timeoutMs: 30000,
      }),
    ],
    45000
  );
  const qrDataUrl = asDataUrl(getStringField(raw, ['qrDataUrl', 'qrCode', 'qr', 'image', 'dataUrl', 'base64']));
  const connected = getBooleanField(raw, ['connected']);
  const message = getStringField(raw, ['message']) || 'Menunggu scan QR WhatsApp.';
  const alreadyLinked = /already linked|sudah terhubung|linked/i.test(message);

  return {
    ok: true,
    configured: true,
    connected: connected || alreadyLinked,
    status: connected || alreadyLinked ? 'connected' : 'waiting_qr',
    number: input.number,
    sessionId: input.sessionId,
    qrDataUrl,
    message: connected || alreadyLinked ? 'WhatsApp sudah terhubung.' : message,
    gatewayUrl: process.env.OPENCLAW_GATEWAY_URL,
    source: 'cli',
    raw,
  };
}

export async function getOpenClawWhatsAppQr(input: {
  number: string;
  sessionId: string;
}): Promise<OpenClawWhatsAppQr> {
  const secret = process.env.OPENCLAW_WEBHOOK_SECRET;
  const qrPath = process.env.OPENCLAW_WA_QR_PATH || '/plugins/whatsapp/qr';

  if (!isOpenClawConfigured()) {
    return {
      ok: false,
      configured: false,
      connected: false,
      status: 'not_configured',
      number: input.number,
      sessionId: input.sessionId,
      qrDataUrl: null,
      message: 'OpenClaw gateway belum dikonfigurasi.',
      gatewayUrl: process.env.OPENCLAW_GATEWAY_URL,
      qrPath,
    };
  }

  try {
    const status = await getWhatsAppStatusFromCli(input);
    if (status?.connected) return status;

    return await startWhatsAppQrFromCli(input);
  } catch (error) {
    console.warn('[OpenClaw] CLI QR/status check failed, falling back to HTTP:', error);
  }

  const url = new URL(resolveGatewayUrl(qrPath));
  url.searchParams.set('number', input.number);
  url.searchParams.set('sessionId', input.sessionId);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json,image/png,image/jpeg',
        'x-openclaw-secret': secret!,
        Authorization: `Bearer ${secret}`,
      },
      cache: 'no-store',
    });

    const contentType = response.headers.get('content-type') || '';

    if (!response.ok) {
      return {
        ok: false,
        configured: true,
        connected: false,
        status: 'gateway_error',
        number: input.number,
        sessionId: input.sessionId,
        qrDataUrl: null,
        message: `OpenClaw gateway mengembalikan status ${response.status}.`,
        gatewayUrl: process.env.OPENCLAW_GATEWAY_URL,
        qrPath,
        raw: await response.text().catch(() => null),
      };
    }

    if (contentType.startsWith('image/')) {
      const buffer = Buffer.from(await response.arrayBuffer());
      return {
        ok: true,
        configured: true,
        connected: false,
        status: 'waiting_qr',
        number: input.number,
        sessionId: input.sessionId,
        qrDataUrl: `data:${contentType};base64,${buffer.toString('base64')}`,
        message: 'QR tersedia dari OpenClaw.',
        gatewayUrl: process.env.OPENCLAW_GATEWAY_URL,
        qrPath,
        source: 'http',
      };
    }

    const payload = await response.json();
    const connected = getBooleanField(payload, ['connected', 'isConnected', 'ready']);
    const qrValue = getStringField(payload, ['qrDataUrl', 'qrCode', 'qr', 'image', 'dataUrl', 'base64']);

    return {
      ok: true,
      configured: true,
      connected,
      status: connected ? 'connected' : 'waiting_qr',
      number: input.number,
      sessionId: input.sessionId,
      qrDataUrl: asDataUrl(qrValue),
      message: connected ? 'WhatsApp sudah terhubung.' : 'Menunggu scan QR WhatsApp.',
      gatewayUrl: process.env.OPENCLAW_GATEWAY_URL,
      qrPath,
      source: 'http',
      raw: payload,
    };
  } catch (error) {
    return {
      ok: false,
      configured: true,
      connected: false,
      status: 'gateway_error',
      number: input.number,
      sessionId: input.sessionId,
      qrDataUrl: null,
      message: error instanceof Error ? error.message : 'Gagal menghubungi OpenClaw gateway.',
      gatewayUrl: process.env.OPENCLAW_GATEWAY_URL,
      qrPath,
    };
  }
}

export async function sendOpenClawWhatsAppMessage(input: {
  to: string;
  message: string;
}): Promise<OpenClawSendResult> {
  const normalizedTarget = `+${normalizeIndonesianWhatsAppNumber(input.to)}`;
  const accountId = process.env.OPENCLAW_WA_SESSION_ID || 'default';

  try {
    const raw = await runOpenClawCli(
      [
        'message',
        'send',
        '--json',
        '--channel',
        'whatsapp',
        '--account',
        accountId,
        '--target',
        normalizedTarget,
        '--message',
        input.message,
      ],
      30000
    );

    return {
      ok: true,
      provider: 'openclaw',
      to: normalizedTarget,
      message: input.message,
      delivered: true,
      raw,
    };
  } catch (error) {
    return {
      ok: false,
      provider: 'openclaw',
      to: normalizedTarget,
      message: input.message,
      delivered: false,
      error: error instanceof Error ? error.message : 'Gagal mengirim pesan lewat OpenClaw.',
    };
  }
}
