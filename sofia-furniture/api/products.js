import pkg from 'pg';
const { Client } = pkg;

function makeClient() {
  return new Client({
    connectionString: process.env.PRISMA_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
    statement_timeout: 12000,
  });
}

function mapRow(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category_name || null,
    price: row.price,
    image: row.image,
    images: row.images,
    videos: row.videos,
    material: row.material,
    description: row.description,
    categoryId: row.categoryid || null,
    categoryIcon: row.category_icon || null,
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, must-revalidate');

  const client = makeClient();
  try {
    await client.connect();
    const { rows } = await client.query(
      `SELECT p.id, p.name, p.price, p.image, p.images, p.videos, p.material, p.description,
              p."categoryId", c.name AS category_name, c.icon AS category_icon
       FROM "Product" p
       LEFT JOIN "Category" c ON c.id = p."categoryId"`
    );
    return res.status(200).json(rows.map(mapRow));
  } catch (e) {
    console.error('products:', e.message);
    return res.status(500).json({ error: e.message });
  } finally {
    await client.end().catch(() => {});
  }
}
