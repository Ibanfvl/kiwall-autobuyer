# Site vitrine Ibanfvl Buyer

Site statique indépendant du script Tampermonkey. Ouvre `index.html` directement dans un navigateur ou sers le dossier avec un serveur statique.

## Personnalisation

- Remplace les textes et tarifs dans `index.html`.
- Remplace `contact@ibanfvl-buyer.example` dans `app.js` par une adresse réelle avant la mise en ligne.
- Les trois emplacements de la section « Ta vitrine » acceptent une image depuis le navigateur pour prévisualisation. Pour des images permanentes, ajoute tes fichiers au projet puis remplace les blocs correspondants par des balises `<img src="...">`.
- Les couleurs et la mise en page sont centralisées dans `styles.css`.
- La vitrine présente la connexion FUTBIN comme une actualisation en direct pendant la session. Le script dépend toutefois de l'accès au site FUTBIN et ses données peuvent être retardées ou bloquées.

Le formulaire prépare un email ; il ne collecte ni ne traite de paiement.

## Backend des avis avec Vercel et Supabase

1. Crée un projet Supabase et exécute [supabase-schema.sql](./supabase-schema.sql) dans le SQL Editor.
2. Déploie le dossier `site` sur Vercel.
3. Configure dans Vercel les variables `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY`.
4. Redéploie le projet.

La clé `SUPABASE_SERVICE_ROLE_KEY` doit rester uniquement dans les variables serveur Vercel. La route `/api/reviews` enregistre et liste les avis publiquement ; aucune modération n’est activée.
