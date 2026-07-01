const { getSql } = require('../../../lib/db');
const { setSessionCookie } = require('../../../lib/auth');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const sql = getSql();
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username dan password wajib diisi' });
    if (username.length < 3) return res.status(400).json({ error: 'Username minimal 3 karakter' });
    if (password.length < 6) return res.status(400).json({ error: 'Password minimal 6 karakter' });

    const existing = await sql`SELECT id FROM users WHERE username = ${username}`;
    if (existing.length > 0) return res.status(409).json({ error: 'Username sudah digunakan' });

    const passwordHash = await bcrypt.hash(password, 10);
    const profilePic = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=2563eb&color=fff&size=128`;

    const [user] = await sql`
      INSERT INTO users (username, password_hash, profile_pic)
      VALUES (${username}, ${passwordHash}, ${profilePic})
      RETURNING id, username, profile_pic
    `;

    await sql`INSERT INTO settings (user_id) VALUES (${user.id})`;

    const sessionId = crypto.randomUUID();
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await sql`INSERT INTO sessions (id, user_id, expires_at) VALUES (${sessionId}, ${user.id}, ${expires.toISOString()})`;

    setSessionCookie(res, sessionId);
    return res.status(201).json({ user });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Terjadi kesalahan server: ' + err.message });
  }
};
