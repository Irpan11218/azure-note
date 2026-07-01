const { getSql } = require('../../lib/db');
const { getUserFromSession } = require('../../lib/auth');

module.exports = async function handler(req, res) {
  try {
    const user = await getUserFromSession(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const sql = getSql();

    if (req.method === 'GET') {
      const [settings] = await sql`SELECT * FROM settings WHERE user_id = ${user.id}`;
      return res.status(200).json({ settings: settings || { theme: 'azure', dark_mode: false, notifications: true } });
    }

    if (req.method === 'POST') {
      const { theme, darkMode, notifications } = req.body;
      const [existing] = await sql`SELECT * FROM settings WHERE user_id = ${user.id}`;
      if (existing) {
        const [updated] = await sql`
          UPDATE settings SET theme=${theme||existing.theme}, dark_mode=${darkMode!==undefined?darkMode:existing.dark_mode}, notifications=${notifications!==undefined?notifications:existing.notifications}
          WHERE user_id=${user.id} RETURNING *
        `;
        return res.status(200).json({ settings: updated });
      } else {
        const [created] = await sql`
          INSERT INTO settings (user_id, theme, dark_mode, notifications) VALUES (${user.id}, ${theme||'azure'}, ${darkMode||false}, ${notifications!==false})
          RETURNING *
        `;
        return res.status(201).json({ settings: created });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Settings API error:', err);
    return res.status(500).json({ error: 'Terjadi kesalahan server: ' + err.message });
  }
};
