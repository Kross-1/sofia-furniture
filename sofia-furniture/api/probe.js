export default async function handler(req, res) {
  const start = Date.now();
  const log = (m) => console.log(`[probe2 ${Date.now() - start}ms] ${m}`);
  try {
    log('start');
    const { createClient } = await import('@vercel/postgres');
    log('imported');
    const client = createClient({ connectionString: process.env.PRISMA_DATABASE_URL });
    log('client created');
    const r = await Promise.race([
      client.query('SELECT 1 as ok, current_database() as db, current_user as u, version() as v'),
      new Promise((_, rej) => setTimeout(() => rej(new Error('query timeout 20s')), 20000))
    ]);
    log('query done');
    res.status(200).json({ ok: true, row: r.rows[0], elapsedMs: Date.now() - start });
  } catch (e) {
    log('ERR: ' + e.message);
    res.status(200).json({ ok: false, error: e.message, code: e.code, stack: (e.stack || '').split('\n').slice(0, 5), elapsedMs: Date.now() - start });
  }
}
