import net from 'node:net';
import tls from 'node:tls';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const out = {
    region: process.env.VERCEL_REGION,
    node: process.version,
  };

  const targets = [
    { name: 'prisma-5432', host: 'db.prisma.io', port: 5432 },
    { name: 'prisma-443',  host: 'db.prisma.io', port: 443 },
    { name: 'google-443',  host: 'www.google.com', port: 443 },
    { name: 'neon-5432',   host: 'ep-cool-forest-123456.us-east-2.aws.neon.tech', port: 5432 },
    { name: 'supabase-5432', host: 'aws-0-eu-central-1.pooler.supabase.com', port: 5432 },
  ];

  out.tcp = [];
  for (const t of targets) {
    const t0 = Date.now();
    const result = await new Promise((resolve) => {
      const sock = new net.Socket();
      let done = false;
      const finish = (data) => { if (done) return; done = true; try { sock.destroy(); } catch {} resolve(data); };
      sock.setTimeout(8000);
      sock.once('connect', () => finish({ ok: true, ms: Date.now() - t0 }));
      sock.once('timeout', () => finish({ ok: false, err: 'timeout', ms: Date.now() - t0 }));
      sock.once('error', (e) => finish({ ok: false, err: e.code || e.message, ms: Date.now() - t0 }));
      try { sock.connect(t.port, t.host); } catch (e) { finish({ ok: false, err: e.message }); }
    });
    out.tcp.push({ ...t, ...result });
  }

  // Try resolve hostname to IP
  try {
    const dns = await import('node:dns/promises');
    const addrs = await dns.resolve4('db.prisma.io');
    out.dns_prisma = addrs;
  } catch (e) {
    out.dns_prisma_err = e.message;
  }

  res.status(200).json(out);
}
