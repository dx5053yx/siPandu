export type { User, UserRole } from './user';
export type { Merchant, MerchantCategory, MerchantStatus, AiTone } from './merchant';
export type { Product, StockStatus } from './product';
export type { Chat, Message, ChatChannel, ChatIntent, ChatStatus, MessageDirection, MessageSender } from './chat';
export type { Order, OrderItem, OrderStatus, DeliveryMethod } from './order';
export type { AnalyticsDaily } from './analytics';

import type { ChatIntent } from './chat';

/** Gemini AI response shape */
export type GeminiResponse = {
  intent: ChatIntent;
  reply: string;
  needsHuman: boolean;
  orderDraft: {
    items: Array<{ name: string; qty: number; note?: string }>;
    deliveryMethod: 'pickup' | 'delivery' | 'unknown';
    address?: string;
    note?: string;
  } | null;
};
