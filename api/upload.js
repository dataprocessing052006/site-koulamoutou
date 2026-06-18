const { put } = require("@vercel/blob");
const { peutEcrireArticles } = require("../lib/auth");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Méthode non autorisée" });
  if (!peutEcrireArticles(req)) return res.status(401).json({ error: "Non autorisé" });
  try {
    var b = req.body || {};
    var dataUrl = b.dataUrl;
    if (!dataUrl) return res.status(400).json({ error: "Image manquante" });
    var m = dataUrl.match(/^data:(.+?);base64,(.*)$/);
    if (!m) return res.status(400).json({ error: "Format d'image invalide" });
    var type = m[1];
    var buf = Buffer.from(m[2], "base64");
    var ext = (type.split("/")[1] || "jpg").replace("jpeg", "jpg");
    var nom = "actus/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext;
    var blob = await put(nom, buf, { access: "public", contentType: type });
    res.json({ url: blob.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
