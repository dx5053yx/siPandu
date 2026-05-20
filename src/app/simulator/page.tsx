export default function SimulatorPage() {
  return (
    <main className="dashboard">
      <section className="container dash-shell">
        <p className="eyebrow">Chat simulator</p>
        <h1>Uji chatbot tanpa WhatsApp</h1>
        <p className="muted">Pakai endpoint API bot untuk mengetes alur menu, cek stok, dan pencatatan pesanan.</p>
        <div className="card panel">
          <p>Contoh pesan:</p>
          <pre>pesan 2 Ayam Geprek dan 1 Es Teh atas nama Budi</pre>
          <p>Endpoint:</p>
          <pre>POST /api/bot</pre>
        </div>
      </section>
    </main>
  );
}
