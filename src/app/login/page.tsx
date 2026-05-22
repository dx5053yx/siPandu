'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bot, LogIn, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = isRegister
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (result.error) {
        throw result.error;
      }

      if (isRegister) {
        setError('Akun dibuat. Cek email jika Supabase meminta konfirmasi, lalu masuk kembali.');
        return;
      }

      router.push('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      const normalizedMessage = message.toLowerCase();

      if (
        normalizedMessage.includes('invalid login credentials') ||
        normalizedMessage.includes('invalid credentials')
      ) {
        setError('Email atau password salah.');
      } else if (normalizedMessage.includes('email not confirmed')) {
        setError('Email belum dikonfirmasi. Cek inbox email kamu dulu.');
      } else if (normalizedMessage.includes('user not found')) {
        setError('Akun tidak ditemukan. Silakan daftar dulu.');
      } else if (
        normalizedMessage.includes('already registered') ||
        normalizedMessage.includes('user already registered')
      ) {
        setError('Email sudah terdaftar. Silakan login.');
      } else if (normalizedMessage.includes('password')) {
        setError('Password minimal 6 karakter.');
      } else if (normalizedMessage.includes('supabase') || normalizedMessage.includes('url is required')) {
        setError('Supabase belum dikonfigurasi. Silakan isi .env.local dengan URL dan publishable key Supabase.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="card login-card">
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#16a34a',
              fontWeight: 800,
              fontSize: '1.25rem',
              textDecoration: 'none',
            }}
          >
            <Bot size={28} />
            siPandu
          </Link>
        </div>
        <h1>{isRegister ? 'Daftar Akun' : 'Masuk ke Dashboard'}</h1>
        <p className="subtitle">
          {isRegister
            ? 'Buat akun untuk mengelola UMKM kamu.'
            : 'Kelola UMKM, produk, dan pesanan dari satu tempat.'}
        </p>

        {error && (
          <div
            style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#5a7e6a',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? (
              <div className="loading-dots">
                <span></span><span></span><span></span>
              </div>
            ) : (
              <>
                <LogIn size={18} />
                {isRegister ? 'Daftar' : 'Masuk'}
              </>
            )}
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            fontSize: '0.85rem',
            color: '#4d6558',
          }}
        >
          {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#16a34a',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {isRegister ? 'Masuk di sini' : 'Daftar di sini'}
          </button>
        </p>
      </div>
    </div>
  );
}
