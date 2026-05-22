/**
 * Demo seed data for siPandu MVP.
 * Matches the demo scenario in projek.md section 17.
 *
 * Usage: npm run seed
 * Requires: .env.local with Firebase Admin credentials
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from './admin';
import { normalizeIndonesianWhatsAppNumber } from '../whatsapp/number';
import type { Merchant } from '../../types/merchant';
import type { Product } from '../../types/product';

function loadEnvFile(path: string, override = false) {
  if (!existsSync(path)) return;

  const content = readFileSync(path, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (override || !process.env[key]) process.env[key] = value;
  }
}

const isSeedCli = process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js');

if (isSeedCli) {
  loadEnvFile(resolve(process.cwd(), '.env'));
  loadEnvFile(resolve(process.cwd(), '.env.local'), true);
}

/* ── Demo Merchant: Warung Mendoan Bu Sari ── */
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

if (isSeedCli) {
  seedDemoData()
    .then((result) => {
      console.log(`Seed selesai: ${result.merchantId} dengan ${result.products} produk.`);
    })
    .catch((error) => {
      console.error('Seed gagal:', error);
      process.exitCode = 1;
    });
}
