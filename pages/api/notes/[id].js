const { getSql } = require('../../../lib/db');
const { getUserFromSession } = require('../../../lib/auth');

module.exports = async function handler(req, res) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const sql = getSql();
    const { id } = req.query;

    if (req.method === 'PUT') {
      const { name, note, status, link, wallet, date, amount } = req.body;
      const [updated] = await sql`
        UPDATE notes SET name=${name||''}, note=${note||''}, status=${status||'Menunggu'}, link=${link||''}, wallet=${wallet||''}, date=${date||''}, amount=${Number(amount)||0}
        WHERE id=${id} AND user_id=${user.id} RETURNING *
      `;
      if (!updated) return res.status(404).json({ error: 'Catatan tidak ditemukan' });
      return res.status(200).json({ note: updated });
    }

    if (req.method === 'DELETE') {
      await sql`DELETE FROM notes WHERE id=${id} AND user_id=${user.id}`;
      return res.status(200).json({ message: 'Catatan dihapus' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Note API error:', err);
    return res.status(500).json({ error: 'Terjadi kesalahan server: ' + err.message });
  }
};
