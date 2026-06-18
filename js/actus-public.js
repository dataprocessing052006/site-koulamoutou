/* Affiche les articles publiés (back-office Supabase) sur la page Actualités */
(function () {
  "use strict";
  var cont = document.getElementById("actus-cms");
  if (!cont) return;
  var sb = window.creerClientSupabase && window.creerClientSupabase();
  if (!sb) return; // config absente : on garde uniquement les actualités statiques

  sb.from("articles").select("*").eq("publie", true)
    .order("date_pub", { ascending: false }).order("created_at", { ascending: false })
    .then(function (res) {
      if (res.error || !res.data || !res.data.length) return;
      res.data.forEach(function (a) {
        var d = a.date_pub ? new Date(a.date_pub + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "";
        var art = document.createElement("article");
        art.className = "actu revele vu";
        var visuel = a.image_url
          ? '<a href="article.html?id=' + a.id + '"><div class="actu__visuel v-photo" style="background-image:url(\'' + a.image_url + '\')"></div></a>'
          : '<a href="article.html?id=' + a.id + '"><div class="actu__visuel v-foret"></div></a>';
        art.innerHTML = visuel +
          '<div class="actu__corps">' +
            '<span class="etiquette"></span>' +
            '<div class="actu__date">' + d + '</div>' +
            '<h3></h3>' +
            '<p></p>' +
            '<a href="article.html?id=' + a.id + '" class="carte__lien">Lire la suite</a>' +
          '</div>';
        art.querySelector(".etiquette").textContent = a.categorie || "Actualité";
        art.querySelector("h3").textContent = a.titre;
        art.querySelector("p").textContent = a.chapeau || (a.contenu || "").slice(0, 130) + "…";
        cont.appendChild(art);
      });
    });
})();
