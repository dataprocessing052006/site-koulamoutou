/* Lecteur d'article dynamique (depuis Supabase) — article.html?id=… */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var etat = $("art-etat");

  var id = new URLSearchParams(location.search).get("id");
  var sb = window.creerClientSupabase && window.creerClientSupabase();

  if (!sb) { etat.textContent = "Configuration indisponible."; return; }
  if (!id) { etat.textContent = "Article introuvable."; return; }

  sb.from("articles").select("*").eq("id", id).eq("publie", true).single()
    .then(function (res) {
      if (res.error || !res.data) { etat.textContent = "Cet article n'existe pas ou n'est plus publié."; return; }
      var a = res.data;

      document.title = a.titre + " — Actualités de Koula-Moutou";
      $("art-cat").textContent = a.categorie || "Actualité";
      $("art-titre").textContent = a.titre;
      $("art-fil").textContent = a.categorie || "Article";

      var d = a.date_pub ? new Date(a.date_pub + "T12:00:00") : null;
      if (d) $("art-date").textContent = d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

      if (a.image_url) {
        $("art-img").src = a.image_url;
        $("art-img").alt = a.titre;
        $("art-figure").style.display = "block";
      }
      if (a.chapeau) { var c = $("art-chapeau"); c.textContent = a.chapeau; c.style.display = "block"; }

      // contenu : paragraphes (saut de ligne = nouveau paragraphe)
      var corps = $("art-contenu");
      (a.contenu || "").split(/\n{2,}|\n/).forEach(function (par) {
        par = par.trim(); if (!par) return;
        var p = document.createElement("p"); p.textContent = par; corps.appendChild(p);
      });

      etat.style.display = "none";
      $("art-corps").style.display = "block";
    });
})();
