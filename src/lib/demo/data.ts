import { normalizeIndonesianWhatsAppNumber } from '@/lib/whatsapp/number';
import type { Merchant } from '@/types/merchant';
import type { Product } from '@/types/product';

export const DEMO_MERCHANT_ID = 'demo_warung_mendoan';
export const DEMO_MERCHANT_PHONE = normalizeIndonesianWhatsAppNumber(
  process.env.WHATSAPP_PHONE_NUMBER || '628997595299'
);

export const demoMerchant: Omit<Merchant, 'createdAt' | 'updatedAt'> = {
  id: DEMO_MERCHANT_ID,
  name: 'Warung Mendoan Bu Sari',
  slug: 'warung-mendoan-bu-sari',
  category: 'kuliner',
  description: 'UMKM kuliner Purbalingga yang menjual mendoan, es teh, dan gorengan.',
  ownerName: 'Bu Sari',
  phone: DEMO_MERCHANT_PHONE,
  whatsappNumber: DEMO_MERCHANT_PHONE,
  address: 'Purbalingga Kota',
  city: 'Purbalingga',
  openingHours: '08.00-21.00',
  isPremium: false,
  status: 'active',
  aiTone: 'ramah',
  fallbackMessage: 'Maaf Kak, admin sedang tidak tersedia. Silakan coba lagi nanti ya.',
};

export const demoProducts: Omit<Product, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'prod_mendoan',
    merchantId: DEMO_MERCHANT_ID,
    name: 'Mendoan',
    description: 'Mendoan tempe khas Purbalingga, renyah dan gurih.',
    price: 2000,
    stockStatus: 'ready',
    category: 'gorengan',
    keywords: ['mendoan', 'tempe', 'gorengan'],
    isActive: true,
  },
  {
    id: 'prod_es_teh',
    merchantId: DEMO_MERCHANT_ID,
    name: 'Es Teh',
    description: 'Es teh manis segar.',
    price: 4000,
    stockStatus: 'ready',
    category: 'minuman',
    keywords: ['es teh', 'teh', 'minuman'],
    isActive: true,
  },
  {
    id: 'prod_bakwan',
    merchantId: DEMO_MERCHANT_ID,
    name: 'Bakwan',
    description: 'Bakwan sayur renyah.',
    price: 1500,
    stockStatus: 'limited',
    category: 'gorengan',
    keywords: ['bakwan', 'gorengan'],
    isActive: true,
  },
];
