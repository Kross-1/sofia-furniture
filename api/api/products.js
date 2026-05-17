import { Pool } from 'pg';

const pool = new Pool({ 
  connectionString: process.env.PRISMA_DATABASE_URL, 
  ssl: { rejectUnauthorized: false } 
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { rows } = await pool.query('SELECT * FROM products');
      return res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  return res.status(405).json({ error: 'Method not allowed' });
}
