/* Tableau de bord — statistiques (API /api/stats) + graphiques Chart.js */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var VERT = "#15803d", VERTC = "#2e8b57", OR = "#c9a227", BLEU = "#2a5db0", GRIS = "#9aa6a0";

  fetch("/api/me", { credentials: "same-origin" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (u) {
      if (!u) { $("db-non").style.display = "block"; return; }
      $("db-qui").textContent = (u.nom || "") + " · " + (u.role === "admin" ? "Administrateur" : "Éditeur");
      $("db-app").style.display = "block";
      charger();
    })
    .catch(function () { $("db-non").style.display = "block"; });

  function charger() {
    fetch("/api/stats", { credentials: "same-origin" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (s) { if (s) rendre(s); })
      .catch(function () {});
  }

  function carte(n, l) { return '<div class="db-card"><div class="n">' + n + '</div><div class="l">' + l + "</div></div>"; }

  function rendre(s) {
    var a = s.articles || {}, v = s.vues || {};
    var html = carte(a.total || 0, "Articles au total") +
      carte(a.publies || 0, "Publiés") +
      carte(a.retires || 0, "Retirés / brouillons") +
      carte(v.total || 0, "Vues cumulées") +
      carte(v.trente_jours || 0, "Vues (30 j)");
    if (s.utilisateurs) html += carte(s.utilisateurs.actifs || 0, "Utilisateurs actifs");
    $("db-cards").innerHTML = html;

    // Publications par mois
    barre("g-mois", (s.parMois || []).map(function (x) { return x.mois; }), (s.parMois || []).map(function (x) { return x.n; }), VERTC);
    // Catégories
    barre("g-cat", (s.parCategorie || []).map(function (x) { return x.categorie; }), (s.parCategorie || []).map(function (x) { return x.n; }), OR, true);
    // Vues 30 jours (ligne)
    ligne("g-vues", (s.vuesParJour || []).map(function (x) { return x.j.slice(5); }), (s.vuesParJour || []).map(function (x) { return x.n; }));
    // Statut (donut)
    donut("g-statut", ["Publiés", "Retirés"], [a.publies || 0, a.retires || 0], [VERT, GRIS]);

    // Listes
    $("db-top").innerHTML = (s.topArticles && s.topArticles.length)
      ? s.topArticles.map(function (x) { return '<div><span>' + echap(x.titre) + '</span><span class="b">' + x.n + ' vues</span></div>'; }).join("")
      : '<p style="color:var(--gris)">Aucune vue d\'article enregistrée.</p>';
    $("db-derniers").innerHTML = (s.derniers && s.derniers.length)
      ? s.derniers.map(function (x) { return '<div><span>' + echap(x.titre) + '</span><span class="b">' + (x.publie ? "Publié" : "Retiré") + "</span></div>"; }).join("")
      : '<p style="color:var(--gris)">Aucun article.</p>';
  }

  function echap(t) { var d = document.createElement("div"); d.textContent = t || ""; return d.innerHTML; }

  function barre(id, labels, data, couleur, horizontal) {
    new Chart($(id), {
      type: "bar",
      data: { labels: labels, datasets: [{ data: data, backgroundColor: couleur, borderRadius: 5 }] },
      options: { indexAxis: horizontal ? "y" : "x", plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { precision: 0 } } } }
    });
  }
  function ligne(id, labels, data) {
    new Chart($(id), {
      type: "line",
      data: { labels: labels, datasets: [{ data: data, borderColor: BLEU, backgroundColor: "rgba(42,93,176,.12)", fill: true, tension: .3, pointRadius: 2 }] },
      options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }
    });
  }
  function donut(id, labels, data, couleurs) {
    new Chart($(id), {
      type: "doughnut",
      data: { labels: labels, datasets: [{ data: data, backgroundColor: couleurs }] },
      options: { plugins: { legend: { position: "bottom" } }, cutout: "62%" }
    });
  }
})();
