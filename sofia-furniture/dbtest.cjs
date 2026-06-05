process.removeAllListeners('warning');
const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  try {
    await c.connect();
  } catch (e) {
    console.log('CONNECT ERR:', e.message); process.exit(1);
  }
  console.log('connected');
  const t = await c.query("select tablename from pg_tables where schemaname='public' order by 1");
  console.log('tables:', t.rows.length);
  for (const r of t.rows) {
    const tn = r.tablename;
    try {
      const n = await c.query('select count(*)::int as n from "' + tn + '"');
      console.log(tn.padEnd(20) + ' = ' + n.rows[0].n);
    } catch (e) {
      console.log(tn.padEnd(20) + ' ERR: ' + e.message.split('\n')[0]);
      try { await c.end() } catch {}
      // reconnect
      const c2 = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
      await c2.connect();
      c.query = c2.query.bind(c2);
    }
  }
  await c.end();
})().catch(e => console.log('FATAL:', e.message));
