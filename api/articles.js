const { q } = require("../lib/db");
const { peutEcrireArticles } = require("../lib/auth");

function aujourdhui() { return new Date().toISOString().slice(0, 10); }

module.exports = async (req, res) => {
  try {
    if (req.method === "GET") {
      var id = req.query.id;
      var all = req.query.all;
      if (id) {
        var r1 = await q("select * from articles where id = $1 and publie = true limit 1", [id]);
        return res.json(r1.rows[0] || null);
      }
      if (all) {
        if (!peutEcrireArticles(req)) return res.status(401).json({ error: "Non autorisé" });
        var r2 = await q("select * from articles order by date_pub desc, created_at desc");
        return res.json(r2.rows);
      }
      var r3 = await q("select * from articles where publie = true order by date_pub desc, created_at desc");
      return res.json(r3.rows);
    }

    if (!peutEcrireArticles(req)) return res.status(401).json({ error: "Non autorisé" });
    var a = req.body || {};

    if (req.method === "POST") {
      var d = (a.date_pub && a.date_pub.length) ? a.date_pub : aujourdhui();
      var ins = await q(
        "insert into articles (titre, categorie, chapeau, contenu, image_url, publie, date_pub) " +
        "values ($1,$2,$3,$4,$5,$6,$7) returning *",
        [a.titre, a.categorie || "Général", a.chapeau || null, a.contenu || null, a.image_url || null, !!a.publie, d]
      );
      return res.json(ins.rows[0]);
    }

    if (req.method === "PUT") {
      if (!a.id) return res.status(400).json({ error: "id manquant" });
      var d2 = (a.date_pub && a.date_pub.length) ? a.date_pub : aujourdhui();
      var upd = await q(
        "update articles set titre=$1, categorie=$2, chapeau=$3, contenu=$4, image_url=$5, publie=$6, date_pub=$7 " +
        "where id=$8 returning *",
        [a.titre, a.categorie || "Général", a.chapeau || null, a.contenu || null, a.image_url || null, !!a.publie, d2, a.id]
      );
      return res.json(upd.rows[0]);
    }

    if (req.method === "DELETE") {
      var did = req.query.id || a.id;
      if (!did) return res.status(400).json({ error: "id manquant" });
      await q("delete from articles where id = $1", [did]);
      return res.json({ ok: true });
    }

    res.status(405).json({ error: "Méthode non autorisée" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
