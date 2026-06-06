import pkg from 'pg';
const { Client } = pkg;

const ICON_FILE = {
  'Спальные гарнитуры': 'Спальные гарнитуры.png',
  'ТВ тумбы': 'Тв тумба.png',
  'Консоли': 'Консоль.png',
  'Столы': 'Столы.png',
  'Стулья': 'Стулья.png',
  'Холлы': 'Холлы.png',
  'Диваны': 'Диваны.png',
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
  return map[name] || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function makeClient() {
  return new Client({
    connectionString: process.env.PRISMA_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
    statement_timeout: 12000,
  });
}

function mapRow(row) {
  const iconFile = ICON_FILE[row.name] || null;
  return {
    id: row.id,
    name: row.name,
    slug: slugify(row.name),
    icon: row.icon,
    iconFile,
    iconType: iconFile || row.icon,
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, must-revalidate');

  const client = makeClient();
  try {
    await client.connect();
    const { rows } = await client.query('SELECT id, name, icon FROM "Category" ORDER BY "sortOrder"');
    return res.status(200).json(rows.map(mapRow));
  } catch (e) {
    console.error('categories:', e.message);
    return res.status(500).json({ error: e.message });
  } finally {
    await client.end().catch(() => {});
  }
}
