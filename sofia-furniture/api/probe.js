export default async function handler(req, res) {
  try {
    const mod = await import('@vercel/postgres');
    const keys = Object.keys(mod || {});
    let queryResult = null;
    let queryError = null;
    try {
      const r = await mod.sql`SELECT 1 as ok, current_database() as db`;
      queryResult = { rowCount: r.rowCount, sample: r.rows && r.rows[0] };
    } catch (e) {
      queryError = e.message;
    }
    return res.status(200).json({ ok: true, moduleKeys: keys, queryResult, queryError });
  } catch (e) {
    return res.status(200).json({ ok: false, error: e.message, stack: (e.stack || '').split('\n').slice(0, 5) });
  }
}
