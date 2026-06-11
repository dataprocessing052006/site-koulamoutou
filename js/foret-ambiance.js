/* ===================================================================
   Ambiance sonore de forêt équatoriale — Web Audio API
   Générée entièrement en temps réel (aucun fichier audio nécessaire) :
     • Vent dans la canopée  -> bruit filtré modulé
     • Bruissement de feuilles -> bruit haute fréquence
     • Chants d'oiseaux       -> oscillateurs avec gazouillis aléatoires
     • Grillons / insectes    -> trilles haute fréquence
   Démarre uniquement sur action de l'utilisateur (politique navigateur).
   =================================================================== */
(function () {
  "use strict";

  var ctx = null;
  var masterGain = null;
  var actif = false;
  var minuteurs = [];
  var noeudsContinus = [];

  /* ---- Génère un tampon de bruit (réutilisable) ---- */
  function tamponBruit(secondes) {
    var taille = ctx.sampleRate * secondes;
    var buffer = ctx.createBuffer(1, taille, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    var last = 0;
    for (var i = 0; i < taille; i++) {
      var white = Math.random() * 2 - 1;
      // léger filtre passe-bas pour un bruit plus "brun" et naturel
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }
    return buffer;
  }

  /* ---- Vent continu dans la canopée ---- */
  function creerVent() {
    var src = ctx.createBufferSource();
    src.buffer = tamponBruit(6);
    src.loop = true;

    var filtre = ctx.createBiquadFilter();
    filtre.type = "lowpass";
    filtre.frequency.value = 480;
    filtre.Q.value = 0.6;

    var gain = ctx.createGain();
    gain.gain.value = 0.14;

    // modulation lente du vent (rafales)
    var lfo = ctx.createOscillator();
    var lfoGain = ctx.createGain();
    lfo.frequency.value = 0.07;
    lfoGain.gain.value = 0.07;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    src.connect(filtre);
    filtre.connect(gain);
    gain.connect(masterGain);

    src.start();
    lfo.start();
    noeudsContinus.push(src, lfo);
  }

  /* ---- Bruissement de feuilles (aigu, doux) ---- */
  function creerFeuilles() {
    var src = ctx.createBufferSource();
    src.buffer = tamponBruit(4);
    src.loop = true;

    var filtre = ctx.createBiquadFilter();
    filtre.type = "bandpass";
    filtre.frequency.value = 3200;
    filtre.Q.value = 0.8;

    var gain = ctx.createGain();
    gain.gain.value = 0.045;

    var lfo = ctx.createOscillator();
    var lfoGain = ctx.createGain();
    lfo.frequency.value = 0.13;
    lfoGain.gain.value = 0.03;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    src.connect(filtre);
    filtre.connect(gain);
    gain.connect(masterGain);
    src.start();
    lfo.start();
    noeudsContinus.push(src, lfo);
  }

  /* ---- Un chant d'oiseau (gazouillis) ---- */
  function chantOiseau() {
    if (!actif) return;
    var t = ctx.currentTime;
    var base = 1800 + Math.random() * 2200;
    var nbNotes = 2 + Math.floor(Math.random() * 4);
    var gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(masterGain);

    var osc = ctx.createOscillator();
    osc.type = Math.random() > 0.5 ? "sine" : "triangle";
    osc.connect(gain);

    var temps = t;
    for (var n = 0; n < nbNotes; n++) {
      var dur = 0.06 + Math.random() * 0.09;
      var f1 = base + (Math.random() - 0.5) * 600;
      var f2 = f1 + (Math.random() - 0.3) * 900;
      osc.frequency.setValueAtTime(f1, temps);
      osc.frequency.exponentialRampToValueAtTime(Math.max(400, f2), temps + dur);
      gain.gain.setValueAtTime(0, temps);
      gain.gain.linearRampToValueAtTime(0.09, temps + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0008, temps + dur);
      temps += dur + 0.02 + Math.random() * 0.05;
    }
    osc.start(t);
    osc.stop(temps + 0.1);

    // programme le prochain chant
    var prochain = 1400 + Math.random() * 5000;
    minuteurs.push(setTimeout(chantOiseau, prochain));
  }

  /* ---- Trille de grillon/insecte ---- */
  function grillon() {
    if (!actif) return;
    var t = ctx.currentTime;
    var osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.value = 4500 + Math.random() * 1500;

    var filtre = ctx.createBiquadFilter();
    filtre.type = "bandpass";
    filtre.frequency.value = osc.frequency.value;
    filtre.Q.value = 12;

    var gain = ctx.createGain();
    gain.gain.value = 0;

    // trémolo rapide caractéristique
    var trem = ctx.createOscillator();
    var tremGain = ctx.createGain();
    trem.type = "square";
    trem.frequency.value = 28 + Math.random() * 12;
    tremGain.gain.value = 0.012;
    trem.connect(tremGain);
    tremGain.connect(gain.gain);

    osc.connect(filtre);
    filtre.connect(gain);
    gain.connect(masterGain);

    var dur = 0.6 + Math.random() * 1.4;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.012, t + 0.3);
    gain.gain.setValueAtTime(0.012, t + dur - 0.3);
    gain.gain.linearRampToValueAtTime(0, t + dur);

    osc.start(t); trem.start(t);
    osc.stop(t + dur); trem.stop(t + dur);

    minuteurs.push(setTimeout(grillon, 2500 + Math.random() * 6000));
  }

  function demarrer() {
    if (actif) return;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(ctx.destination);

    creerVent();
    creerFeuilles();
    actif = true;

    // montée en douceur du volume
    masterGain.gain.setValueAtTime(0, ctx.currentTime);
    masterGain.gain.linearRampToValueAtTime(0.9, ctx.currentTime + 2);

    // lance oiseaux et grillons
    minuteurs.push(setTimeout(chantOiseau, 800));
    minuteurs.push(setTimeout(chantOiseau, 2600));
    minuteurs.push(setTimeout(grillon, 1500));
    minuteurs.push(setTimeout(grillon, 4000));
    return true;
  }

  function arreter() {
    if (!actif) return;
    actif = false;
    minuteurs.forEach(clearTimeout);
    minuteurs = [];
    if (masterGain && ctx) {
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
    }
    setTimeout(function () {
      noeudsContinus.forEach(function (n) { try { n.stop(); } catch (e) {} });
      noeudsContinus = [];
      if (ctx) { ctx.close(); ctx = null; }
    }, 900);
  }

  // API publique
  window.ForetAmbiance = {
    basculer: function () {
      if (actif) { arreter(); return false; }
      else { return demarrer(); }
    },
    estActif: function () { return actif; }
  };
})();
