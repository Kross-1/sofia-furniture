export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    env: {
      hasPrisma: typeof process.env.PRISMA_DATABASE_URL === 'string' && process.env.PRISMA_DATABASE_URL.length > 0,
      prismaPrefix: process.env.PRISMA_DATABASE_URL ? process.env.PRISMA_DATABASE_URL.substring(0, 20) : null,
      hasPostgres: typeof process.env.POSTGRES_URL === 'string' && process.env.POSTGRES_URL.length > 0,
      postgresPrefix: process.env.POSTGRES_URL ? process.env.POSTGRES_URL.substring(0, 20) : null,
      hasDatabase: typeof process.env.DATABASE_URL === 'string' && process.env.DATABASE_URL.length > 0,
      databasePrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) : null,
      nodeVersion: process.version,
    },
  });
}
