import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

/* ─── Icons (inline SVG components) ─── */
const IconDashboard = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
const IconNotes = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const IconSettings = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
const IconUser = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconLogout = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const IconMenu = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
const IconX = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconCloud = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/></svg>;

/* ─── Helpers ─── */
function formatCurrency(n) {
  return 'Rp ' + Number(n || 0).toLocaleString('id-ID');
}

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUS_COLORS = {
  Menunggu: '#eab308',
  Berjalan: '#3b82f6',
  Selesai: '#22c55e',
  Gagal: '#ef4444',
};

const STATUS_LIST = ['Menunggu', 'Berjalan', 'Selesai', 'Gagal'];

const THEMES = [
  { name: 'azure', color: '#2563eb', label: 'Azure' },
  { name: 'green', color: '#22c55e', label: 'Hijau' },
  { name: 'purple', color: '#8b5cf6', label: 'Ungu' },
  { name: 'orange', color: '#f97316', label: 'Oranye' },
  { name: 'red', color: '#ef4444', label: 'Merah' },
  { name: 'teal', color: '#0f766e', label: 'Teal' },
];

/* ─── Main Component ─── */
export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [settings, setSettings] = useState({ theme: 'azure', dark_mode: false, notifications: true });
  const [panel, setPanel] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  /* Fetch user data */
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/user');
      if (!res.ok) { router.replace('/'); return; }
      const data = await res.json();
      setUser(data.user);
      setNotes(data.notes || []);
      if (data.settings) setSettings(data.settings);
    } catch {
      router.replace('/');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* Apply theme & dark mode */
  useEffect(() => {
    const body = document.body;
    THEMES.forEach(t => body.classList.remove(`theme-${t.name}`));
    body.classList.add(`theme-${settings.theme}`);
    body.classList.toggle('dark-mode', !!settings.dark_mode);
  }, [settings.theme, settings.dark_mode]);

  /* Logout */
  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/');
  }

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><span className="spinner" style={{ borderColor: '#ccc', borderTopColor: '#333', width: 32, height: 32 }} /></div>;

  const PANEL_TITLES = { dashboard: 'Dashboard', notes: 'Catatan', settings: 'Setting', account: 'Akun' };

  return (
    <div className="app-layout">
      {/* Sidebar overlay for mobile */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <IconCloud /> Azure Notes App
        </div>
        <nav className="sidebar-nav">
          {[
            { key: 'dashboard', icon: <IconDashboard />, label: 'Dashboard' },
            { key: 'notes', icon: <IconNotes />, label: 'Catatan' },
            { key: 'settings', icon: <IconSettings />, label: 'Setting' },
            { key: 'account', icon: <IconUser />, label: 'Akun' },
          ].map(item => (
            <button
              key={item.key}
              className={`nav-item ${panel === item.key ? 'active' : ''}`}
              onClick={() => { setPanel(item.key); setSidebarOpen(false); }}
            >
              {item.icon} {item.label}
            </button>
          ))}
          <button className="nav-item logout" onClick={handleLogout}>
            <IconLogout /> Logout
          </button>
        </nav>
      </aside>

      {/* Main */}
      <div className="main-content">
        <header className="header">
          <div className="header-left">
            <button className="hamburger" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <IconX /> : <IconMenu />}
            </button>
            <span className="header-title">{PANEL_TITLES[panel]}</span>
          </div>
          <div className="header-right">
            <div className="header-user">
              <img src={user?.profile_pic || `https://ui-avatars.com/api/?name=U&background=2563eb&color=fff&size=64`} alt="avatar" />
              <span>{user?.username || 'User'}</span>
            </div>
          </div>
        </header>

        <div className="page-content">
          {panel === 'dashboard' && <DashboardPanel notes={notes} />}
          {panel === 'notes' && <NotesPanel notes={notes} setNotes={setNotes} />}
          {panel === 'settings' && <SettingsPanel settings={settings} setSettings={setSettings} />}
          {panel === 'account' && <AccountPanel user={user} setUser={setUser} router={router} />}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   DASHBOARD PANEL
   ════════════════════════════════════════════════ */
function DashboardPanel({ notes }) {
  const counts = {};
  STATUS_LIST.forEach(s => { counts[s] = notes.filter(n => n.status === s).length; });
  const total = notes.length;
  const spending = notes.reduce((sum, n) => sum + Number(n.amount || 0), 0);

  /* Donut chart calculations */
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const segments = STATUS_LIST.map(s => {
    const pct = total > 0 ? counts[s] / total : 0;
    const dash = pct * circumference;
    const seg = { status: s, pct, dash, offset, color: STATUS_COLORS[s] };
    offset += dash;
    return seg;
  });

  return (
    <>
      <div className="cards-grid">
        <div className="stat-card status-total">
          <div className="label">Total Catatan</div>
          <div className="value">{total}</div>
          <div className="sub">Semua catatan</div>
        </div>
        <div className="stat-card status-spending">
          <div className="label">Total Pengeluaran</div>
          <div className="value">{formatCurrency(spending)}</div>
          <div className="sub">Akumulasi amount</div>
        </div>
        {STATUS_LIST.map(s => (
          <div key={s} className={`stat-card status-${s.toLowerCase()}`}>
            <div className="label">{s}</div>
            <div className="value">{counts[s]}</div>
            <div className="sub">{total > 0 ? Math.round(counts[s] / total * 100) : 0}% dari total</div>
          </div>
        ))}
      </div>

      <div className="chart-section">
        <h3>Distribusi Status</h3>
        <div className="chart-container">
          <div className="donut-chart">
            <svg viewBox="0 0 200 200">
              {segments.map(seg => (
                <circle
                  key={seg.status}
                  cx="100" cy="100" r={radius}
                  stroke={seg.color}
                  strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
                  strokeDashoffset={-seg.offset}
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />
              ))}
              {total === 0 && (
                <circle cx="100" cy="100" r={radius} stroke="#e2e8f0" strokeDasharray={`${circumference} 0`} />
              )}
            </svg>
            <div className="donut-center">
              <div className="total">{total}</div>
              <div className="label">Catatan</div>
            </div>
          </div>
          <div className="chart-legend">
            {STATUS_LIST.map(s => (
              <div key={s} className="legend-item">
                <span className="legend-dot" style={{ background: STATUS_COLORS[s] }} />
                <span>{s}</span>
                <span className="legend-pct">{total > 0 ? Math.round(counts[s] / total * 100) : 0}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════
   NOTES PANEL
   ════════════════════════════════════════════════ */
function NotesPanel({ notes, setNotes }) {
  const [filter, setFilter] = useState('default');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [popupNote, setPopupNote] = useState(null);
  const perPage = 10;

  /* Filtered & sorted */
  let sorted = [...notes];
  if (filter === 'newest') sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
  else if (filter === 'oldest') sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
  else if (filter === 'highest') sorted.sort((a, b) => Number(b.amount) - Number(a.amount));
  else if (filter === 'lowest') sorted.sort((a, b) => Number(a.amount) - Number(b.amount));

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  async function handleDelete(id) {
    if (!confirm('Yakin ingin menghapus catatan ini?')) return;
    const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    if (res.ok) setNotes(notes.filter(n => n.id !== id));
  }

  function openCreate() { setEditNote(null); setModalOpen(true); }
  function openEdit(note) { setEditNote(note); setModalOpen(true); }

  function handleSaved(saved) {
    if (editNote) {
      setNotes(notes.map(n => n.id === saved.id ? saved : n));
    } else {
      setNotes([saved, ...notes]);
    }
    setModalOpen(false);
  }

  return (
    <>
      <div className="table-header">
        <h3>Daftar Catatan</h3>
        <div className="table-controls">
          <select className="filter-select" value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}>
            <option value="default">Default</option>
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="highest">Harga Tertinggi</option>
            <option value="lowest">Harga Terendah</option>
          </select>
          <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Tambah Catatan</button>
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Nama</th>
              <th>Catatan</th>
              <th>Status</th>
              <th>Jumlah</th>
              <th>Tanggal</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={7} className="table-empty">Belum ada catatan</td></tr>
            ) : paginated.map((n, i) => (
              <tr key={n.id}>
                <td>{(page - 1) * perPage + i + 1}</td>
                <td className="clickable" onClick={() => setPopupNote(n)}>{n.name}</td>
                <td className="clickable" onClick={() => setPopupNote(n)}>{n.note}</td>
                <td><span className={`status-tag status-${n.status.toLowerCase()}`}>{n.status}</span></td>
                <td>{formatCurrency(n.amount)}</td>
                <td>{formatDate(n.date)}</td>
                <td>
                  <div className="table-actions">
                    <button className="btn btn-primary btn-sm" onClick={() => openEdit(n)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(n.id)}>Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>‹ Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} className={p === page ? 'active' : ''} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next ›</button>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && <NoteModal note={editNote} onClose={() => setModalOpen(false)} onSaved={handleSaved} />}

      {/* Detail Popup */}
      {popupNote && (
        <div className="modal-overlay" onClick={() => setPopupNote(null)}>
          <div className="modal popup-detail" onClick={e => e.stopPropagation()}>
            <h3>Detail Catatan</h3>
            <div className="detail-row"><span className="detail-label">Nama:</span><span className="detail-value">{popupNote.name}</span></div>
            <div className="detail-row"><span className="detail-label">Catatan:</span><span className="detail-value">{popupNote.note}</span></div>
            <div className="detail-row"><span className="detail-label">Status:</span><span className="detail-value"><span className={`status-tag status-${popupNote.status.toLowerCase()}`}>{popupNote.status}</span></span></div>
            <div className="detail-row"><span className="detail-label">Link:</span><span className="detail-value">{popupNote.link || '-'}</span></div>
            <div className="detail-row"><span className="detail-label">Wallet:</span><span className="detail-value">{popupNote.wallet || '-'}</span></div>
            <div className="detail-row"><span className="detail-label">Jumlah:</span><span className="detail-value">{formatCurrency(popupNote.amount)}</span></div>
            <div className="detail-row"><span className="detail-label">Tanggal:</span><span className="detail-value">{formatDate(popupNote.date)}</span></div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setPopupNote(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Note Create/Edit Modal ─── */
function NoteModal({ note, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: note?.name || '',
    note: note?.note || '',
    status: note?.status || 'Menunggu',
    link: note?.link || '',
    wallet: note?.wallet || '',
    amount: note?.amount || 0,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function set(k, v) { setForm(prev => ({ ...prev, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const url = note ? `/api/notes/${note.id}` : '/api/notes';
      const method = note ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSaved(data.note);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>{note ? 'Edit Catatan' : 'Tambah Catatan'}</h3>
        {error && <p className="error-msg">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nama</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Catatan</label>
            <textarea value={form.note} onChange={e => set('note', e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}>
              {STATUS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Link</label>
            <input value={form.link} onChange={e => set('link', e.target.value)} placeholder="https://..." />
          </div>
          <div className="form-group">
            <label>Wallet</label>
            <input value={form.wallet} onChange={e => set('wallet', e.target.value)} placeholder="Alamat wallet" />
          </div>
          <div className="form-group">
            <label>Jumlah (Rp)</label>
            <input type="number" value={form.amount} onChange={e => set('amount', e.target.value)} min="0" />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" /> : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   SETTINGS PANEL
   ════════════════════════════════════════════════ */
function SettingsPanel({ settings, setSettings }) {
  async function updateSetting(key, value) {
    setSettings(prev => ({ ...prev, [key]: value }));
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: value }),
    });
  }

  return (
    <>
      <div className="settings-section">
        <h3>Tema Warna</h3>
        <div className="theme-swatches">
          {THEMES.map(t => (
            <div
              key={t.name}
              className={`theme-swatch ${settings.theme === t.name ? 'active' : ''}`}
              style={{ background: t.color }}
              data-label={t.label}
              onClick={() => updateSetting('theme', t.name)}
            />
          ))}
        </div>
      </div>

      <div className="settings-section">
        <h3>Preferensi</h3>
        <div className="toggle-row">
          <div>
            <div className="toggle-label">Mode Gelap</div>
            <div className="toggle-desc">Aktifkan tampilan gelap untuk kenyamanan mata</div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={!!settings.dark_mode}
              onChange={e => updateSetting('dark_mode', e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>
        <div className="toggle-row">
          <div>
            <div className="toggle-label">Notifikasi</div>
            <div className="toggle-desc">Terima pemberitahuan untuk catatan penting</div>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={!!settings.notifications}
              onChange={e => updateSetting('notifications', e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════
   ACCOUNT PANEL
   ════════════════════════════════════════════════ */
function AccountPanel({ user, setUser, router }) {
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  function showMsg(type, text) { setMsg({ type, text }); setTimeout(() => setMsg({ type: '', text: '' }), 3000); }

  async function updateUsername(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'updateUsername', username }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUser(prev => ({ ...prev, username }));
      showMsg('success', data.message);
      setUsername('');
    } catch (err) { showMsg('error', err.message); }
    finally { setSaving(false); }
  }

  async function updatePassword(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'updatePassword', currentPassword, password: newPassword }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showMsg('success', data.message);
      setCurrentPassword(''); setNewPassword('');
    } catch (err) { showMsg('error', err.message); }
    finally { setSaving(false); }
  }

  async function updatePhoto(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'updateProfilePic', profilePic }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setUser(prev => ({ ...prev, profile_pic: profilePic }));
      showMsg('success', data.message);
      setProfilePic('');
    } catch (err) { showMsg('error', err.message); }
    finally { setSaving(false); }
  }

  async function deleteAccount() {
    if (!confirm('Yakin ingin menghapus akun? Semua data akan hilang!')) return;
    if (!confirm('Konfirmasi sekali lagi: hapus akun permanen?')) return;
    await fetch('/api/user', { method: 'DELETE' });
    router.replace('/');
  }

  return (
    <>
      {msg.text && <p className={msg.type === 'error' ? 'error-msg' : 'success-msg'} style={{ marginBottom: 16, fontSize: 14 }}>{msg.text}</p>}

      <div className="settings-section">
        <h3>Profil</h3>
        <div className="profile-preview">
          <img src={user?.profile_pic || `https://ui-avatars.com/api/?name=U&background=2563eb&color=fff&size=128`} alt="avatar" />
          <div className="profile-info">
            <h3>{user?.username}</h3>
            <p>ID: {user?.id}</p>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>Ubah Username</h3>
        <form onSubmit={updateUsername} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Username Baru</label>
            <input value={username} onChange={e => setUsername(e.target.value)} minLength={3} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>Simpan</button>
        </form>
      </div>

      <div className="settings-section">
        <h3>Ubah Password</h3>
        <form onSubmit={updatePassword}>
          <div className="form-group">
            <label>Password Lama</label>
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password Baru</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={6} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: 10 }}>Ubah Password</button>
        </form>
      </div>

      <div className="settings-section">
        <h3>Foto Profil</h3>
        <form onSubmit={updatePhoto} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>URL Foto</label>
            <input value={profilePic} onChange={e => setProfilePic(e.target.value)} placeholder="https://..." required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>Simpan</button>
        </form>
      </div>

      <div className="settings-section danger-zone">
        <h3>Zona Berbahaya</h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Menghapus akun akan menghilangkan semua data Anda secara permanen. Tindakan ini tidak dapat dibatalkan.
        </p>
        <button className="btn btn-danger" onClick={deleteAccount}>Hapus Akun</button>
      </div>
    </>
  );
}
