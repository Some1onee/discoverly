# Discoverly Backend API

Backend API pour Discoverly - Application de découverte musicale

## Installation

```bash
npm install
```

## Configuration

Créez un fichier `.env` à la racine du dossier `server` (un exemple est fourni dans `.env.example`):

```env
PORT=3001
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

## Démarrage

### Mode développement (avec hot reload)
```bash
npm run dev
```

### Mode production
```bash
npm run build
npm start
```

## API Endpoints

### Authentification
- `POST /api/auth/signup` - Créer un compte
- `POST /api/auth/login` - Se connecter

### Likes
- `GET /api/likes` - Récupérer les likes de l'utilisateur
- `POST /api/likes` - Liker une musique
- `DELETE /api/likes/:trackId` - Unliker une musique
- `GET /api/likes/check/:trackId` - Vérifier si une musique est likée

### Playlists
- `GET /api/playlists` - Récupérer les playlists de l'utilisateur
- `POST /api/playlists` - Créer une playlist
- `GET /api/playlists/:id/tracks` - Récupérer les musiques d'une playlist
- `POST /api/playlists/:id/tracks` - Ajouter une musique à une playlist
- `DELETE /api/playlists/:playlistId/tracks/:trackId` - Retirer une musique
- `DELETE /api/playlists/:id` - Supprimer une playlist

### Commentaires
- `GET /api/comments/track/:trackId` - Récupérer les commentaires d'une musique
- `POST /api/comments` - Ajouter un commentaire
- `DELETE /api/comments/:id` - Supprimer un commentaire

### Recommandations
- `POST /api/recommendations/listen` - Tracker l'écoute d'une musique
- `GET /api/recommendations/genres` - Récupérer les genres favoris
- `GET /api/recommendations/tracks` - Récupérer les recommandations

### Partage
- `POST /api/shares` - Créer un lien de partage
- `GET /api/shares/:token` - Récupérer une musique partagée

## Base de données

SQLite est utilisé pour la persistance. La base de données est créée automatiquement au démarrage dans `server/discoverly.db`.

## Stack Technique

- **Express** - Framework web
- **TypeScript** - Typage statique
- **Better-SQLite3** - Base de données SQLite
- **bcrypt** - Hashage des mots de passe
- **jsonwebtoken** - Authentification JWT
- **Zod** - Validation des données
