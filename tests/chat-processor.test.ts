import { describe, expect, it } from 'vitest';
import { ruleBasedResponse } from '../src/lib/chat/processor';
import { demoMerchant, demoProducts } from '../src/lib/demo/data';

describe('ruleBasedResponse', () => {
  it('returns a product menu from demo products', () => {
    const result = ruleBasedResponse('menu apa saja?', demoMerchant, demoProducts);

    expect(result.intent).toBe('tanya_produk');
    expect(result.reply).toContain('Mendoan');
    expect(result.reply).toContain('Es Teh');
    expect(result.orderDraft).toBeNull();
  });

  it('extracts multiple ordered products with quantities', () => {
    const result = ruleBasedResponse(
      'Pesan 5 mendoan sama 2 es teh',
      demoMerchant,
      demoProducts
    );

    expect(result.intent).toBe('pesan');
    expect(result.needsHuman).toBe(false);
    expect(result.orderDraft).toEqual({
      items: [
        { name: 'Mendoan', qty: 5 },
        { name: 'Es Teh', qty: 2 },
      ],
      deliveryMethod: 'unknown',
    });
    expect(result.reply).toContain('Total estimasi');
    expect(result.reply.replace(/\s/g, '')).toContain('Rp18.000');
  });

  it('marks complaints as needing a human follow-up', () => {
    const result = ruleBasedResponse('Pesanan lama sekali, saya komplain', demoMerchant, demoProducts);

    expect(result.intent).toBe('komplain');
    expect(result.needsHuman).toBe(true);
    expect(result.orderDraft).toBeNull();
  });
});
