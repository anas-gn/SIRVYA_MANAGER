# Fitlek Manager

Application Next.js (frontend + backend dans le meme projet, App Router) pour l'espace
**Manager** de Fitlek : gestion des advisors (salles) et des coaches d'une ville donnee,
gestion des reservations, et upload de photos via Cloudinary.

## Stack

- **Next.js 14** (App Router) — frontend + API routes (backend)
- **MySQL** — via `mysql2`, connexion directe a votre base existante (schema fourni dans `database/schema.sql`)
- **JWT** (cookie httpOnly) — authentification manager
- **bcryptjs** — hachage des mots de passe
- **Cloudinary** — upload d'images (photos de salle, avatar) via upload signe
- **TailwindCSS** — UI

## Fonctionnalites

- Inscription / connexion d'un compte **manager** (role `manager`), rattache a une **ville**
  (table `managerprofiles`)
- Dashboard avec statistiques (advisors, coaches, reservations)
- Liste et fiche detaillee des **advisors** de la ville geree, avec approbation
  (`isApproved`) et upload de photos de salle (table `imageadvisor`)
- Liste et fiche detaillee des **coaches** de la ville geree (rattaches directement ou via
  un advisor de la ville), avec approbation et affichage des avis (`coachreviews`)
- Gestion des **reservations** des coaches de la ville : filtre par statut
  (`pending` / `confirmed` / `cancelled`) et actions confirmer / annuler
- Page de profil manager avec upload de photo (Cloudinary)

## Installation

```bash
npm install
cp .env.example .env
```

Remplissez `.env` avec :

- Vos identifiants MySQL (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`)
- Un `JWT_SECRET` long et aleatoire
- Vos identifiants Cloudinary (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
  `CLOUDINARY_API_SECRET`)

La base de donnees doit deja contenir les tables du schema fourni dans
`database/schema.sql` (users, managerprofiles, advisorprofiles, coachprofiles,
imageadvisor, reservations, coachreviews, etc.). Si votre base ne contient pas encore ce
schema, importez `database/schema.sql` dans MySQL avant de lancer l'application.

## Lancer en developpement

```bash
npm run dev
```

L'application est disponible sur http://localhost:3000

- `/register` — creer un compte manager (prenom, nom, email, mot de passe, ville geree)
- `/login` — se connecter
- `/dashboard` — vue d'ensemble (proteg­ee par middleware, redirige vers `/login` si non
  connecte)

## Build production

```bash
npm run build
npm run start
```

## Notes techniques

- L'authentification est stockee dans un cookie httpOnly `fitlek_token` contenant un JWT
  (`id`, `email`, `role`, `ville`). Le middleware (`middleware.js`) protege toutes les
  routes `/dashboard/*`.
- Toutes les requetes SQL filtrent explicitement sur `ville` afin qu'un manager ne voie et
  ne modifie que les advisors/coaches/reservations de sa propre ville.
- L'upload de photos utilise un **upload signe Cloudinary** : le backend genere une
  signature (`/api/upload/signature`), puis le navigateur envoie directement le fichier a
  Cloudinary, et enfin l'URL renvoyee est sauvegardee en base
  (`/api/upload/save` → `users.avatarUrl` ou table `imageadvisor`).
- Le role `manager` est le seul autorise a se connecter sur cette application (les clients,
  coaches et advisors ont leurs propres applications).
