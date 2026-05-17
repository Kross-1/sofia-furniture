import { Pool } from 'pg';

const pool = new Pool({ 
  connectionString: process.env.PRISMA_DATABASE_URL, 
  ssl: { rejectUnauthorized: false } 
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { rows } = await pool.query('SELECT * FROM site_content');
      return res.status(200).json(rows);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  if (req.method === 'POST') {
    const { page_section, item_key, item_value } = req.body;
    try {
      await pool.query(
        'INSERT INTO site_content (page_section, item_key, item_value) VALUES ($1, $2, $3) ON CONFLICT (page_section, item_key) DO UPDATE SET item_value = $3',
        [page_section, item_key, item_value]
      );
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
