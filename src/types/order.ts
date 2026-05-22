import type { Timestamp } from './timestamp';

export type OrderStatus = 'draft' | 'confirmed' | 'processing' | 'done' | 'cancelled';
export type DeliveryMethod = 'pickup' | 'delivery' | 'unknown';

export type OrderItem = {
  productId?: string;
  name: string;
  qty: number;
  price?: number;
  note?: string;
};

export type Order = {
  id: string;
  merchantId: string;
  chatId: string;
  customerPhone: string;
  customerName?: string;
  items: OrderItem[];
  totalEstimated?: number;
  deliveryMethod?: DeliveryMethod;
  address?: string;
  note?: string;
  status: OrderStatus;
  sourceMessageId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
