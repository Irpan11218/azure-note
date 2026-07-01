const { sql } = require('../../../lib/db');
const { getUserFromSession, setSessionCookie } = require('../../../lib/auth');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username dan password wajib diisi' });

  try {
    const users = await sql`SELECT * FROM users WHERE username = ${username}`;
    if (users.length === 0) return res.status(401).json({ error: 'Username atau password salah' });

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Username atau password salah' });

    const sessionId = crypto.randomUUID();
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await sql`INSERT INTO sessions (id, user_id, expires_at) VALUES (${sessionId}, ${user.id}, ${expires.toISOString()})`;

    setSessionCookie(res, sessionId);
    return res.status(200).json({ user: { id: user.id, username: user.username, profile_pic: user.profile_pic } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
};
