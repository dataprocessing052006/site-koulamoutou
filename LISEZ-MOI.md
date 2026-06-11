# Site institutionnel — Ville de Koula-Moutou

Site web complet et autonome de la ville de **Koula-Moutou**, chef-lieu de la province de l'**Ogooué-Lolo** (Gabon), avec **fond sonore de forêt** intégré.

## 🎨 Design

Style « **portail officiel + forêt** » : bandeau *République Gabonaise*, **liseré tricolore** (vert/or/bleu), blason en évidence, **hero immersif** (paysage de forêt dessiné en SVG) avec **barre de recherche de démarches**, palette vert forêt / or / bleu d'État, titres en serif. Le système d'en-tête, de navigation et de pied de page est généré par `js/composants.js` et partagé par toutes les pages.

> Les anciennes maquettes (proposition 1 « nature » et proposition 2 « e-admin ») sont conservées dans le dossier `_archives/` pour référence.

## 🌿 Le fond sonore de forêt

Le son de forêt est **généré en temps réel** par le navigateur (Web Audio API) — aucun fichier audio à télécharger. Il mélange :

- le vent dans la canopée,
- le bruissement des feuilles,
- des chants d'oiseaux aléatoires,
- des trilles de grillons.

👉 Pour l'activer, cliquez sur le bouton **« 🔊 Forêt »** en haut à droite de chaque page.
Les navigateurs interdisent la lecture audio automatique : **un clic est obligatoire** pour démarrer le son. Recliquez pour le couper.

## 📄 Pages du site

| Fichier | Page |
|---|---|
| `index.html` | Accueil (héros, chiffres clés, mot du maire, services, actualités) |
| `presentation.html` | Présentation, histoire, géographie, la province |
| `tourisme.html` | Tourisme, sites naturels, culture, gastronomie |
| `economie.html` | Économie, filières, projets de développement |
| `administration.html` | Mairie, démarches, horaires, services |
| `actualites.html` | Actualités et newsletter |
| `contact.html` | Coordonnées, formulaire, carte de localisation |

## 🛡️ Le blason de la ville

Le blason officiel de Koula-Moutou (série héraldique des villes du Gabon, 1973) est utilisé dans `images/blason-koulamoutou.svg`. Il s'agit du fichier **SVG officiel récupéré sur Wikimedia Commons** (`Coat of arms of Koulamoutou, Gabon.svg`). Il sert de **logo** (en-tête et pied de page), de **favicon** et est présenté avec sa symbolique sur la page *Présentation*.

> ⚖️ **Avant publication officielle**, vérifiez les conditions de licence/attribution du fichier sur sa [page Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Coat_of_arms_of_Koulamoutou,_Gabon.svg).

> Blasonnement : *« D'argent à la patte de lion de sable, armée de gueules, mouvant du canton senestre en chef, soutenue d'un mont de trois coupeaux de sinople mouvant de la pointe ; au chef de gueules à trois étoiles du champ. »*
> — patte de lion = courage ; trois collines vertes = collines de la ville ; chef rouge aux trois étoiles = insignes administratifs.

## 📷 Photographies

Le site utilise des **images réelles sous licence libre** issues de [Wikimedia Commons](https://commons.wikimedia.org) :

| Fichier | Sujet | Auteur / Licence |
|---|---|---|
| `koulamoutou-ville.jpg` | Vue réelle de Koula-Moutou | Vincent Vaquin — CC BY-SA 3.0 |
| `foret-gabon-1.jpg` | Rivière et forêt (Gabon) | David Stanley — CC BY 2.0 |
| `foret-gabon-2.jpg` | Forêt équatoriale primaire | Axel Rouvin — CC BY 2.0 |
| `pont-liane.jpg` | Pont de lianes (Poubara) | Vincent Vaquin — CC BY-SA 3.0 |
| `case-bwiti.jpg` | Case Bwiti (Mimongo) | Vincent Vaquin — CC BY-SA 3.0 |
| `bwiti-praticien.jpg` | Praticien du Bwiti | David Stanley — CC BY 2.0 |
| `marche-poisson.jpg` | Marché aux poissons (Gabon) | David Stanley — CC BY 2.0 |
| `marche-produits.jpg` | Poisson fumé sur étal | Kani Beat — CC BY-SA 4.0 |
| `tisserand-adouma.jpg` | Tisserand Adouma (Lastoursville, ~1900) | Domaine public |
| `chute-doume.jpg` | Chute Doumé (Lastoursville, ~1900) | Domaine public |

> ⚖️ Les licences CC BY / CC BY-SA exigent l'**attribution** (faite dans les légendes et le pied de page). En cas de réutilisation hors de ce site, conservez les crédits.

## 🗂️ Structure

```
Site/
├── index.html + 6 autres pages .html
├── images/
│   ├── blason-koulamoutou.svg      ← blason de la ville (SVG)
│   └── *.jpg                       ← photos réelles (Wikimedia Commons)
├── css/style.css                   ← thème forêt, responsive
├── js/
│   ├── foret-ambiance.js           ← générateur de son de forêt
│   └── composants.js               ← en-tête, menu, pied de page partagés
└── .claude/serve.ps1               ← (optionnel) petit serveur local
```

## ▶️ Lancer le site

Ouvrez simplement **`index.html`** dans un navigateur (Chrome, Edge, Firefox).
La carte de localisation (page Contact) nécessite une connexion Internet ; tout le reste fonctionne hors ligne, son de forêt et blason compris.

**Aperçu via un serveur local** (optionnel, utile si certains chemins se comportent mal en `file://`) — vous n'avez ni Python ni Node, donc un petit serveur PowerShell est fourni :

```powershell
powershell -NoProfile -File .claude/serve.ps1
```

Puis ouvrez **http://localhost:8000**. (Ctrl+C pour arrêter.)

## ✏️ Personnaliser

- **Couleurs / thème** : variables en haut de `css/style.css` (`:root`).
- **Menu, coordonnées, réseaux sociaux** : tableau `LIENS` et fonctions dans `js/composants.js`.
- **Intensité / sons** : valeurs de `gain` et fréquences dans `js/foret-ambiance.js`.
- **Textes** : directement dans chaque fichier `.html`.

> Les coordonnées (téléphone, e-mail) et certains chiffres sont des **valeurs d'exemple** à remplacer par les informations officielles de la mairie.
