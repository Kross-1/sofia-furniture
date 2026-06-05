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

const QUERY = `
  SELECT
    p.id,
    p.name,
    p.price,
    p.image,
    p.images,
    p.videos,
    p.material,
    p.description,
    p."createdAt",
    p."updatedAt",
    p."categoryId",
    c.name AS category_name,
    c.icon  AS category_icon
  FROM "Product" p
  LEFT JOIN "Category" c ON c.id = p."categoryId"
  ORDER BY p."createdAt" ASC
`;

function mapRow(r) {
  return {
    id: r.id,
    name: r.name,
    price: typeof r.price === 'string' ? parseInt(r.price, 10) : r.price,
    image: r.image,
    images: r.images || [],
    videos: r.videos || [],
    material: r.material,
    description: r.description,
    categoryId: r.categoryId,
    category: r.category_name || '',
    categoryIcon: r.category_icon || '',
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, must-revalidate');

  if (req.method === 'GET') {
    const client = getClient();
    try {
      await client.connect();
      const { rows } = await client.query(QUERY);
      return res.status(200).json(rows.map(mapRow));
    } catch (e) {
      console.error('products GET:', e.message);
      return res.status(500).json({ error: e.message });
    } finally {
      await client.end().catch(() => {});
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
