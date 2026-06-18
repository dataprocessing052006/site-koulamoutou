/* ===================================================================
   Back-office des actualités — connexion + édition + publication
   =================================================================== */
(function () {
  "use strict";

  var sb = window.creerClientSupabase && window.creerClientSupabase();
  var $ = function (id) { return document.getElementById(id); };

  if (!sb) {
    $("adm-config-alerte").style.display = "block";
    return;
  }

  function message(el, texte, type) {
    el.textContent = texte;
    el.className = "adm-msg " + (type || "");
  }

  /* ---------- Affichage selon l'état de connexion ---------- */
  function afficher(connecte) {
    $("adm-login").style.display = connecte ? "none" : "block";
    $("adm-app").style.display = connecte ? "block" : "none";
    $("btn-sortir").style.display = connecte ? "inline-flex" : "none";
    if (connecte) chargerListe();
  }

  sb.auth.getSession().then(function (res) {
    afficher(!!(res.data && res.data.session));
  });

  /* ---------- Connexion / déconnexion ---------- */
  $("form-login").addEventListener("submit", function (e) {
    e.preventDefault();
    sb.auth.signInWithPassword({ email: $("email").value.trim(), password: $("mdp").value })
      .then(function (res) {
        if (res.error) { message($("login-msg"), "Échec : " + res.error.message, "err"); return; }
        afficher(true);
      });
  });
  $("btn-sortir").addEventListener("click", function () {
    sb.auth.signOut().then(function () { afficher(false); });
  });

  /* ---------- Upload image ---------- */
  function televerser(fichier) {
    var ext = (fichier.name.split(".").pop() || "jpg").toLowerCase();
    var nom = "art-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext;
    return sb.storage.from("actus").upload(nom, fichier, { upsert: false })
      .then(function (res) {
        if (res.error) throw res.error;
        return sb.storage.from("actus").getPublicUrl(nom).data.publicUrl;
      });
  }

  /* ---------- Enregistrer (créer ou modifier) ---------- */
  var imageActuelle = "";

  $("art-image").addEventListener("change", function () {
    var f = this.files[0];
    if (f) { $("art-apercu").style.display = "block"; $("art-apercu-img").src = URL.createObjectURL(f); }
  });

  $("form-article").addEventListener("submit", function (e) {
    e.preventDefault();
    var btn = e.submitter; if (btn) btn.disabled = true;
    var fichier = $("art-image").files[0];

    var enregistrer = function (imageUrl) {
      var donnees = {
        titre: $("art-titre").value.trim(),
        categorie: $("art-cat").value,
        chapeau: $("art-chapeau").value.trim(),
        contenu: $("art-contenu").value.trim(),
        publie: $("art-publie").checked,
        date_pub: $("art-date").value || new Date().toISOString().slice(0, 10)
      };
      if (imageUrl) donnees.image_url = imageUrl;

      var id = $("art-id").value;
      var op = id
        ? sb.from("articles").update(donnees).eq("id", id)
        : sb.from("articles").insert(donnees);

      op.then(function (res) {
        if (btn) btn.disabled = false;
        if (res.error) { message($("app-msg"), "Erreur : " + res.error.message, "err"); return; }
        message($("app-msg"), id ? "Article mis à jour." : "Article créé.", "ok");
        reinitialiser();
        chargerListe();
      });
    };

    if (fichier) {
      televerser(fichier).then(enregistrer).catch(function (err) {
        if (btn) btn.disabled = false;
        message($("app-msg"), "Image : " + err.message, "err");
      });
    } else {
      enregistrer(imageActuelle);
    }
  });

  function reinitialiser() {
    $("form-article").reset();
    $("art-id").value = "";
    imageActuelle = "";
    $("art-apercu").style.display = "none";
    $("editeur-titre").textContent = "Nouvel article";
  }
  $("btn-annuler").addEventListener("click", reinitialiser);

  /* ---------- Liste des articles ---------- */
  function chargerListe() {
    sb.from("articles").select("*").order("date_pub", { ascending: false }).order("created_at", { ascending: false })
      .then(function (res) {
        var cont = $("adm-liste");
        if (res.error) { cont.innerHTML = '<p style="color:#b91c1c">' + res.error.message + "</p>"; return; }
        var arts = res.data || [];
        if (!arts.length) { cont.innerHTML = '<p style="color:var(--gris)">Aucun article pour le moment.</p>'; return; }
        cont.innerHTML = "";
        arts.forEach(function (a) {
          var div = document.createElement("div");
          div.className = "adm-liste__item";
          div.innerHTML =
            (a.image_url ? '<img class="adm-vign" src="' + a.image_url + '" alt="">' : '<span class="adm-vign"></span>') +
            '<div class="adm-liste__t"><h4></h4><span>' + a.categorie + ' · ' + a.date_pub + '</span></div>' +
            '<span class="adm-statut ' + (a.publie ? "on" : "off") + '">' + (a.publie ? "Publié" : "Retiré") + '</span>' +
            '<div class="adm-actions">' +
              '<button class="adm-mini" data-toggle>' + (a.publie ? "Retirer" : "Publier") + '</button>' +
              '<button class="adm-mini" data-edit>Modifier</button>' +
              '<button class="adm-mini" data-del>Supprimer</button>' +
            '</div>';
          div.querySelector(".adm-liste__t h4").textContent = a.titre;
          div.querySelector("[data-toggle]").addEventListener("click", function () { basculer(a); });
          div.querySelector("[data-edit]").addEventListener("click", function () { editer(a); });
          div.querySelector("[data-del]").addEventListener("click", function () { supprimer(a); });
          cont.appendChild(div);
        });
      });
  }

  function basculer(a) {
    sb.from("articles").update({ publie: !a.publie }).eq("id", a.id).then(function (res) {
      if (res.error) { message($("app-msg"), res.error.message, "err"); return; }
      chargerListe();
    });
  }

  function editer(a) {
    $("art-id").value = a.id;
    $("art-titre").value = a.titre || "";
    $("art-cat").value = a.categorie || "Général";
    $("art-date").value = a.date_pub || "";
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
    sb.from("articles").delete().eq("id", a.id).then(function (res) {
      if (res.error) { message($("app-msg"), res.error.message, "err"); return; }
      message($("app-msg"), "Article supprimé.", "ok");
      chargerListe();
    });
  }
})();
