import { callGemini, isGeminiAvailable } from '@/lib/gemini/client';
import { buildFullPrompt } from '@/lib/chat/prompts';
import { geminiOutputSchema, type GeminiOutput } from '@/lib/validators';
import { demoMerchant, demoProducts, DEMO_MERCHANT_ID } from '@/lib/demo/data';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { rupiah } from '@/lib/utils';
import type { Merchant } from '@/types/merchant';
import type { Product } from '@/types/product';

export type ProcessResult = {
  intent: string;
  reply: string;
  needsHuman: boolean;
  orderDraft: GeminiOutput['orderDraft'];
  chatId: string;
  messageId: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function mapMerchantRow(row: unknown): Merchant {
  const data = asRecord(row);
  return {
    id: String(data.id ?? DEMO_MERCHANT_ID),
    name: String(data.name ?? ''),
    slug: String(data.slug ?? ''),
    category:
      data.category === 'fashion' || data.category === 'jasa' || data.category === 'lainnya'
        ? data.category
        : 'kuliner',
    description: String(data.description ?? ''),
    ownerName: String(data.owner_name ?? data.ownerName ?? ''),
    phone: String(data.phone ?? ''),
    whatsappNumber: String(data.whatsapp_number ?? data.whatsappNumber ?? ''),
    address: String(data.address ?? ''),
    city: String(data.city ?? 'Purbalingga'),
    openingHours: String(data.opening_hours ?? data.openingHours ?? ''),
    isPremium: data.is_premium === true || data.isPremium === true,
    status: data.status === 'draft' || data.status === 'suspended' ? data.status : 'active',
    aiTone:
      data.ai_tone === 'formal' || data.aiTone === 'formal'
        ? 'formal'
        : data.ai_tone === 'santai' || data.aiTone === 'santai'
          ? 'santai'
          : 'ramah',
    fallbackMessage: String(data.fallback_message ?? data.fallbackMessage ?? ''),
    createdAt: String(data.created_at ?? data.createdAt ?? ''),
    updatedAt: String(data.updated_at ?? data.updatedAt ?? ''),
  };
}

function mapProductRow(row: unknown): Product {
  const data = asRecord(row);
  return {
    id: String(data.id ?? ''),
    merchantId: String(data.merchant_id ?? data.merchantId ?? DEMO_MERCHANT_ID),
    name: String(data.name ?? ''),
    description: String(data.description ?? ''),
    price: Number(data.price ?? 0),
    stockStatus:
      data.stock_status === 'limited' || data.stockStatus === 'limited'
        ? 'limited'
        : data.stock_status === 'empty' || data.stockStatus === 'empty'
          ? 'empty'
          : 'ready',
    category: String(data.category ?? 'umum'),
    imageUrl: typeof data.image_url === 'string' ? data.image_url : typeof data.imageUrl === 'string' ? data.imageUrl : undefined,
    keywords: Array.isArray(data.keywords) ? data.keywords.map(String) : [],
    isActive: data.is_active !== false && data.isActive !== false,
    createdAt: String(data.created_at ?? data.createdAt ?? ''),
    updatedAt: String(data.updated_at ?? data.updatedAt ?? ''),
  };
}

/**
 * Get merchant data from Supabase or fallback to demo data.
 */
async function getMerchantData(merchantId: string) {
  try {
    const supabase = getSupabaseServerClient();
    const { data: merchantRow, error: merchantError } = await supabase
      .from('merchants')
      .select('*')
      .eq('id', merchantId)
      .maybeSingle();

    if (merchantError) throw merchantError;

    if (merchantRow) {
      const { data: productRows, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('merchant_id', merchantId)
        .eq('is_active', true);

      if (productsError) throw productsError;

      const merchant = mapMerchantRow(merchantRow);
      const products = (productRows ?? []).map(mapProductRow);
      return { merchant, products };
    }
  } catch {
    // Supabase not available, fall through to demo data.
  }

  // Fallback to demo data if merchantId matches or as default
  if (merchantId === DEMO_MERCHANT_ID || merchantId === 'demo-geprek-maju') {
    return {
      merchant: demoMerchant as unknown as Merchant,
      products: demoProducts as unknown as Product[],
    };
  }

  return {
    merchant: demoMerchant as unknown as Merchant,
    products: demoProducts as unknown as Product[],
  };
}

/**
 * Rule-based fallback when Gemini is not available.
 * Provides basic intent detection and response using product data.
 */
export function ruleBasedResponse(
  message: string,
  merchant: Pick<Merchant, 'name' | 'address' | 'openingHours'>,
  products: Pick<Product, 'name' | 'price' | 'stockStatus' | 'description'>[]
): GeminiOutput {
  const text = message.toLowerCase();

  // Check for menu/product list request
  if (text.includes('menu') || text.includes('daftar') || text.includes('produk apa')) {
    const menu = products
      .map((p) => `- ${p.name}: ${rupiah(p.price)} (${p.stockStatus})`)
      .join('\n');
    return {
      intent: 'tanya_produk',
      reply: `Berikut menu ${merchant.name}:\n${menu}\n\nMau pesan yang mana, Kak?`,
      needsHuman: false,
      orderDraft: null,
    };
  }

  // Check for opening hours
  if (text.includes('jam') || text.includes('buka') || text.includes('tutup')) {
    return {
      intent: 'jam_buka',
      reply: `${merchant.name} buka setiap hari pukul ${merchant.openingHours}. Silakan mampir ya, Kak!`,
      needsHuman: false,
      orderDraft: null,
    };
  }

  // Check for location
  if (text.includes('alamat') || text.includes('lokasi') || text.includes('dimana') || text.includes('di mana')) {
    return {
      intent: 'lokasi',
      reply: `Lokasi ${merchant.name}: ${merchant.address}. Ditunggu kedatangannya, Kak!`,
      needsHuman: false,
      orderDraft: null,
    };
  }

  // Check for complaint
  if (text.includes('komplain') || text.includes('kecewa') || text.includes('jelek') || text.includes('lama')) {
    return {
      intent: 'komplain',
      reply: 'Mohon maaf atas ketidaknyamanannya, Kak. Admin kami akan segera menghubungi untuk membantu.',
      needsHuman: true,
      orderDraft: null,
    };
  }

  // Check for ordering intent
  const isOrdering = text.includes('pesan') || text.includes('order') || text.includes('beli') || text.includes('mau');
  const matchedProducts: { name: string; qty: number }[] = [];

  for (const product of products) {
    const productName = product.name.toLowerCase();
    if (text.includes(productName)) {
      // Try to extract quantity
      const escapedProductName = productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const qtyPattern = new RegExp(`(\\d+)\\s*(?:x|pcs|porsi|buah|gelas)?\\s*${escapedProductName}`);
      const reversePattern = new RegExp(`${escapedProductName}\\s*(\\d+)`);
      const match = text.match(qtyPattern) || text.match(reversePattern);
      const qty = match?.[1] ? parseInt(match[1]) : 1;
      matchedProducts.push({ name: product.name, qty });
    }
  }

  if (isOrdering && matchedProducts.length > 0) {
    const total = matchedProducts.reduce((sum, item) => {
      const prod = products.find((p) => p.name === item.name);
      return sum + (prod?.price ?? 0) * item.qty;
    }, 0);

    const summary = matchedProducts
      .map((item) => {
        const prod = products.find((p) => p.name === item.name);
        return `- ${item.name} x${item.qty}: ${rupiah((prod?.price ?? 0) * item.qty)}`;
      })
      .join('\n');

    return {
      intent: 'pesan',
      reply: `Baik Kak, pesanannya:\n${summary}\nTotal estimasi: ${rupiah(total)}\n\nSudah benar? Mau diambil sendiri (pickup) atau diantar?`,
      needsHuman: false,
      orderDraft: {
        items: matchedProducts.map((item) => ({ name: item.name, qty: item.qty })),
        deliveryMethod: 'unknown',
      },
    };
  }

  // Check for specific product inquiry
  for (const product of products) {
    if (text.includes(product.name.toLowerCase())) {
      const status = product.stockStatus === 'ready' ? 'ready' : product.stockStatus === 'limited' ? 'tinggal sedikit' : 'habis';
      const followUp = product.stockStatus === 'empty' ? 'Bisa pilih produk lain di menu ya.' : 'Mau pesan berapa?';
      return {
        intent: 'tanya_produk',
        reply: `${product.name} ${status} ya, Kak. Harganya ${rupiah(product.price)}. ${followUp}`,
        needsHuman: product.stockStatus === 'empty',
        orderDraft: null,
      };
    }
  }

  // Default greeting
  return {
    intent: 'lainnya',
    reply: `Halo Kak! Saya siPandu, asisten ${merchant.name}. Saya bisa bantu cek menu, harga, stok, dan mencatat pesanan. Ketik "menu" untuk melihat daftar produk ya!`,
    needsHuman: false,
    orderDraft: null,
  };
}

/**
 * Save chat messages to Supabase.
 * Returns chatId and messageId.
 */
async function saveChatToSupabase(input: {
  merchantId: string;
  customerPhone: string;
  customerName: string;
  channel: string;
  inboundText: string;
  outboundText: string;
  intent: string;
  needsHuman: boolean;
}) {
  let chatId = 'local_' + Date.now();
  let messageId = 'msg_' + Date.now();

  try {
    const supabase = getSupabaseServerClient();
    const now = new Date().toISOString();
    const chatStatus = input.needsHuman ? 'needs_human' : 'open';

    // Find or create chat
    const { data: existingChats, error: existingError } = await supabase
      .from('chats')
      .select('id')
      .eq('merchant_id', input.merchantId)
      .eq('customer_phone', input.customerPhone)
      .in('status', ['open', 'handled', 'needs_human'])
      .order('updated_at', { ascending: false })
      .limit(1);

    if (existingError) throw existingError;

    if (existingChats?.[0]) {
      chatId = existingChats[0].id;
      const { error: updateError } = await supabase
        .from('chats')
        .update({
          last_message: input.inboundText,
          last_intent: input.intent,
          status: chatStatus,
          updated_at: now,
        })
        .eq('id', chatId);

      if (updateError) throw updateError;
    } else {
      const { data: newChat, error: insertError } = await supabase
        .from('chats')
        .insert({
          merchant_id: input.merchantId,
          customer_phone: input.customerPhone,
          customer_name: input.customerName,
          channel: input.channel,
          last_message: input.inboundText,
          last_intent: input.intent,
          status: chatStatus,
          created_at: now,
          updated_at: now,
        })
        .select('id')
        .single();

      if (insertError) throw insertError;
      chatId = newChat.id;
    }

    // Save inbound message
    const { data: inboundMsg, error: inboundError } = await supabase
      .from('messages')
      .insert({
        merchant_id: input.merchantId,
        chat_id: chatId,
        direction: 'inbound',
        sender: 'customer',
        text: input.inboundText,
        intent: input.intent,
        created_at: now,
      })
      .select('id')
      .single();

    if (inboundError) throw inboundError;
    messageId = inboundMsg.id;

    // Save outbound message
    const { error: outboundError } = await supabase.from('messages').insert({
      merchant_id: input.merchantId,
      chat_id: chatId,
      direction: 'outbound',
      sender: 'bot',
      text: input.outboundText,
      intent: input.intent,
      created_at: now,
    });

    if (outboundError) throw outboundError;
  } catch {
    // Supabase not available, continue with local IDs.
  }

  return { chatId, messageId };
}

/**
 * Save order draft to Supabase.
 */
async function saveOrderToSupabase(input: {
  merchantId: string;
  chatId: string;
  customerPhone: string;
  customerName: string;
  orderDraft: NonNullable<GeminiOutput['orderDraft']>;
  sourceMessageId: string;
  products: Pick<Product, 'id' | 'name' | 'price'>[];
}) {
  try {
    const supabase = getSupabaseServerClient();
    const now = new Date().toISOString();

    const items = input.orderDraft.items.map((item) => {
      const prod = input.products.find((p) => p.name.toLowerCase() === item.name.toLowerCase());
      return {
        product_id: prod?.id,
        name: item.name,
        qty: item.qty,
        price: prod?.price,
        note: item.note,
      };
    });

    const totalEstimated = items.reduce((sum, item) => sum + (item.price ?? 0) * item.qty, 0);

    const { error } = await supabase.from('orders').insert({
      merchant_id: input.merchantId,
      chat_id: input.chatId,
      customer_phone: input.customerPhone,
      customer_name: input.customerName,
      items,
      total_estimated: totalEstimated,
      delivery_method: input.orderDraft.deliveryMethod || 'unknown',
      address: input.orderDraft.address,
      note: input.orderDraft.note,
      status: 'draft',
      source_message_id: input.sourceMessageId,
      created_at: now,
      updated_at: now,
    });

    if (error) throw error;
  } catch {
    // Supabase not available.
  }
}

/**
 * Main function: Process incoming chat message.
 * 1. Get merchant + products from Supabase (or demo data)
 * 2. Generate AI response via Gemini (or rule-based fallback)
 * 3. Save chat and order to Supabase
 * 4. Return result
 */
export async function processIncomingChat(input: {
  merchantId: string;
  customerPhone: string;
  customerName: string;
  message: string;
  channel: string;
}): Promise<ProcessResult> {
  const { merchant, products } = await getMerchantData(input.merchantId);

  let aiResult: GeminiOutput;

  if (isGeminiAvailable()) {
    try {
      const prompt = buildFullPrompt(merchant, products, input.message);
      const rawResponse = await callGemini(prompt);

      // Parse and validate JSON
      const parsed = JSON.parse(rawResponse);
      const validated = geminiOutputSchema.safeParse(parsed);

      if (validated.success) {
        aiResult = validated.data;
      } else {
        console.warn('Gemini output validation failed:', validated.error.issues);
        aiResult = ruleBasedResponse(input.message, merchant, products);
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      aiResult = ruleBasedResponse(input.message, merchant, products);
    }
  } else {
    // No Gemini API key — use rule-based fallback
    aiResult = ruleBasedResponse(input.message, merchant, products);
  }

  // Save to Supabase
  const { chatId, messageId } = await saveChatToSupabase({
    merchantId: input.merchantId,
    customerPhone: input.customerPhone,
    customerName: input.customerName,
    channel: input.channel,
    inboundText: input.message,
    outboundText: aiResult.reply,
    intent: aiResult.intent,
    needsHuman: aiResult.needsHuman,
  });

  // Save order if exists
  if (aiResult.orderDraft) {
    await saveOrderToSupabase({
      merchantId: input.merchantId,
      chatId,
      customerPhone: input.customerPhone,
      customerName: input.customerName,
      orderDraft: aiResult.orderDraft,
      sourceMessageId: messageId,
      products,
    });
  }

  return {
    intent: aiResult.intent,
    reply: aiResult.reply,
    needsHuman: aiResult.needsHuman,
    orderDraft: aiResult.orderDraft,
    chatId,
    messageId,
  };
}
