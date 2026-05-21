import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'siPandu — Chatbot AI untuk UMKM Purbalingga',
  description:
    'Platform chatbot AI yang membantu UMKM Purbalingga menjawab chat pelanggan otomatis, mencatat pesanan, dan memberikan insight penjualan.',
  keywords: ['siPandu', 'UMKM', 'chatbot', 'Purbalingga', 'WhatsApp', 'AI'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
