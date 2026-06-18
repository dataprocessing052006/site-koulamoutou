/* ===================================================================
   Widget météo + heure locale de Koula-Moutou (page d'accueil).
   - Heure : horloge en temps réel au fuseau du Gabon (Africa/Libreville).
   - Météo : API Open-Meteo (gratuite, sans clé), actualisée au chargement
     puis toutes les 15 minutes.
   =================================================================== */
(function () {
  "use strict";

  var LAT = -1.1373, LON = 12.4719;               // Koula-Moutou
  var FUSEAU = "Africa/Libreville";               // WAT (UTC+1)

  /* ---------------- HEURE EN TEMPS RÉEL ---------------- */
  var elHeure = document.getElementById("mh-heure");
  var elDate  = document.getElementById("mh-date");
  if (elHeure) {
    var fmtH = new Intl.DateTimeFormat("fr-FR", {
      timeZone: FUSEAU, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
    });
    var fmtD = new Intl.DateTimeFormat("fr-FR", {
      timeZone: FUSEAU, weekday: "long", day: "numeric", month: "long"
    });
    function majHeure() {
      var maintenant = new Date();
      elHeure.textContent = fmtH.format(maintenant);
      if (elDate) {
        var d = fmtD.format(maintenant);
        elDate.textContent = d.charAt(0).toUpperCase() + d.slice(1);
      }
    }
    majHeure();
    setInterval(majHeure, 1000);
  }

  /* ---------------- MÉTÉO (Open-Meteo) ---------------- */
  // Correspondance code WMO -> { icône, libellé français }
  var CODES = {
    0:  ["☀️", "Ciel dégagé"],
    1:  ["🌤️", "Plutôt dégagé"],
    2:  ["⛅", "Partiellement nuageux"],
    3:  ["☁️", "Couvert"],
    45: ["🌫️", "Brouillard"],
    48: ["🌫️", "Brouillard givrant"],
    51: ["🌦️", "Bruine légère"],
    53: ["🌦️", "Bruine"],
    55: ["🌦️", "Bruine dense"],
    61: ["🌧️", "Pluie faible"],
    63: ["🌧️", "Pluie"],
    65: ["🌧️", "Forte pluie"],
    66: ["🌧️", "Pluie verglaçante"],
    67: ["🌧️", "Pluie verglaçante"],
    80: ["🌦️", "Averses"],
    81: ["🌦️", "Averses"],
    82: ["⛈️", "Fortes averses"],
    95: ["⛈️", "Orage"],
    96: ["⛈️", "Orage grêleux"],
    99: ["⛈️", "Orage grêleux"]
  };

  var elIco  = document.getElementById("mh-ico");
  var elTemp = document.getElementById("mh-temp");
  var elDesc = document.getElementById("mh-desc");
  if (!elTemp) return;

  var URL = "https://api.open-meteo.com/v1/forecast?latitude=" + LAT +
            "&longitude=" + LON +
            "&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m" +
            "&timezone=" + encodeURIComponent(FUSEAU);

  function chargerMeteo() {
    fetch(URL, { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (data) {
        var c = data && data.current;
        if (!c) throw new Error("données absentes");
        var info = CODES[c.weather_code] || ["🌡️", "—"];
        if (elIco)  elIco.textContent  = info[0];
        elTemp.textContent = Math.round(c.temperature_2m) + "°C";
        if (elDesc) {
          elDesc.textContent = info[1] +
            " · " + Math.round(c.relative_humidity_2m) + "% humidité" +
            " · vent " + Math.round(c.wind_speed_10m) + " km/h";
        }
      })
      .catch(function () {
        if (elIco)  elIco.textContent  = "🌡️";
        elTemp.textContent = "—";
        if (elDesc) elDesc.textContent = "Météo indisponible";
      });
  }

  chargerMeteo();
  setInterval(chargerMeteo, 15 * 60 * 1000); // toutes les 15 min
})();
