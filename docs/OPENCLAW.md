# OpenClaw integration

Endpoint siPandu untuk webhook OpenClaw:

```text
POST /api/openclaw
```

## Security

Webhook dilindungi dengan environment variable:

```env
OPENCLAW_WEBHOOK_SECRET=your_secret_here
```

Secret dapat dikirim dari OpenClaw dengan salah satu cara berikut:

1. Header `x-openclaw-secret`.
2. Header `Authorization: Bearer your_secret_here`.
3. Field JSON `secret` pada body request.

Rekomendasi utama: pakai header `x-openclaw-secret`.

## Payload minimal

```json
{
  "message": "pesan 2 Ayam Geprek dan 1 Es Teh atas nama Budi",
  "name": "Budi",
  "phone": "628xxxxxxxxxx",
  "umkmId": "demo-geprek-maju"
}
```

## Response

```json
{
  "ok": true,
  "reply": "Balasan bot",
  "to": "628xxxxxxxxxx",
  "order": null,
  "orderId": null
}
```
