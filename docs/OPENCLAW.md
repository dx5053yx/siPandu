# OpenClaw Integration

Endpoint siPandu untuk event OpenClaw:

```text
POST /api/openclaw/webhook
```

Endpoint ini dipakai untuk agent automation seperti follow-up chat yang butuh admin dan laporan harian. Chat masuk pelanggan tetap masuk lewat:

```text
POST /api/chat/inbound
POST /api/mock/inbound
```

Halaman dashboard untuk koneksi WhatsApp:

```text
GET /dashboard/whatsapp
```

Endpoint internal untuk mengambil QR dari gateway OpenClaw:

```text
GET /api/openclaw/wa/qr
```

## Security

Webhook dilindungi dengan environment variable:

```env
OPENCLAW_WEBHOOK_SECRET=your_secret_here
CHAT_WEBHOOK_SECRET=your_chat_webhook_secret
OPENCLAW_GATEWAY_URL=http://localhost:18789
WHATSAPP_PROVIDER=openclaw
WHATSAPP_PHONE_NUMBER=628997595299
OPENCLAW_WA_SESSION_ID=default
OPENCLAW_WA_QR_PATH=/plugins/whatsapp/qr
OPENCLAW_CLI_PATH=/home/akiru/.local/share/npm-global/bin/openclaw
```

Secret dapat dikirim dengan salah satu header berikut:

```text
x-openclaw-secret: your_secret_here
Authorization: Bearer your_secret_here
```

Rekomendasi utama: pakai `x-openclaw-secret`.

## Event `needs_human_followup`

```json
{
  "type": "needs_human_followup",
  "merchantId": "demo_warung_mendoan",
  "chatId": "chat_123",
  "customerPhone": "628xxxxxxxxxx",
  "summary": "Pelanggan komplain pesanan belum sampai.",
  "priority": "high"
}
```

## Webhook Chat Masuk dari WhatsApp

Nomor bot WhatsApp demo adalah **08997595299** (`628997595299`). Untuk OpenClaw lokal, siPandu memakai plugin `sipandu-forwarder`:

```text
/home/akiru/.openclaw/extensions/sipandu-forwarder
```

Plugin ini berjalan di hook `before_dispatch`, meneruskan pesan masuk ke:

```text
POST ${NEXT_PUBLIC_APP_URL}/api/chat/inbound
```

Header:

```text
Content-Type: application/json
x-sipandu-signature: ${CHAT_WEBHOOK_SECRET}
x-sipandu-respond-only: true
```

Payload:

```json
{
  "merchantId": "demo_warung_mendoan",
  "channel": "whatsapp",
  "customerPhone": "{{from}}",
  "customerName": "{{name}}",
  "message": "{{message}}",
  "rawPayload": {}
}
```

Karena memakai `x-sipandu-respond-only: true`, endpoint siPandu hanya mengembalikan teks balasan. Pengiriman WhatsApp dilakukan oleh OpenClaw agar tidak terjadi balasan dobel.

Konfigurasi OpenClaw yang dibutuhkan:

```json
{
  "channels": {
    "whatsapp": {
      "dmPolicy": "open",
      "allowFrom": ["*"]
    }
  },
  "plugins": {
    "entries": {
      "sipandu-forwarder": {
        "enabled": true,
        "config": {
          "endpointUrl": "http://localhost:3000/api/chat/inbound",
          "webhookSecret": "isi_CHAT_WEBHOOK_SECRET",
          "merchantId": "demo_warung_mendoan",
          "allowGroups": false,
          "timeoutMs": 15000
        }
      }
    }
  }
}
```

## Event `daily_report`

```json
{
  "type": "daily_report",
  "merchantId": "demo_warung_mendoan",
  "date": "20260521"
}
```

## Response

```json
{
  "ok": true,
  "type": "needs_human_followup",
  "merchantId": "demo_warung_mendoan",
  "received": true
}
```

## Outbound ke Gateway OpenClaw

Jika `OPENCLAW_GATEWAY_URL`, `OPENCLAW_ROUTE_PATH`, dan `OPENCLAW_WEBHOOK_SECRET` tersedia, siPandu akan mengirim event otomatis ke gateway OpenClaw saat chat ditandai `needsHuman`.
