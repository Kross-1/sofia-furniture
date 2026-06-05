import { createClient } from '@vercel/postgres';

const client = createClient({ connectionString: process.env.PRISMA_DATABASE_URL });
const TIMEOUT_MS = 5000;

const withTimeout = (p, ms, label) => Promise.race([
  p,
  new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} timeout ${ms}ms`)), ms))
]);

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
    try {
      const { rows } = await withTimeout(client.query(QUERY), TIMEOUT_MS, 'products');
      return res.status(200).json(rows.map(mapRow));
    } catch (error) {
      console.error('products GET error:', error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
