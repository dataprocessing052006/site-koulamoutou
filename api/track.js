const { q } = require("../lib/db");

/* Enregistre une vue de page (public). Ne bloque jamais le front. */
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  try {
    var b = req.body || {};
    var chemin = String(b.chemin || "/").slice(0, 200);
    var aid = b.articleId ? String(b.articleId).slice(0, 64) : null;
    await q("insert into vues (chemin, article_id) values ($1, $2)", [chemin, aid]);
    res.json({ ok: true });
  } catch (e) {
    res.status(200).json({ ok: false });
  }
};
