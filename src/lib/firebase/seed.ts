/**
 * Demo seed data for siPandu MVP.
 * Matches the demo scenario in projek.md section 17.
 *
 * Usage: npm run seed
 * Requires: .env.local with Firebase Admin credentials
 */

import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from './admin';
import type { Merchant } from '../../types/merchant';
import type { Product } from '../../types/product';

/* ── Demo Merchant: Warung Mendoan Bu Sari ── */
export const DEMO_MERCHANT_ID = 'demo_warung_mendoan';

export const demoMerchant: Omit<Merchant, 'createdAt' | 'updatedAt'> = {
  id: DEMO_MERCHANT_ID,
  name: 'Warung Mendoan Bu Sari',
  slug: 'warung-mendoan-bu-sari',
  category: 'kuliner',
  description: 'UMKM kuliner Purbalingga yang menjual mendoan, es teh, dan gorengan.',
  ownerName: 'Bu Sari',
  phone: '628123456789',
  whatsappNumber: '628123456789',
  address: 'Purbalingga Kota',
  city: 'Purbalingga',
  openingHours: '08.00-21.00',
  isPremium: false,
  status: 'active',
  aiTone: 'ramah',
  fallbackMessage: 'Maaf Kak, admin sedang tidak tersedia. Silakan coba lagi nanti ya.',
};

/* ── Demo Products ── */
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

export async function seedDemoData() {
  const db = getAdminDb();
  const now = FieldValue.serverTimestamp();
  const merchantRef = db.collection('merchants').doc(DEMO_MERCHANT_ID);

  await merchantRef.set(
    {
      ...demoMerchant,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true }
  );

  const batch = db.batch();

  for (const product of demoProducts) {
    batch.set(
      merchantRef.collection('products').doc(product.id),
      {
        ...product,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true }
    );
  }

  const today = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  batch.set(
    db.collection('analyticsDaily').doc(`${DEMO_MERCHANT_ID}_${today}`),
    {
      id: `${DEMO_MERCHANT_ID}_${today}`,
      merchantId: DEMO_MERCHANT_ID,
      date: today,
      totalChats: 0,
      totalOrders: 0,
      topAskedProducts: [],
      topOrderedProducts: [],
      createdAt: now,
      updatedAt: now,
    },
    { merge: true }
  );

  await batch.commit();

  return {
    merchantId: DEMO_MERCHANT_ID,
    products: demoProducts.length,
  };
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedDemoData()
    .then((result) => {
      console.log(`Seed selesai: ${result.merchantId} dengan ${result.products} produk.`);
    })
    .catch((error) => {
      console.error('Seed gagal:', error);
      process.exitCode = 1;
    });
}
