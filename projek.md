# PROJECT PLAN — siPandu

**Target serah-terima:** Dokumen ini disiapkan untuk agen developer lain agar dapat langsung membangun MVP siPandu menggunakan **Next.js**, **Gemini API**, **OpenClaw**, dan **Supabase**.

**Nama proyek:** siPandu  
**Jenis:** Platform chatbot AI untuk UMKM lokal  
**Lokasi target awal:** Purbalingga  
**Target pengguna:** UMKM kuliner, fashion, dan jasa  
**Model bisnis:** B2B dengan opsi mitra premium  
**Channel utama MVP:** WhatsApp/chat webhook  
**Output utama MVP:** Website + dashboard UMKM + webhook chatbot + pencatatan pesanan + analisis sederhana.

---

## 1. Ringkasan Produk

siPandu adalah platform chatbot AI untuk membantu UMKM Purbalingga menjawab chat pelanggan secara otomatis, mencatat pesanan, dan memberikan insight penjualan sederhana. MVP harus memprioritaskan kemudahan onboarding UMKM, integrasi chat masuk, balasan AI yang sesuai data toko, serta rekap pesanan yang mudah dibaca pemilik UMKM.

### Masalah yang diselesaikan

1. UMKM lambat merespons pertanyaan pelanggan.
2. Pencatatan pesanan masih manual dan rawan hilang.
3. Data chat/pesanan belum dipakai untuk insight sederhana.
4. Pemilik UMKM butuh sistem yang mudah, murah, dan familiar.

### Solusi MVP

1. Chatbot otomatis berbasis AI untuk menjawab pertanyaan produk, harga, stok, dan jam operasional.
2. Ekstraksi pesanan dari chat pelanggan.
3. Dashboard UMKM untuk mengelola profil toko, katalog produk, pesanan, dan riwayat chat.
4. Supabase sebagai database, auth, storage, dan deployment/backend supporting service.
5. OpenClaw sebagai jalur agent automation/taskflow melalui webhook aman.
6. Gemini API sebagai model AI untuk respons natural dan ekstraksi data.

---

## 2. Scope MVP

### Wajib ada

- Landing page publik siPandu.
- Login admin/UMKM.
- Dashboard UMKM.
- CRUD data UMKM.
- CRUD produk/katalog.
- Webhook endpoint untuk menerima pesan masuk.
- Integrasi Gemini API untuk:
  - auto-reply pelanggan,
  - ekstraksi pesanan,
  - klasifikasi intent pesan,
  - ringkasan percakapan.
- Penyimpanan chat dan pesanan ke Supabase.
- Endpoint outbound response untuk mengirim balasan ke channel/gateway.
- Integrasi OpenClaw webhook untuk menjalankan taskflow/agent automation.
- Halaman analisis sederhana:
  - total chat,
  - total pesanan,
  - produk paling sering ditanyakan,
  - produk paling sering dipesan,
  - status pesanan.

### Tidak wajib di MVP pertama

- Payment gateway.
- Multi-cabang kompleks.
- Mobile app native.
- Inventory advanced.
- Integrasi WhatsApp Business Cloud API resmi secara penuh jika belum tersedia tokennya.
- Recommendation engine kompleks.

### Catatan penting

OpenClaw tidak diposisikan sebagai pengganti WhatsApp provider. OpenClaw digunakan sebagai agent/taskflow orchestration dan webhook automation. Untuk produksi WhatsApp tetap butuh salah satu adapter/channel:

- WhatsApp Business Cloud API,
- gateway WhatsApp pihak ketiga,
- OpenClaw channel yang tersedia,
- atau mock webhook dulu untuk MVP lokal.

---

## 3. Tech Stack

