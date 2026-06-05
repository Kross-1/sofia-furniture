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
  SELECT id, name, icon, "sortOrder", "createdAt"
  FROM "Category"
  ORDER BY "sortOrder" ASC NULLS LAST, name ASC
`;

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
    const client = getClient();
    try {
      await client.connect();
      const { rows } = await client.query(QUERY);
      return res.status(200).json(rows.map(mapRow));
    } catch (e) {
      console.error('categories GET:', e.message);
      return res.status(500).json({ error: e.message });
    } finally {
      await client.end().catch(() => {});
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
