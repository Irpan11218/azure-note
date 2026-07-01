const { sql } = require('../../lib/db');
const { getUserFromSession } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  const user = await getUserFromSession(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const [settings] = await sql`SELECT * FROM settings WHERE user_id = ${user.id}`;
      return res.status(200).json({ settings });
    }

    if (req.method === 'POST') {
      const { theme, dark_mode, notifications } = req.body;
      const [updated] = await sql`
        UPDATE settings SET
          theme = COALESCE(${theme}, theme),
          dark_mode = COALESCE(${dark_mode}, dark_mode),
          notifications = COALESCE(${notifications}, notifications)
        WHERE user_id = ${user.id}
        RETURNING *
      `;
      return res.status(200).json({ settings: updated });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Terjadi kesalahan server' });
  }
};
