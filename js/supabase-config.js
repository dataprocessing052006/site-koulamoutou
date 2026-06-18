/* ===================================================================
   Configuration Supabase (back-office des actualités)
   -------------------------------------------------------------------
   Renseignez ci-dessous les deux valeurs de VOTRE projet Supabase :
   Tableau de bord Supabase → Project Settings → API
     • Project URL      → champ "url"
     • Project API keys → "anon public" → champ "anonKey"
   La clé "anon" est PUBLIQUE (prévue pour le navigateur) : aucun risque
   à la laisser ici. Les écritures sont protégées par l'authentification
   et les règles de sécurité (RLS) côté Supabase.
   =================================================================== */
window.SUPABASE_CONFIG = {
  url: "https://VOTRE-PROJET.supabase.co",
  anonKey: "VOTRE_CLE_ANON_PUBLIQUE"
};

/* Outil interne : crée le client Supabase si la config est renseignée. */
window.creerClientSupabase = function () {
  var c = window.SUPABASE_CONFIG || {};
  if (!window.supabase || !c.url || c.url.indexOf("VOTRE-PROJET") !== -1) return null;
  return window.supabase.createClient(c.url, c.anonKey);
};
