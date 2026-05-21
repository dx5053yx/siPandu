import { getAdminDb } from '@/lib/firebase/admin';
import { DEMO_MERCHANT_ID, demoMerchant, demoProducts } from '@/lib/firebase/seed';
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

function timestampToIso(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  return undefined;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function normalizeProduct(id: string, value: unknown): DashboardProduct {
  const data = asRecord(value);
  return {
    id,
    merchantId: String(data.merchantId ?? DEMO_MERCHANT_ID),
    name: String(data.name ?? ''),
    description: String(data.description ?? ''),
    price: Number(data.price ?? 0),
    stockStatus: data.stockStatus === 'limited' || data.stockStatus === 'empty' ? data.stockStatus : 'ready',
    category: String(data.category ?? 'umum'),
    imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : undefined,
    keywords: Array.isArray(data.keywords) ? data.keywords.map(String) : [],
    isActive: data.isActive !== false,
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt),
  };
}

function normalizeOrder(id: string, value: unknown): DashboardOrder {
  const data = asRecord(value);
  const items = Array.isArray(data.items)
    ? data.items.map((item) => {
        const record = asRecord(item);
        return {
          productId: typeof record.productId === 'string' ? record.productId : undefined,
          name: String(record.name ?? ''),
          qty: Number(record.qty ?? 1),
          price: typeof record.price === 'number' ? record.price : undefined,
          note: typeof record.note === 'string' ? record.note : undefined,
        };
      })
    : [];

  const calculatedTotal = items.reduce((sum, item) => sum + (item.price ?? 0) * item.qty, 0);

  return {
    id,
    merchantId: String(data.merchantId ?? DEMO_MERCHANT_ID),
    chatId: String(data.chatId ?? ''),
    customerPhone: String(data.customerPhone ?? ''),
    customerName: typeof data.customerName === 'string' ? data.customerName : undefined,
    items,
    totalEstimated: Number(data.totalEstimated ?? calculatedTotal),
    deliveryMethod: data.deliveryMethod === 'pickup' || data.deliveryMethod === 'delivery' ? data.deliveryMethod : 'unknown',
    address: typeof data.address === 'string' ? data.address : undefined,
    note: typeof data.note === 'string' ? data.note : undefined,
    status:
      data.status === 'confirmed' ||
      data.status === 'processing' ||
      data.status === 'done' ||
      data.status === 'cancelled'
        ? data.status
        : 'draft',
    sourceMessageId: typeof data.sourceMessageId === 'string' ? data.sourceMessageId : undefined,
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt),
  };
}

function normalizeMessage(id: string, value: unknown): DashboardMessage {
  const data = asRecord(value);
  return {
    id,
    sender: data.sender === 'bot' || data.sender === 'human' ? data.sender : 'customer',
    text: String(data.text ?? ''),
    createdAt: timestampToIso(data.createdAt),
  };
}

function normalizeChat(id: string, value: unknown, messages: DashboardMessage[] = []): DashboardChat {
  const data = asRecord(value);
  return {
    id,
    merchantId: String(data.merchantId ?? DEMO_MERCHANT_ID),
    customerPhone: String(data.customerPhone ?? ''),
    customerName: typeof data.customerName === 'string' ? data.customerName : undefined,
    channel: data.channel === 'whatsapp' || data.channel === 'openclaw' ? data.channel : 'mock',
    lastMessage: String(data.lastMessage ?? ''),
    lastIntent:
      data.lastIntent === 'tanya_produk' ||
      data.lastIntent === 'pesan' ||
      data.lastIntent === 'komplain' ||
      data.lastIntent === 'lokasi' ||
      data.lastIntent === 'jam_buka'
        ? data.lastIntent
        : 'lainnya',
    status: data.status === 'handled' || data.status === 'needs_human' ? data.status : 'open',
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt),
    messages,
  };
}

export async function getDashboardMerchant(
  merchantId = DEFAULT_DASHBOARD_MERCHANT_ID
): Promise<DashboardMerchant> {
  try {
    const doc = await getAdminDb().collection('merchants').doc(merchantId).get();
    if (doc.exists) {
      const data = asRecord(doc.data());
      return {
        ...(data as Omit<Merchant, 'createdAt' | 'updatedAt'>),
        id: doc.id,
        createdAt: timestampToIso(data.createdAt),
        updatedAt: timestampToIso(data.updatedAt),
      };
    }
  } catch {
    // Firebase may be unavailable in local demo mode.
  }

  return demoMerchant;
}

export async function getDashboardProducts(
  merchantId = DEFAULT_DASHBOARD_MERCHANT_ID
): Promise<DashboardProduct[]> {
  try {
    const snap = await getAdminDb()
      .collection('merchants')
      .doc(merchantId)
      .collection('products')
      .orderBy('name', 'asc')
      .get();

    return snap.docs.map((doc) => normalizeProduct(doc.id, doc.data()));
  } catch {
    return demoProducts.map((product) => normalizeProduct(product.id, product));
  }
}

export async function getDashboardOrders(
  merchantId = DEFAULT_DASHBOARD_MERCHANT_ID
): Promise<DashboardOrder[]> {
  try {
    const snap = await getAdminDb()
      .collection('merchants')
      .doc(merchantId)
      .collection('orders')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    return snap.docs.map((doc) => normalizeOrder(doc.id, doc.data()));
  } catch {
    return fallbackOrders;
  }
}

export async function getDashboardChats(
  merchantId = DEFAULT_DASHBOARD_MERCHANT_ID,
  includeMessages = false
): Promise<DashboardChat[]> {
  try {
    const snap = await getAdminDb()
      .collection('merchants')
      .doc(merchantId)
      .collection('chats')
      .orderBy('updatedAt', 'desc')
      .limit(25)
      .get();

    return Promise.all(
      snap.docs.map(async (doc) => {
        if (!includeMessages) return normalizeChat(doc.id, doc.data());

        const messagesSnap = await doc.ref.collection('messages').orderBy('createdAt', 'asc').limit(40).get();
        const messages = messagesSnap.docs.map((messageDoc) => normalizeMessage(messageDoc.id, messageDoc.data()));
        return normalizeChat(doc.id, doc.data(), messages);
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
