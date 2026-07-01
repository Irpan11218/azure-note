let sql;

function getSql() {
  if (!sql) {
    const { neon } = require('@neondatabase/serverless');
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL not set');
    sql = neon(url);
  }
  return sql;
}

module.exports = { getSql };
