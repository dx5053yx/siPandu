import type { Timestamp } from './timestamp';

export type StockStatus = 'ready' | 'limited' | 'empty';

export type Product = {
  id: string;
  merchantId: string;
  name: string;
  description: string;
  price: number;
  stockStatus: StockStatus;
  category: string;
  imageUrl?: string;
  keywords: string[];
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
