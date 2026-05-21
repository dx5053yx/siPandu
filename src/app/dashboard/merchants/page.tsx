import { Store, MapPin, Phone, Clock } from 'lucide-react';
import { getDashboardMerchant } from '@/lib/dashboard/data';

export const dynamic = 'force-dynamic';

export default async function MerchantsPage() {
  const merchant = await getDashboardMerchant();

  return (
    <>
      <div className="dash-page-header">
        <h1>Kelola UMKM</h1>
        <p>Lihat dan edit profil UMKM yang terdaftar.</p>
      </div>

      <div className="card">
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: 'linear-gradient(135deg, rgba(22,163,74,.1), rgba(22,163,74,.05))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#16a34a',
                flexShrink: 0,
              }}
            >
              <Store size={28} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{merchant.name}</h2>
                <span className={`badge ${merchant.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                  {merchant.status}
                </span>
                {merchant.isPremium && <span className="badge badge-info">Premium</span>}
              </div>
              <p style={{ color: '#4d6558', fontSize: '0.9rem', marginBottom: '1rem' }}>
                {merchant.description}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#5a7e6a' }}>
                  <MapPin size={16} />
                  {merchant.address}, {merchant.city}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#5a7e6a' }}>
                  <Phone size={16} />
                  {merchant.phone}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#5a7e6a' }}>
                  <Clock size={16} />
                  {merchant.openingHours}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-body">
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>Detail Konfigurasi</h2>
          <table className="data-table">
            <tbody>
              <tr>
                <td style={{ fontWeight: 700, width: '200px' }}>Merchant ID</td>
                <td><code style={{ background: '#eaf7ef', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.85rem' }}>{merchant.id}</code></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700 }}>Kategori</td>
                <td style={{ textTransform: 'capitalize' }}>{merchant.category}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700 }}>Owner</td>
                <td>{merchant.ownerName}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700 }}>WhatsApp</td>
                <td>{merchant.whatsappNumber}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700 }}>AI Tone</td>
                <td style={{ textTransform: 'capitalize' }}>{merchant.aiTone}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 700 }}>Fallback Message</td>
                <td style={{ color: '#5a7e6a', fontStyle: 'italic' }}>{merchant.fallbackMessage}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
