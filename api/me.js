const { session } = require("../lib/auth");

module.exports = (req, res) => {
  var s = session(req);
  if (!s) return res.status(401).json({ error: "Non connecté" });
  res.json({ uid: s.uid, role: s.role, nom: s.nom, email: s.email || null });
};
