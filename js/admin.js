/* ===================================================================
   Back-office — articles + utilisateurs (API Vercel + Postgres + Blob)
   =================================================================== */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var moi = null;

  function api(url, opts) {
    opts = opts || {};
    opts.credentials = "same-origin";
    opts.headers = Object.assign({ "Content-Type": "application/json" }, opts.headers || {});
    return fetch(url, opts);
  }
  function msg(el, t, type) { el.textContent = t; el.className = "adm-msg " + (type || ""); }

  /* ---------------- Session ---------------- */
  function init() {
    api("/api/me").then(function (r) {
      if (r.status !== 200) { afficher(false); return; }
      return r.json().then(function (u) { moi = u; afficher(true); });
    }).catch(function () { afficher(false); });
  }

  function afficher(connecte) {
    $("adm-login").style.display = connecte ? "none" : "block";
    $("adm-app").style.display = connecte ? "block" : "none";
    $("btn-sortir").style.display = connecte ? "inline-flex" : "none";
    $("lien-dashboard").style.display = connecte ? "inline" : "none";
    if (connecte) {
      $("adm-qui").textContent = (moi.nom || "") + " · " + (moi.role === "admin" ? "Administrateur" : "Éditeur");
      $("bloc-users").style.display = (moi.role === "admin") ? "block" : "none";
      chargerArticles();
      if (moi.role === "admin") chargerUsers();
    }
  }

  $("form-login").addEventListener("submit", function (e) {
    e.preventDefault();
    api("/api/login", { method: "POST", body: JSON.stringify({ email: $("email").value.trim(), password: $("mdp").value }) })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (!res.ok) { msg($("login-msg"), "Échec : " + (res.d.error || ""), "err"); return; }
        $("mdp").value = ""; init();
      })
      .catch(function () { msg($("login-msg"), "Erreur réseau.", "err"); });
  });
  $("btn-sortir").addEventListener("click", function () {
    api("/api/login", { method: "DELETE" }).then(function () { moi = null; afficher(false); });
  });

  /* ---------------- Articles ---------------- */
  function preparerImage(fichier) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () {
        var max = 1280, w = img.width, h = img.height;
        if (w > max) { h = Math.round(h * max / w); w = max; }
        var cv = document.createElement("canvas"); cv.width = w; cv.height = h;
        cv.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(cv.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject; img.src = URL.createObjectURL(fichier);
    });
  }
  $("art-image").addEventListener("change", function () {
    var f = this.files[0];
    if (f) { $("art-apercu").style.display = "block"; $("art-apercu-img").src = URL.createObjectURL(f); }
  });

  var imageActuelle = "";
  $("form-article").addEventListener("submit", function (e) {
    e.preventDefault();
    var btn = e.submitter; if (btn) btn.disabled = true;
    var fichier = $("art-image").files[0];
    var finaliser = function (imageUrl) {
      var data = {
        id: $("art-id").value || undefined,
        titre: $("art-titre").value.trim(), categorie: $("art-cat").value,
        chapeau: $("art-chapeau").value.trim(), contenu: $("art-contenu").value.trim(),
        image_url: imageUrl || imageActuelle || null,
        publie: $("art-publie").checked, date_pub: $("art-date").value
      };
      api("/api/articles", { method: data.id ? "PUT" : "POST", body: JSON.stringify(data) })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (btn) btn.disabled = false;
          if (!res.ok) { msg($("app-msg"), "Erreur : " + (res.d.error || ""), "err"); return; }
          msg($("app-msg"), data.id ? "Article mis à jour." : "Article créé.", "ok");
          resetArticle(); chargerArticles();
        })
        .catch(function () { if (btn) btn.disabled = false; msg($("app-msg"), "Erreur réseau.", "err"); });
    };
    if (fichier) {
      preparerImage(fichier)
        .then(function (dataUrl) { return api("/api/upload", { method: "POST", body: JSON.stringify({ dataUrl: dataUrl }) }).then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); }); })
        .then(function (res) { if (!res.ok) { if (btn) btn.disabled = false; msg($("app-msg"), "Image : " + (res.d.error || ""), "err"); return; } finaliser(res.d.url); })
        .catch(function () { if (btn) btn.disabled = false; msg($("app-msg"), "Erreur d'envoi de l'image.", "err"); });
    } else { finaliser(null); }
  });
  function resetArticle() { $("form-article").reset(); $("art-id").value = ""; imageActuelle = ""; $("art-apercu").style.display = "none"; $("editeur-titre").textContent = "Nouvel article"; }
  $("btn-annuler").addEventListener("click", resetArticle);

  function chargerArticles() {
    api("/api/articles?all=1").then(function (r) {
      if (!r.ok) { afficher(false); return; }
      return r.json().then(function (arts) {
        var c = $("adm-liste");
        if (!arts.length) { c.innerHTML = '<p style="color:var(--gris)">Aucun article.</p>'; return; }
        c.innerHTML = "";
        arts.forEach(function (a) {
          var d = document.createElement("div"); d.className = "adm-liste__item";
          d.innerHTML = (a.image_url ? '<img class="adm-vign" src="' + a.image_url + '">' : '<span class="adm-vign"></span>') +
            '<div class="adm-liste__t"><h4></h4><span>' + (a.categorie || "") + " · " + (a.date_pub || "").slice(0, 10) + '</span></div>' +
            '<span class="adm-statut ' + (a.publie ? "on" : "off") + '">' + (a.publie ? "Publié" : "Retiré") + "</span>" +
            '<div class="adm-actions"><button class="adm-mini" data-t>' + (a.publie ? "Retirer" : "Publier") + '</button><button class="adm-mini" data-e>Modifier</button><button class="adm-mini" data-d>Suppr.</button></div>';
          d.querySelector(".adm-liste__t h4").textContent = a.titre;
          d.querySelector("[data-t]").addEventListener("click", function () { toggleArt(a); });
          d.querySelector("[data-e]").addEventListener("click", function () { editArt(a); });
          d.querySelector("[data-d]").addEventListener("click", function () { delArt(a); });
          c.appendChild(d);
        });
      });
    });
  }
  function toggleArt(a) { api("/api/articles", { method: "PUT", body: JSON.stringify(Object.assign({}, a, { publie: !a.publie, date_pub: (a.date_pub || "").slice(0, 10) })) }).then(function () { chargerArticles(); }); }
  function editArt(a) {
    $("art-id").value = a.id; $("art-titre").value = a.titre || ""; $("art-cat").value = a.categorie || "Général";
    $("art-date").value = (a.date_pub || "").slice(0, 10); $("art-chapeau").value = a.chapeau || ""; $("art-contenu").value = a.contenu || "";
    $("art-publie").checked = !!a.publie; imageActuelle = a.image_url || "";
    if (a.image_url) { $("art-apercu").style.display = "block"; $("art-apercu-img").src = a.image_url; } else $("art-apercu").style.display = "none";
    $("editeur-titre").textContent = "Modifier l'article"; window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function delArt(a) { if (!confirm("Supprimer « " + a.titre + " » ?")) return; api("/api/articles?id=" + encodeURIComponent(a.id), { method: "DELETE" }).then(function () { msg($("app-msg"), "Article supprimé.", "ok"); chargerArticles(); }); }

  /* ---------------- Utilisateurs (admin) ---------------- */
  $("form-user").addEventListener("submit", function (e) {
    e.preventDefault();
    var id = $("u-id").value;
    var data = { id: id || undefined, nom: $("u-nom").value.trim(), email: $("u-email").value.trim(), role: $("u-role").value, actif: $("u-actif").value === "1", password: $("u-mdp").value || undefined };
    if (!id && !data.password) { msg($("app-msg"), "Mot de passe requis pour un nouvel utilisateur.", "err"); return; }
    api("/api/users", { method: id ? "PUT" : "POST", body: JSON.stringify(data) })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (!res.ok) { msg($("app-msg"), "Erreur : " + (res.d.error || ""), "err"); return; }
        msg($("app-msg"), id ? "Utilisateur mis à jour." : "Utilisateur créé.", "ok");
        resetUser(); chargerUsers();
      });
  });
  function resetUser() { $("form-user").reset(); $("u-id").value = ""; $("u-mdp-label").textContent = "Mot de passe *"; }
  $("u-annuler").addEventListener("click", resetUser);

  function chargerUsers() {
    api("/api/users").then(function (r) {
      if (!r.ok) return;
      return r.json().then(function (us) {
        var c = $("users-liste");
        if (!us.length) { c.innerHTML = '<p style="color:var(--gris)">Aucun utilisateur.</p>'; return; }
        c.innerHTML = "";
        us.forEach(function (u) {
          var d = document.createElement("div"); d.className = "adm-liste__item";
          d.innerHTML = '<div class="adm-liste__t"><h4></h4><span class="u-mail"></span></div>' +
            '<span class="adm-role">' + (u.role === "admin" ? "Admin" : "Éditeur") + "</span>" +
            '<span class="adm-statut ' + (u.actif ? "on" : "off") + '">' + (u.actif ? "Actif" : "Inactif") + "</span>" +
            '<div class="adm-actions"><button class="adm-mini" data-e>Modifier</button><button class="adm-mini" data-d>Suppr.</button></div>';
          d.querySelector("h4").textContent = u.nom;
          d.querySelector(".u-mail").textContent = u.email;
          d.querySelector("[data-e]").addEventListener("click", function () { editUser(u); });
          d.querySelector("[data-d]").addEventListener("click", function () { delUser(u); });
          c.appendChild(d);
        });
      });
    });
  }
  function editUser(u) {
    $("u-id").value = u.id; $("u-nom").value = u.nom || ""; $("u-email").value = u.email || "";
    $("u-role").value = u.role || "editeur"; $("u-actif").value = u.actif ? "1" : "0";
    $("u-mdp").value = ""; $("u-mdp-label").textContent = "Nouveau mot de passe (laisser vide pour ne pas changer)";
    $("bloc-users").scrollIntoView({ behavior: "smooth" });
  }
  function delUser(u) { if (!confirm("Supprimer l'utilisateur « " + u.nom + " » ?")) return; api("/api/users?id=" + encodeURIComponent(u.id), { method: "DELETE" }).then(function () { chargerUsers(); }); }

  init();
})();
