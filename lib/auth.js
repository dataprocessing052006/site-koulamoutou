/* Authentification : cookie signé (HMAC) + hachage des mots de passe (scrypt). */
const crypto = require("crypto");
const SECRET = process.env.AUTH_SECRET || "dev-secret-a-changer";
const COOKIE = "km_session";

/* ---------- Cookie de session signé ---------- */
function sign(payload) {
  var body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  var sig = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  return body + "." + sig;
}
function verify(token) {
  if (!token || token.indexOf(".") === -1) return null;
  var parts = token.split("."), body = parts[0], sig = parts[1];
  var attendu = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  try {
    if (sig.length !== attendu.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(attendu))) return null;
    var p = JSON.parse(Buffer.from(body, "base64url").toString());
    if (p.exp && Date.now() > p.exp) return null;
    return p;
  } catch (e) { return null; }
}
function lireCookie(req, nom) {
  var h = (req.headers && req.headers.cookie) || "";
  var m = h.match(new RegExp("(?:^|; )" + nom + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}

/* ---------- Session / rôles ---------- */
function session(req) { return verify(lireCookie(req, COOKIE)); }
function estConnecte(req) { return !!session(req); }
function estAdmin(req) { var s = session(req); return !!s && s.role === "admin"; }
// alias historique : "connecté" suffit pour gérer les articles
function peutEcrireArticles(req) { return estConnecte(req); }

function cookieSession(token, maxAgeSec) {
  return COOKIE + "=" + encodeURIComponent(token) +
    "; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=" + maxAgeSec;
}
function cookieEffacer() {
  return COOKIE + "=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0";
}

/* ---------- Hachage des mots de passe (scrypt, sans dépendance) ---------- */
function hacher(mdp) {
  var sel = crypto.randomBytes(16).toString("hex");
  var dk = crypto.scryptSync(String(mdp), sel, 32).toString("hex");
  return "scrypt$" + sel + "$" + dk;
}
function verifierMdp(mdp, stocke) {
  try {
    var p = String(stocke).split("$");
    if (p[0] !== "scrypt") return false;
    var dk = crypto.scryptSync(String(mdp), p[1], 32).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(dk), Buffer.from(p[2]));
  } catch (e) { return false; }
}

module.exports = {
  sign, verify, session, estConnecte, estAdmin, peutEcrireArticles,
  cookieSession, cookieEffacer, hacher, verifierMdp, COOKIE
};
