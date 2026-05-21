import { BarChart3, MessageSquare, ShoppingCart, TrendingUp } from 'lucide-react';
import {
  getDashboardChats,
  getDashboardOrders,
  getDashboardProducts,
  rankAskedProducts,
  rankOrderedProducts,
} from '@/lib/dashboard/data';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const [products, orders, chats] = await Promise.all([
    getDashboardProducts(),
    getDashboardOrders(),
    getDashboardChats(undefined, true),
  ]);
  const topAsked = rankAskedProducts(products, chats);
  const topOrdered = rankOrderedProducts(orders);
  const conversionRate = chats.length > 0 ? Math.round((orders.length / chats.length) * 100) : 0;

  return (
    <>
      <div className="dash-page-header">
        <h1>Analisis</h1>
        <p>Insight sederhana tentang chat dan pesanan UMKM.</p>
      </div>

      <div className="stat-grid" style={{ marginBottom: '2rem' }}>
        <div className="card stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="stat-label">Total Chat</div>
              <div className="stat-value">{chats.length}</div>
            </div>
            <MessageSquare size={24} style={{ color: '#3b82f6' }} />
          </div>
        </div>
        <div className="card stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="stat-label">Total Pesanan</div>
              <div className="stat-value">{orders.length}</div>
            </div>
            <ShoppingCart size={24} style={{ color: '#16a34a' }} />
          </div>
        </div>
        <div className="card stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="stat-label">Rasio Konversi</div>
              <div className="stat-value">{conversionRate}%</div>
            </div>
            <TrendingUp size={24} style={{ color: '#8b5cf6' }} />
          </div>
        </div>
        <div className="card stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div className="stat-label">Produk Terlaris</div>
              <div className="stat-value">{topOrdered[0]?.name ?? '—'}</div>
            </div>
            <BarChart3 size={24} style={{ color: '#f59e0b' }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Top Asked */}
        <div className="card">
          <div className="card-body">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>
              Produk Paling Sering Ditanya
            </h2>
            {topAsked.map((item, i) => {
              const maxCount = topAsked[0].count;
              const pct = (item.count / maxCount) * 100;
              return (
                <div key={item.name} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    <span>{i + 1}. {item.name}</span>
                    <span style={{ color: '#5a7e6a' }}>{item.count}x</span>
                  </div>
                  <div style={{ height: 8, background: '#eaf7ef', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #16a34a, #22a867)', borderRadius: 999, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              );
            })}
            {topAsked.length === 0 && (
              <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                <MessageSquare />
                <h3>Belum ada pertanyaan produk</h3>
                <p>Data akan terisi dari riwayat chat pelanggan.</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Ordered */}
        <div className="card">
          <div className="card-body">
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>
              Produk Paling Sering Dipesan
            </h2>
            {topOrdered.map((item, i) => {
              const maxCount = topOrdered[0].count;
              const pct = (item.count / maxCount) * 100;
              return (
                <div key={item.name} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    <span>{i + 1}. {item.name}</span>
                    <span style={{ color: '#5a7e6a' }}>{item.count}x</span>
                  </div>
                  <div style={{ height: 8, background: '#eaf7ef', borderRadius: 999, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', borderRadius: 999, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              );
            })}
            {topOrdered.length === 0 && (
              <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                <ShoppingCart />
                <h3>Belum ada produk dipesan</h3>
                <p>Produk akan muncul setelah order draft tercatat.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
