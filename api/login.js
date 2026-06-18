const { sign, cookieSession, cookieEffacer } = require("../lib/auth");

module.exports = async (req, res) => {
  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", cookieEffacer());
    return res.json({ ok: true });
  }
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });

  var pwd = (req.body && req.body.password) || "";
  if (!process.env.ADMIN_PASSWORD) return res.status(500).json({ error: "ADMIN_PASSWORD non configuré" });
  if (pwd !== process.env.ADMIN_PASSWORD) return res.status(401).json({ error: "Mot de passe incorrect" });

  var token = sign({ admin: true, exp: Date.now() + 1000 * 60 * 60 * 8 }); // 8 h
  res.setHeader("Set-Cookie", cookieSession(token, 28800));
  res.json({ ok: true });
};
