import './globals.css';

export const metadata = {
  title: 'siPandu',
  description: 'Demo chatbot UMKM lokal berbasis WhatsApp.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
