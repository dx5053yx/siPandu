# Database Schema

Database utama siPandu sekarang memakai Supabase Postgres. Skema SQL lengkap ada di [`supabase/schema.sql`](../supabase/schema.sql).

## Tables

- `merchants` - profil UMKM, nomor WhatsApp, tone AI, dan status toko.
- `products` - katalog produk per `merchant_id`.
- `chats` - ringkasan percakapan pelanggan per UMKM.
- `messages` - riwayat pesan inbound/outbound per chat.
- `orders` - draft pesanan hasil ekstraksi chat.
- `analytics_daily` - metrik harian awal untuk dashboard.
- `openclaw_events` - event automation dari OpenClaw.

## Catatan

- Semua tabel membawa `merchant_id` agar data tiap UMKM tetap bisa difilter jelas.
- Route server menulis chat, order, seed, dan event OpenClaw lewat Supabase.
- Dashboard membaca Supabase lebih dulu, lalu fallback ke data demo lokal jika tabel belum siap.
- Skema MVP mematikan RLS agar bisa berjalan dengan publishable key. Untuk produksi publik, isi `SUPABASE_SERVICE_ROLE_KEY` di server dan ganti dengan policy RLS yang lebih ketat.
