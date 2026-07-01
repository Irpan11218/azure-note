const { sql } = require('../../../lib/db');
const { getUserFromSession, clearSessionCookie } = require('../../../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const user = await getUserFromSession(req);
    if (user) {
      const cookies = req.headers.cookie || '';
      const match = cookies.match(/session=([^;]+)/);
      if (match) {
        await sql`DELETE FROM sessions WHERE id = ${match[1]}`;
      }
    }
    clearSessionCookie(res);
    return res.status(200).json({ message: 'Berhasil logout' });
  } catch (err) {
    console.error(err);
    clearSessionCookie(res);
    return res.status(200).json({ message: 'Berhasil logout' });
  }
};
