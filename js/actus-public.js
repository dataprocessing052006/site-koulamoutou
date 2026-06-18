/* Affiche les articles publiés (back-office) sur la page Actualités (API Vercel) */
(function () {
  "use strict";
  var cont = document.getElementById("actus-cms");
  if (!cont) return;

  fetch("/api/articles")
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(function (arts) {
      if (!arts || !arts.length) return;
      arts.forEach(function (a) {
        var dp = (a.date_pub || "").slice(0, 10);
        var d = dp ? new Date(dp + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "";
        var art = document.createElement("article");
        art.className = "actu revele vu";
        var visuel = a.image_url
          ? '<a href="article.html?id=' + a.id + '"><div class="actu__visuel v-photo" style="background-image:url(\'' + a.image_url + '\')"></div></a>'
          : '<a href="article.html?id=' + a.id + '"><div class="actu__visuel v-foret"></div></a>';
        art.innerHTML = visuel +
          '<div class="actu__corps">' +
            '<span class="etiquette"></span>' +
            '<div class="actu__date">' + d + '</div>' +
            '<h3></h3><p></p>' +
            '<a href="article.html?id=' + a.id + '" class="carte__lien">Lire la suite</a>' +
          '</div>';
        art.querySelector(".etiquette").textContent = a.categorie || "Actualité";
        art.querySelector("h3").textContent = a.titre;
        art.querySelector("p").textContent = a.chapeau || (a.contenu || "").slice(0, 130) + "…";
        cont.appendChild(art);
      });
    })
    .catch(function () { /* API indisponible : on garde les actualités statiques */ });
})();
