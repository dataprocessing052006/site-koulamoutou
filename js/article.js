/* Lecteur d'article dynamique — article.html?id=… (API Vercel) */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var etat = $("art-etat");
  var id = new URLSearchParams(location.search).get("id");
  if (!id) { etat.textContent = "Article introuvable."; return; }

  fetch("/api/articles?id=" + encodeURIComponent(id))
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (a) {
      if (!a) { etat.textContent = "Cet article n'existe pas ou n'est plus publié."; return; }

      document.title = a.titre + " — Actualités de Koula-Moutou";
      $("art-cat").textContent = a.categorie || "Actualité";
      $("art-titre").textContent = a.titre;
      $("art-fil").textContent = a.categorie || "Article";

      var dp = (a.date_pub || "").slice(0, 10);
      if (dp) $("art-date").textContent = new Date(dp + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

      if (a.image_url) {
        $("art-img").src = a.image_url; $("art-img").alt = a.titre;
        $("art-figure").style.display = "block";
      }
      if (a.chapeau) { var c = $("art-chapeau"); c.textContent = a.chapeau; c.style.display = "block"; }

      var corps = $("art-contenu");
      (a.contenu || "").split(/\n{2,}|\n/).forEach(function (par) {
        par = par.trim(); if (!par) return;
        var p = document.createElement("p"); p.textContent = par; corps.appendChild(p);
      });

      etat.style.display = "none";
      $("art-corps").style.display = "block";
    })
    .catch(function () { etat.textContent = "Article indisponible pour le moment."; });
})();
