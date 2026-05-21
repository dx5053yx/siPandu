import { ShoppingCart, Clock } from 'lucide-react';
import { rupiah } from '@/lib/utils';

const demoOrders = [
  {
    id: 'ord_001',
    customerName: 'Budi',
    customerPhone: '628123456789',
    items: [
      { name: 'Mendoan', qty: 10, price: 2000 },
      { name: 'Es Teh', qty: 2, price: 4000 },
    ],
    totalEstimated: 28000,
    status: 'confirmed' as const,
    deliveryMethod: 'pickup' as const,
    createdAt: '2026-05-21T10:30:00',
  },
  {
    id: 'ord_002',
    customerName: 'Ani',
    customerPhone: '628987654321',
    items: [
      { name: 'Bakwan', qty: 5, price: 1500 },
      { name: 'Es Teh', qty: 1, price: 4000 },
    ],
    totalEstimated: 11500,
    status: 'draft' as const,
    deliveryMethod: 'delivery' as const,
    createdAt: '2026-05-21T11:15:00',
  },
  {
    id: 'ord_003',
    customerName: 'Citra',
    customerPhone: '628111222333',
    items: [{ name: 'Mendoan', qty: 3, price: 2000 }],
    totalEstimated: 6000,
    status: 'done' as const,
    deliveryMethod: 'pickup' as const,
    createdAt: '2026-05-21T09:00:00',
  },
];

const statusMap = {
  draft: { label: 'Draft', class: 'badge-neutral' },
  confirmed: { label: 'Dikonfirmasi', class: 'badge-info' },
  processing: { label: 'Diproses', class: 'badge-warning' },
  done: { label: 'Selesai', class: 'badge-success' },
  cancelled: { label: 'Dibatalkan', class: 'badge-danger' },
};

export default function OrdersPage() {
  return (
    <>
      <div className="dash-page-header">
        <h1>Pesanan</h1>
        <p>Lihat dan kelola pesanan yang masuk dari chat pelanggan.</p>
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="card stat-card">
          <div className="stat-label">Total Pesanan</div>
          <div className="stat-value">{demoOrders.length}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Estimasi Omzet</div>
          <div className="stat-value">{rupiah(demoOrders.reduce((s, o) => s + o.totalEstimated, 0))}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Draft</div>
          <div className="stat-value">{demoOrders.filter((o) => o.status === 'draft').length}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Selesai</div>
          <div className="stat-value">{demoOrders.filter((o) => o.status === 'done').length}</div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Pelanggan</th>
                <th>Items</th>
                <th>Total</th>
                <th>Metode</th>
                <th>Status</th>
                <th>Waktu</th>
              </tr>
            </thead>
            <tbody>
              {demoOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong style={{ fontWeight: 700 }}>{order.customerName}</strong>
                    <p style={{ color: '#5a7e6a', fontSize: '0.8rem' }}>{order.customerPhone}</p>
                  </td>
                  <td>
                    {order.items.map((item, i) => (
                      <div key={i} style={{ fontSize: '0.85rem' }}>
                        {item.name} x{item.qty}
                      </div>
                    ))}
                  </td>
                  <td style={{ fontWeight: 700 }}>{rupiah(order.totalEstimated)}</td>
                  <td>
                    <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>
                      {order.deliveryMethod}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${statusMap[order.status].class}`}>
                      {statusMap[order.status].label}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#5a7e6a' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={14} />
                      {new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
