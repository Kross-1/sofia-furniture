import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method } = req;
  const connString = process.env.DATABASE_URL || '';

  if (!connString || connString.includes('example.com')) {
    return res.json({ error: 'DATABASE_URL not configured' }, { status: 500 });
  }

  if (method === 'GET') {
    const table = (req.query.table as string) || '';
    const page = req.query.page as string;

    try {
      const url = new URL('/api/db', req.headers.host?.startsWith('localhost') ? 'http://localhost:3000' : 'https://mahachkala-mebel.ru');
      url.searchParams.set('table', table);
      if (page) url.searchParams.set('page', page);

      const resp = await fetch(url.toString(), {
        headers: { 'x-api-key': connString },
        redirect: 'manual',
      });

      const data = await resp.text();
      return res.json({ debug: data, status: resp.status });
    } catch (e: unknown) {
      return res.json({ error: (e as Error).message }, { status: 500 });
    }
  }

  return res.json({ error: 'Method not allowed' }, { status: 405 });
}