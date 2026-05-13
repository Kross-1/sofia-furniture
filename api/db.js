import { neon } from '@neondatabase/serverless';

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

  try {
    const db = neon(CONN);
    const table = req.query.table || '';
    const page = req.query.page;

    if (req.method === 'GET') {
      if (table === 'Category') {
        const rows = await db`SELECT * FROM "Category" ORDER BY "sortOrder"`;
        return res.status(200).json(rows);
      }
      if (table === 'MediaItem') {
        const rows = page
          ? await db`SELECT * FROM "MediaItem" WHERE page = ${page} ORDER BY "createdAt" DESC`
          : await db`SELECT * FROM "MediaItem" ORDER BY "createdAt" DESC`;
        return res.status(200).json(rows);
      }
      if (table === 'Message') {
        const rows = await db`SELECT * FROM "Message" ORDER BY "createdAt" DESC`;
        return res.status(200).json(rows);
      }
      if (table === 'SiteSetting') {
        const rows = await db`SELECT * FROM "SiteSetting"`;
        return res.status(200).json(rows);
      }
      if (table === 'Product') {
        const rows = await db`
          SELECT p.*, c.name as category, c.icon
          FROM "Product" p
          LEFT JOIN "Category" c ON p."categoryId" = c.id
          ORDER BY c."sortOrder", p.name
        `;
        return res.status(200).json(rows);
      }
      return res.status(400).json({ error: `Unknown table: ${table}` });
    }

    if (req.method === 'POST') {
      const { table: t, ...values } = req.body || {};
      if (!t) return res.status(400).json({ error: 'Missing table' });

      if (t === 'Message') {
        const result = await db`
          INSERT INTO "Message" (name, phone, comment, product, status, "createdAt")
          VALUES (${values.name}, ${values.phone}, ${values.comment || null}, ${values.product || null}, 'new', NOW())
          RETURNING *
        `;
        return res.status(201).json(result[0]);
      }
      return res.status(400).json({ error: `Unknown table: ${t}` });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}