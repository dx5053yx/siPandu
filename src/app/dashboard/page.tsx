import {
  MessageSquare,
  ShoppingCart,
  AlertCircle,
  Package,
} from 'lucide-react';
import { demoMerchant, demoProducts } from '@/lib/firebase/seed';
import { rupiah } from '@/lib/utils';

export default function DashboardOverview() {
  const stats = [
    { label: 'Chat hari ini', value: '—', icon: MessageSquare, color: '#3b82f6' },
    { label: 'Total pesanan', value: '—', icon: ShoppingCart, color: '#16a34a' },
    { label: 'Butuh admin', value: '—', icon: AlertCircle, color: '#f59e0b' },
    { label: 'Produk aktif', value: String(demoProducts.length), icon: Package, color: '#8b5cf6' },
  ];

  return (
    <>
      <div className="dash-page-header">
        <h1>{demoMerchant.name}</h1>
        <p>Pantau chat pelanggan, pesanan, produk, dan insight penjualan UMKM kamu.</p>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: '2rem' }}>
        {stats.map((stat) => (
          <div className="card stat-card" key={stat.label}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-value">{stat.value}</div>
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: `${stat.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: stat.color,
                }}
              >
                <stat.icon size={22} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Products quick view */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-body">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>
            Produk Aktif
          </h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Harga</th>
                <th>Stok</th>
                <th>Kategori</th>
              </tr>
            </thead>
            <tbody>
              {demoProducts.map((product) => (
                <tr key={product.id}>
                  <td style={{ fontWeight: 700 }}>{product.name}</td>
                  <td>{rupiah(product.price)}</td>
                  <td>
                    <span
                      className={`badge ${
                        product.stockStatus === 'ready'
                          ? 'badge-success'
                          : product.stockStatus === 'limited'
                          ? 'badge-warning'
                          : 'badge-danger'
                      }`}
                    >
                      {product.stockStatus}
                    </span>
                  </td>
                  <td>{product.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info */}
      <div className="card">
        <div className="card-body">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Info UMKM
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
            <div>
              <strong style={{ color: '#5a7e6a', fontSize: '0.8rem' }}>Kategori</strong>
              <p style={{ fontWeight: 600, textTransform: 'capitalize' }}>{demoMerchant.category}</p>
            </div>
            <div>
              <strong style={{ color: '#5a7e6a', fontSize: '0.8rem' }}>Jam Buka</strong>
              <p style={{ fontWeight: 600 }}>{demoMerchant.openingHours}</p>
            </div>
            <div>
              <strong style={{ color: '#5a7e6a', fontSize: '0.8rem' }}>Alamat</strong>
              <p style={{ fontWeight: 600 }}>{demoMerchant.address}</p>
            </div>
            <div>
              <strong style={{ color: '#5a7e6a', fontSize: '0.8rem' }}>AI Tone</strong>
              <p style={{ fontWeight: 600, textTransform: 'capitalize' }}>{demoMerchant.aiTone}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
