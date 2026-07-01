const { getSql } = require('../../../lib/db');
const { getUserFromSession, clearSessionCookie } = require('../../../lib/auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const sql = getSql();
    const user = await getUserFromSession(req);
    if (user) {
      await sql`DELETE FROM sessions WHERE user_id = ${user.id}`;
    }
    clearSessionCookie(res);
    return res.status(200).json({ message: 'Logged out' });
  } catch (err) {
    console.error('Logout error:', err);
    clearSessionCookie(res);
    return res.status(200).json({ message: 'Logged out' });
  }
};
