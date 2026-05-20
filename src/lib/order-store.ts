import { FieldValue } from 'firebase-admin/firestore';
import { getAdminDb } from './firebase-admin';
import type { OrderItem } from './types';

export async function saveIncomingOrder(input: {
  umkmId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  source: 'openclaw' | 'simulator';
}) {
  const db = getAdminDb();
  const orderRef = db.collection('umkms').doc(input.umkmId).collection('orders').doc();

  await orderRef.set({
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    status: 'baru',
    total: input.total,
    source: input.source,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  const batch = db.batch();
  input.items.forEach((item) => {
    const itemRef = orderRef.collection('items').doc();
    batch.set(itemRef, item);
  });
  await batch.commit();

  return orderRef.id;
}
