const { Client } = require('pg');
const url = 'postgres://bbcf8954088957e4fbb0bc328f877a1ee6bb990801161a42912c228557579937:sk_1D334oCMZ_6crYbIsn9Gx@db.prisma.io:5432/postgres?sslmode=require';
(async () => {
  const c = new Client({ connectionString: url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000, statement_timeout: 20000 });
  await c.connect();
  console.log('count...');
  const r = await c.query('SELECT count(*)::int n FROM "Product"');
  console.log('count=', r.rows[0].n);
  console.log('simple select...');
  const r2 = await c.query('SELECT id, name FROM "Product"');
  console.log(JSON.stringify(r2.rows));
  await c.end();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
