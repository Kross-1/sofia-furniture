const { createClient } = require('@vercel/postgres');
require('dotenv').config();

async function migrate() {
  console.log('Начинаю миграцию базы данных...');

  const client = createClient({
    connectionString: process.env.POSTGRES_URL_NON_POOLING,
  });

  try {
    await client.connect();
    
    // 1. Создание таблицы продуктов
    await client.sql`
      CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          price INTEGER NOT NULL,
          image TEXT,
          images TEXT[],
          videos TEXT[],
          material VARCHAR(100),
          description TEXT
      );
    `;
    console.log('Таблица products создана.');

    // 2. Создание таблицы контента сайта
    await client.sql`
      CREATE TABLE IF NOT EXISTS site_content (
          id SERIAL PRIMARY KEY,
          page_section VARCHAR(20) NOT NULL,
          item_key VARCHAR(50) NOT NULL,
          item_value TEXT,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(page_section, item_key)
      );
    `;
    console.log('Таблица site_content создана.');
    
    console.log('Миграция успешно завершена.');
  } catch (error) {
    console.error('Ошибка миграции:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
