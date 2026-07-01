module.exports = async function handler(req, res) {
  return res.status(200).json({
    status: 'ok',
    message: 'API routes work!',
    timestamp: new Date().toISOString(),
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    nodeVersion: process.version,
  });
};