| Area | Teknologi | Fungsi |
|---|---|---|
| Frontend & Backend | Next.js App Router + TypeScript | Website, dashboard, API route handlers |
| Styling | Tailwind CSS + shadcn/ui | UI cepat, rapi, dan konsisten |
| AI | Gemini API via `@google/genai` | Auto-reply, intent detection, ekstraksi order |
| Database | Supabase Postgres | Data UMKM, produk, chat, order, analytics |
| Auth | Supabase Auth | Login admin/UMKM |
| Storage | Supabase Storage | Logo toko, foto produk |
| Server Client | `@supabase/supabase-js` | Server-side access Supabase/Auth |
| Automation | OpenClaw Webhooks Plugin | Agent workflow, follow-up task, monitoring |
| Validation | Zod | Validasi input API |
| Testing | Vitest | Unit test service logic |
| Deployment | Vercel | Deploy Next.js |

---

## 4. Asumsi dan Keputusan Arsitektur

1. **Next.js digunakan full-stack**: UI dan API webhook berada dalam satu repo.
2. **API key Gemini tidak boleh dipanggil dari client**. Semua request AI harus lewat server route Next.js.
3. **Supabase publishable key boleh berada di client**, tetapi tetap gunakan `.env.local` agar mudah dikelola.
4. **Supabase service role key hanya boleh dipakai di server** untuk operasi sensitif.
5. **Webhook harus diverifikasi** menggunakan secret/token.
6. **Data tiap UMKM harus dipisahkan berdasarkan `merchantId`** agar aman untuk multi-tenant.
7. **Pesan WhatsApp/gateway yang belum tersedia tokennya harus dimock dulu** memakai endpoint `/api/mock/inbound`.
8. **OpenClaw webhook secret disimpan di environment variable** `OPENCLAW_WEBHOOK_SECRET`.

---

## 5. Environment Variables

Buat file `.env.local`:

```env
# App
NEXT_PUBLIC_APP_NAME=siPandu
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Gemini
GEMINI_API_KEY=isi_dari_google_ai_studio
GEMINI_MODEL=gemini-2.0-flash

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
SUPABASE_SERVICE_ROLE_KEY=optional_untuk_server_writes_produksi

# Chat / WhatsApp Gateway
CHAT_WEBHOOK_SECRET=buat_secret_random_min_32_char
WHATSAPP_PROVIDER=openclaw
WHATSAPP_PHONE_NUMBER=628997595299
WHATSAPP_ACCESS_TOKEN=optional_untuk_produksi
WHATSAPP_PHONE_NUMBER_ID=optional_untuk_produksi

# OpenClaw
OPENCLAW_GATEWAY_URL=http://localhost:18789
OPENCLAW_WEBHOOK_SECRET=buat_secret_random_min_32_char
OPENCLAW_ROUTE_PATH=/plugins/webhooks/sipandu
OPENCLAW_SESSION_KEY=agent:sipandu:main
OPENCLAW_WA_SESSION_ID=default
OPENCLAW_CLI_PATH=/home/akiru/.local/share/npm-global/bin/openclaw
```

---

## 6. Struktur Folder yang Disarankan

```txt
sipandu/
├─ public/
│  ├─ logo.png
│  └─ placeholder-product.png
├─ src/
│  ├─ app/
│  │  ├─ page.tsx
│  │  ├─ login/page.tsx
│  │  ├─ dashboard/page.tsx
│  │  ├─ dashboard/merchants/page.tsx
│  │  ├─ dashboard/products/page.tsx
│  │  ├─ dashboard/orders/page.tsx
│  │  ├─ dashboard/chats/page.tsx
│  │  ├─ dashboard/analytics/page.tsx
│  │  └─ api/
│  │     ├─ health/route.ts
│  │     ├─ chat/inbound/route.ts
│  │     ├─ chat/reply/route.ts
│  │     ├─ gemini/respond/route.ts
│  │     ├─ openclaw/webhook/route.ts
│  │     └─ mock/inbound/route.ts
│  ├─ components/
│  │  ├─ ui/
│  │  ├─ landing/
│  │  ├─ dashboard/
│  │  └─ forms/
│  ├─ lib/
│  │  ├─ supabase/client.ts
│  │  ├─ supabase/server.ts
│  │  ├─ supabase/seed.ts
│  │  ├─ gemini/client.ts
│  │  ├─ openclaw/client.ts
│  │  ├─ chat/processor.ts
│  │  ├─ chat/prompts.ts
│  │  ├─ validators.ts
│  │  └─ utils.ts
│  ├─ types/
│  │  ├─ merchant.ts
│  │  ├─ product.ts
│  │  ├─ chat.ts
│  │  └─ order.ts
│  └─ middleware.ts
├─ tests/
│  ├─ chat-processor.test.ts
│  └─ order-extraction.test.ts
├─ .env.example
├─ package.json
├─ README.md
└─ projek.md
```

