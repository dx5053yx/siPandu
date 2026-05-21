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
