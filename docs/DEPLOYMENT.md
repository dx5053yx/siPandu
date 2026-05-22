# Deployment

Target paling sederhana untuk siPandu saat ini adalah Vercel untuk aplikasi Next.js, Firebase untuk Auth/Firestore, dan OpenClaw tetap berjalan di mesin yang memegang sesi WhatsApp.

## Data UMKM Awal

Untuk sementara siPandu diset ke satu UMKM demo:

```text
Merchant ID: demo_warung_mendoan
Nama: Warung Mendoan Bu Sari
WhatsApp UMKM: 628997595299
```

Seed data:

```bash
npm run seed
```

Seed hanya membuat merchant `demo_warung_mendoan`, produk demo, dan dokumen analytics harian awal.

## Cek Sebelum Deploy

```bash
npm install --legacy-peer-deps
npm test
npm run build
```

Build harus sukses sebelum deploy.

## Deploy ke Vercel

1. Push project ke GitHub.
2. Buat project baru di Vercel dan pilih repository siPandu.
3. Isi environment variable dari `.env.production.example`.
4. Set `NEXT_PUBLIC_APP_URL` ke domain Vercel final.
5. Deploy.

Untuk mode OpenClaw lokal, jangan set `OPENCLAW_GATEWAY_URL=http://localhost:18789` di Vercel. `localhost` di Vercel menunjuk ke server Vercel, bukan laptop yang menjalankan OpenClaw.

## Hubungkan OpenClaw Setelah Deploy

Di mesin OpenClaw lokal, arahkan plugin `sipandu-forwarder` ke domain deploy:

```json
{
  "plugins": {
    "entries": {
      "sipandu-forwarder": {
        "enabled": true,
        "config": {
          "endpointUrl": "https://your-sipandu-domain.vercel.app/api/chat/inbound",
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

Lalu restart gateway:

```bash
openclaw gateway restart
```

Alur deploy yang dipakai:

```text
WhatsApp -> OpenClaw lokal -> siPandu deployed /api/chat/inbound -> teks balasan -> OpenClaw lokal -> WhatsApp
```

## Verifikasi

```bash
curl https://your-sipandu-domain.vercel.app/api/health
```

Untuk tes chat tanpa mengirim WhatsApp:

```bash
curl -X POST https://your-sipandu-domain.vercel.app/api/mock/inbound \
  -H "Content-Type: application/json" \
  -d '{"message":"menu"}'
```
