import type { Timestamp } from './timestamp';

export type AnalyticsDaily = {
  id: string;
  merchantId: string;
  date: string;
  totalChats: number;
  totalOrders: number;
  topAskedProducts: Array<{ name: string; count: number }>;
  topOrderedProducts: Array<{ name: string; count: number }>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
