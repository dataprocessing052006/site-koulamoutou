/* ===================================================================
   Back-office des actualités — API Vercel (/api) + Postgres + Blob
   =================================================================== */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };

  function message(el, texte, type) { el.textContent = texte; el.className = "adm-msg " + (type || ""); }
  function api(url, opts) {
    opts = opts || {};
    opts.credentials = "same-origin";
    opts.headers = Object.assign({ "Content-Type": "application/json" }, opts.headers || {});
    return fetch(url, opts);
  }

  /* ---------- État de connexion ---------- */
  function afficher(connecte) {
    $("adm-login").style.display = connecte ? "none" : "block";
    $("adm-app").style.display = connecte ? "block" : "none";
    $("btn-sortir").style.display = connecte ? "inline-flex" : "none";
    if (connecte) chargerListe();
  }

  // Au chargement : suis-je déjà connecté ?
  api("/api/articles?all=1").then(function (r) { afficher(r.status === 200); }).catch(function () { afficher(false); });

  /* ---------- Connexion / déconnexion ---------- */
  $("form-login").addEventListener("submit", function (e) {
    e.preventDefault();
    api("/api/login", { method: "POST", body: JSON.stringify({ password: $("mdp").value }) })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (!res.ok) { message($("login-msg"), "Échec : " + (res.d.error || "connexion"), "err"); return; }
        afficher(true);
      })
      .catch(function () { message($("login-msg"), "Erreur réseau.", "err"); });
  });
  $("btn-sortir").addEventListener("click", function () {
    api("/api/login", { method: "DELETE" }).then(function () { afficher(false); });
  });

  /* ---------- Redimensionnement image (max 1280px) -> dataURL ---------- */
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
      img.onerror = reject;
      img.src = URL.createObjectURL(fichier);
    });
  }

  $("art-image").addEventListener("change", function () {
    var f = this.files[0];
    if (f) { $("art-apercu").style.display = "block"; $("art-apercu-img").src = URL.createObjectURL(f); }
  });

  /* ---------- Enregistrer (créer / modifier) ---------- */
  var imageActuelle = "";

  $("form-article").addEventListener("submit", function (e) {
    e.preventDefault();
    var btn = e.submitter; if (btn) btn.disabled = true;
    var fichier = $("art-image").files[0];

    var finaliser = function (imageUrl) {
      var data = {
        id: $("art-id").value || undefined,
        titre: $("art-titre").value.trim(),
        categorie: $("art-cat").value,
        chapeau: $("art-chapeau").value.trim(),
        contenu: $("art-contenu").value.trim(),
        image_url: imageUrl || imageActuelle || null,
        publie: $("art-publie").checked,
        date_pub: $("art-date").value
      };
      var methode = data.id ? "PUT" : "POST";
      api("/api/articles", { method: methode, body: JSON.stringify(data) })
        .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
        .then(function (res) {
          if (btn) btn.disabled = false;
          if (!res.ok) { message($("app-msg"), "Erreur : " + (res.d.error || ""), "err"); return; }
          message($("app-msg"), data.id ? "Article mis à jour." : "Article créé.", "ok");
          reinitialiser(); chargerListe();
        })
        .catch(function () { if (btn) btn.disabled = false; message($("app-msg"), "Erreur réseau.", "err"); });
    };

    if (fichier) {
      preparerImage(fichier)
        .then(function (dataUrl) {
          return api("/api/upload", { method: "POST", body: JSON.stringify({ dataUrl: dataUrl }) })
            .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); });
        })
        .then(function (res) {
          if (!res.ok) { if (btn) btn.disabled = false; message($("app-msg"), "Image : " + (res.d.error || ""), "err"); return; }
          finaliser(res.d.url);
        })
        .catch(function () { if (btn) btn.disabled = false; message($("app-msg"), "Erreur d'envoi de l'image.", "err"); });
    } else {
      finaliser(null);
    }
  });

  function reinitialiser() {
    $("form-article").reset();
    $("art-id").value = ""; imageActuelle = "";
    $("art-apercu").style.display = "none";
    $("editeur-titre").textContent = "Nouvel article";
  }
  $("btn-annuler").addEventListener("click", reinitialiser);

  /* ---------- Liste ---------- */
  function chargerListe() {
    api("/api/articles?all=1").then(function (r) {
      if (!r.ok) { $("adm-liste").innerHTML = '<p style="color:#b91c1c">Session expirée.</p>'; afficher(false); return; }
      return r.json().then(function (arts) {
        var cont = $("adm-liste");
        if (!arts || !arts.length) { cont.innerHTML = '<p style="color:var(--gris)">Aucun article pour le moment.</p>'; return; }
        cont.innerHTML = "";
        arts.forEach(function (a) {
          var div = document.createElement("div");
          div.className = "adm-liste__item";
          div.innerHTML =
            (a.image_url ? '<img class="adm-vign" src="' + a.image_url + '" alt="">' : '<span class="adm-vign"></span>') +
            '<div class="adm-liste__t"><h4></h4><span>' + (a.categorie || "") + " · " + (a.date_pub || "").slice(0, 10) + '</span></div>' +
            '<span class="adm-statut ' + (a.publie ? "on" : "off") + '">' + (a.publie ? "Publié" : "Retiré") + "</span>" +
            '<div class="adm-actions">' +
              '<button class="adm-mini" data-toggle>' + (a.publie ? "Retirer" : "Publier") + "</button>" +
              '<button class="adm-mini" data-edit>Modifier</button>' +
              '<button class="adm-mini" data-del>Supprimer</button>' +
            "</div>";
          div.querySelector(".adm-liste__t h4").textContent = a.titre;
          div.querySelector("[data-toggle]").addEventListener("click", function () { basculer(a); });
          div.querySelector("[data-edit]").addEventListener("click", function () { editer(a); });
          div.querySelector("[data-del]").addEventListener("click", function () { supprimer(a); });
          cont.appendChild(div);
        });
      });
    });
  }

  function basculer(a) {
    var data = Object.assign({}, a, { publie: !a.publie, date_pub: (a.date_pub || "").slice(0, 10) });
    api("/api/articles", { method: "PUT", body: JSON.stringify(data) }).then(function (r) {
      if (!r.ok) { message($("app-msg"), "Erreur.", "err"); return; }
      chargerListe();
    });
  }

  function editer(a) {
    $("art-id").value = a.id;
    $("art-titre").value = a.titre || "";
    $("art-cat").value = a.categorie || "Général";
    $("art-date").value = (a.date_pub || "").slice(0, 10);
    $("art-chapeau").value = a.chapeau || "";
    $("art-contenu").value = a.contenu || "";
    $("art-publie").checked = !!a.publie;
    imageActuelle = a.image_url || "";
    if (a.image_url) { $("art-apercu").style.display = "block"; $("art-apercu-img").src = a.image_url; }
    else $("art-apercu").style.display = "none";
    $("editeur-titre").textContent = "Modifier l'article";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function supprimer(a) {
    if (!window.confirm("Supprimer définitivement « " + a.titre + " » ?")) return;
    api("/api/articles?id=" + encodeURIComponent(a.id), { method: "DELETE" }).then(function (r) {
      if (!r.ok) { message($("app-msg"), "Erreur.", "err"); return; }
      message($("app-msg"), "Article supprimé.", "ok"); chargerListe();
    });
  }
})();
