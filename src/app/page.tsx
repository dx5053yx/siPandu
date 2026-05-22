import Link from 'next/link';
import {
  MessageSquare,
  ShoppingCart,
  BarChart3,
  Clock,
  Package,
  Users,
  Zap,
  Shield,
  ArrowRight,
  Bot,
} from 'lucide-react';

export default function HomePage() {
  return (
    <>
      {/* ── Navbar ── */}
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="navbar-brand">
            <Bot />
            siPandu
          </Link>
          <div className="navbar-links">
            <a href="#fitur">Fitur</a>
            <a href="#cara-kerja">Cara Kerja</a>
            <a href="#harga">Harga</a>
            <Link href="/login" className="btn btn-primary btn-sm">
              Masuk Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* ── Hero ── */}
        <section className="hero">
          <div className="container hero-grid">
            <div>
              <div className="hero-eyebrow">
                <Zap size={14} />
                Platform AI untuk UMKM
              </div>
              <h1>
                Chatbot <span>AI</span> untuk UMKM Purbalingga
              </h1>
              <p className="lead">
                siPandu membantu UMKM menjawab chat pelanggan 24/7, mencatat pesanan otomatis,
                dan memberikan insight penjualan — semua lewat WhatsApp.
              </p>
              <div className="hero-actions">
                <Link href="/login" className="btn btn-primary btn-lg">
                  Daftarkan UMKM
                  <ArrowRight size={18} />
                </Link>
                <Link href="/simulator" className="btn btn-outline btn-lg">
                  Coba Simulator
                </Link>
              </div>
            </div>

            {/* Phone mockup */}
            <div className="phone-mockup">
              <div className="phone-header">
                <MessageSquare size={18} />
                Warung Mendoan Bu Sari
              </div>
              <div className="phone-messages">
                <div className="bubble bubble-user">
                  <div className="bubble-label">Pelanggan</div>
                  Halo, mendoan ready?
                </div>
                <div className="bubble bubble-bot">
                  <div className="bubble-label">siPandu Bot</div>
                  Halo Kak, mendoan ready ya. Harganya Rp2.000/pcs. Mau pesan berapa? 😊
                </div>
                <div className="bubble bubble-user">
                  <div className="bubble-label">Pelanggan</div>
                  Pesan 10 mendoan sama 2 es teh, ambil jam 5 sore
                </div>
                <div className="bubble bubble-bot">
                  <div className="bubble-label">siPandu Bot</div>
                  Siap Kak! Pesanannya:
                  <br />• 10 Mendoan — Rp20.000
                  <br />• 2 Es Teh — Rp8.000
                  <br />Total: Rp28.000
                  <br />Pickup jam 17.00. Konfirmasi nama pemesan ya! ✅
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section className="section" id="fitur">
          <div className="container">
            <div className="section-header">
              <p className="eyebrow">Fitur Utama</p>
              <h2>Semua yang UMKM Butuhkan</h2>
              <p>Dari balasan otomatis sampai analisis penjualan, siPandu siap bantu UMKM kamu naik level.</p>
            </div>
            <div className="feature-grid">
              <div className="card feature-card">
                <div className="feature-icon">
                  <MessageSquare size={24} />
                </div>
                <h3>Auto-Reply 24/7</h3>
                <p>Bot menjawab pertanyaan pelanggan soal produk, harga, stok, dan jam buka secara otomatis.</p>
              </div>
              <div className="card feature-card">
                <div className="feature-icon">
                  <ShoppingCart size={24} />
                </div>
                <h3>Catat Pesanan Otomatis</h3>
                <p>AI mendeteksi pesanan dari chat dan langsung mencatat ke sistem tanpa input manual.</p>
              </div>
              <div className="card feature-card">
                <div className="feature-icon">
                  <BarChart3 size={24} />
                </div>
                <h3>Insight Penjualan</h3>
                <p>Dashboard analisis sederhana: total chat, pesanan, dan produk paling populer.</p>
              </div>
              <div className="card feature-card">
                <div className="feature-icon">
                  <Package size={24} />
                </div>
                <h3>Kelola Katalog Produk</h3>
                <p>Tambah, edit, dan atur produk dari dashboard. Bot langsung pakai data terbaru.</p>
              </div>
              <div className="card feature-card">
                <div className="feature-icon">
                  <Users size={24} />
                </div>
                <h3>Multi-UMKM</h3>
                <p>Satu platform untuk banyak UMKM. Data terisolasi per toko untuk keamanan.</p>
              </div>
              <div className="card feature-card">
                <div className="feature-icon">
                  <Shield size={24} />
                </div>
                <h3>Aman & Terpercaya</h3>
                <p>Data tersimpan di Supabase, dilindungi autentikasi, dan disiapkan terpisah per UMKM.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── How It Works ── */}
        <section className="section" id="cara-kerja" style={{ background: 'white' }}>
          <div className="container">
            <div className="section-header">
              <p className="eyebrow">Cara Kerja</p>
              <h2>Mulai dalam 4 Langkah</h2>
              <p>Setup cepat, langsung bisa dipakai. Tidak perlu skill teknis.</p>
            </div>
            <div className="steps-grid">
              <div className="card step-card">
                <div className="step-number">1</div>
                <h3>Daftarkan UMKM</h3>
                <p>Isi profil toko: nama, kategori, alamat, dan jam operasional.</p>
              </div>
              <div className="card step-card">
                <div className="step-number">2</div>
                <h3>Input Produk</h3>
                <p>Masukkan produk, harga, dan stok ke dalam katalog digital.</p>
              </div>
              <div className="card step-card">
                <div className="step-number">3</div>
                <h3>Chat Masuk</h3>
                <p>Pelanggan chat lewat WhatsApp, bot siPandu langsung menjawab.</p>
              </div>
              <div className="card step-card">
                <div className="step-number">4</div>
                <h3>Pesanan Tercatat</h3>
                <p>Bot mendeteksi pesanan dan mencatatnya otomatis ke dashboard.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section className="section" id="harga">
          <div className="container">
            <div className="section-header">
              <p className="eyebrow">Harga</p>
              <h2>Pilih Paket yang Cocok</h2>
              <p>Mulai gratis, upgrade kapan saja.</p>
            </div>
            <div className="pricing-grid">
              <div className="card pricing-card">
                <p className="eyebrow" style={{ marginBottom: '0.25rem' }}>Gratis</p>
                <div className="pricing-price">
                  Rp0<span>/bulan</span>
                </div>
                <p>Cocok untuk UMKM yang baru mulai.</p>
                <ul className="pricing-features">
                  <li>Profil UMKM</li>
                  <li>Katalog produk dasar</li>
                  <li>Auto-reply chat</li>
                  <li>Pencatatan pesanan</li>
                  <li>Dashboard sederhana</li>
                </ul>
                <Link href="/login" className="btn btn-outline" style={{ width: '100%' }}>
                  Mulai Gratis
                </Link>
              </div>
              <div className="card pricing-card premium">
                <div className="pricing-badge">POPULER</div>
                <p className="eyebrow" style={{ marginBottom: '0.25rem', color: '#7cd9a8' }}>
                  Premium
                </p>
                <div className="pricing-price">
                  Rp100.000<span>/bulan</span>
                </div>
                <p>Untuk UMKM yang ingin grow lebih cepat.</p>
                <ul className="pricing-features">
                  <li>Semua fitur Gratis</li>
                  <li>Prioritas rekomendasi</li>
                  <li>Analytics lanjutan</li>
                  <li>Support prioritas</li>
                  <li>Custom AI tone</li>
                </ul>
                <Link href="/login" className="btn btn-primary" style={{ width: '100%' }}>
                  Upgrade Premium
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="section" style={{ background: 'white', textAlign: 'center' }}>
          <div className="container">
            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.75rem' }}>
              Siap Tingkatkan Penjualan UMKM Kamu?
            </h2>
            <p style={{ color: '#4d6558', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
              Gabung dengan UMKM Purbalingga lainnya yang sudah pakai siPandu.
            </p>
            <Link href="/login" className="btn btn-primary btn-lg">
              Daftarkan UMKM Sekarang
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="container footer-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800 }}>
            <Bot size={20} />
            siPandu
          </div>
          <p style={{ fontSize: '0.85rem' }}>
            © 2026 siPandu — Platform Chatbot AI untuk UMKM Purbalingga
          </p>
        </div>
      </footer>
    </>
  );
}
