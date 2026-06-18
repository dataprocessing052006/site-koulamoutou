# Back-office des actualités — Installation (Vercel Postgres + Blob)

Le site est statique ; le back-office utilise des **fonctions serverless Vercel** (`/api`),
une base **Vercel Postgres** (articles) et **Vercel Blob** (images). L'administration est
protégée par un mot de passe (cookie de session signé).

## 1) Créer la base de données Postgres

Tableau de bord **Vercel → ton projet `site-koulamoutou` → onglet Storage → Create Database → Postgres**.
- Nom : `koulamoutou-db`, région Europe.
- **Connect to Project** : relie-la au projet (coche *Production*, *Preview*, *Development*).
  → Vercel ajoute automatiquement les variables `POSTGRES_URL`, etc.

Puis ouvre l'onglet **Query** (ou *Data → SQL*) de la base et exécute :

```sql
create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  titre text not null,
  categorie text not null default 'Général',
  chapeau text,
  contenu text,
  image_url text,
  publie boolean not null default false,
  date_pub date not null default current_date
);
```

## 2) Créer le stockage des images (Blob)

**Storage → Create Database → Blob** → nom `actus`, **Connect to Project**.
→ Vercel ajoute automatiquement la variable `BLOB_READ_WRITE_TOKEN`.

## 3) Définir le mot de passe admin et la clé de session

**Project → Settings → Environment Variables**, ajoute (pour *Production* et *Preview*) :

| Nom | Valeur |
|---|---|
| `ADMIN_PASSWORD` | le mot de passe de connexion au back-office (choisis-le) |
| `AUTH_SECRET` | une longue chaîne aléatoire (ex. 40 caractères) |

> Astuce pour générer `AUTH_SECRET` : sur https://generate-secret.vercel.app/40 ou n'importe quel générateur.

## 4) Redéployer

Après avoir branché la base, le Blob et les variables, **redéploie** (Deployments → … → Redeploy,
ou fais un `git push`). Les fonctions `/api` seront actives.

## 5) Utiliser le back-office

- Va sur **/admin.html** → connecte-toi avec `ADMIN_PASSWORD`.
- Rédige un article : titre, catégorie (Urgent, Économie, Politique…), chapeau, contenu, image.
- Coche **Publié** pour l'afficher (page *Actualités*, carrousel et bandeau de l'accueil).
- Décoche **Publié** pour le **retirer** du site (sans le supprimer), ou **Supprime**-le.

Les articles publiés sont lisibles via **article.html?id=…** et apparaissent
automatiquement sur l'accueil et la page Actualités.

---

### Détail technique
- `api/articles.js` : liste/lecture (public = publiés) ; création/modif/suppression (admin).
- `api/upload.js` : reçoit l'image (redimensionnée côté navigateur) → Vercel Blob.
- `api/login.js` : connexion (mot de passe) → cookie de session signé (8 h).
- `lib/auth.js` : signature/vérification du cookie (HMAC, sans dépendance).
