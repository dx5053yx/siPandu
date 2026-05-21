import { callGemini, isGeminiAvailable } from '@/lib/gemini/client';
import { buildFullPrompt, FALLBACK_RESPONSE } from '@/lib/chat/prompts';
import { geminiOutputSchema, type GeminiOutput } from '@/lib/validators';
import { getAdminDb } from '@/lib/firebase/admin';
import { demoMerchant, demoProducts, DEMO_MERCHANT_ID } from '@/lib/firebase/seed';
import { FieldValue } from 'firebase-admin/firestore';
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

/**
 * Get merchant data from Firestore or fallback to demo data.
 */
async function getMerchantData(merchantId: string) {
  try {
    const db = getAdminDb();
    const merchantDoc = await db.collection('merchants').doc(merchantId).get();

    if (merchantDoc.exists) {
      const merchant = { id: merchantDoc.id, ...merchantDoc.data() } as Merchant;
      const productsSnap = await db
        .collection('merchants')
        .doc(merchantId)
        .collection('products')
        .where('isActive', '==', true)
        .get();
      const products = productsSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as Product[];
      return { merchant, products };
    }
  } catch {
    // Firestore not available, fall through to demo data
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
function ruleBasedResponse(
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
    if (text.includes(product.name.toLowerCase())) {
      // Try to extract quantity
      const qtyPattern = new RegExp(`(\\d+)\\s*(?:x|pcs|porsi|buah|gelas)?\\s*${product.name.toLowerCase()}`);
      const reversePattern = new RegExp(`${product.name.toLowerCase()}\\s*(\\d+)`);
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
      return {
        intent: 'tanya_produk',
        reply: `${product.name} ${status} ya, Kak. Harganya ${rupiah(product.price)}. Mau pesan berapa?`,
        needsHuman: false,
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
 * Save chat messages to Firestore.
 * Returns chatId and messageId.
 */
async function saveChatToFirestore(input: {
  merchantId: string;
  customerPhone: string;
  customerName: string;
  channel: string;
  inboundText: string;
  outboundText: string;
  intent: string;
}) {
  let chatId = 'local_' + Date.now();
  let messageId = 'msg_' + Date.now();

  try {
    const db = getAdminDb();
    const now = FieldValue.serverTimestamp();

    // Find or create chat
    const chatsRef = db.collection('merchants').doc(input.merchantId).collection('chats');
    const existingChat = await chatsRef
      .where('customerPhone', '==', input.customerPhone)
      .where('status', 'in', ['open', 'handled'])
      .limit(1)
      .get();

    if (!existingChat.empty) {
      chatId = existingChat.docs[0].id;
      await chatsRef.doc(chatId).update({
        lastMessage: input.inboundText,
        lastIntent: input.intent,
        updatedAt: now,
      });
    } else {
      const newChat = await chatsRef.add({
        merchantId: input.merchantId,
        customerPhone: input.customerPhone,
        customerName: input.customerName,
        channel: input.channel,
        lastMessage: input.inboundText,
        lastIntent: input.intent,
        status: 'open',
        createdAt: now,
        updatedAt: now,
      });
      chatId = newChat.id;
    }

    // Save inbound message
    const messagesRef = chatsRef.doc(chatId).collection('messages');
    const inboundMsg = await messagesRef.add({
      merchantId: input.merchantId,
      chatId,
      direction: 'inbound',
      sender: 'customer',
      text: input.inboundText,
      intent: input.intent,
      createdAt: now,
    });
    messageId = inboundMsg.id;

    // Save outbound message
    await messagesRef.add({
      merchantId: input.merchantId,
      chatId,
      direction: 'outbound',
      sender: 'bot',
      text: input.outboundText,
      intent: input.intent,
      createdAt: now,
    });
  } catch {
    // Firestore not available, continue with local IDs
  }

  return { chatId, messageId };
}

/**
 * Save order draft to Firestore.
 */
async function saveOrderToFirestore(input: {
  merchantId: string;
  chatId: string;
  customerPhone: string;
  customerName: string;
  orderDraft: NonNullable<GeminiOutput['orderDraft']>;
  sourceMessageId: string;
  products: Pick<Product, 'name' | 'price'>[];
}) {
  try {
    const db = getAdminDb();
    const now = FieldValue.serverTimestamp();

    const items = input.orderDraft.items.map((item) => {
      const prod = input.products.find((p) => p.name.toLowerCase() === item.name.toLowerCase());
      return {
        name: item.name,
        qty: item.qty,
        price: prod?.price,
        note: item.note,
      };
    });

    const totalEstimated = items.reduce((sum, item) => sum + (item.price ?? 0) * item.qty, 0);

    await db.collection('merchants').doc(input.merchantId).collection('orders').add({
      merchantId: input.merchantId,
      chatId: input.chatId,
      customerPhone: input.customerPhone,
      customerName: input.customerName,
      items,
      totalEstimated,
      deliveryMethod: input.orderDraft.deliveryMethod || 'unknown',
      address: input.orderDraft.address,
      note: input.orderDraft.note,
      status: 'draft',
      sourceMessageId: input.sourceMessageId,
      createdAt: now,
      updatedAt: now,
    });
  } catch {
    // Firestore not available
  }
}

/**
 * Main function: Process incoming chat message.
 * 1. Get merchant + products from Firestore (or demo data)
 * 2. Generate AI response via Gemini (or rule-based fallback)
 * 3. Save chat and order to Firestore
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

  // Save to Firestore
  const { chatId, messageId } = await saveChatToFirestore({
    merchantId: input.merchantId,
    customerPhone: input.customerPhone,
    customerName: input.customerName,
    channel: input.channel,
    inboundText: input.message,
    outboundText: aiResult.reply,
    intent: aiResult.intent,
  });

  // Save order if exists
  if (aiResult.orderDraft) {
    await saveOrderToFirestore({
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
