const { sql } = require('../../../lib/db');
const { getUserFromSession } = require('../../../lib/auth');

module.exports = async function handler(req, res) {
  const user = await getUserFromSession(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const notes = await sql`SELECT * FROM notes WHERE user_id = ${user.id} ORDER BY date DESC`;
      return res.status(200).json({ notes });
    }

    if (req.method === 'POST') {
      const { name, note, status, link, wallet, amount } = req.body;
      if (!name || !note || !status) return res.status(400).json({ error: 'Nama, catatan, dan status wajib diisi' });

      const validStatuses = ['Menunggu', 'Berjalan', 'Selesai', 'Gagal'];
      if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Status tidak valid' });

      const [newNote] = await sql`
        INSERT INTO notes (user_id, name, note, status, link, wallet, amount)
        VALUES (${user.id}, ${name}, ${note}, ${status}, ${link || ''}, ${wallet || ''}, ${amount || 0})
        RETURNING *
      `;
      return res.status(201).json({ note: newNote });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
};
