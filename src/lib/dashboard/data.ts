import { DEMO_MERCHANT_ID, demoMerchant, demoProducts } from '@/lib/demo/data';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Merchant } from '@/types/merchant';
import type { Product } from '@/types/product';
import type { ChatIntent, ChatStatus } from '@/types/chat';
import type { DeliveryMethod, OrderStatus } from '@/types/order';

export type DashboardMerchant = Omit<Merchant, 'createdAt' | 'updatedAt'> & {
  createdAt?: string;
  updatedAt?: string;
};

export type DashboardProduct = Omit<Product, 'createdAt' | 'updatedAt'> & {
  createdAt?: string;
  updatedAt?: string;
};

export type DashboardOrderItem = {
  productId?: string;
  name: string;
  qty: number;
  price?: number;
  note?: string;
};

export type DashboardOrder = {
  id: string;
  merchantId: string;
  chatId: string;
  customerPhone: string;
  customerName?: string;
  items: DashboardOrderItem[];
  totalEstimated: number;
  deliveryMethod: DeliveryMethod;
  address?: string;
  note?: string;
  status: OrderStatus;
  sourceMessageId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type DashboardMessage = {
  id: string;
  sender: 'customer' | 'bot' | 'human';
  text: string;
  createdAt?: string;
};

export type DashboardChat = {
  id: string;
  merchantId: string;
  customerPhone: string;
  customerName?: string;
  channel: 'whatsapp' | 'mock' | 'openclaw';
  lastMessage: string;
  lastIntent?: ChatIntent;
  status: ChatStatus;
  createdAt?: string;
  updatedAt?: string;
  messages: DashboardMessage[];
};

export const DEFAULT_DASHBOARD_MERCHANT_ID = DEMO_MERCHANT_ID;

export const fallbackOrders: DashboardOrder[] = [
  {
    id: 'ord_001',
    merchantId: DEMO_MERCHANT_ID,
    chatId: 'chat_001',
    customerName: 'Budi',
    customerPhone: '628123456789',
    items: [
      { name: 'Mendoan', qty: 10, price: 2000 },
      { name: 'Es Teh', qty: 2, price: 4000 },
    ],
    totalEstimated: 28000,
    status: 'confirmed',
    deliveryMethod: 'pickup',
    createdAt: '2026-05-21T10:30:00.000Z',
  },
  {
    id: 'ord_002',
    merchantId: DEMO_MERCHANT_ID,
    chatId: 'chat_002',
    customerName: 'Ani',
    customerPhone: '628987654321',
    items: [
      { name: 'Bakwan', qty: 5, price: 1500 },
      { name: 'Es Teh', qty: 1, price: 4000 },
    ],
    totalEstimated: 11500,
    status: 'draft',
    deliveryMethod: 'delivery',
    createdAt: '2026-05-21T11:15:00.000Z',
  },
  {
    id: 'ord_003',
    merchantId: DEMO_MERCHANT_ID,
    chatId: 'chat_003',
    customerName: 'Citra',
    customerPhone: '628111222333',
    items: [{ name: 'Mendoan', qty: 3, price: 2000 }],
    totalEstimated: 6000,
    status: 'done',
    deliveryMethod: 'pickup',
    createdAt: '2026-05-21T09:00:00.000Z',
  },
];

export const fallbackChats: DashboardChat[] = [
  {
    id: 'chat_001',
    merchantId: DEMO_MERCHANT_ID,
    customerName: 'Budi',
    customerPhone: '628123456789',
    channel: 'whatsapp',
    lastMessage: 'Pesan 10 mendoan sama 2 es teh',
    lastIntent: 'pesan',
    status: 'handled',
    messages: [
      { id: 'msg_001', sender: 'customer', text: 'Halo, mendoan ready?', createdAt: '2026-05-21T10:28:00.000Z' },
      { id: 'msg_002', sender: 'bot', text: 'Halo Kak, mendoan ready ya. Harganya Rp2.000/pcs. Mau pesan berapa?', createdAt: '2026-05-21T10:28:30.000Z' },
      { id: 'msg_003', sender: 'customer', text: 'Pesan 10 mendoan sama 2 es teh', createdAt: '2026-05-21T10:29:00.000Z' },
      { id: 'msg_004', sender: 'bot', text: 'Siap Kak! 10 Mendoan + 2 Es Teh. Total Rp28.000. Pickup atau antar?', createdAt: '2026-05-21T10:29:20.000Z' },
    ],
  },
  {
    id: 'chat_002',
    merchantId: DEMO_MERCHANT_ID,
    customerName: 'Ani',
    customerPhone: '628987654321',
    channel: 'mock',
    lastMessage: 'Bakwan masih ada?',
    lastIntent: 'tanya_produk',
    status: 'open',
    messages: [
      { id: 'msg_005', sender: 'customer', text: 'Bakwan masih ada?', createdAt: '2026-05-21T11:10:00.000Z' },
      { id: 'msg_006', sender: 'bot', text: 'Bakwan tinggal sedikit. Harganya Rp1.500. Mau pesan?', createdAt: '2026-05-21T11:10:20.000Z' },
    ],
  },
];

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function stringField(data: Record<string, unknown>, camel: string, snake = camel, fallback = '') {
  const value = data[camel] ?? data[snake];
  return typeof value === 'string' ? value : fallback;
}

function boolField(data: Record<string, unknown>, camel: string, snake = camel, fallback = false) {
  const value = data[camel] ?? data[snake];
  return typeof value === 'boolean' ? value : fallback;
}

function numberField(data: Record<string, unknown>, camel: string, snake = camel, fallback = 0) {
  const value = data[camel] ?? data[snake];
  return typeof value === 'number' ? value : Number(value ?? fallback);
}

function timestampToIso(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  return undefined;
}

function normalizeMerchant(id: string, value: unknown): DashboardMerchant {
  const data = asRecord(value);
  return {
    id,
    name: stringField(data, 'name'),
    slug: stringField(data, 'slug'),
    category:
      data.category === 'fashion' || data.category === 'jasa' || data.category === 'lainnya'
        ? data.category
        : 'kuliner',
    description: stringField(data, 'description'),
    ownerName: stringField(data, 'ownerName', 'owner_name'),
    phone: stringField(data, 'phone'),
    whatsappNumber: stringField(data, 'whatsappNumber', 'whatsapp_number'),
    address: stringField(data, 'address'),
    city: stringField(data, 'city', 'city', 'Purbalingga'),
    openingHours: stringField(data, 'openingHours', 'opening_hours'),
    isPremium: boolField(data, 'isPremium', 'is_premium'),
    status: data.status === 'draft' || data.status === 'suspended' ? data.status : 'active',
    aiTone: data.aiTone === 'formal' || data.ai_tone === 'formal'
      ? 'formal'
      : data.aiTone === 'santai' || data.ai_tone === 'santai'
        ? 'santai'
        : 'ramah',
    fallbackMessage: stringField(data, 'fallbackMessage', 'fallback_message'),
    createdAt: timestampToIso(data.createdAt ?? data.created_at),
    updatedAt: timestampToIso(data.updatedAt ?? data.updated_at),
  };
}

function normalizeProduct(id: string, value: unknown): DashboardProduct {
  const data = asRecord(value);
  const keywords = data.keywords;

  return {
    id,
    merchantId: stringField(data, 'merchantId', 'merchant_id', DEMO_MERCHANT_ID),
    name: stringField(data, 'name'),
    description: stringField(data, 'description'),
    price: numberField(data, 'price'),
    stockStatus: data.stockStatus === 'limited' || data.stock_status === 'limited'
      ? 'limited'
      : data.stockStatus === 'empty' || data.stock_status === 'empty'
        ? 'empty'
        : 'ready',
    category: stringField(data, 'category', 'category', 'umum'),
    imageUrl: stringField(data, 'imageUrl', 'image_url') || undefined,
    keywords: Array.isArray(keywords) ? keywords.map(String) : [],
    isActive: boolField(data, 'isActive', 'is_active', true),
    createdAt: timestampToIso(data.createdAt ?? data.created_at),
    updatedAt: timestampToIso(data.updatedAt ?? data.updated_at),
  };
}

function normalizeOrder(id: string, value: unknown): DashboardOrder {
  const data = asRecord(value);
  const items = Array.isArray(data.items)
    ? data.items.map((item) => {
        const record = asRecord(item);
        return {
          productId: stringField(record, 'productId', 'product_id') || undefined,
          name: stringField(record, 'name'),
          qty: numberField(record, 'qty', 'qty', 1),
          price: record.price == null ? undefined : numberField(record, 'price'),
          note: stringField(record, 'note') || undefined,
        };
      })
    : [];

  const calculatedTotal = items.reduce((sum, item) => sum + (item.price ?? 0) * item.qty, 0);

  return {
    id,
    merchantId: stringField(data, 'merchantId', 'merchant_id', DEMO_MERCHANT_ID),
    chatId: stringField(data, 'chatId', 'chat_id'),
    customerPhone: stringField(data, 'customerPhone', 'customer_phone'),
    customerName: stringField(data, 'customerName', 'customer_name') || undefined,
    items,
    totalEstimated: numberField(data, 'totalEstimated', 'total_estimated', calculatedTotal),
    deliveryMethod: data.deliveryMethod === 'pickup' || data.delivery_method === 'pickup'
      ? 'pickup'
      : data.deliveryMethod === 'delivery' || data.delivery_method === 'delivery'
        ? 'delivery'
        : 'unknown',
    address: stringField(data, 'address') || undefined,
    note: stringField(data, 'note') || undefined,
    status:
      data.status === 'confirmed' ||
      data.status === 'processing' ||
      data.status === 'done' ||
      data.status === 'cancelled'
        ? data.status
        : 'draft',
    sourceMessageId: stringField(data, 'sourceMessageId', 'source_message_id') || undefined,
    createdAt: timestampToIso(data.createdAt ?? data.created_at),
    updatedAt: timestampToIso(data.updatedAt ?? data.updated_at),
  };
}

function normalizeMessage(id: string, value: unknown): DashboardMessage {
  const data = asRecord(value);
  return {
    id,
    sender: data.sender === 'bot' || data.sender === 'human' ? data.sender : 'customer',
    text: stringField(data, 'text'),
    createdAt: timestampToIso(data.createdAt ?? data.created_at),
  };
}

function normalizeChat(id: string, value: unknown, messages: DashboardMessage[] = []): DashboardChat {
  const data = asRecord(value);
  const lastIntent = data.lastIntent ?? data.last_intent;

  return {
    id,
    merchantId: stringField(data, 'merchantId', 'merchant_id', DEMO_MERCHANT_ID),
    customerPhone: stringField(data, 'customerPhone', 'customer_phone'),
    customerName: stringField(data, 'customerName', 'customer_name') || undefined,
    channel: data.channel === 'whatsapp' || data.channel === 'openclaw' ? data.channel : 'mock',
    lastMessage: stringField(data, 'lastMessage', 'last_message'),
    lastIntent:
      lastIntent === 'tanya_produk' ||
      lastIntent === 'pesan' ||
      lastIntent === 'komplain' ||
      lastIntent === 'lokasi' ||
      lastIntent === 'jam_buka'
        ? lastIntent
        : 'lainnya',
    status: data.status === 'handled' || data.status === 'needs_human' ? data.status : 'open',
    createdAt: timestampToIso(data.createdAt ?? data.created_at),
    updatedAt: timestampToIso(data.updatedAt ?? data.updated_at),
    messages,
  };
}

export async function getDashboardMerchant(
  merchantId = DEFAULT_DASHBOARD_MERCHANT_ID
): Promise<DashboardMerchant> {
  try {
    const { data, error } = await getSupabaseServerClient()
      .from('merchants')
      .select('*')
      .eq('id', merchantId)
      .maybeSingle();

    if (error) throw error;
    if (data) return normalizeMerchant(data.id, data);
  } catch {
    // Supabase may be unavailable in local demo mode.
  }

  return normalizeMerchant(demoMerchant.id, demoMerchant);
}

export async function getDashboardProducts(
  merchantId = DEFAULT_DASHBOARD_MERCHANT_ID
): Promise<DashboardProduct[]> {
  try {
    const { data, error } = await getSupabaseServerClient()
      .from('products')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('name', { ascending: true });

    if (error) throw error;
    return (data ?? []).map((product) => normalizeProduct(product.id, product));
  } catch {
    return demoProducts.map((product) => normalizeProduct(product.id, product));
  }
}

export async function getDashboardOrders(
  merchantId = DEFAULT_DASHBOARD_MERCHANT_ID
): Promise<DashboardOrder[]> {
  try {
    const { data, error } = await getSupabaseServerClient()
      .from('orders')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return (data ?? []).map((order) => normalizeOrder(order.id, order));
  } catch {
    return fallbackOrders;
  }
}

export async function getDashboardChats(
  merchantId = DEFAULT_DASHBOARD_MERCHANT_ID,
  includeMessages = false
): Promise<DashboardChat[]> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .eq('merchant_id', merchantId)
      .order('updated_at', { ascending: false })
      .limit(25);

    if (error) throw error;

    if (!includeMessages) {
      return (data ?? []).map((chat) => normalizeChat(chat.id, chat));
    }

    return Promise.all(
      (data ?? []).map(async (chat) => {
        const { data: messages, error: messagesError } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', chat.id)
          .order('created_at', { ascending: true })
          .limit(40);

        if (messagesError) throw messagesError;
        return normalizeChat(
          chat.id,
          chat,
          (messages ?? []).map((message) => normalizeMessage(message.id, message))
        );
      })
    );
  } catch {
    return fallbackChats;
  }
}

export function rankAskedProducts(products: DashboardProduct[], chats: DashboardChat[]) {
  return products
    .map((product) => {
      const productName = product.name.toLowerCase();
      const count = chats.reduce((sum, chat) => {
        const haystack = [chat.lastMessage, ...chat.messages.map((message) => message.text)]
          .join(' ')
          .toLowerCase();
        return sum + (haystack.includes(productName) ? 1 : 0);
      }, 0);

      return { name: product.name, count };
    })
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);
}

export function rankOrderedProducts(orders: DashboardOrder[]) {
  const counts = new Map<string, number>();

  for (const order of orders) {
    for (const item of order.items) {
      counts.set(item.name, (counts.get(item.name) ?? 0) + item.qty);
    }
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
