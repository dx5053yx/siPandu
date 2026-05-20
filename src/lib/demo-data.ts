import type { Product } from './types';

export const demoUmkm = {
  id: 'demo-geprek-maju',
  name: 'Geprek Maju Purbalingga',
  category: 'Kuliner',
  address: 'Purbalingga Kota',
  openingHours: '09.00 - 21.00',
  phone: '6280000000000'
};

export const demoProducts: Product[] = [
  { id: 'ayam-geprek', name: 'Ayam Geprek', price: 15000, stock: 24, description: 'Ayam geprek sambal bawang' },
  { id: 'es-teh', name: 'Es Teh', price: 5000, stock: 40, description: 'Es teh manis segar' },
  { id: 'nasi-telur', name: 'Nasi Telur', price: 12000, stock: 18, description: 'Nasi telur dadar sambal' }
];
