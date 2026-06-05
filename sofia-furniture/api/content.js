import { createClient } from '@vercel/postgres';

const client = createClient({ connectionString: process.env.PRISMA_DATABASE_URL });
const TIMEOUT_MS = 5000;

const withTimeout = (p, ms, label) => Promise.race([
  p,
  new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} timeout ${ms}ms`)), ms))
]);

function derivePageSection(key) {
  if (!key) return { page: '', section: '' };
  const idx = key.indexOf('-');
  if (idx === -1) return { page: key, section: '' };
  const page = key.slice(0, idx);
  const rest = key.slice(idx + 1);
  const lastDash = rest.lastIndexOf('-');
  const section = lastDash === -1 ? '' : rest.slice(0, lastDash);
  return { page, section };
}

function mapRow(row) {
  const { page, section } = derivePageSection(row.key);
  return {
    item_key: row.key,
    item_value: row.value,
    page_section: `${page}${section ? ':' + section : ''}`,
    page,
    section,
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, must-revalidate');

  if (req.method === 'GET') {
    try {
      const { rows } = await withTimeout(
        client.query('SELECT key, value FROM "SiteSetting"'),
        TIMEOUT_MS,
        'content'
      );
      return res.status(200).json(rows.map(mapRow));
    } catch (error) {
      console.error('content GET error:', error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    const { item_key, item_value, page_section } = req.body || {};
    if (!item_key || typeof item_value !== 'string') {
      return res.status(400).json({ error: 'item_key and item_value required' });
    }
    try {
      const { page, section } = derivePageSection(item_key);
      const ps = page_section || `${page}${section ? ':' + section : ''}`;
      await withTimeout(
        client.query(
          `INSERT INTO "SiteSetting" (id, key, value) VALUES (gen_random_uuid()::text, $1, $2)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
          [item_key, item_value]
        ),
        TIMEOUT_MS,
        'content upsert'
      );
      return res.status(200).json({ success: true, item_key, item_value, page_section: ps });
    } catch (error) {
      console.error('content POST error:', error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
