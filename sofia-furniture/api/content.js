import pkg from 'pg';

const { Client } = pkg;

function getClient() {
  return new Client({
    connectionString: process.env.PRISMA_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
    statement_timeout: 12000,
  });
}

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
    const client = getClient();
    try {
      await client.connect();
      const { rows } = await client.query('SELECT key, value FROM "SiteSetting"');
      return res.status(200).json(rows.map(mapRow));
    } catch (e) {
      console.error('content GET:', e.message);
      return res.status(500).json({ error: e.message });
    } finally {
      await client.end().catch(() => {});
    }
  }

  if (req.method === 'POST') {
    const { item_key, item_value } = req.body || {};
    if (!item_key || typeof item_value !== 'string') {
      return res.status(400).json({ error: 'item_key and item_value required' });
    }
    const client = getClient();
    try {
      await client.connect();
      await client.query(
        `INSERT INTO "SiteSetting" (id, key, value) VALUES (gen_random_uuid()::text, $1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
        [item_key, item_value]
      );
      return res.status(200).json({ success: true, item_key, item_value });
    } catch (e) {
      console.error('content POST:', e.message);
      return res.status(500).json({ error: e.message });
    } finally {
      await client.end().catch(() => {});
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
