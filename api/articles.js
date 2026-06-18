const { sql } = require("@vercel/postgres");
const { estAdmin } = require("../lib/auth");

function aujourdhui() { return new Date().toISOString().slice(0, 10); }

module.exports = async (req, res) => {
  try {
    if (req.method === "GET") {
      var id = req.query.id;
      var all = req.query.all;
      if (id) {
        var r1 = await sql`select * from articles where id = ${id} and publie = true limit 1`;
        return res.json(r1.rows[0] || null);
      }
      if (all && estAdmin(req)) {
        var r2 = await sql`select * from articles order by date_pub desc, created_at desc`;
        return res.json(r2.rows);
      }
      var r3 = await sql`select * from articles where publie = true order by date_pub desc, created_at desc`;
      return res.json(r3.rows);
    }

    if (!estAdmin(req)) return res.status(401).json({ error: "Non autorisé" });
    var a = req.body || {};

    if (req.method === "POST") {
      var d = (a.date_pub && a.date_pub.length) ? a.date_pub : aujourdhui();
      var ins = await sql`
        insert into articles (titre, categorie, chapeau, contenu, image_url, publie, date_pub)
        values (${a.titre}, ${a.categorie || "Général"}, ${a.chapeau || null}, ${a.contenu || null},
                ${a.image_url || null}, ${!!a.publie}, ${d})
        returning *`;
      return res.json(ins.rows[0]);
    }

    if (req.method === "PUT") {
      if (!a.id) return res.status(400).json({ error: "id manquant" });
      var d2 = (a.date_pub && a.date_pub.length) ? a.date_pub : aujourdhui();
      var upd = await sql`
        update articles set
          titre = ${a.titre}, categorie = ${a.categorie || "Général"},
          chapeau = ${a.chapeau || null}, contenu = ${a.contenu || null},
          image_url = ${a.image_url || null}, publie = ${!!a.publie}, date_pub = ${d2}
        where id = ${a.id} returning *`;
      return res.json(upd.rows[0]);
    }

    if (req.method === "DELETE") {
      var did = req.query.id || a.id;
      if (!did) return res.status(400).json({ error: "id manquant" });
      await sql`delete from articles where id = ${did}`;
      return res.json({ ok: true });
    }

    res.status(405).json({ error: "Méthode non autorisée" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
