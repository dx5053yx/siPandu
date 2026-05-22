/**
 * Supabase seed data for siPandu MVP.
 *
 * Usage: npm run seed
 * Requires:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 * - SUPABASE_SERVICE_ROLE_KEY for production-safe writes
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getSupabaseServerClient } from './server';
import { DEMO_MERCHANT_ID, demoMerchant, demoProducts } from '@/lib/demo/data';

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

export async function seedDemoData() {
  const supabase = getSupabaseServerClient();
  const today = new Date().toISOString().slice(0, 10).replaceAll('-', '');

  const { error: merchantError } = await supabase.from('merchants').upsert(
    {
      id: demoMerchant.id,
      name: demoMerchant.name,
      slug: demoMerchant.slug,
      category: demoMerchant.category,
      description: demoMerchant.description,
      owner_name: demoMerchant.ownerName,
      phone: demoMerchant.phone,
      whatsapp_number: demoMerchant.whatsappNumber,
      address: demoMerchant.address,
      city: demoMerchant.city,
      opening_hours: demoMerchant.openingHours,
      is_premium: demoMerchant.isPremium,
      status: demoMerchant.status,
      ai_tone: demoMerchant.aiTone,
      fallback_message: demoMerchant.fallbackMessage,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  if (merchantError) throw merchantError;

  const { error: productsError } = await supabase.from('products').upsert(
    demoProducts.map((product) => ({
      id: product.id,
      merchant_id: product.merchantId,
      name: product.name,
      description: product.description,
      price: product.price,
      stock_status: product.stockStatus,
      category: product.category,
      image_url: product.imageUrl ?? null,
      keywords: product.keywords,
      is_active: product.isActive,
      updated_at: new Date().toISOString(),
    })),
    { onConflict: 'id' }
  );

  if (productsError) throw productsError;

  const { error: analyticsError } = await supabase.from('analytics_daily').upsert(
    {
      id: `${DEMO_MERCHANT_ID}_${today}`,
      merchant_id: DEMO_MERCHANT_ID,
      date: today,
      total_chats: 0,
      total_orders: 0,
      top_asked_products: [],
      top_ordered_products: [],
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  if (analyticsError) throw analyticsError;

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
