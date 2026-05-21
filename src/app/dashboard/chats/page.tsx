import { MessageSquare, User } from 'lucide-react';

const demoChats = [
  {
    id: 'chat_001',
    customerName: 'Budi',
    customerPhone: '628123456789',
    channel: 'whatsapp',
    lastMessage: 'Pesan 10 mendoan sama 2 es teh',
    lastIntent: 'pesan',
    status: 'handled' as const,
    messages: [
      { sender: 'customer', text: 'Halo, mendoan ready?', time: '10:28' },
      { sender: 'bot', text: 'Halo Kak, mendoan ready ya. Harganya Rp2.000/pcs. Mau pesan berapa?', time: '10:28' },
      { sender: 'customer', text: 'Pesan 10 mendoan sama 2 es teh', time: '10:29' },
      { sender: 'bot', text: 'Siap Kak! 10 Mendoan + 2 Es Teh. Total Rp28.000. Pickup atau antar?', time: '10:29' },
    ],
  },
  {
    id: 'chat_002',
    customerName: 'Ani',
    customerPhone: '628987654321',
    channel: 'mock',
    lastMessage: 'Bakwan masih ada?',
    lastIntent: 'tanya_produk',
    status: 'open' as const,
    messages: [
      { sender: 'customer', text: 'Bakwan masih ada?', time: '11:10' },
      { sender: 'bot', text: 'Bakwan tinggal sedikit. Harganya Rp1.500. Mau pesan?', time: '11:10' },
    ],
  },
];

const statusBadge = { open: 'badge-success', handled: 'badge-neutral', needs_human: 'badge-danger' };
const statusLabel = { open: 'Aktif', handled: 'Selesai', needs_human: 'Butuh Admin' };

export default function ChatsPage() {
  return (
    <>
      <div className="dash-page-header">
        <h1>Riwayat Chat</h1>
        <p>Percakapan pelanggan dan respons bot siPandu.</p>
      </div>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {demoChats.map((chat) => (
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
                    <div className="bubble-label">{msg.sender === 'customer' ? chat.customerName : 'Bot'} {msg.time}</div>
                    <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
