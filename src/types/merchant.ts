import { Timestamp } from 'firebase/firestore';

export type MerchantCategory = 'kuliner' | 'fashion' | 'jasa' | 'lainnya';
export type MerchantStatus = 'draft' | 'active' | 'suspended';
export type AiTone = 'ramah' | 'formal' | 'santai';

export type Merchant = {
  id: string;
  name: string;
  slug: string;
  category: MerchantCategory;
  description: string;
  ownerName: string;
  phone: string;
  whatsappNumber: string;
  address: string;
  city: string;
  openingHours: string;
  isPremium: boolean;
  status: MerchantStatus;
  aiTone: AiTone;
  fallbackMessage: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
