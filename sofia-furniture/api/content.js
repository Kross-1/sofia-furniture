import { createClient } from '@vercel/postgres';

const client = createClient({ connectionString: process.env.PRISMA_DATABASE_URL });
const TIMEOUT_MS = 3000;

const withTimeout = (p, ms, label) => Promise.race([
  p,
  new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} timeout ${ms}ms`)), ms))
]);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { rows } = await withTimeout(client.query('SELECT * FROM site_content'), TIMEOUT_MS, 'content');
      return res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    const { page_section, item_key, item_value } = req.body;
    try {
      await withTimeout(
        client.query(
          'INSERT INTO site_content (page_section, item_key, item_value) VALUES ($1, $2, $3) ON CONFLICT (page_section, item_key) DO UPDATE SET item_value = $3',
          [page_section, item_key, item_value]
        ),
        TIMEOUT_MS,
        'content upsert'
      );
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
