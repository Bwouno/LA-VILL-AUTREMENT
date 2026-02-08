# Site mairie (React + CSS, sans base de données)

Ce projet contient :
- Le site public en **ReactJS + CSS** (Vite)
- Un **espace admin** pour gérer des articles (texte + image) avec stockage **sans base de données** (fichiers JSON + uploads)

## Prérequis
- Node.js (≥ 18)

## Installation
```bash
npm install
```

## Démarrer en développement
Ouvrez 2 terminaux :

Terminal 1 (front) :
```bash
npm run dev
```

Terminal 2 (API / admin) :
```bash
npm run dev:server
```

- Site : `http://localhost:5173`
- Admin : `http://localhost:5173/admin`

## Comptes admin / éditeur
### Créer le premier utilisateur (recommandé)
```bash
npm run create-user -- --username alice --password "motdepassefort" --role editor
```
Rôles :
- `admin` : gestion des utilisateurs + articles
- `editor` : gestion des articles

## Stockage (sans DB)
- Articles : `server/data/articles.json`
- Messages de contact : `server/data/messages.json`
- Utilisateurs : `server/data/users.json`
- Uploads images : `server/uploads/` (accès public via `/uploads/...`)

## Modifier les images / textes de la maquette
Placeholders à remplacer :
- Hero : `public/images/hero.svg`
- Image section “avenir” : `public/images/future.svg`
- Image équipe : `public/images/team.svg`
- Image listes électorales : `public/images/electoral.svg`
- Logo : `public/branding/logo.svg` et `public/branding/wordmark.svg`

Lien du questionnaire :
- `src/content/links.js` (`QUESTIONNAIRE_URL`)

## Build & production
```bash
npm run build
npm start
```

Variables utiles :
- `PORT` (défaut `5174`)
- `HOST` (défaut `127.0.0.1`) → mettre `0.0.0.0` sur serveur
- `ALLOWED_ORIGINS` (défaut `http://localhost:5173`)
- `COOKIE_SECURE` (`true` conseillé en HTTPS)
