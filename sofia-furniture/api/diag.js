import { neon } from '@neondatabase/serverless';
import pkg from 'pg';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const out = { region: process.env.VERCEL_REGION, node: process.version };

  // Test 1: Neon HTTP-based (POSTGRES_URL likely is a Neon direct URL)
  const urls = {
    POSTGRES_URL: process.env.POSTGRES_URL,
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
    DATABASE_URL: process.env.DATABASE_URL,
    PRISMA_DATABASE_URL: process.env.PRISMA_DATABASE_URL,
  };

  out.envs = Object.fromEntries(Object.entries(urls).map(([k, v]) => [k, v ? v.substring(0, 50) + '...' : null]));

  out.neon_tests = [];
  for (const [name, url] of Object.entries(urls)) {
    if (!url) continue;
    try {
      const sql = neon(url);
      const t0 = Date.now();
      const r = await Promise.race([
        sql('SELECT 1 as ok, current_database() as db, version() as ver'),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout 15s')), 15000))
      ]);
      out.neon_tests.push({ url_name: name, ok: true, ms: Date.now() - t0, row: r?.[0] });
    } catch (e) {
      out.neon_tests.push({ url_name: name, ok: false, err: e.message });
    }
  }

  // Test 2: raw pg with PRISMA url (if it has a host)
  const pgUrl = process.env.PRISMA_DATABASE_URL;
  if (pgUrl) {
    try {
      const t0 = Date.now();
      const c = new pkg.Client({ connectionString: pgUrl, connectionTimeoutMillis: 12000, ssl: { rejectUnauthorized: false } });
      await c.connect();
      const r = await c.query('SELECT 1 as ok, current_database() as db');
      out.pg_prisma = { ok: true, ms: Date.now() - t0, row: r.rows[0] };
      await c.end();
    } catch (e) {
      out.pg_prisma = { err: e.message, code: e.code };
    }
  }

  res.status(200).json(out);
}
