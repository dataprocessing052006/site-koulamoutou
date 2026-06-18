/* ===================================================================
   Accueil : injecte les articles publiés (back-office) dans le
   carrousel et le bandeau défilant, devant les actualités statiques.
   Dégradation propre si l'API n'est pas encore configurée.
   =================================================================== */
(function () {
  "use strict";

  function lancer() {
    fetch("/api/articles")
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (arts) {
        if (!arts || !arts.length) return;
        arts = arts.slice(0, 6);
        injecterCarrousel(arts);
        if (window.initCarrousel) window.initCarrousel();
      })
      .catch(function () { /* API absente : contenu statique conservé */ });
  }

  function dateFr(d) {
    d = (d || "").slice(0, 10);
    return d ? new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "";
  }

  function injecterCarrousel(arts) {
    var piste = document.querySelector("#carrousel-actus .carrousel__piste");
    if (!piste) return;
    for (var k = arts.length - 1; k >= 0; k--) {
      var a = arts[k];
      var slide = document.createElement("a");
      slide.className = "carrousel__slide";
      slide.href = "article.html?id=" + a.id;
      if (a.image_url) slide.style.backgroundImage = "url('" + a.image_url + "')";
      else slide.style.background = "linear-gradient(135deg, var(--vert), var(--vert-d))";
      slide.innerHTML =
        '<span class="carrousel__voile"></span>' +
        '<span class="carrousel__txt">' +
          '<span class="etiquette"></span>' +
          '<span class="carrousel__titre"></span>' +
          '<span class="carrousel__desc"></span>' +
          '<span class="carrousel__lien">Lire la suite →</span>' +
        '</span>';
      slide.querySelector(".etiquette").textContent = (a.categorie || "Actualité") + " · " + dateFr(a.date_pub);
      slide.querySelector(".carrousel__titre").textContent = a.titre;
      slide.querySelector(".carrousel__desc").textContent = a.chapeau || (a.contenu || "").slice(0, 140);
      piste.insertBefore(slide, piste.firstChild);
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", lancer);
  else lancer();
})();
