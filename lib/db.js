/* Pool Postgres (Neon / Vercel).
   Auto-détecte la chaîne de connexion quel que soit le préfixe des
   variables d'environnement (POSTGRES_URL, DATABASE_URL, STORAGE_URL, …). */
const { Pool } = require("pg");

var pool = null;

function trouverConnexion() {
  // 1) noms usuels
  var connues = ["POSTGRES_URL", "DATABASE_URL", "POSTGRES_PRISMA_URL"];
  for (var i = 0; i < connues.length; i++) {
    if (process.env[connues[i]]) return process.env[connues[i]];
  }
  // 2) sinon, balayer toutes les variables et repérer une URL postgres
  var cands = [];
  for (var k in process.env) {
    var v = process.env[k];
    if (typeof v === "string" && /^postgres(ql)?:\/\//.test(v)) cands.push([k, v]);
  }
  if (!cands.length) return null;
  // préférer une connexion "poolée" (clé sans UNPOOLED)
  cands.sort(function (a, b) { return (/UNPOOLED/i.test(a[0]) ? 1 : 0) - (/UNPOOLED/i.test(b[0]) ? 1 : 0); });
  return cands[0][1];
}

function getPool() {
  if (pool) return pool;
  var cs = trouverConnexion();
  if (!cs) throw new Error("Aucune chaîne de connexion Postgres trouvée dans les variables d'environnement.");
  pool = new Pool({ connectionString: cs, ssl: { rejectUnauthorized: false }, max: 3 });
  return pool;
}

function q(texte, params) { return getPool().query(texte, params || []); }

module.exports = { getPool, q };
