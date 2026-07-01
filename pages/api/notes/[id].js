const { sql } = require('../../../lib/db');
const { getUserFromSession } = require('../../../lib/auth');

module.exports = async function handler(req, res) {
  const user = await getUserFromSession(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { id } = req.query;

  try {
    const existing = await sql`SELECT * FROM notes WHERE id = ${id} AND user_id = ${user.id}`;
    if (existing.length === 0) return res.status(404).json({ error: 'Catatan tidak ditemukan' });

    if (req.method === 'PUT') {
      const { name, note, status, link, wallet, amount } = req.body;
      if (!name || !note || !status) return res.status(400).json({ error: 'Nama, catatan, dan status wajib diisi' });

      const validStatuses = ['Menunggu', 'Berjalan', 'Selesai', 'Gagal'];
      if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Status tidak valid' });

      const [updated] = await sql`
        UPDATE notes SET name = ${name}, note = ${note}, status = ${status},
          link = ${link || ''}, wallet = ${wallet || ''}, amount = ${amount || 0}
        WHERE id = ${id} AND user_id = ${user.id}
        RETURNING *
      `;
      return res.status(200).json({ note: updated });
    }

    if (req.method === 'DELETE') {
      await sql`DELETE FROM notes WHERE id = ${id} AND user_id = ${user.id}`;
      return res.status(200).json({ message: 'Catatan berhasil dihapus' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
};
