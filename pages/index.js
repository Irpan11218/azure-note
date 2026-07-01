import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AuthPage() {
  const router = useRouter();
  const [tab, setTab] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/user').then(r => { if (r.ok) router.replace('/dashboard'); }).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/auth/${tab}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-hero">
          <div className="cloud cloud-1" />
          <div className="cloud cloud-2" />
          <div className="cloud cloud-3" />
          <div className="cloud cloud-4" />
          <div className="cloud cloud-5" />
          <h1>Azure Notes App</h1>
          <p>Kelola catatan Anda dengan mudah dan efisien</p>
        </div>
        <div className="auth-form-section">
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setError(''); }}>
              Masuk
            </button>
            <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setError(''); }}>
              Daftar
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>{tab === 'login' ? 'Selamat Datang!' : 'Buat Akun Baru'}</h2>
            <p className="subtitle">
              {tab === 'login' ? 'Masuk untuk melanjutkan ke akun Anda' : 'Daftar untuk mulai menggunakan Azure Notes'}
            </p>

            {error && <p className="error-msg">{error}</p>}

            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : (tab === 'login' ? 'Masuk' : 'Daftar')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
