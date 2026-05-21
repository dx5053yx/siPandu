'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bot, Send, ArrowLeft, Sparkles } from 'lucide-react';

type ChatMessage = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  intent?: string;
};

export default function SimulatorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      text: 'Halo! Saya siPandu, asisten Warung Mendoan Bu Sari. Ketik "menu" untuk lihat daftar produk, atau langsung tanya apa saja! 😊',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/mock/inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: 'demo_warung_mendoan',
          customerPhone: '628123456789',
          customerName: 'Demo User',
          message: currentInput,
        }),
      });

      const data = await res.json();

      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: data.reply || 'Maaf, terjadi kesalahan. Coba lagi ya.',
        sender: 'bot',
        timestamp: new Date(),
        intent: data.intent,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: 'Maaf, gagal menghubungi server. Pastikan dev server berjalan.',
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const quickMessages = [
    'menu',
    'Mendoan ready?',
    'Pesan 5 mendoan sama 2 es teh',
    'Jam buka berapa?',
    'Alamat di mana?',
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f5fbf7' }}>
      {/* Header */}
      <div
        style={{
          background: 'white',
          borderBottom: '1px solid #d8eadf',
          padding: '1rem 0',
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/" className="btn btn-ghost btn-sm">
            <ArrowLeft size={16} />
            Kembali
          </Link>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
              <Sparkles size={20} style={{ display: 'inline', marginRight: '0.5rem', color: '#16a34a' }} />
              Chat Simulator
            </h1>
            <p style={{ color: '#5a7e6a', fontSize: '0.8rem' }}>
              Uji chatbot tanpa WhatsApp — langsung kirim pesan ke bot siPandu
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="container" style={{ padding: '1.5rem 0', maxWidth: '700px' }}>
        {/* Quick Messages */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {quickMessages.map((msg) => (
            <button
              key={msg}
              className="btn btn-ghost btn-sm"
              onClick={() => setInput(msg)}
              style={{ fontSize: '0.8rem' }}
            >
              {msg}
            </button>
          ))}
        </div>

        {/* Messages */}
        <div
          className="card"
          style={{
            height: 'calc(100vh - 320px)',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`bubble ${msg.sender === 'user' ? 'bubble-user' : 'bubble-bot'}`}
              >
                <div className="bubble-label">
                  {msg.sender === 'user' ? 'Kamu' : 'siPandu Bot'}
                  {msg.intent && (
                    <span className="badge badge-info" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>
                      {msg.intent}
                    </span>
                  )}
                </div>
                <div style={{ whiteSpace: 'pre-line' }}>{msg.text}</div>
              </div>
            ))}

            {loading && (
              <div className="bubble bubble-bot">
                <div className="bubble-label">siPandu Bot</div>
                <div className="loading-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="chat-input-bar">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik pesan... coba: menu, pesan 3 mendoan"
              disabled={loading}
            />
            <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()}>
              <Send size={18} />
            </button>
          </form>
        </div>

        {/* Info */}
        <div style={{ textAlign: 'center', padding: '1rem', color: '#5a7e6a', fontSize: '0.8rem' }}>
          <Bot size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
          Endpoint: <code style={{ background: '#eaf7ef', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>POST /api/mock/inbound</code>
        </div>
      </div>
    </div>
  );
}
