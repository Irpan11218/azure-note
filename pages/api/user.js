const { sql } = require('../../lib/db');
const { getUserFromSession, clearSessionCookie } = require('../../lib/auth');
const bcrypt = require('bcryptjs');

module.exports = async function handler(req, res) {
  const user = await getUserFromSession(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const [userData] = await sql`SELECT id, username, profile_pic FROM users WHERE id = ${user.id}`;
      const notes = await sql`SELECT * FROM notes WHERE user_id = ${user.id} ORDER BY date DESC`;
      const [settings] = await sql`SELECT * FROM settings WHERE user_id = ${user.id}`;
      return res.status(200).json({ user: userData, notes, settings });
    }

    if (req.method === 'POST') {
      const { action, username, password, currentPassword, profilePic } = req.body;

      if (action === 'updateUsername') {
        if (!username || username.length < 3) return res.status(400).json({ error: 'Username minimal 3 karakter' });
        const existing = await sql`SELECT id FROM users WHERE username = ${username} AND id != ${user.id}`;
        if (existing.length > 0) return res.status(409).json({ error: 'Username sudah digunakan' });
        await sql`UPDATE users SET username = ${username} WHERE id = ${user.id}`;
        return res.status(200).json({ message: 'Username berhasil diubah' });
      }

      if (action === 'updatePassword') {
        if (!currentPassword || !password) return res.status(400).json({ error: 'Password wajib diisi' });
        if (password.length < 6) return res.status(400).json({ error: 'Password baru minimal 6 karakter' });
        const [userData] = await sql`SELECT password_hash FROM users WHERE id = ${user.id}`;
        const valid = await bcrypt.compare(currentPassword, userData.password_hash);
        if (!valid) return res.status(401).json({ error: 'Password lama salah' });
        const hash = await bcrypt.hash(password, 10);
        await sql`UPDATE users SET password_hash = ${hash} WHERE id = ${user.id}`;
        return res.status(200).json({ message: 'Password berhasil diubah' });
      }

      if (action === 'updateProfilePic') {
        if (!profilePic) return res.status(400).json({ error: 'URL foto wajib diisi' });
        await sql`UPDATE users SET profile_pic = ${profilePic} WHERE id = ${user.id}`;
        return res.status(200).json({ message: 'Foto profil berhasil diubah' });
      }

      return res.status(400).json({ error: 'Aksi tidak valid' });
    }

    if (req.method === 'DELETE') {
      await sql`DELETE FROM sessions WHERE user_id = ${user.id}`;
      await sql`DELETE FROM notes WHERE user_id = ${user.id}`;
      await sql`DELETE FROM settings WHERE user_id = ${user.id}`;
      await sql`DELETE FROM users WHERE id = ${user.id}`;
      clearSessionCookie(res);
      return res.status(200).json({ message: 'Akun berhasil dihapus' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
};
