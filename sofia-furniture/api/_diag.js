import { createClient } from '@vercel/postgres';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const candidates = [
    { name: 'POSTGRES_URL', value: process.env.POSTGRES_URL },
    { name: 'POSTGRES_URL_NON_POOLING', value: process.env.POSTGRES_URL_NON_POOLING },
    { name: 'DATABASE_URL', value: process.env.DATABASE_URL },
    { name: 'PRISMA_DATABASE_URL', value: process.env.PRISMA_DATABASE_URL },
  ];

  const out = [];
  for (const c of candidates) {
    if (!c.value) { out.push({ name: c.name, present: false }); continue; }
    const t0 = Date.now();
    try {
      const client = createClient({ connectionString: c.value });
      const r = await Promise.race([
        client.query('SELECT 1 as ok'),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout 4000')), 4000))
      ]);
      out.push({ name: c.name, ok: true, ms: Date.now() - t0, row: r.rows?.[0] });
      await client.end();
    } catch (e) {
      out.push({ name: c.name, ok: false, ms: Date.now() - t0, err: e.message });
    }
  }
  res.status(200).json(out);
}
