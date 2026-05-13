import pg from 'pg';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const CONN = process.env.DATABASE_URL || '';
  if (!CONN || CONN.includes('example.com')) {
    return res.status(500).json({ error: 'DATABASE_URL not configured' });
  }

  async function q(sql, params) {
    const client = new pg.Client({
      connectionString: CONN,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });
    try {
      await client.connect();
      const result = await client.query(sql, params);
      return result.rows;
    } finally {
      await client.end().catch(() => {});
    }
  }

  const table = req.query.table || '';

  try {
    if (req.method === 'GET') {
      let rows;

      if (table === 'Category') {
        rows = await q(`SELECT * FROM "Category" ORDER BY "sortOrder"`);
      } else if (table === 'MediaItem') {
        const page = req.query.page;
        rows = page
          ? await q(`SELECT * FROM "MediaItem" WHERE page = $1 ORDER BY "createdAt" DESC`, [page])
          : await q(`SELECT * FROM "MediaItem" ORDER BY "createdAt" DESC`);
      } else if (table === 'Message') {
        rows = await q(`SELECT * FROM "Message" ORDER BY "createdAt" DESC`);
      } else if (table === 'SiteSetting') {
        rows = await q(`SELECT * FROM "SiteSetting"`);
      } else if (table === 'Product') {
        rows = await q(`SELECT p.*, c.name as category, c.icon FROM "Product" p LEFT JOIN "Category" c ON p."categoryId" = c.id ORDER BY c."sortOrder", p.name`);
      } else if (table === 'User') {
        rows = await q(`SELECT * FROM "User"`);
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
        return res.status(201).json(rows[0]);
      }
      if (t === 'Message_update') {
        const rows = await q(
          `UPDATE "Message" SET status = $2 WHERE id = $1 RETURNING *`,
          [values.id, values.status]
        );
        return res.status(200).json(rows[0]);
      }
      if (t === 'SiteSetting') {
        const rows = await q(
          `INSERT INTO "SiteSetting" (id, key, value) VALUES (gen_random_uuid(), $1, $2) ON CONFLICT (key) DO UPDATE SET value = $2 RETURNING *`,
          [values.key, values.value]
        );
        return res.status(201).json(rows[0]);
      }
      if (t === 'MediaItem') {
        const rows = await q(
          `INSERT INTO "MediaItem" (page, section, type, url, "createdAt") VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
          [values.page, values.section, values.type, values.url]
        );
        return res.status(201).json(rows[0]);
      }
      if (t === 'Product') {
        const rows = await q(
          `INSERT INTO "Product" (name, "categoryId", price, image, images, videos, material, description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [values.name, values.categoryId, values.price, values.image || '', values.images || [], values.videos || [], values.material || null, values.description || null]
        );
        return res.status(201).json(rows[0]);
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

      if (t === 'Message' || t === 'MediaItem') {
        await q(`DELETE FROM "${t}" WHERE id = $1`, [id]);
        return res.status(200).json({ success: true });
      }
      return res.status(400).json({ error: `Cannot delete from: ${t}` });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}