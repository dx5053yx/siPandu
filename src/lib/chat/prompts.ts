import type { Merchant } from '@/types/merchant';
import type { Product } from '@/types/product';
import { rupiah } from '@/lib/utils';

/** System prompt for siPandu chatbot */
export const SYSTEM_PROMPT = `Kamu adalah siPandu, asisten virtual WhatsApp untuk UMKM lokal di Purbalingga.
Tugasmu membantu pelanggan mendapatkan informasi produk, harga, stok, jam buka, alamat, dan membuat draft pesanan.
Gunakan bahasa Indonesia yang ramah, singkat, natural, dan tidak bertele-tele.
Jangan mengarang data produk. Jika data tidak tersedia, jawab dengan sopan dan arahkan ke admin UMKM.
Jika pelanggan tampak ingin membeli, bantu rangkum pesanan dan minta konfirmasi.
Jika ada komplain serius, tandai needsHuman=true.

Kamu WAJIB membalas dalam format JSON valid berikut:
{
  "intent": "tanya_produk | pesan | komplain | lokasi | jam_buka | lainnya",
  "reply": "balasan untuk pelanggan",
  "needsHuman": false,
  "orderDraft": null
}

Jika pelanggan memesan, isi orderDraft:
{
  "intent": "pesan",
  "reply": "rangkuman pesanan",
  "needsHuman": false,
  "orderDraft": {
    "items": [{ "name": "nama produk", "qty": 1, "note": "opsional" }],
    "deliveryMethod": "pickup | delivery | unknown",
    "address": "opsional",
    "note": "opsional"
  }
}

PENTING:
- Hanya gunakan data produk yang diberikan di bawah ini.
- JANGAN mengarang produk, harga, atau stok yang tidak ada di data.
- Jawab HANYA dalam format JSON, tanpa markdown, tanpa teks tambahan di luar JSON.`;

/**
 * Build context prompt per merchant with active products and chat history.
 */
export function buildContextPrompt(
  merchant: Pick<Merchant, 'name' | 'category' | 'description' | 'address' | 'openingHours' | 'aiTone'>,
  products: Pick<Product, 'name' | 'price' | 'stockStatus' | 'description'>[],
  chatHistory?: string
): string {
  const productBullets = products
    .map((p) => `- ${p.name}: ${rupiah(p.price)} (stok: ${p.stockStatus})${p.description ? ' — ' + p.description : ''}`)
    .join('\n');

  let context = `Data UMKM:
Nama: ${merchant.name}
Kategori: ${merchant.category}
Deskripsi: ${merchant.description}
Alamat: ${merchant.address}
Jam buka: ${merchant.openingHours}
Gaya bahasa: ${merchant.aiTone}

Produk aktif:
${productBullets}`;

  if (chatHistory) {
    context += `\n\nRiwayat chat ringkas:\n${chatHistory}`;
  }

  return context;
}

/**
 * Build the full prompt combining system prompt, context, and user message.
 */
export function buildFullPrompt(
  merchant: Pick<Merchant, 'name' | 'category' | 'description' | 'address' | 'openingHours' | 'aiTone'>,
  products: Pick<Product, 'name' | 'price' | 'stockStatus' | 'description'>[],
  userMessage: string,
  chatHistory?: string
): string {
  const context = buildContextPrompt(merchant, products, chatHistory);
  return `${SYSTEM_PROMPT}\n\n${context}\n\nPesan pelanggan:\n"${userMessage}"`;
}

/** Fallback response when Gemini fails or is unavailable */
export const FALLBACK_RESPONSE = {
  intent: 'lainnya' as const,
  reply: 'Maaf Kak, sistem sedang memproses pesan. Admin akan segera membantu ya.',
  needsHuman: true,
  orderDraft: null,
};
