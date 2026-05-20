import { demoProducts, demoUmkm } from '@/lib/demo-data';

export default function DashboardPage() {
  return (
    <main className="dashboard">
      <section className="container dash-shell">
        <div className="dash-header">
          <div>
            <p className="eyebrow">Dashboard UMKM</p>
            <h1>{demoUmkm.name}</h1>
            <p className="muted">Pantau pesanan WhatsApp, produk, stok, dan insight penjualan.</p>
          </div>
        </div>
        <div className="stat-grid">
          <article className="card stat-card"><span>Pesanan hari ini</span><strong>18</strong></article>
          <article className="card stat-card"><span>Estimasi omzet</span><strong>642 ribu</strong></article>
          <article className="card stat-card"><span>Chat masuk</span><strong>74</strong></article>
          <article className="card stat-card"><span>Produk aktif</span><strong>{demoProducts.length}</strong></article>
        </div>
        <section className="card panel">
          <h2>Produk aktif</h2>
          {demoProducts.map((product) => (
            <div className="row" key={product.id}>
              <div><strong>{product.name}</strong><span>Stok {product.stock}</span></div>
              <div>{product.price.toLocaleString('id-ID')}</div>
            </div>
          ))}
        </section>
      </section>
    </main>
  );
}
