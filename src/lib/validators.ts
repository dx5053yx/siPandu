import { z } from 'zod';

/* ── Chat Inbound ── */
export const chatInboundSchema = z.object({
  merchantId: z.string().min(1, 'merchantId wajib diisi'),
  channel: z.enum(['whatsapp', 'mock', 'openclaw']).default('mock'),
  customerPhone: z.string().min(1, 'customerPhone wajib diisi'),
  customerName: z.string().optional().default('Pelanggan'),
  message: z.string().min(1, 'message wajib diisi'),
  rawPayload: z.record(z.unknown()).optional(),
});

export type ChatInboundInput = z.infer<typeof chatInboundSchema>;

/* ── Gemini Respond ── */
export const geminiRespondSchema = z.object({
  merchantId: z.string().min(1),
  chatId: z.string().min(1),
  message: z.string().min(1),
  mode: z.enum(['reply', 'summary', 'extract_order']).default('reply'),
});

export type GeminiRespondInput = z.infer<typeof geminiRespondSchema>;

/* ── Chat Reply ── */
export const chatReplySchema = z.object({
  to: z.string().min(1, 'to wajib diisi'),
  message: z.string().min(1, 'message wajib diisi'),
});

export type ChatReplyInput = z.infer<typeof chatReplySchema>;

/* ── OpenClaw Webhook ── */
export const openclawWebhookSchema = z.object({
  type: z.enum(['needs_human_followup', 'daily_report', 'run_task']),
  merchantId: z.string().min(1),
  chatId: z.string().optional(),
  customerPhone: z.string().optional(),
  summary: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  date: z.string().optional(),
  action: z.string().optional(),
});

export type OpenClawWebhookInput = z.infer<typeof openclawWebhookSchema>;

/* ── Mock Inbound ── */
export const mockInboundSchema = z.object({
  merchantId: z.string().min(1).default('demo_warung_mendoan'),
  customerPhone: z.string().min(1).default('628123456789'),
  customerName: z.string().optional().default('Pelanggan'),
  message: z.string().min(1, 'message wajib diisi'),
});

export type MockInboundInput = z.infer<typeof mockInboundSchema>;

/* ── Gemini output validation ── */
export const geminiOutputSchema = z.object({
  intent: z.enum(['tanya_produk', 'pesan', 'komplain', 'lokasi', 'jam_buka', 'lainnya']),
  reply: z.string().min(1),
  needsHuman: z.boolean(),
  orderDraft: z.object({
    items: z.array(z.object({
      name: z.string(),
      qty: z.number().int().positive(),
      note: z.string().optional(),
    })).min(1),
    deliveryMethod: z.enum(['pickup', 'delivery', 'unknown']),
    address: z.string().optional(),
    note: z.string().optional(),
  }).nullable(),
});

export type GeminiOutput = z.infer<typeof geminiOutputSchema>;

/* ── Merchant form ── */
export const merchantFormSchema = z.object({
  name: z.string().min(1, 'Nama UMKM wajib diisi'),
  slug: z.string().min(1),
  category: z.enum(['kuliner', 'fashion', 'jasa', 'lainnya']),
  description: z.string().min(1),
  ownerName: z.string().min(1),
  phone: z.string().min(1),
  whatsappNumber: z.string().min(1),
  address: z.string().min(1),
  city: z.string().default('Purbalingga'),
  openingHours: z.string().min(1),
  aiTone: z.enum(['ramah', 'formal', 'santai']).default('ramah'),
  fallbackMessage: z.string().default('Maaf Kak, admin sedang tidak tersedia. Silakan coba lagi nanti ya.'),
});

/* ── Product form ── */
export const productFormSchema = z.object({
  name: z.string().min(1, 'Nama produk wajib diisi'),
  description: z.string().min(1),
  price: z.number().positive('Harga harus lebih dari 0'),
  stockStatus: z.enum(['ready', 'limited', 'empty']).default('ready'),
  category: z.string().default('umum'),
  keywords: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});
