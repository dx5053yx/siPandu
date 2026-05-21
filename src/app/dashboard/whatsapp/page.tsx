'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Link2,
  QrCode,
  RefreshCw,
  Shield,
  Smartphone,
} from 'lucide-react';

type WaQrResponse = {
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
  inboundWebhookUrl: string;
  automationWebhookUrl: string;
  requiredInboundHeader: string;
  requiredOpenClawHeader: string;
  merchantId: string;
};

const defaultState: WaQrResponse = {
  ok: false,
  configured: false,
  connected: false,
  status: 'not_configured',
  number: '628997595299',
  sessionId: 'sipandu-628997595299',
  qrDataUrl: null,
  message: 'Memuat koneksi WhatsApp.',
  inboundWebhookUrl: 'http://localhost:3000/api/chat/inbound',
  automationWebhookUrl: 'http://localhost:3000/api/openclaw/webhook',
  requiredInboundHeader: 'x-sipandu-signature',
  requiredOpenClawHeader: 'x-openclaw-secret',
  merchantId: 'demo_warung_mendoan',
};

function formatPhone(number: string) {
  if (!number.startsWith('62')) return number;
  return `0${number.slice(2)}`.replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3');
}

export default function WhatsAppConnectionPage() {
  const [data, setData] = useState<WaQrResponse>(defaultState);
  const [loading, setLoading] = useState(true);

  async function refreshQr() {
    setLoading(true);
    try {
      const response = await fetch('/api/openclaw/wa/qr', { cache: 'no-store' });
      const payload = (await response.json()) as WaQrResponse;
      setData(payload);
    } catch (error) {
      setData((current) => ({
        ...current,
        ok: false,
        configured: false,
        connected: false,
        status: 'gateway_error',
        message: error instanceof Error ? error.message : 'Gagal memuat status WhatsApp.',
      }));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshQr();
  }, []);

  const status = useMemo(() => {
    if (loading) {
      return {
        label: 'Memuat',
        className: 'badge-neutral',
        icon: RefreshCw,
      };
    }

    if (data.connected) {
      return {
        label: 'Terhubung',
        className: 'badge-success',
        icon: CheckCircle2,
      };
    }

    if (!data.configured) {
      return {
        label: 'Belum dikonfigurasi',
        className: 'badge-warning',
        icon: AlertTriangle,
      };
    }

    if (data.status === 'gateway_error') {
      return {
        label: 'Gateway error',
        className: 'badge-danger',
        icon: AlertTriangle,
      };
    }

    return {
      label: 'Menunggu QR',
      className: 'badge-info',
      icon: QrCode,
    };
  }, [data.configured, data.connected, data.status, loading]);

  const StatusIcon = status.icon;

  return (
    <>
      <div className="dash-page-header">
        <h1>Hubungkan WhatsApp</h1>
        <p>Nomor aktif: {formatPhone(data.number)} untuk channel chat siPandu.</p>
      </div>

      <div className="wa-connect-grid">
        <div className="card">
          <div className="card-body wa-qr-panel">
            <div className="wa-panel-header">
              <div>
                <span className={`badge ${status.className}`}>
                  <StatusIcon size={14} />
                  {status.label}
                </span>
                <h2>Scan QR WhatsApp</h2>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={refreshQr} disabled={loading}>
                <RefreshCw size={16} className={loading ? 'spin' : ''} />
                Refresh
              </button>
            </div>

            <div className="wa-qr-box">
              {data.qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.qrDataUrl} alt="QR WhatsApp siPandu" />
              ) : (
                <div className="wa-qr-placeholder">
                  <QrCode size={96} />
                  <strong>{data.connected ? 'WhatsApp aktif' : 'QR belum tersedia'}</strong>
                  <span>{data.message}</span>
                </div>
              )}
            </div>

            <div className="wa-number-card">
              <Smartphone size={20} />
              <div>
                <strong>{formatPhone(data.number)}</strong>
                <span>Session: {data.sessionId}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          <div className="card">
            <div className="card-body">
              <div className="wa-config-title">
                <Link2 size={20} />
                Webhook Chat Masuk
              </div>
              <div className="config-list">
                <div>
                  <span>URL</span>
                  <code>{data.inboundWebhookUrl}</code>
                </div>
                <div>
                  <span>Header</span>
                  <code>{data.requiredInboundHeader}: CHAT_WEBHOOK_SECRET</code>
                </div>
                <div>
                  <span>Merchant</span>
                  <code>{data.merchantId}</code>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="wa-config-title">
                <Shield size={20} />
                OpenClaw Gateway
              </div>
              <div className="config-list">
                <div>
                  <span>Gateway</span>
                  <code>{data.gatewayUrl || 'OPENCLAW_GATEWAY_URL belum diset'}</code>
                </div>
                <div>
                  <span>QR Path</span>
                  <code>{data.qrPath || '/plugins/whatsapp/qr'}</code>
                </div>
                <div>
                  <span>Automation</span>
                  <code>{data.automationWebhookUrl}</code>
                </div>
                <div>
                  <span>Header</span>
                  <code>{data.requiredOpenClawHeader}: OPENCLAW_WEBHOOK_SECRET</code>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="wa-config-title">
                <QrCode size={20} />
                Payload OpenClaw
              </div>
              <pre className="code-block">{`{
  "merchantId": "${data.merchantId}",
  "channel": "whatsapp",
  "customerPhone": "{{from}}",
  "customerName": "{{name}}",
  "message": "{{message}}",
  "rawPayload": {}
}`}</pre>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
