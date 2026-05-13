import pg from 'pg';

const CONN = process.env.DATABASE_URL || '';
const isConfigured = CONN && !CONN.includes('example.com');

let pool = null;

function getPool() {
  if (!pool) {
    pool = new pg.Pool({
      connectionString: CONN,
      ssl: { rejectUnauthorized: false },
      max: 2,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }
  return pool;
}

const cache = new Map();
const CACHE_TTL = 30000;

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

function invalidateCache(table) {
  for (const key of cache.keys()) {
    if (key.startsWith(table + ':') || key === table) {
      cache.delete(key);
    }
  }
}

async function q(sql, params, skipCache = false) {
  const p = getPool();
  try {
    const result = await p.query(sql, params);
    return result.rows;
  } finally {}
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!isConfigured) {
    return res.status(500).json({ error: 'DATABASE_URL not configured' });
  }

  const table = req.query.table || '';

  try {
    if (req.method === 'GET') {
      let rows;
      const cacheKey = table + ':' + (req.query.page || '');

      if (table === 'Category') {
        rows = getCached('Category') || await q(`SELECT * FROM "Category" ORDER BY "sortOrder"`);
        if (!getCached('Category')) { setCached('Category', rows); rows = getCached('Category'); }
      } else if (table === 'MediaItem') {
        const page = req.query.page;
        const key = page ? `MediaItem:${page}` : 'MediaItem:all';
        rows = getCached(key) || await (page
          ? q(`SELECT * FROM "MediaItem" WHERE page = $1 ORDER BY "createdAt" DESC`, [page])
          : q(`SELECT * FROM "MediaItem" ORDER BY "createdAt" DESC`));
        if (!getCached(key)) { setCached(key, rows); rows = getCached(key); }
      } else if (table === 'Message') {
        rows = getCached('Message') || await q(`SELECT * FROM "Message" ORDER BY "createdAt" DESC`);
        if (!getCached('Message')) { setCached('Message', rows); rows = getCached('Message'); }
      } else if (table === 'SiteSetting') {
        rows = getCached('SiteSetting') || await q(`SELECT * FROM "SiteSetting"`);
        if (!getCached('SiteSetting')) { setCached('SiteSetting', rows); rows = getCached('SiteSetting'); }
      } else if (table === 'Product') {
        rows = getCached('Product') || await q(`SELECT p.*, c.name as category, c.icon FROM "Product" p LEFT JOIN "Category" c ON p."categoryId" = c.id ORDER BY c."sortOrder", p.name`);
        if (!getCached('Product')) { setCached('Product', rows); rows = getCached('Product'); }
      } else if (table === 'User') {
        rows = getCached('User') || await q(`SELECT * FROM "User"`);
        if (!getCached('User')) { setCached('User', rows); rows = getCached('User'); }
      } else {
        return res.status(400).json({ error: `Unknown table: ${table}` });
      }

      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { table: t, ...values } = req.body || {};
      if (!t) return res.status(400).json({ error: 'Missing table' });

      if (t === 'Message') {
        const rows = await q(
          `INSERT INTO "Message" (name, phone, comment, product, status, "createdAt") VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
          [values.name, values.phone, values.comment || null, values.product || null, values.status || 'new']
        );
        invalidateCache('Message');
        return res.status(201).json(rows[0]);
      }
      if (t === 'Message_update') {
        const rows = await q(
          `UPDATE "Message" SET status = $2 WHERE id = $1 RETURNING *`,
          [values.id, values.status]
        );
        invalidateCache('Message');
        return res.status(200).json(rows[0]);
      }
      if (t === 'SiteSetting') {
        const rows = await q(
          `INSERT INTO "SiteSetting" (id, key, value) VALUES (gen_random_uuid(), $1, $2) ON CONFLICT (key) DO UPDATE SET value = $2 RETURNING *`,
          [values.key, values.value]
        );
        invalidateCache('SiteSetting');
        return res.status(201).json(rows[0]);
      }
      if (t === 'MediaItem') {
        const rows = await q(
          `INSERT INTO "MediaItem" (page, section, type, url, "createdAt") VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
          [values.page, values.section, values.type, values.url]
        );
        invalidateCache('MediaItem');
        return res.status(201).json(rows[0]);
      }
      if (t === 'Product') {
        let categoryId = values.categoryId;
        if (!categoryId && values.category) {
          const catRows = await q(`SELECT id FROM "Category" WHERE name = $1`, [values.category]);
          if (catRows[0]) categoryId = catRows[0].id;
        }

        if (values.id) {
          const rows = await q(
            `UPDATE "Product" SET name = $2, "categoryId" = $3, price = $4, image = $5, images = $6, videos = $7, material = $8, description = $9 WHERE id = $1 RETURNING *`,
            [values.id, values.name, categoryId, values.price, values.image || '', values.images || [], values.videos || [], values.material || null, values.description || null]
          );
          invalidateCache('Product');
          return res.status(200).json(rows[0] || {});
        } else {
          const rows = await q(
            `INSERT INTO "Product" (name, "categoryId", price, image, images, videos, material, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [values.name, categoryId, values.price, values.image || '', values.images || [], values.videos || [], values.material || null, values.description || null]
          );
          invalidateCache('Product');
          return res.status(201).json(rows[0]);
        }
      }
      if (t === 'seed_products') {
        const cats = [
          ['Спальные гарнитуры', 'Bed', 1],
          ['ТВ тумбы', 'Tv', 2],
          ['Консоли', 'Coffee', 3],
          ['Столы', 'Armchair', 4],
          ['Стулья', 'Armchair', 5],
          ['Холлы', 'Sofa', 6],
          ['Диваны', 'Sofa', 7],
        ];
        const catIds = {};
        for (const [name, icon, sort] of cats) {
          const r = await q(`INSERT INTO "Category" (name, icon, "sortOrder") VALUES ($1, $2, $3) ON CONFLICT DO NOTHING RETURNING id`, [name, icon, sort]);
          if (r[0]) catIds[name] = r[0].id;
        }
        const allCats = await q(`SELECT id, name FROM "Category"`);
        allCats.forEach(r => { catIds[r.name] = r.id; });

        const products = [
          ['Спальный гарнитур "Престиж"', catIds['Спальные гарнитуры'], 125000, 'Дерево', 'Элегантный спальный гарнитур из натурального дерева с мягким изголовьем'],
          ['ТВ тумба "Минимал"', catIds['ТВ тумбы'], 28000, 'МДФ', 'Современная ТВ тумба с ящиками и нишей для техники'],
          ['Консоль "Венеция"', catIds['Консоли'], 35000, 'Дерево', 'Изящная консоль для прихожей или гостиной'],
          ['Обеденный стол "Семья"', catIds['Столы'], 45000, 'Дерево', 'Просторный обеденный стол на 6 персон из массива дуба'],
          ['Стул "Комфорт"', catIds['Стулья'], 8500, 'Ткань', 'Мягкий стул с обивкой из велюра'],
          ['Холл "Уютный"', catIds['Холлы'], 55000, 'Ткань', 'Мягкий холл с подушками для максимального комфорта'],
          ['Диван "Венеция"', catIds['Диваны'], 89000, 'Ткань', 'Мягкий раскладной диван с ящиком для белья'],
          ['Спальный гарнитур "Мечта"', catIds['Спальные гарнитуры'], 98000, 'МДФ', 'Стильный гарнитур с зеркалом и вместительными шкафами'],
          ['ТВ тумба "Лофт"', catIds['ТВ тумбы'], 32000, 'Металл', 'Индустриальная ТВ тумба в стиле лофт'],
          ['Консоль "Модерн"', catIds['Консоли'], 42000, 'МДФ', 'Минималистичная консоль с глянцевым покрытием'],
          ['Письменный стол "Работа"', catIds['Столы'], 38000, 'Дерево', 'Функциональный письменный стол с выдвижными ящиками'],
          ['Стул "Велюр"', catIds['Стулья'], 12000, 'Велюр', 'Элегантный стул с обивкой из велюра и металлическими ножками'],
          ['Холл "Классик"', catIds['Холлы'], 65000, 'Кожа', 'Классический холл с элегантным дизайном'],
          ['Диван "Аккордеон"', catIds['Диваны'], 65000, 'Ткань', 'Раскладной диван типа "аккордеон" с ортопедическим матрасом'],
          ['Кожаный диван "Бизнес"', catIds['Диваны'], 145000, 'Кожа', 'Премиальный кожаный диван для офиса или дома'],
          ['Холл "Лофт"', catIds['Холлы'], 48000, 'Ткань', 'Современный холл в стиле лофт для вашего интерьера'],
        ];
        let count = 0;
        for (const [name, catId, price, material, desc] of products) {
          await q(`INSERT INTO "Product" (name, "categoryId", price, image, material, description) VALUES ($1, $2, $3, '', $4, $5) ON CONFLICT DO NOTHING`, [name, catId, price, material, desc]);
          count++;
        }
        return res.status(200).json({ seeded: count });
      }
      return res.status(400).json({ error: `Unknown table: ${t}` });
    }

    if (req.method === 'DELETE') {
      const t = req.query.table;
      const id = req.query.id;
      if (!t || !id) return res.status(400).json({ error: 'Missing table or id' });

      if (t === 'Message' || t === 'MediaItem' || t === 'Product') {
        await q(`DELETE FROM "${t}" WHERE id = $1`, [id]);
        invalidateCache(t);
        return res.status(200).json({ success: true });
      }
      return res.status(400).json({ error: `Cannot delete from: ${t}` });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}