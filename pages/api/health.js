module.exports = async function handler(req, res) {
  const info = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlLength: (process.env.DATABASE_URL || '').length,
    nodeVersion: process.version,
  };

  // Try database connection
  try {
    const { getSql } = require('../../lib/db');
    const sql = getSql();
    const result = await sql`SELECT 1 as test`;
    info.dbConnection = 'ok';
    info.dbTest = result;
  } catch (err) {
    info.dbConnection = 'failed';
    info.dbError = err.message;
    info.dbErrorCode = err.code;
  }

  // Try checking if tables exist
  try {
    const { getSql } = require('../../lib/db');
    const sql = getSql();
    const tables = await sql`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    info.tables = tables.map(t => t.table_name);
  } catch (err) {
    info.tablesError = err.message;
  }

  return res.status(200).json(info);
};
