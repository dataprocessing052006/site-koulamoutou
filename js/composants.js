/* ===================================================================
   Composants partagés : bandeau État, en-tête, liseré tricolore,
   pied de page, bouton d'ambiance sonore, animations, compteurs.
   Chaque page définit <body data-page="..."> pour l'onglet actif.
   =================================================================== */
(function () {
  "use strict";

  var LIENS = [
    { id: "accueil",        url: "index.html",          label: "Accueil" },
    { id: "presentation",   url: "presentation.html",   label: "La commune" },
    { id: "administration", url: "administration.html", label: "Services" },
    { id: "tourisme",       url: "tourisme.html",       label: "Tourisme" },
    { id: "economie",       url: "economie.html",       label: "Économie" },
    { id: "actualites",     url: "actualites.html",     label: "Actualités" },
    { id: "contact",        url: "contact.html",        label: "Contact" }
  ];

  var BLASON = '<img src="images/blason-koulamoutou.svg" alt="Blason de Koula-Moutou" class="blason-img">';

  function pageCourante() {
    return document.body.getAttribute("data-page") || "accueil";
  }

  /* ---------------- EN-TÊTE ---------------- */
  function construireEntete() {
    var courant = pageCourante();
    var liens = LIENS.map(function (l) {
      var on = l.id === courant ? " on" : "";
      return '<a href="' + l.url + '" class="' + on.trim() + '">' + l.label + "</a>";
    }).join("");

    var html =
      '<div class="gouv"><div class="wrap">' +
        '<strong>🇬🇦 République Gabonaise</strong>' +
        '<div class="gouv__r">' +
          '<a href="index.html" class="gouv__accueil">🏠 Accueil</a>' +
          '<span>Province de l\'Ogooué-Lolo</span>' +
          '<a href="contact.html">Nous écrire</a>' +
          '<a href="#" aria-label="Langue">FR</a>' +
        '</div>' +
      '</div></div>' +
      '<header class="top"><div class="wrap">' +
        '<a class="brand" href="index.html">' + BLASON +
          '<span class="brand__t"><b>Mairie de Koula-Moutou</b>' +
          '<span>Commune chef-lieu de l\'Ogooué-Lolo</span></span>' +
        '</a>' +
        '<button class="burger" id="btn-menu" aria-label="Ouvrir le menu">' +
          '<svg viewBox="0 0 24 24"><path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/></svg>' +
        '</button>' +
        '<nav class="menu" id="nav-principale">' + liens + '</nav>' +
        '<div class="widget-mh" id="widget-mh" aria-label="Heure et météo de Koula-Moutou">' +
          '<div class="widget-mh__heure">' +
            '<span class="widget-mh__h" id="mh-heure">--:--:--</span>' +
            '<span class="widget-mh__d" id="mh-date">Koula-Moutou</span>' +
          '</div>' +
          '<div class="widget-mh__sep"></div>' +
          '<div class="widget-mh__meteo">' +
            '<span class="widget-mh__ico" id="mh-ico" aria-hidden="true">⛅</span>' +
            '<span class="widget-mh__temp" id="mh-temp">…</span>' +
            '<span class="widget-mh__desc" id="mh-desc">Chargement…</span>' +
          '</div>' +
        '</div>' +
      '</div></header>' +
      '<div class="tricolore"><i></i><i></i><i></i></div>';

    var conteneur = document.getElementById("site-entete");
    if (conteneur) conteneur.innerHTML = html;
  }

  /* ---------------- PIED DE PAGE ---------------- */
  function construirePied() {
    var liensRapides = LIENS.map(function (l) {
      return '<li><a href="' + l.url + '">' + l.label + "</a></li>";
    }).join("");

    var html =
      '<div class="foot__top"><i></i><i></i><i></i></div>' +
      '<div class="wrap foot__grid">' +
        '<div>' +
          '<div class="foot__brand">' + BLASON + '<b>Mairie de Koula-Moutou</b></div>' +
          '<p class="foot__desc">Portail officiel de la commune de Koula-Moutou, chef-lieu de la province de l\'Ogooué-Lolo, au cœur de la forêt équatoriale du Gabon.</p>' +
          '<div class="foot__reseaux">' +
            '<a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z"/></svg></a>' +
            '<a href="#" aria-label="X / Twitter"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7 8 8.2 12h-6.4l-5-7.3L6 22H2.9l7.5-8.6L2.5 2H9l4.5 6.6L18.9 2zm-1.1 18h1.7L7.3 3.8H5.5L17.8 20z"/></svg></a>' +
            '<a href="#" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 12s0-3.2-.4-4.7a2.5 2.5 0 0 0-1.8-1.8C19.3 5 12 5 12 5s-7.3 0-8.8.5A2.5 2.5 0 0 0 1.4 7.3C1 8.8 1 12 1 12s0 3.2.4 4.7a2.5 2.5 0 0 0 1.8 1.8C4.7 19 12 19 12 19s7.3 0 8.8-.5a2.5 2.5 0 0 0 1.8-1.8C23 15.2 23 12 23 12zM9.8 15.3V8.7l5.7 3.3-5.7 3.3z"/></svg></a>' +
          '</div>' +
        '</div>' +
        '<div><h3>Démarches</h3><ul>' +
          '<li><a href="administration.html">État civil</a></li>' +
          '<li><a href="administration.html">Acte de naissance</a></li>' +
          '<li><a href="administration.html">Permis de construire</a></li>' +
          '<li><a href="contact.html">Réclamations</a></li>' +
        '</ul></div>' +
        '<div><h3>Navigation</h3><ul>' + liensRapides + '</ul></div>' +
        '<div><h3>Hôtel de Ville</h3><ul>' +
          '<li>Centre-ville, Koula-Moutou</li>' +
          '<li>Province de l\'Ogooué-Lolo, Gabon</li>' +
          '<li>📞 +241 01 00 00 00</li>' +
          '<li>✉️ contact@mairie-koulamoutou.ga</li>' +
          '<li>🕘 Lun – Ven : 7h30 – 15h30</li>' +
        '</ul></div>' +
      '</div>' +
      '<div class="foot__bas"><div class="wrap">' +
        '© ' + new Date().getFullYear() + ' Mairie de Koula-Moutou — Tous droits réservés. ' +
        'Portail institutionnel de la commune. 🌿 · <a href="admin.html">Administration</a><br>' +
        '<span style="font-size:0.74rem;opacity:0.75">Photographies : Wikimedia Commons — V.&nbsp;Vaquin, D.&nbsp;Stanley, A.&nbsp;Rouvin, Kani&nbsp;Beat (licences CC&nbsp;BY / CC&nbsp;BY-SA) et cartes postales anciennes du domaine public.</span>' +
      '</div></div>';

    var conteneur = document.getElementById("site-pied");
    if (conteneur) conteneur.innerHTML = html;
  }

  /* ---------------- INTERACTIONS ---------------- */
  function brancherInteractions() {
    var btnMenu = document.getElementById("btn-menu");
    var nav = document.getElementById("nav-principale");

    if (btnMenu && nav) {
      btnMenu.addEventListener("click", function () { nav.classList.toggle("open"); });
      nav.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () { nav.classList.remove("open"); });
      });
    }

  }

  /* ---------------- HEURE + MÉTÉO (widget en-tête) ---------------- */
  function demarrerMeteoHeure() {
    var LAT = -1.1373, LON = 12.4719, FUSEAU = "Africa/Libreville";
    var elH = document.getElementById("mh-heure");
    var elD = document.getElementById("mh-date");
    if (elH) {
      var fmtH = new Intl.DateTimeFormat("fr-FR", { timeZone: FUSEAU, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
      var fmtD = new Intl.DateTimeFormat("fr-FR", { timeZone: FUSEAU, weekday: "long", day: "numeric", month: "long" });
      var majH = function () {
        var n = new Date();
        elH.textContent = fmtH.format(n);
        if (elD) { var d = fmtD.format(n); elD.textContent = d.charAt(0).toUpperCase() + d.slice(1); }
      };
      majH();
      setInterval(majH, 1000);
    }

    var CODES = {
      0: ["☀️", "Ciel dégagé"], 1: ["🌤️", "Plutôt dégagé"], 2: ["⛅", "Partiellement nuageux"],
      3: ["☁️", "Couvert"], 45: ["🌫️", "Brouillard"], 48: ["🌫️", "Brouillard givrant"],
      51: ["🌦️", "Bruine légère"], 53: ["🌦️", "Bruine"], 55: ["🌦️", "Bruine dense"],
      61: ["🌧️", "Pluie faible"], 63: ["🌧️", "Pluie"], 65: ["🌧️", "Forte pluie"],
      66: ["🌧️", "Pluie verglaçante"], 67: ["🌧️", "Pluie verglaçante"],
      80: ["🌦️", "Averses"], 81: ["🌦️", "Averses"], 82: ["⛈️", "Fortes averses"],
      95: ["⛈️", "Orage"], 96: ["⛈️", "Orage grêleux"], 99: ["⛈️", "Orage grêleux"]
    };
    var elIco = document.getElementById("mh-ico");
    var elTemp = document.getElementById("mh-temp");
    var elDesc = document.getElementById("mh-desc");
    if (!elTemp) return;
    var URL = "https://api.open-meteo.com/v1/forecast?latitude=" + LAT + "&longitude=" + LON +
      "&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=" + encodeURIComponent(FUSEAU);
    var charger = function () {
      fetch(URL, { cache: "no-store" })
        .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
        .then(function (data) {
          var c = data && data.current; if (!c) throw new Error("vide");
          var info = CODES[c.weather_code] || ["🌡️", "—"];
          if (elIco) elIco.textContent = info[0];
          elTemp.textContent = Math.round(c.temperature_2m) + "°C";
          if (elDesc) elDesc.textContent = info[1] + " · " + Math.round(c.relative_humidity_2m) + "% · vent " + Math.round(c.wind_speed_10m) + " km/h";
        })
        .catch(function () {
          if (elIco) elIco.textContent = "🌡️";
          elTemp.textContent = "—";
          if (elDesc) elDesc.textContent = "Météo indisponible";
        });
    };
    charger();
    setInterval(charger, 15 * 60 * 1000);

    configurerPrevisions(CODES);
  }

  /* ---------------- PRÉVISIONS (popover au survol du widget) ---------------- */
  function configurerPrevisions(CODES) {
    var widget = document.getElementById("widget-mh");
    if (!widget) return;
    widget.setAttribute("tabindex", "0");
    widget.setAttribute("aria-label", "Heure et météo de Koula-Moutou — survolez pour les prévisions");

    var pop = document.createElement("div");
    pop.className = "prev";
    pop.setAttribute("role", "tooltip");
    pop.innerHTML =
      '<div class="prev__t">Prévisions · Koula-Moutou</div>' +
      '<div class="prev__jours" id="prev-jours"><p class="prev__info">Chargement…</p></div>';
    widget.appendChild(pop);

    var dejaCharge = false;

    function chargerPrevisions() {
      var url = "https://api.open-meteo.com/v1/forecast?latitude=-1.1373&longitude=12.4719" +
        "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
        "&timezone=" + encodeURIComponent("Africa/Libreville") + "&forecast_days=7";
      var cont = document.getElementById("prev-jours");
      fetch(url, { cache: "no-store" })
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (data) {
          var d = data.daily; if (!d || !d.time) throw 0;
          var fmt = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", timeZone: "Africa/Libreville" });
          var html = "";
          for (var i = 0; i < d.time.length; i++) {
            var dt = new Date(d.time[i] + "T12:00:00");
            var lbl = fmt.format(dt); lbl = lbl.charAt(0).toUpperCase() + lbl.slice(1);
            var info = CODES[d.weather_code[i]] || ["🌡️", "—"];
            var pp = d.precipitation_probability_max ? d.precipitation_probability_max[i] : null;
            html += '<div class="prev__jour"' + (i === 0 ? ' data-auj' : '') + '>' +
              '<span class="prev__nom">' + (i === 0 ? "Auj." : lbl) + '</span>' +
              '<span class="prev__ico" title="' + info[1] + '">' + info[0] + '</span>' +
              '<span class="prev__temp"><b>' + Math.round(d.temperature_2m_max[i]) + '°</b> / ' + Math.round(d.temperature_2m_min[i]) + '°</span>' +
              '<span class="prev__pp">' + (pp != null ? '💧 ' + pp + '%' : '') + '</span>' +
            '</div>';
          }
          if (cont) cont.innerHTML = html;
        })
        .catch(function () { if (cont) cont.innerHTML = '<p class="prev__info">Prévisions indisponibles.</p>'; });
    }

    function montrer() {
      widget.classList.add("prev-on");
      if (!dejaCharge) { chargerPrevisions(); dejaCharge = true; }
    }
    function cacher() { widget.classList.remove("prev-on"); }

    widget.addEventListener("mouseenter", montrer);
    widget.addEventListener("mouseleave", cacher);
    widget.addEventListener("focusin", montrer);
    widget.addEventListener("focusout", cacher);
    widget.addEventListener("keydown", function (e) { if (e.key === "Escape") { cacher(); widget.blur(); } });
  }

  /* ---------------- ANIMATIONS AU DÉFILEMENT ---------------- */
  function animerAuDefilement() {
    var elements = document.querySelectorAll(".revele");
    if (!("IntersectionObserver" in window) || !elements.length) {
      elements.forEach(function (e) { e.classList.add("vu"); });
      return;
    }
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("vu"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    elements.forEach(function (e) { obs.observe(e); });
  }

  /* ---------------- COMPTEURS ANIMÉS ---------------- */
  function animerCompteurs() {
    var compteurs = document.querySelectorAll("[data-compteur]");
    if (!compteurs.length) return;
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        var cible = parseFloat(el.getAttribute("data-compteur"));
        var suffixe = el.getAttribute("data-suffixe") || "";
        var duree = 1400, t0 = null;
        function pas(ts) {
          if (!t0) t0 = ts;
          var p = Math.min((ts - t0) / duree, 1);
          var val = Math.floor(cible * (1 - Math.pow(1 - p, 3)));
          el.textContent = val.toLocaleString("fr-FR") + suffixe;
          if (p < 1) requestAnimationFrame(pas);
        }
        requestAnimationFrame(pas);
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    compteurs.forEach(function (c) { obs.observe(c); });
  }

  /* ---------------- CARROUSEL ACTUALITÉS (ré-initialisable) ---------------- */
  function initCarrousel() {
    var car = document.getElementById("carrousel-actus");
    if (!car) return;
    var piste = car.querySelector(".carrousel__piste");
    var pts = car.querySelector(".carrousel__points");
    function slides() { return car.querySelectorAll(".carrousel__slide"); }
    if (!slides().length) return;

    var st = car._car || (car._car = { i: 0, timer: null });

    function maj() {
      var n = slides().length; if (st.i >= n) st.i = 0;
      piste.style.transform = "translateX(-" + (st.i * 100) + "%)";
      [].forEach.call(pts.children, function (d, idx) { d.classList.toggle("actif", idx === st.i); });
    }
    function aller(k) { var n = slides().length; st.i = (k + n) % n; maj(); }
    function suiv() { aller(st.i + 1); }
    function prec() { aller(st.i - 1); }
    function arreter() { if (st.timer) { clearInterval(st.timer); st.timer = null; } }
    function lancer() { arreter(); st.timer = setInterval(suiv, 5000); }
    car._ctl = { suiv: suiv, prec: prec, lancer: lancer, arreter: arreter };

    // (re)construire les points
    pts.innerHTML = "";
    [].forEach.call(slides(), function (_, k) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Aller à l'actualité " + (k + 1));
      b.addEventListener("click", function () { aller(k); lancer(); });
      pts.appendChild(b);
    });

    // attacher les contrôles une seule fois (lisent toujours car._ctl à jour)
    if (!car._wired) {
      car._wired = true;
      var bs = car.querySelector(".carrousel__suiv"); if (bs) bs.addEventListener("click", function () { car._ctl.suiv(); car._ctl.lancer(); });
      var bp = car.querySelector(".carrousel__prec"); if (bp) bp.addEventListener("click", function () { car._ctl.prec(); car._ctl.lancer(); });
      car.addEventListener("mouseenter", function () { car._ctl.arreter(); });
      car.addEventListener("mouseleave", function () { car._ctl.lancer(); });
      car.addEventListener("focusin", function () { car._ctl.arreter(); });
      car.addEventListener("focusout", function () { car._ctl.lancer(); });
    }

    maj();
    lancer();
  }
  window.initCarrousel = initCarrousel;

  /* ---------------- SUIVI DES VUES (statistiques) ---------------- */
  function suivreVue() {
    try {
      var aid = new URLSearchParams(location.search).get("id");
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chemin: location.pathname, articleId: aid || null }),
        keepalive: true
      }).catch(function () {});
    } catch (e) { /* sans effet si l'API est absente */ }
  }

  document.addEventListener("DOMContentLoaded", function () {
    construireEntete();
    construirePied();
    brancherInteractions();
    demarrerMeteoHeure();
    initCarrousel();
    animerAuDefilement();
    animerCompteurs();
    suivreVue();
  });
})();
