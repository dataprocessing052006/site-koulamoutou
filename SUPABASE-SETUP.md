# Back-office des actualités — Installation Supabase

Le site est statique ; le back-office utilise **Supabase** (gratuit) pour stocker les
articles, héberger les images et gérer la connexion de l'administrateur.

## 1) Créer le projet Supabase

1. Va sur **https://supabase.com** → *Start your project* → connecte-toi (GitHub possible).
2. *New project* : nom (`koulamoutou`), mot de passe de base de données (note-le), région la plus proche (Europe).
3. Attends ~2 min que le projet soit prêt.

## 2) Créer la table, les règles et le stockage

Dans Supabase : menu **SQL Editor** → *New query* → colle puis exécute ce script :

```sql
-- Table des articles
create table if not exists public.articles (
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

alter table public.articles enable row level security;

-- Lecture publique : uniquement les articles publiés
create policy "lecture_publique_publies"
  on public.articles for select using ( publie = true );

-- Administrateur connecté : tous les droits
create policy "admin_select" on public.articles for select to authenticated using ( true );
create policy "admin_insert" on public.articles for insert to authenticated with check ( true );
create policy "admin_update" on public.articles for update to authenticated using ( true ) with check ( true );
create policy "admin_delete" on public.articles for delete to authenticated using ( true );

-- Stockage des images
insert into storage.buckets (id, name, public) values ('actus','actus',true)
  on conflict (id) do nothing;

create policy "images_lecture_publique"
  on storage.objects for select using ( bucket_id = 'actus' );
create policy "images_upload_admin"
  on storage.objects for insert to authenticated with check ( bucket_id = 'actus' );
create policy "images_suppr_admin"
  on storage.objects for delete to authenticated using ( bucket_id = 'actus' );
```

## 3) Créer le compte administrateur

Menu **Authentication** → *Users* → **Add user** → renseigne un e-mail et un mot de passe
(ce seront tes identifiants pour te connecter au back-office).

> Recommandé : **Authentication → Providers → Email** → désactive *"Enable sign-ups"*
> pour qu'on ne puisse pas créer de compte librement.

## 4) Renseigner les clés dans le site

Menu **Project Settings → API** :
- copie **Project URL**
- copie la clé **anon public**

Colle-les dans le fichier **`js/supabase-config.js`** (champs `url` et `anonKey`),
puis enregistre / pousse (`git push`). C'est tout !

## 5) Utiliser le back-office

- Va sur **/admin.html**, connecte-toi.
- Rédige un article : titre, catégorie (Urgent, Économie, Politique…), chapeau, contenu, image.
- Coche **Publié** pour l'afficher sur le site (les visiteurs le voient sur *Actualités*).
- Décoche **Publié** pour le **retirer** du frontend (sans le supprimer).

Les articles publiés apparaissent automatiquement sur la page **Actualités** et sont
lisibles via **article.html?id=…**.
