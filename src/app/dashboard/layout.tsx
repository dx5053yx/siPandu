'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bot,
  LayoutDashboard,
  Store,
  Package,
  ShoppingCart,
  MessageSquare,
  BarChart3,
  LogOut,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/merchants', icon: Store, label: 'UMKM' },
  { href: '/dashboard/products', icon: Package, label: 'Produk' },
  { href: '/dashboard/orders', icon: ShoppingCart, label: 'Pesanan' },
  { href: '/dashboard/chats', icon: MessageSquare, label: 'Chat' },
  { href: '/dashboard/analytics', icon: BarChart3, label: 'Analisis' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="dash-layout">
      {/* Sidebar */}
      <aside className="dash-sidebar">
        <Link href="/" className="dash-sidebar-brand">
          <Bot size={24} />
          siPandu
        </Link>

        <nav className="dash-nav">
          {navItems.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={isActive ? 'active' : ''}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: '1rem', marginTop: '1rem' }}>
          <Link
            href="/simulator"
            className=""
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              color: '#7cd9a8',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            <Sparkles size={20} />
            Simulator Chat
          </Link>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              color: '#9bbaa6',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            <LogOut size={20} />
            Keluar
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dash-main">
        {children}
      </main>
    </div>
  );
}
