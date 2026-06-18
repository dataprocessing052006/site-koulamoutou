const { q } = require("../lib/db");
const { estAdmin, hacher } = require("../lib/auth");

var ROLES = ["admin", "editeur"];

module.exports = async (req, res) => {
  if (!estAdmin(req)) return res.status(401).json({ error: "Réservé aux administrateurs" });
  try {
    if (req.method === "GET") {
      var r = await q("select id, nom, email, role, actif, created_at from users order by created_at desc");
      return res.json(r.rows);
    }

    var b = req.body || {};

    if (req.method === "POST") {
      if (!b.nom || !b.email || !b.password) return res.status(400).json({ error: "Nom, e-mail et mot de passe requis" });
      var role = ROLES.indexOf(b.role) !== -1 ? b.role : "editeur";
      try {
        var ins = await q(
          "insert into users (nom, email, role, password_hash, actif) values ($1,$2,$3,$4,$5) returning id, nom, email, role, actif",
          [b.nom, b.email.trim().toLowerCase(), role, hacher(b.password), b.actif !== false]
        );
        return res.json(ins.rows[0]);
      } catch (e) {
        if (/unique/i.test(e.message)) return res.status(409).json({ error: "Cet e-mail existe déjà" });
        throw e;
      }
    }

    if (req.method === "PUT") {
      if (!b.id) return res.status(400).json({ error: "id manquant" });
      var role2 = ROLES.indexOf(b.role) !== -1 ? b.role : "editeur";
      if (b.password) {
        await q("update users set nom=$1, email=$2, role=$3, actif=$4, password_hash=$5 where id=$6",
          [b.nom, b.email.trim().toLowerCase(), role2, b.actif !== false, hacher(b.password), b.id]);
      } else {
        await q("update users set nom=$1, email=$2, role=$3, actif=$4 where id=$5",
          [b.nom, b.email.trim().toLowerCase(), role2, b.actif !== false, b.id]);
      }
      return res.json({ ok: true });
    }

    if (req.method === "DELETE") {
      var id = req.query.id || b.id;
      if (!id) return res.status(400).json({ error: "id manquant" });
      await q("delete from users where id = $1", [id]);
      return res.json({ ok: true });
    }

    res.status(405).json({ error: "Méthode non autorisée" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
