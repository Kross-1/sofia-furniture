import { neon } from '@neondatabase/serverless';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const sql = neon(process.env.DATABASE_URL || '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;

  if (method === 'GET') {
    const table = (req.query.table as string) || '';
    const page = req.query.page as string;

    try {
      if (table === 'MediaItem') {
        const q = page
          ? sql`SELECT * FROM "MediaItem" WHERE page = ${page} ORDER BY "createdAt" DESC`
          : sql`SELECT * FROM "MediaItem" ORDER BY "createdAt" DESC`;
        return res.json(await q);
      }
      if (table === 'Message') {
        return res.json(await sql`SELECT * FROM "Message" ORDER BY "createdAt" DESC`);
      }
      if (table === 'SiteSetting') {
        return res.json(await sql`SELECT * FROM "SiteSetting"`);
      }
      if (table === 'Product') {
        return res.json(await sql`
          SELECT p.*, c.name as category, c.icon
          FROM "Product" p
          LEFT JOIN "Category" c ON p."categoryId" = c.id
          ORDER BY c."sortOrder", p.name
        `);
      }
      if (table === 'Category') {
        return res.json(await sql`SELECT * FROM "Category" ORDER BY "sortOrder"`);
      }
      if (table === 'User') {
        return res.json(await sql`SELECT * FROM "User"`);
      }
      return res.json({ error: 'Unknown table' }, { status: 400 });
    } catch (e: unknown) {
      return res.json({ error: (e as Error).message }, { status: 500 });
    }
  }

  if (method === 'POST') {
    const body = req.body;
    const { table, ...values } = body;

    if (!table) return res.json({ error: 'Missing table' }, { status: 400 });

    try {
      if (table === 'Message') {
        const result = await sql`
          INSERT INTO "Message" (name, phone, comment, product, status, "createdAt")
          VALUES (${values.name}, ${values.phone}, ${values.comment || null}, ${values.product || null}, 'new', NOW())
          RETURNING *
        `;
        return res.json(result[0]);
      }
      if (table === 'SiteSetting') {
        const result = await sql`
          INSERT INTO "SiteSetting" (id, key, value)
          VALUES (gen_random_uuid(), ${values.key}, ${values.value})
          ON CONFLICT (key) DO UPDATE SET value = ${values.value}
          RETURNING *
        `;
        return res.json(result[0]);
      }
      return res.json({ error: 'Unknown table' }, { status: 400 });
    } catch (e: unknown) {
      return res.json({ error: (e as Error).message }, { status: 500 });
    }
  }

  return res.json({ error: 'Method not allowed' }, { status: 405 });
}