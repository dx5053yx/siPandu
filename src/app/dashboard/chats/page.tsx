import { MessageSquare, User } from 'lucide-react';
import { getDashboardChats } from '@/lib/dashboard/data';

const statusBadge = { open: 'badge-success', handled: 'badge-neutral', needs_human: 'badge-danger' };
const statusLabel = { open: 'Aktif', handled: 'Selesai', needs_human: 'Butuh Admin' };

export const dynamic = 'force-dynamic';

export default async function ChatsPage() {
  const chats = await getDashboardChats(undefined, true);

  return (
    <>
      <div className="dash-page-header">
        <h1>Riwayat Chat</h1>
        <p>Percakapan pelanggan dan respons bot siPandu.</p>
      </div>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {chats.map((chat) => (
          <div className="card" key={chat.id}>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#eaf7ef', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                    <User size={20} />
                  </div>
                  <div>
                    <strong>{chat.customerName}</strong>
                    <p style={{ color: '#5a7e6a', fontSize: '0.8rem' }}>{chat.customerPhone}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span className="badge badge-neutral">{chat.channel}</span>
                  <span className="badge badge-info">{chat.lastIntent}</span>
                  <span className={`badge ${statusBadge[chat.status]}`}>{statusLabel[chat.status]}</span>
                </div>
              </div>
              <div style={{ background: '#f5fbf7', borderRadius: 12, padding: '1rem', display: 'grid', gap: '0.5rem' }}>
                {chat.messages.map((msg, i) => (
                  <div key={i} className={`bubble ${msg.sender === 'customer' ? 'bubble-user' : 'bubble-bot'}`} style={{ maxWidth: '80%' }}>
                    <div className="bubble-label">
                      {msg.sender === 'customer' ? chat.customerName ?? 'Pelanggan' : 'Bot'}{' '}
                      {msg.createdAt
                        ? new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                        : ''}
                    </div>
                    <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                  </div>
                ))}
                {chat.messages.length === 0 && (
                  <div className="bubble bubble-user" style={{ maxWidth: '80%' }}>
                    <div className="bubble-label">{chat.customerName ?? 'Pelanggan'}</div>
                    <div style={{ whiteSpace: 'pre-line' }}>{chat.lastMessage}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {chats.length === 0 && (
          <div className="card">
            <div className="empty-state">
              <MessageSquare />
              <h3>Belum ada chat</h3>
              <p>Riwayat percakapan dari simulator atau webhook akan muncul di sini.</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
