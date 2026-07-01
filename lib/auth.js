const { getSql } = require('./db');

function parseCookies(req) {
  const cookieHeader = req.headers.cookie || '';
  const cookies = {};
  cookieHeader.split(';').forEach((c) => {
    const [name, ...rest] = c.trim().split('=');
    if (name) cookies[name] = rest.join('=');
  });
  return cookies;
}

async function getUserFromSession(req) {
  const sql = getSql();
  const cookies = parseCookies(req);
  const sessionId = cookies.session;
  if (!sessionId) return null;

  try {
    const rows = await sql`
      SELECT u.id, u.username, u.profile_pic
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.id = ${sessionId} AND s.expires_at > NOW()
    `;
    return rows[0] || null;
  } catch (err) {
    console.error('Session lookup error:', err.message);
    return null;
  }
}

function setSessionCookie(res, sessionId) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
  res.setHeader('Set-Cookie', [
    `session=${sessionId}; HttpOnly; Path=/; SameSite=Lax; Expires=${expires}`,
  ]);
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', [
    'session=; HttpOnly; Path=/; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
  ]);
}

module.exports = { getUserFromSession, setSessionCookie, clearSessionCookie };
