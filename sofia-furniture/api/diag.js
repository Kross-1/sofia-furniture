export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const out = {
    region: process.env.VERCEL_REGION,
    runtime: process.env.VERCEL_RUNTIME,
    node: process.version,
  };

  // Test 1: outbound HTTP to example.com
  try {
    const t0 = Date.now();
    const r = await fetch('https://example.com', { signal: AbortSignal.timeout(10000) });
    out.example_com = { ok: r.ok, status: r.status, ms: Date.now() - t0 };
  } catch (e) {
    out.example_com = { err: e.message };
  }

  // Test 2: outbound HTTP to Prisma DB
  const prismaUrl = process.env.PRISMA_DATABASE_URL;
  if (prismaUrl) {
    try {
      const u = new URL(prismaUrl.replace('postgres://', 'http://').replace('postgresql://', 'http://'));
      out.prisma_host = u.host;
      const t0 = Date.now();
      const r = await fetch(`http://${u.host}/`, { signal: AbortSignal.timeout(8000) });
      out.prisma_http = { ok: r.ok, status: r.status, ms: Date.now() - t0 };
    } catch (e) {
      out.prisma_http = { err: e.message, name: e.name };
    }
  } else {
    out.prisma_host = 'NO PRISMA URL';
  }

  // Test 3: pg client with short timeout
  try {
    const pg = await import('pg');
    const t0 = Date.now();
    const c = new pg.default.Client({ connectionString: prismaUrl, connectionTimeoutMillis: 8000 });
    await c.connect();
    const r = await c.query('SELECT 1 as ok');
    out.pg_test = { ok: true, ms: Date.now() - t0, row: r.rows[0] };
    await c.end();
  } catch (e) {
    out.pg_test = { err: e.message, code: e.code, name: e.name };
  }

  res.status(200).json(out);
}
