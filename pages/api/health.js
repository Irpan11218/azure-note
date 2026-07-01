module.exports = async function handler(req, res) {
  const info = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    nodeVersion: process.version,
  };

  // Try database connection
  try {
    const { neon } = require('@neondatabase/serverless');
    const url = process.env.DATABASE_URL;
    if (!url) {
      info.dbConnection = 'no_url';
    } else {
      const sql = neon(url);
      const result = await sql`SELECT 1 as test`;
      info.dbConnection = 'ok';
      info.dbTest = result;

      // Check tables
      const tables = await sql`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `;
      info.tables = tables.map(t => t.table_name);
    }
  } catch (err) {
    info.dbConnection = 'failed';
    info.dbError = err.message;
    info.dbErrorCode = err.code;
  }

  return res.status(200).json(info);
};
