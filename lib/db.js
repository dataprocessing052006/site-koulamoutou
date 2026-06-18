/* Pool Postgres (Neon / Vercel) — accepte POSTGRES_URL ou DATABASE_URL. */
const { Pool } = require("pg");

var pool = null;

function getPool() {
  if (pool) return pool;
  var cs = process.env.POSTGRES_URL || process.env.DATABASE_URL ||
           process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL_UNPOOLED;
  if (!cs) throw new Error("Aucune chaîne de connexion (POSTGRES_URL / DATABASE_URL) trouvée.");
  pool = new Pool({ connectionString: cs, ssl: { rejectUnauthorized: false }, max: 3 });
  return pool;
}

function q(texte, params) { return getPool().query(texte, params || []); }

module.exports = { getPool, q };
