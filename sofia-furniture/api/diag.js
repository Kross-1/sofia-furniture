import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const out = { region: process.env.VERCEL_REGION, node: process.version };

  // Test 1: @vercel/postgres sql template (HTTP-based, works without TCP)
  try {
    const t0 = Date.now();
    const r = await sql`SELECT 1 as ok, current_database() as db`;
    out.sql_template = { ok: true, ms: Date.now() - t0, rows: r.rows };
  } catch (e) {
    out.sql_template = { err: e.message, code: e.code };
  }

  // Test 2: try listing tables via sql
  try {
    const t0 = Date.now();
    const r = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`;
    out.sql_tables = { ok: true, ms: Date.now() - t0, count: r.rows.length, names: r.rows.map(x => x.table_name) };
  } catch (e) {
    out.sql_tables = { err: e.message };
  }

  res.status(200).json(out);
}
