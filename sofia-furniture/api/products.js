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
      const { rows } = await withTimeout(client.query('SELECT * FROM products'), TIMEOUT_MS, 'products');
      return res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
