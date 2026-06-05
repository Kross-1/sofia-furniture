import { createClient } from '@vercel/postgres';

const client = createClient({ connectionString: process.env.PRISMA_DATABASE_URL });
const TIMEOUT_MS = 5000;

const withTimeout = (p, ms, label) => Promise.race([
  p,
  new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} timeout ${ms}ms`)), ms))
]);

const QUERY = `
  SELECT id, name, icon, "sortOrder", "createdAt"
  FROM "Category"
  ORDER BY "sortOrder" ASC NULLS LAST, name ASC
`;

function slugify(name) {
  const map = {
    'Спальные гарнитуры': 'spalnya',
    'ТВ тумбы': 'tv-tumby',
    'Консоли': 'konsoli',
    'Столы': 'stoly',
    'Стулья': 'stulya',
    'Холлы': 'holly',
    'Диваны': 'divany',
  };
  return map[name] || name.toLowerCase().replace(/\s+/g, '-');
}

const ICON_FILE = {
  'Спальные гарнитуры': 'Спальные гарнитуры.png',
  'ТВ тумбы': 'Тв тумба.png',
  'Тв тумба': 'Тв тумба.png',
  'Консоли': 'Консоль.png',
  'Консоль': 'Консоль.png',
  'Столы': 'Столы.png',
  'Стол': 'Столы.png',
  'Стулья': 'Стулья.png',
  'Стул': 'Стулья.png',
  'Холлы': 'Холлы.png',
  'Холл': 'Холлы.png',
  'Диваны': 'Диваны.png',
  'Диван': 'Диваны.png',
};

function mapRow(r) {
  const iconFile = ICON_FILE[r.name] || ICON_FILE[r.icon] || null;
  return {
    id: r.id,
    name: r.name,
    icon: r.icon,
    iconType: iconFile || r.icon,
    iconFile,
    slug: slugify(r.name),
    sortOrder: r.sortOrder,
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, must-revalidate');

  if (req.method === 'GET') {
    try {
      const { rows } = await withTimeout(client.query(QUERY), TIMEOUT_MS, 'categories');
      return res.status(200).json(rows.map(mapRow));
    } catch (error) {
      console.error('categories GET error:', error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
