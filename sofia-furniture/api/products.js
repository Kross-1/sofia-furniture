import { createClient } from '@vercel/postgres';

const client = createClient({ connectionString: process.env.PRISMA_DATABASE_URL });

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { rows } = await client.query('SELECT * FROM products');
      return res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
