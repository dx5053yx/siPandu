import { ShoppingCart, Clock } from 'lucide-react';
import { rupiah } from '@/lib/utils';
import { getDashboardOrders } from '@/lib/dashboard/data';

const statusMap = {
  draft: { label: 'Draft', class: 'badge-neutral' },
  confirmed: { label: 'Dikonfirmasi', class: 'badge-info' },
  processing: { label: 'Diproses', class: 'badge-warning' },
  done: { label: 'Selesai', class: 'badge-success' },
  cancelled: { label: 'Dibatalkan', class: 'badge-danger' },
};

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const orders = await getDashboardOrders();

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
          <div className="stat-value">{orders.length}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Estimasi Omzet</div>
          <div className="stat-value">{rupiah(orders.reduce((s, o) => s + o.totalEstimated, 0))}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Draft</div>
          <div className="stat-value">{orders.filter((o) => o.status === 'draft').length}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Selesai</div>
          <div className="stat-value">{orders.filter((o) => o.status === 'done').length}</div>
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
              {orders.map((order) => (
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
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="empty-state">
              <ShoppingCart />
              <h3>Belum ada pesanan</h3>
              <p>Pesanan dari chat pelanggan akan muncul di sini.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
