const pg = require('pg');
const CONN = 'postgres://bbcf8954088957e4fbb0bc328f877a1ee6bb990801161a42912c228557579937:sk_1D334oCMZ_6crYbIsn9Gx@db.prisma.io:5432/postgres?sslmode=require';

async function seed() {
  const client = new pg.Client({ connectionString: CONN, ssl: { rejectUnauthorized: false } });
  await client.connect();

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
    const r = await client.query(
      `INSERT INTO "Category" (name, icon, "sortOrder") VALUES ($1, $2, $3) ON CONFLICT DO NOTHING RETURNING id`,
      [name, icon, sort]
    );
    if (r.rows[0]) catIds[name] = r.rows[0].id;
  }

  // fallback IDs
  const allCats = await client.query(`SELECT id, name FROM "Category"`);
  allCats.rows.forEach(r => { catIds[r.name] = r.id; });

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

  for (const [name, catId, price, material, desc] of products) {
    await client.query(
      `INSERT INTO "Product" (name, "categoryId", price, image, material, description) VALUES ($1, $2, $3, '', $4, $5) ON CONFLICT DO NOTHING`,
      [name, catId, price, material, desc]
    );
    process.stdout.write('.');
  }

  console.log('\nSeeded ' + products.length + ' products!');
  await client.end();
}

seed().catch(e => { console.error(e); process.exit(1); });