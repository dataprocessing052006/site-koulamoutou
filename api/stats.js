const { q } = require("../lib/db");
const { estConnecte, estAdmin } = require("../lib/auth");

module.exports = async (req, res) => {
  if (!estConnecte(req)) return res.status(401).json({ error: "Non autorisé" });
  try {
    var out = {};

    var a = await q("select count(*)::int total, count(*) filter (where publie)::int publies, count(*) filter (where not publie)::int retires from articles");
    out.articles = a.rows[0];

    var cat = await q("select categorie, count(*)::int n from articles group by categorie order by n desc");
    out.parCategorie = cat.rows;

    var mois = await q("select to_char(date_pub,'YYYY-MM') mois, count(*)::int n from articles where date_pub > (current_date - interval '12 months') group by 1 order by 1");
    out.parMois = mois.rows;

    var vt = await q("select count(*)::int total, count(*) filter (where created_at > now() - interval '30 days')::int trente_jours from vues");
    out.vues = vt.rows[0];

    var vj = await q("select to_char(date(created_at),'YYYY-MM-DD') j, count(*)::int n from vues where created_at > now() - interval '30 days' group by 1 order by 1");
    out.vuesParJour = vj.rows;

    var top = await q(
      "select a.id::text id, a.titre, count(*)::int n from vues v join articles a on a.id::text = v.article_id " +
      "where v.article_id is not null group by a.id, a.titre order by n desc limit 6"
    );
    out.topArticles = top.rows;

    var derniers = await q("select id, titre, categorie, publie, date_pub from articles order by date_pub desc, created_at desc limit 6");
    out.derniers = derniers.rows;

    if (estAdmin(req)) {
      var u = await q("select count(*)::int total, count(*) filter (where actif)::int actifs from users");
      out.utilisateurs = u.rows[0];
    }

    res.json(out);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
