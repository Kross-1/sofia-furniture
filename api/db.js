import pg from 'pg';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const CONN = process.env.DATABASE_URL || '';
  if (!CONN || CONN.includes('example.com')) {
    return res.status(500).json({ error: 'DATABASE_URL not configured' });
  }

  async function q(sql, params) {
    const client = new pg.Client({
      connectionString: CONN,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });
    try {
      await client.connect();
      const result = await client.query(sql, params);
      return result.rows;
    } finally {
      await client.end().catch(() => {});
    }
  }

  const table = req.query.table || '';

  try {
    if (req.method === 'GET') {
      let rows;

      if (table === 'Category') {
        rows = await q(`SELECT * FROM "Category" ORDER BY "sortOrder"`);
      } else if (table === 'MediaItem') {
        const page = req.query.page;
        rows = page
          ? await q(`SELECT * FROM "MediaItem" WHERE page = $1 ORDER BY "createdAt" DESC`, [page])
          : await q(`SELECT * FROM "MediaItem" ORDER BY "createdAt" DESC`);
      } else if (table === 'Message') {
        rows = await q(`SELECT * FROM "Message" ORDER BY "createdAt" DESC`);
      } else if (table === 'SiteSetting') {
        rows = await q(`SELECT * FROM "SiteSetting"`);
      } else if (table === 'Product') {
        rows = await q(`SELECT p.*, c.name as category, c.icon FROM "Product" p LEFT JOIN "Category" c ON p."categoryId" = c.id ORDER BY c."sortOrder", p.name`);
      } else if (table === 'User') {
        rows = await q(`SELECT * FROM "User"`);
      } else {
        return res.status(400).json({ error: `Unknown table: ${table}` });
      }

      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { table: t, ...values } = req.body || {};
      if (!t) return res.status(400).json({ error: 'Missing table' });

      if (t === 'Message') {
        const rows = await q(
          `INSERT INTO "Message" (name, phone, comment, product, status, "createdAt") VALUES ($1, $2, $3, $4, 'new', NOW()) RETURNING *`,
          [values.name, values.phone, values.comment || null, values.product || null]
        );
        return res.status(201).json(rows[0]);
      }
      if (t === 'SiteSetting') {
        const rows = await q(
          `INSERT INTO "SiteSetting" (id, key, value) VALUES (gen_random_uuid(), $1, $2) ON CONFLICT (key) DO UPDATE SET value = $2 RETURNING *`,
          [values.key, values.value]
        );
        return res.status(201).json(rows[0]);
      }
      return res.status(400).json({ error: `Unknown table: ${t}` });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}