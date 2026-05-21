import { getDashboardProducts } from '@/lib/dashboard/data';
import { rupiah } from '@/lib/utils';
import { Package } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const products = await getDashboardProducts();

  return (
    <>
      <div className="dash-page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1>Kelola Produk</h1>
            <p>Tambah, edit, dan atur produk UMKM.</p>
          </div>
          <button className="btn btn-primary">
            <Package size={18} />
            Tambah Produk
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Produk</th>
                <th>Harga</th>
                <th>Stok</th>
                <th>Kategori</th>
                <th>Keywords</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div>
                      <strong style={{ fontWeight: 700 }}>{product.name}</strong>
                      <p style={{ color: '#5a7e6a', fontSize: '0.8rem', marginTop: '0.15rem' }}>
                        {product.description}
                      </p>
                    </div>
                  </td>
                  <td style={{ fontWeight: 700 }}>{rupiah(product.price)}</td>
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
                  <td style={{ textTransform: 'capitalize' }}>{product.category}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {product.keywords.map((kw) => (
                        <span key={kw} className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                          {kw}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${product.isActive ? 'badge-success' : 'badge-neutral'}`}>
                      {product.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <div className="empty-state">
              <Package />
              <h3>Belum ada produk</h3>
              <p>Tambahkan produk pertama agar bot bisa menjawab katalog UMKM.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
