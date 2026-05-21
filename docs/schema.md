# Database Schema

Firestore memakai struktur multi-tenant berbasis `merchantId`.

## Collections

- `users/{userId}`
- `merchants/{merchantId}`
- `merchants/{merchantId}/products/{productId}`
- `merchants/{merchantId}/chats/{chatId}`
- `merchants/{merchantId}/chats/{chatId}/messages/{messageId}`
- `merchants/{merchantId}/orders/{orderId}`
- `analyticsDaily/{merchantId_yyyyMMdd}`
- `openclawEvents/{eventId}`

## Catatan

- Produk, chat, message, dan order disimpan sebagai subcollection merchant agar data antar UMKM tidak tercampur.
- Route server memakai Firebase Admin SDK untuk menulis chat, order, dan event OpenClaw.
- Client dashboard membaca data melalui server component dengan fallback data demo jika Firebase belum dikonfigurasi.
- `openclawEvents` hanya boleh ditulis oleh server, bukan langsung oleh client.
