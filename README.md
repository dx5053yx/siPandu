# siPandu

Platform chatbot AI untuk UMKM lokal di Purbalingga. Dibangun dengan Next.js, Firebase, Gemini API, dan OpenClaw.

## Fokus Demo

siPandu membuktikan alur inti:

1. UMKM mendaftarkan profil dan produk.
2. Pelanggan chat lewat WhatsApp atau simulator.
3. Bot menjawab berdasarkan data produk UMKM.
4. Bot mendeteksi pesanan dan mencatat otomatis.
5. Dashboard menampilkan produk, pesanan, chat, dan insight.

## Tech Stack

| Area | Teknologi |
|---|---|
| Frontend & Backend | Next.js App Router + TypeScript |
| Styling | Tailwind CSS |
| AI | Gemini API via `@google/genai` |
| Database | Firebase Cloud Firestore |
| Auth | Firebase Authentication |
| Automation | OpenClaw Webhooks |
| Validation | Zod |

## Setup

### 1. Install dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Konfigurasi environment

Salin `.env.example` ke `.env.local` dan isi dengan API key yang benar:

```bash
cp .env.example .env.local
```

Variable yang wajib diisi:

- `NEXT_PUBLIC_FIREBASE_API_KEY` — dari Firebase Console
- `NEXT_PUBLIC_FIREBASE_APP_ID` — dari Firebase Console
- `FIREBASE_PRIVATE_KEY` — dari service account JSON
- `GEMINI_API_KEY` — dari Google AI Studio

### 3. Jalankan dev server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

### 4. Test mock chat

```bash
curl -X POST http://localhost:3000/api/mock/inbound \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": "demo_warung_mendoan",
    "customerPhone": "628123456789",
    "message": "Halo, mendoan ready?"
  }'
```

## Struktur Folder

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── login/page.tsx              # Login Firebase Auth
│   ├── simulator/page.tsx          # Chat simulator interaktif
│   ├── dashboard/
│   │   ├── layout.tsx              # Dashboard layout + sidebar
│   │   ├── page.tsx                # Overview
│   │   ├── merchants/page.tsx      # Kelola UMKM
│   │   ├── products/page.tsx       # Kelola produk
│   │   ├── orders/page.tsx         # Pesanan
│   │   ├── chats/page.tsx          # Riwayat chat
│   │   └── analytics/page.tsx      # Analisis
│   └── api/
│       ├── health/route.ts         # Health check
│       ├── chat/inbound/route.ts   # Webhook chat masuk
│       ├── chat/reply/route.ts     # Kirim balasan
│       ├── gemini/respond/route.ts # Generate AI response
│       ├── mock/inbound/route.ts   # Simulasi chat
│       └── openclaw/webhook/route.ts # OpenClaw bridge
├── lib/
│   ├── firebase/                   # Firebase client & admin
│   ├── gemini/                     # Gemini API client
│   ├── chat/                       # Chat processor & prompts
│   ├── openclaw/                   # OpenClaw client
│   ├── validators.ts               # Zod schemas
│   └── utils.ts                    # Utility functions
├── types/                          # TypeScript type definitions
└── middleware.ts                   # Auth middleware
```

## API Endpoints

| Method | Path | Fungsi |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/chat/inbound` | Webhook chat masuk (protected) |
| POST | `/api/chat/reply` | Kirim balasan ke provider |
| POST | `/api/gemini/respond` | Generate AI response |
| POST | `/api/mock/inbound` | Simulasi chat tanpa WhatsApp |
| POST | `/api/openclaw/webhook` | OpenClaw automation bridge |

## Demo Data

Merchant demo: **Warung Mendoan Bu Sari** (`demo_warung_mendoan`)

| Produk | Harga | Stok |
|---|---|---|
| Mendoan | Rp2.000 | Ready |
| Es Teh | Rp4.000 | Ready |
| Bakwan | Rp1.500 | Limited |

## Fitur Bot

Bot siPandu bisa:

- Menjawab pertanyaan produk, harga, dan stok
- Mendeteksi intent (tanya_produk, pesan, komplain, lokasi, jam_buka)
- Mengekstrak pesanan dari chat
- Menandai chat yang butuh admin (`needsHuman`)
- Fallback ke rule-based jika Gemini tidak tersedia

## Catatan Keamanan

- Jangan commit `.env.local` atau API key ke repository
- Gemini API key hanya dipanggil server-side
- Webhook dilindungi secret verification
- Data antar UMKM diisolasi per `merchantId`
