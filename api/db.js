import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const connString = process.env.DATABASE_URL || '';
const sql = connString ? neon(connString) : null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!sql) {
    return res.status(500).json({ error: 'DATABASE_URL not set', conn: connString ? 'set' : 'empty' });
  }

  if (req.method === 'GET') {
    const table = (req.query.table as string) || '';

    try {
      if (table === 'Category') {
        const rows = await sql`SELECT * FROM "Category" ORDER BY "sortOrder"`;
        return res.status(200).json(rows);
      }
      if (table === 'MediaItem') {
        const page = req.query.page as string;
        const rows = page
          ? await sql`SELECT * FROM "MediaItem" WHERE page = ${page} ORDER BY "createdAt" DESC`
          : await sql`SELECT * FROM "MediaItem" ORDER BY "createdAt" DESC`;
        return res.status(200).json(rows);
      }
      if (table === 'Message') {
        const rows = await sql`SELECT * FROM "Message" ORDER BY "createdAt" DESC`;
        return res.status(200).json(rows);
      }
      if (table === 'SiteSetting') {
        const rows = await sql`SELECT * FROM "SiteSetting"`;
        return res.status(200).json(rows);
      }
      if (table === 'Product') {
        const rows = await sql`
          SELECT p.*, c.name as category, c.icon
          FROM "Product" p
          LEFT JOIN "Category" c ON p."categoryId" = c.id
          ORDER BY c."sortOrder", p.name
        `;
        return res.status(200).json(rows);
      }
      return res.status(400).json({ error: `Unknown table: ${table}` });
    } catch (e: unknown) {
      return res.status(500).json({ error: (e as Error).message });
    }
  }

  if (req.method === 'POST') {
    const { table, ...values } = req.body || {};

    if (!table) return res.status(400).json({ error: 'Missing table' });

    try {
      if (table === 'Message') {
        const result = await sql`
          INSERT INTO "Message" (name, phone, comment, product, status, "createdAt")
          VALUES (${values.name}, ${values.phone}, ${values.comment || null}, ${values.product || null}, 'new', NOW())
          RETURNING *
        `;
        return res.status(201).json(result[0]);
      }
      if (table === 'SiteSetting') {
        const result = await sql`
          INSERT INTO "SiteSetting" (id, key, value)
          VALUES (gen_random_uuid(), ${values.key}, ${values.value})
          ON CONFLICT (key) DO UPDATE SET value = ${values.value}
          RETURNING *
        `;
        return res.status(201).json(result[0]);
      }
      return res.status(400).json({ error: `Unknown table: ${table}` });
    } catch (e: unknown) {
      return res.status(500).json({ error: (e as Error).message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}