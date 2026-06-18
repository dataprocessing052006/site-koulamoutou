/* ===================================================================
   Accueil : injecte les articles publiés (back-office Supabase) dans
   le carrousel et le bandeau défilant, devant les actualités statiques.
   Dégradation propre si la config Supabase est absente.
   =================================================================== */
(function () {
  "use strict";

  function lancer() {
    var sb = window.creerClientSupabase && window.creerClientSupabase();
    if (!sb) return; // pas de config : on garde le contenu statique

    sb.from("articles").select("*").eq("publie", true)
      .order("date_pub", { ascending: false }).order("created_at", { ascending: false })
      .then(function (res) {
        if (res.error || !res.data || !res.data.length) return;
        var arts = res.data.slice(0, 6);

        injecterCarrousel(arts);
        injecterBandeau(arts);

        if (window.initCarrousel) window.initCarrousel(); // recalcul points/état
      });
  }

  function dateFr(d) {
    if (!d) return "";
    return new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  }

  function injecterCarrousel(arts) {
    var piste = document.querySelector("#carrousel-actus .carrousel__piste");
    if (!piste) return;
    // insérées en tête (plus récentes d'abord), avant les diapos statiques
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

  function injecterBandeau(arts) {
    var track = document.querySelector(".ticker .ticker__track");
    if (!track) return;
    // ensemble de base = première moitié des éléments existants (statiques réels)
    var enfants = track.children;
    var moitie = Math.floor(enfants.length / 2) || enfants.length;
    var base = [];
    for (var j = 0; j < moitie; j++) base.push(enfants[j].cloneNode(true));

    var cms = arts.map(function (a) {
      var lien = document.createElement("a");
      lien.href = "article.html?id=" + a.id;
      var b = document.createElement("b");
      b.textContent = a.categorie || "Actualité";
      lien.appendChild(b);
      lien.appendChild(document.createTextNode(" " + a.titre));
      return lien;
    });

    var seq = cms.concat(base); // CMS en premier puis statiques
    track.innerHTML = "";
    seq.forEach(function (n) { track.appendChild(n.cloneNode(true)); }); // copie 1
    seq.forEach(function (n) { track.appendChild(n.cloneNode(true)); }); // copie 2 (boucle continue)
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", lancer);
  } else {
    lancer();
  }
})();
