# siPandu

MVP demo chatbot WhatsApp UMKM: Next.js + Firebase + Gemini + OpenClaw.

## Fokus demo

siPandu dibuat untuk membuktikan alur inti:

1. pelanggan chat lewat WhatsApp atau simulator;
2. bot menjawab berdasarkan produk dan FAQ UMKM;
3. bot mendeteksi pesanan;
4. pesanan disimpan ke Firestore;
5. dashboard UMKM menampilkan produk, pesanan, dan insight.

## Stack

- Next.js untuk frontend dan backend API.
- Firebase Firestore untuk database.
- Firebase Auth untuk login UMKM.
- Gemini API untuk balasan natural berbasis data.
- OpenClaw sebagai adapter WhatsApp demo.

## Firebase

Konfigurasi Firebase client disimpan melalui environment variable, bukan hardcode di source.

Lihat `.env.example` untuk daftar variable yang perlu diisi.

Rules Firestore utama ada di `firestore.rules`.

## Endpoint awal

- `GET /api/health`
- `POST /api/bot`
- `POST /api/openclaw`

## Catatan keamanan

Jangan commit API key rahasia, service account JSON, atau private key ke repository.
Firebase web config boleh dipakai di frontend, tetapi tetap lebih rapi jika dikelola lewat `.env.local`.
