/* Authentification légère par cookie signé (HMAC), sans dépendance. */
const crypto = require("crypto");
const SECRET = process.env.AUTH_SECRET || "dev-secret-a-changer";
const COOKIE = "km_session";

function sign(payload) {
  var body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  var sig = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  return body + "." + sig;
}

function verify(token) {
  if (!token || token.indexOf(".") === -1) return null;
  var parts = token.split(".");
  var body = parts[0], sig = parts[1];
  var attendu = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
  try {
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

function estAdmin(req) { return !!verify(lireCookie(req, COOKIE)); }

function cookieSession(token, maxAgeSec) {
  return COOKIE + "=" + encodeURIComponent(token) +
    "; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=" + maxAgeSec;
}
function cookieEffacer() {
  return COOKIE + "=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0";
}

module.exports = { sign, verify, estAdmin, cookieSession, cookieEffacer, COOKIE };
