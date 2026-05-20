import { demoProducts, demoUmkm } from './demo-data';
import type { BotResult, OrderItem, Product } from './types';

const rupiah = (value: number) => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0
}).format(value);

function findProduct(message: string, products: Product[]) {
  const normalized = message.toLowerCase();
  return products.find((product) => normalized.includes(product.name.toLowerCase()));
}

function parseQuantity(message: string, productName: string) {
  const normalized = message.toLowerCase();
  const pattern = new RegExp('(\\d+)\\s*(x|pcs|porsi|buah|gelas)?\\s*' + productName.toLowerCase().replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'));
  const match = normalized.match(pattern);
  if (match?.[1]) return Number(match[1]);
  const before = normalized.match(new RegExp(productName.toLowerCase().replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\s*(\\d+)'));
  if (before?.[1]) return Number(before[1]);
  return normalized.includes('pesan') || normalized.includes('order') ? 1 : 0;
}

function buildMenu(products: Product[]) {
  return products.map((product) => `- ${product.name}: ${rupiah(product.price)} (stok ${product.stock})`).join('\n');
}

export async function handleIncomingMessage(message: string, customerName = 'Pelanggan'): Promise<BotResult> {
  const text = message.toLowerCase();
  const products = demoProducts;

  if (!text.trim()) {
    return { reply: 'Halo, ada yang bisa siPandu bantu?' };
  }

  if (text.includes('menu') || text.includes('daftar produk') || text.includes('produk')) {
    return { reply: `Menu ${demoUmkm.name}:\n${buildMenu(products)}\n\nKetik contoh: pesan 2 Ayam Geprek dan 1 Es Teh atas nama Budi.` };
  }

  const detectedItems: OrderItem[] = [];
  for (const product of products) {
    if (text.includes(product.name.toLowerCase())) {
      const qty = parseQuantity(message, product.name);
      if (qty > 0) {
        detectedItems.push({
          productId: product.id,
          productName: product.name,
          qty,
          price: product.price,
          subtotal: product.price * qty
        });
      }
    }
  }

  const asksOrder = text.includes('pesan') || text.includes('order') || text.includes('beli');
  if (asksOrder && detectedItems.length > 0) {
    const total = detectedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const summary = detectedItems.map((item) => `- ${item.productName} x${item.qty}: ${rupiah(item.subtotal)}`).join('\n');
    return {
      reply: `Baik, Kak ${customerName}. Pesanan sudah siPandu catat:\n${summary}\nTotal: ${rupiah(total)}\n\nSilakan konfirmasi metode ambil: pickup atau antar.`,
      order: { customerName, items: detectedItems, total }
    };
  }

  const product = findProduct(message, products);
  if (product) {
    return { reply: `${product.name} tersedia, harganya ${rupiah(product.price)} dan stok saat ini ${product.stock}. Mau pesan berapa?` };
  }

  if (text.includes('jam') || text.includes('buka')) {
    return { reply: `${demoUmkm.name} buka setiap hari pukul ${demoUmkm.openingHours}.` };
  }

  if (text.includes('alamat') || text.includes('lokasi')) {
    return { reply: `Lokasi ${demoUmkm.name}: ${demoUmkm.address}.` };
  }

  return { reply: `Halo! Saya siPandu, asisten ${demoUmkm.name}. Saya bisa bantu cek menu, harga, stok, dan mencatat pesanan. Ketik "menu" untuk melihat daftar produk.` };
}