---

## 7. Data Model Supabase

Gunakan tabel Supabase Postgres berikut. SQL final ada di `supabase/schema.sql`.

### `users/{userId}`

```ts
type User = {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "merchant_owner" | "staff";
  merchantId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

### `merchants/{merchantId}`

```ts
type Merchant = {
  id: string;
  name: string;
  slug: string;
  category: "kuliner" | "fashion" | "jasa" | "lainnya";
  description: string;
  ownerName: string;
  phone: string;
  whatsappNumber: string;
  address: string;
  city: "Purbalingga" | string;
  openingHours: string;
  isPremium: boolean;
  status: "draft" | "active" | "suspended";
  aiTone: "ramah" | "formal" | "santai";
  fallbackMessage: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

### `merchants/{merchantId}/products/{productId}`

```ts
type Product = {
  id: string;
  merchantId: string;
  name: string;
  description: string;
  price: number;
  stockStatus: "ready" | "limited" | "empty";
  category: string;
  imageUrl?: string;
  keywords: string[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

### `merchants/{merchantId}/chats/{chatId}`

```ts
type Chat = {
  id: string;
  merchantId: string;
  customerPhone: string;
  customerName?: string;
  channel: "whatsapp" | "mock" | "openclaw";
  lastMessage: string;
  lastIntent?: "tanya_produk" | "pesan" | "komplain" | "lokasi" | "jam_buka" | "lainnya";
  status: "open" | "handled" | "needs_human";
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

### `merchants/{merchantId}/chats/{chatId}/messages/{messageId}`

```ts
type Message = {
  id: string;
  merchantId: string;
  chatId: string;
  direction: "inbound" | "outbound";
  sender: "customer" | "bot" | "human";
  text: string;
  rawPayload?: Record<string, unknown>;
  intent?: string;
  aiResponseId?: string;
  createdAt: Timestamp;
};
```

### `merchants/{merchantId}/orders/{orderId}`

```ts
type Order = {
  id: string;
  merchantId: string;
  chatId: string;
  customerPhone: string;
  customerName?: string;
  items: Array<{
    productId?: string;
    name: string;
    qty: number;
    price?: number;
    note?: string;
  }>;
  totalEstimated?: number;
  deliveryMethod?: "pickup" | "delivery" | "unknown";
  address?: string;
  note?: string;
  status: "draft" | "confirmed" | "processing" | "done" | "cancelled";
  sourceMessageId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

### `analyticsDaily/{merchantId_yyyyMMdd}`

```ts
type AnalyticsDaily = {
  id: string;
  merchantId: string;
  date: string;
  totalChats: number;
  totalOrders: number;
  topAskedProducts: Array<{ name: string; count: number }>;
  topOrderedProducts: Array<{ name: string; count: number }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

---

## 8. API Routes

### `GET /api/health`

Fungsi: cek server hidup.

Response:

```json
{ "ok": true, "service": "sipandu", "time": "ISO_DATE" }
```

---

### `POST /api/chat/inbound`

Fungsi: menerima chat masuk dari WhatsApp gateway/mock channel.

Header:

```txt
x-sipandu-signature: <secret/hash/token>
```

Request body standar internal:

```json
{
  "merchantId": "merchant_123",
  "channel": "whatsapp",
  "customerPhone": "628xxxxxxxxxx",
  "customerName": "Budi",
  "message": "Mendoannya masih ada? kalau pesan 3 berapa?",
  "rawPayload": {}
}
```

Flow:

1. Validasi secret.
2. Validasi body dengan Zod.
3. Ambil data merchant + produk aktif dari Supabase.
4. Simpan inbound message.
5. Panggil `processIncomingChat()`.
6. Dapatkan intent, reply text, dan order draft jika ada.
7. Simpan outbound message.
8. Kirim balasan ke `/api/chat/reply` atau provider adapter.
9. Trigger OpenClaw jika butuh human follow-up/agent workflow.

---

### `POST /api/gemini/respond`

Fungsi: internal endpoint untuk generate respons AI. Endpoint ini sebaiknya hanya dipakai server-side atau dilindungi admin token.

Request:

```json
{
  "merchantId": "merchant_123",
  "chatId": "chat_123",
  "message": "Mendoannya masih ada?",
  "mode": "reply"
}
```

Response:

```json
{
  "intent": "tanya_produk",
  "reply": "Halo Kak, mendoannya ready ya. Harga per pcs Rp2.000. Mau pesan berapa?",
  "orderDraft": null,
  "needsHuman": false
}
```

---

### `POST /api/openclaw/webhook`

Fungsi: bridge dari/ke OpenClaw untuk menjalankan agent automation.

Header:

```txt
authorization: Bearer ${OPENCLAW_WEBHOOK_SECRET}
```

Request:

```json
{
  "type": "needs_human_followup",
  "merchantId": "merchant_123",
  "chatId": "chat_123",
  "summary": "Pelanggan komplain pesanan belum sampai.",
  "priority": "high"
}
```

Tugas route:

1. Verifikasi bearer token.
2. Simpan event ke tabel Supabase `openclaw_events`.
3. Jika perlu, panggil OpenClaw Gateway route `/plugins/webhooks/sipandu`.
4. Return status.

---

### `POST /api/mock/inbound`

Fungsi: simulasi chat masuk tanpa WhatsApp asli.

Request:

```json
{
  "merchantId": "demo_warung_mendoan",
  "customerPhone": "628123456789",
  "message": "Halo, mendoan ready?"
}
```

Response:

```json
{
  "ok": true,
  "reply": "Halo Kak, mendoan ready ya. Mau pesan berapa?"
}
```

---

## 9. Prompt Gemini

### System prompt dasar

```txt
Kamu adalah siPandu, asisten virtual WhatsApp untuk UMKM lokal di Purbalingga.
Tugasmu membantu pelanggan mendapatkan informasi produk, harga, stok, jam buka, alamat, dan membuat draft pesanan.
Gunakan bahasa Indonesia yang ramah, singkat, natural, dan tidak bertele-tele.
Jangan mengarang data produk. Jika data tidak tersedia, jawab dengan sopan dan arahkan ke admin UMKM.
Jika pelanggan tampak ingin membeli, bantu rangkum pesanan dan minta konfirmasi.
Jika ada komplain serius, tandai needsHuman=true.
```

### Context prompt per merchant

```txt
Data UMKM:
Nama: {{merchant.name}}
Kategori: {{merchant.category}}
Deskripsi: {{merchant.description}}
Alamat: {{merchant.address}}
Jam buka: {{merchant.openingHours}}
Gaya bahasa: {{merchant.aiTone}}

Produk aktif:
{{products_as_bullets}}

Riwayat chat ringkas:
{{chat_summary}}
```

### Output JSON wajib

Minta Gemini mengembalikan JSON valid:

```json
{
  "intent": "tanya_produk | pesan | komplain | lokasi | jam_buka | lainnya",
  "reply": "balasan untuk pelanggan",
  "needsHuman": false,
  "orderDraft": {
    "items": [
      { "name": "string", "qty": 1, "note": "optional" }
    ],
    "deliveryMethod": "pickup | delivery | unknown",
    "address": "optional",
    "note": "optional"
  }
}
```

Validasi JSON hasil Gemini dengan Zod. Jika parsing gagal, fallback ke respons aman:

```txt
Maaf Kak, sistem sedang memproses pesan. Admin akan segera membantu ya.
```

---

## 10. OpenClaw Integration Plan

### Tujuan OpenClaw di siPandu

OpenClaw digunakan untuk menjalankan agent/taskflow yang tidak harus dijalankan langsung di request utama, misalnya:

1. Membuat ringkasan komplain untuk admin.
2. Menandai chat yang butuh follow-up manusia.
3. Membuat laporan harian.
4. Menjalankan task analisis kualitas respons chatbot.
5. Mengirim notifikasi ke tim internal.

### Konfigurasi OpenClaw yang diharapkan

Contoh konfigurasi route OpenClaw:

```js
{
  plugins: {
    entries: {
      webhooks: {
        enabled: true,
        config: {
          routes: {
            sipandu: {
              path: "/plugins/webhooks/sipandu",
              sessionKey: "agent:sipandu:main",
              secret: {
                source: "env",
                provider: "default",
                id: "OPENCLAW_WEBHOOK_SECRET"
              },
              controllerId: "webhooks/sipandu",
              description: "siPandu UMKM agent automation bridge"
            }
          }
        }
      }
    }
  }
}
```

### Event yang dikirim ke OpenClaw

#### `needs_human_followup`

```json
{
  "action": "run_task",
  "type": "needs_human_followup",
  "merchantId": "merchant_123",
  "chatId": "chat_123",
  "customerPhone": "628xxxx",
  "summary": "Pelanggan bertanya stok produk yang tidak tersedia di katalog.",
  "priority": "medium"
}
```

#### `daily_report`

```json
{
  "action": "run_task",
  "type": "daily_report",
  "merchantId": "merchant_123",
  "date": "2026-05-21"
}
```

---

## 11. Halaman UI

### Landing Page `/`

Konten:

- Hero: “Chatbot AI untuk UMKM Purbalingga”.
- CTA: “Daftarkan UMKM”.
- Fitur utama:
  - Auto-reply 24/7.
  - Pencatatan pesanan otomatis.
  - Analisis sederhana penjualan.
- Segmentasi: kuliner, fashion, jasa.
- Cara kerja:
  1. UMKM daftar.
  2. Produk dimasukkan.
  3. Chat pelanggan masuk.
  4. siPandu menjawab dan mencatat pesanan.
- Paket harga:
  - Gratis: profil + katalog dasar.
  - Premium Rp100.000/bulan: prioritas rekomendasi + analytics lanjutan + support.

### Login `/login`

- Login email/password Supabase Auth.
- Redirect berdasarkan role.

### Dashboard `/dashboard`

- Cards:
  - Total chat hari ini.
  - Total pesanan.
  - Chat butuh admin.
  - Produk paling sering ditanya.

### Merchant Management `/dashboard/merchants`

- Super admin dapat melihat semua merchant.
- Merchant owner hanya melihat merchant sendiri.

### Product Management `/dashboard/products`

- CRUD produk.
- Upload foto produk.
- Toggle aktif/nonaktif.

### Orders `/dashboard/orders`

- Tabel pesanan.
- Status update.
- Detail pesanan.

### Chats `/dashboard/chats`

- List percakapan.
- Detail messages.
- Tombol “ambil alih oleh admin”.

### Analytics `/dashboard/analytics`

- Chart total chat.
- Chart total order.
- Top product asked.
- Top product ordered.

---

## 12. Alur Sistem

### Alur chat masuk

```txt
Pelanggan kirim pesan
→ WhatsApp/gateway/mock webhook
→ POST /api/chat/inbound
→ validasi secret
→ ambil merchant dan produk dari Supabase
→ simpan inbound message
→ Gemini klasifikasi intent + generate reply + ekstrak order
→ simpan order jika ada
→ simpan outbound reply
→ kirim balasan ke provider/mock
→ jika needsHuman, trigger OpenClaw
```

### Alur onboarding UMKM

```txt
Admin login
→ tambah merchant
→ isi profil toko
→ input produk
→ aktifkan merchant
→ buat webhook mapping nomor WA/gateway ke merchantId
→ test via /api/mock/inbound
→ siap dipakai
```

### Alur laporan harian

```txt
Scheduler/manual admin
→ hitung data harian Supabase
→ simpan analyticsDaily
→ kirim event daily_report ke OpenClaw
→ OpenClaw membuat ringkasan laporan untuk admin
```

---

## 13. Supabase SQL & RLS Draft

Skema MVP ada di `supabase/schema.sql`. Untuk demo lokal, RLS dimatikan agar seed dan webhook bisa berjalan dengan publishable key.

Sebelum produksi publik:

1. Isi `SUPABASE_SERVICE_ROLE_KEY` hanya di server/Vercel.
2. Aktifkan RLS untuk tabel `merchants`, `products`, `chats`, `messages`, `orders`, `analytics_daily`, dan `openclaw_events`.
3. Buat policy berbasis `merchant_id` dan role user agar data antar UMKM tidak tercampur.

---

## 14. Setup Development

### 1. Buat project Next.js

```bash
npx create-next-app@latest sipandu \
  --ts \
  --tailwind \
  --eslint \
  --app \
  --src-dir

cd sipandu
```

### 2. Install dependency

```bash
npm install @supabase/supabase-js @google/genai zod uuid clsx tailwind-merge lucide-react
npm install -D vitest @types/node
```

### 3. Setup shadcn/ui

```bash
npx shadcn@latest init
npx shadcn@latest add button card input textarea table badge dialog dropdown-menu form label select tabs
```

### 4. Buat `.env.local`

Salin dari section environment variables.

### 5. Jalankan dev server

```bash
npm run dev
```

### 6. Test mock chat

```bash
curl -X POST http://localhost:3000/api/mock/inbound \
  -H "Content-Type: application/json" \
  -d '{
    "merchantId": "demo_warung_mendoan",
    "customerPhone": "628123456789",
    "message": "Halo, mendoan ready?"
  }'
```

---

## 15. Rencana Implementasi per Tahap

### Tahap 0 — Persiapan Repo

Estimasi: 0.5 hari

Checklist:

- [ ] Buat repo Next.js TypeScript.
- [ ] Setup Tailwind dan shadcn/ui.
- [ ] Setup `.env.example`.
- [ ] Tambahkan logo siPandu ke `public/logo.png`.
- [ ] Setup linting dan format dasar.

Deliverable:

- Project bisa jalan dengan `npm run dev`.

---

### Tahap 1 — Supabase Foundation

Estimasi: 1 hari

Checklist:

- [ ] Buat `src/lib/supabase/client.ts`.
- [ ] Buat `src/lib/supabase/server.ts`.
- [ ] Setup Supabase Auth login.
- [ ] Setup Supabase helper.
- [ ] Buat seed data demo merchant.
- [ ] Buat SQL schema dan RLS draft.

Deliverable:

- User bisa login.
- Data demo merchant dan produk bisa dibaca.

---

### Tahap 2 — Dashboard Core

Estimasi: 2 hari

Checklist:

- [ ] Layout dashboard.
- [ ] Page merchants.
- [ ] Page products.
- [ ] Page orders.
- [ ] Page chats.
- [ ] Page analytics sederhana.

Deliverable:

- Admin/merchant bisa mengelola profil toko dan produk.

---

### Tahap 3 — Gemini Chat Processor

Estimasi: 1.5 hari

Checklist:

- [ ] Buat `src/lib/gemini/client.ts`.
- [ ] Buat `src/lib/chat/prompts.ts`.
- [ ] Buat `src/lib/chat/processor.ts`.
- [ ] Validasi output JSON Gemini dengan Zod.
- [ ] Fallback response aman.
- [ ] Unit test order extraction.

Deliverable:

- Fungsi `processIncomingChat()` menghasilkan `reply`, `intent`, `orderDraft`, dan `needsHuman`.

---

### Tahap 4 — Webhook Chat

Estimasi: 1.5 hari

Checklist:

- [ ] Implement `/api/chat/inbound`.
- [ ] Implement `/api/mock/inbound`.
- [ ] Implement penyimpanan inbound/outbound message.
- [ ] Implement pembuatan draft order.
- [ ] Implement status `needs_human`.

Deliverable:

- Chat mock dapat diproses end-to-end dan masuk Supabase.

---

### Tahap 5 — OpenClaw Bridge

Estimasi: 1 hari

Checklist:

- [x] Buat `src/lib/openclaw/client.ts`.
- [x] Implement `/api/openclaw/webhook`.
- [x] Implement function `triggerOpenClawEvent()`.
- [x] Tambahkan status/QR WhatsApp OpenClaw di `/dashboard/whatsapp`.
- [x] Tambahkan plugin lokal `sipandu-forwarder` untuk bridge WhatsApp masuk.
- [x] Test status WhatsApp connected dan inbound respond-only.

Deliverable:

- Event tertentu dari chatbot bisa diteruskan ke OpenClaw.

---

### Tahap 6 — Analytics MVP

Estimasi: 1 hari

Checklist:

- [ ] Hitung total chat harian.
- [ ] Hitung total order harian.
- [ ] Hitung produk sering ditanya.
- [ ] Hitung produk sering dipesan.
- [ ] Tampilkan chart sederhana di dashboard.

Deliverable:

- Dashboard analytics membaca data dari Supabase.

---

### Tahap 7 — Hardening & Demo

Estimasi: 1 hari

Checklist:

- [ ] Validasi semua route pakai Zod.
- [ ] Tambahkan loading/error states.
- [ ] Tambahkan empty states.
- [ ] Tambahkan README setup.
- [ ] Tambahkan demo script.
- [ ] Test manual flow lengkap.

Deliverable:

- MVP siap demo ke tim/UMKM.

---

## 16. Acceptance Criteria

MVP dianggap selesai jika:

1. Developer baru bisa menjalankan project dari README tanpa bertanya konfigurasi dasar.
2. Landing page tampil dengan branding siPandu.
3. Login Supabase berfungsi.
4. Merchant dan produk bisa dibuat/diedit/dihapus.
5. Endpoint mock inbound bisa menerima pesan pelanggan.
6. Gemini menghasilkan respons sesuai katalog produk.
7. Pesanan sederhana bisa diekstrak dan tersimpan ke Supabase.
8. Riwayat chat inbound/outbound tersimpan.
9. Dashboard menampilkan chat dan order.
10. OpenClaw bridge bisa menerima atau mengirim event menggunakan secret.
11. Tidak ada API key Gemini di client bundle.
12. Project punya `.env.example`, README, dan seed data demo.

---

## 17. Demo Scenario

Gunakan merchant demo:

```json
{
  "id": "demo_warung_mendoan",
  "name": "Warung Mendoan Bu Sari",
  "category": "kuliner",
  "description": "UMKM kuliner Purbalingga yang menjual mendoan, es teh, dan gorengan.",
  "openingHours": "08.00-21.00",
  "address": "Purbalingga Kota",
  "aiTone": "ramah"
}
```

Produk demo:

```json
[
  { "name": "Mendoan", "price": 2000, "stockStatus": "ready" },
  { "name": "Es Teh", "price": 4000, "stockStatus": "ready" },
  { "name": "Bakwan", "price": 1500, "stockStatus": "limited" }
]
```

Percakapan demo:

```txt
Pelanggan: Halo, mendoan ready?
Bot: Halo Kak, mendoan ready ya. Harganya Rp2.000/pcs. Mau pesan berapa?

Pelanggan: Pesan 10 mendoan sama 2 es teh, ambil jam 5 sore
Bot: Siap Kak, saya rangkum pesanannya: 10 Mendoan dan 2 Es Teh untuk diambil jam 5 sore. Mohon konfirmasi nama pemesan ya.
```

Expected result:

- Chat tersimpan.
- Order draft dibuat.
- Analytics total chat/order bertambah.

---

## 18. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Gemini mengarang data produk | Pelanggan dapat info salah | Pakai prompt larangan mengarang + context produk + fallback |
| API key bocor | Biaya dan keamanan bermasalah | Semua secret di env, jangan commit `.env.local` |
| Webhook diserang spam | Database penuh | Secret verification + rate limit + logging |
| Data antar UMKM tercampur | Masalah privasi | Semua query wajib filter `merchantId` |
| WhatsApp provider belum siap | MVP tertunda | Gunakan `/api/mock/inbound` dulu |
| OpenClaw belum terpasang | Automation tertunda | Buat bridge modular, jangan blokir chat utama |

---

## 19. Prioritas Pengerjaan untuk Agen Developer

Urutan kerja yang paling aman:

1. Setup project Next.js.
2. Setup Supabase client/admin.
3. Seed merchant dan produk demo.
4. Buat dashboard CRUD produk.
5. Buat Gemini processor.
6. Buat mock inbound endpoint.
7. Simpan chat dan order.
8. Buat UI chat/order.
9. Buat OpenClaw bridge.
10. Buat analytics.
11. Polish landing page.
12. Dokumentasi dan demo.

---

## 20. Instruksi untuk Agen Developer

Kerjakan project ini sebagai MVP yang bisa didemokan, bukan sistem enterprise penuh. Prioritaskan flow end-to-end:

```txt
Input produk UMKM → pelanggan kirim chat mock → AI menjawab → order tercatat → dashboard menampilkan hasil
```

Aturan penting:

1. Gunakan TypeScript di semua file.
2. Gunakan server route untuk semua operasi Gemini dan Supabase Admin.
3. Jangan hardcode secret.
4. Semua route POST harus validasi Zod.
5. Buat kode modular agar WhatsApp provider bisa diganti.
6. Buat UI sederhana tapi rapi.
7. Pastikan project bisa dijalankan di lokal tanpa layanan WhatsApp asli.
8. OpenClaw integration boleh berupa bridge dan dokumentasi konfigurasi jika gateway belum tersedia.

---

## 21. Referensi Resmi yang Harus Dibaca Agen

- Next.js Route Handlers: gunakan route handler di folder `app` untuk endpoint API.
- Gemini API Quickstart: gunakan SDK `@google/genai` untuk Node.js.
- Supabase Postgres: gunakan tabel SQL sebagai database aplikasi.
- OpenClaw Webhooks Plugin: gunakan route webhook terautentikasi dengan secret environment.

---

## 22. Definition of Done Final

Project siap diserahkan jika folder project memiliki:

- [ ] Source code Next.js lengkap.
- [x] `.env.example` lengkap.
- [ ] Supabase client/admin setup.
- [ ] Gemini client setup.
- [x] OpenClaw bridge setup.
- [ ] Supabase data model diterapkan.
- [ ] Dashboard berfungsi.
- [x] Mock chat end-to-end berfungsi.
- [x] README instalasi.
- [x] Seed data demo.
- [ ] Test minimal untuk chat processor.
- [ ] Tidak ada secret asli di repository.
