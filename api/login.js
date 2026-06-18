const { sign, cookieSession, cookieEffacer, verifierMdp } = require("../lib/auth");
const { q } = require("../lib/db");

module.exports = async (req, res) => {
  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", cookieEffacer());
    return res.json({ ok: true });
  }
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  try {
    var b = req.body || {};
    var email = (b.email || "").trim().toLowerCase();
    var pwd = b.password || "";
    var payload = null;

    if (email) {
      // Connexion d'un utilisateur enregistré
      var r = await q("select * from users where lower(email) = $1 and actif = true limit 1", [email]);
      var u = r.rows[0];
      if (u && verifierMdp(pwd, u.password_hash)) {
        payload = { uid: u.id, role: u.role, nom: u.nom, email: u.email };
      }
    } else {
      // Compte principal (amorçage) via ADMIN_PASSWORD
      if (process.env.ADMIN_PASSWORD && pwd === process.env.ADMIN_PASSWORD) {
        payload = { uid: "principal", role: "admin", nom: "Administrateur principal" };
      }
    }

    if (!payload) return res.status(401).json({ error: "Identifiants incorrects" });

    payload.exp = Date.now() + 1000 * 60 * 60 * 8; // 8 h
    res.setHeader("Set-Cookie", cookieSession(sign(payload), 28800));
    res.json({ ok: true, role: payload.role, nom: payload.nom });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
