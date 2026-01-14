# 🎵 Discoverly - Guide de Démarrage

Application complète de découverte musicale avec authentification, playlists, commentaires, likes et recommandations.

## 📋 Prérequis

- **Node.js 18+** (pour Vite 5 et le serveur)
- **npm** (inclus avec Node.js)

## 🚀 Installation et Démarrage

### 1️⃣ Installation du Frontend

```powershell
# Dans le dossier racine du projet
npm install
```

### 2️⃣ Installation du Backend

```powershell
# Dans le dossier server
cd server
npm install
cd ..
```

### 3️⃣ Configuration du Backend

Le fichier `.env` a déjà été créé dans `server/.env` avec les valeurs par défaut. Vous pouvez le modifier si nécessaire.

### 4️⃣ Démarrage de l'application

**Terminal 1 - Backend (API):**
```powershell
cd server
npm run dev
```
Le serveur démarre sur http://localhost:3001

**Terminal 2 - Frontend:**
```powershell
npm run dev
```
L'application démarre sur http://localhost:8080

## ✨ Fonctionnalités

### 🔐 Authentification
- **Inscription** - Créez un compte utilisateur
- **Connexion** - Connectez-vous avec votre email et mot de passe
- **Déconnexion** - Déconnectez-vous à tout moment

### ❤️ Gestion des Favoris
- **Liker des musiques** - Marquez vos musiques préférées
- **Page Favoris** - Accédez à toutes vos musiques likées
- **Sync en temps réel** - Vos likes sont sauvegardés dans la base de données

### 📝 Commentaires
- **Commenter** - Partagez vos avis sur les musiques
- **Voir les commentaires** - Lisez ce que les autres utilisateurs pensent
- **Supprimer** - Supprimez vos propres commentaires

### 🎼 Playlists
- **Créer des playlists** - Organisez vos musiques favorites
- **Ajouter des musiques** - Ajoutez des tracks à vos playlists
- **Gérer vos playlists** - Modifiez, supprimez, organisez

### 🔗 Partage
- **Partager des musiques** - Créez des liens de partage pour vos tracks préférés
- **Copie automatique** - Le lien est copié dans le presse-papier

### 🎯 Recommandations
- **Suivi des écoutes** - L'application track vos préférences musicales
- **Genres favoris** - Affichage de vos genres les plus écoutés
- **Recommandations personnalisées** - Suggestions basées sur vos goûts

## 🗂️ Structure du Projet

```
discoverly-soundscape-main/
├── src/                          # Frontend React
│   ├── components/              # Composants réutilisables
│   │   ├── Navigation.tsx       # Barre de navigation
│   │   ├── TrackCard.tsx       # Carte de musique
│   │   └── AudioPlayer.tsx     # Lecteur audio
│   ├── contexts/               # Contextes React
│   │   └── AuthContext.tsx     # Gestion de l'authentification
│   ├── hooks/                  # Hooks personnalisés
│   │   └── useAudiusApi.ts    # Hook pour l'API Audius
│   ├── lib/                    # Utilitaires
│   │   └── api.ts             # Client API backend
│   ├── pages/                  # Pages de l'application
│   │   ├── Index.tsx          # Page d'accueil
│   │   ├── Login.tsx          # Page de connexion
│   │   ├── Signup.tsx         # Page d'inscription
│   │   ├── Liked.tsx          # Page des favoris
│   │   ├── Playlists.tsx      # Page des playlists
│   │   ├── PlaylistDetail.tsx # Détails d'une playlist
│   │   └── TrackDetail.tsx    # Détails d'une musique
│   └── App.tsx                # Composant principal
│
├── server/                      # Backend Express
│   ├── src/
│   │   ├── db/
│   │   │   └── schema.ts       # Schéma de la base de données
│   │   ├── middleware/
│   │   │   └── auth.ts         # Middleware d'authentification
│   │   ├── routes/             # Routes de l'API
│   │   │   ├── auth.ts        # Routes d'authentification
│   │   │   ├── likes.ts       # Routes des likes
│   │   │   ├── playlists.ts   # Routes des playlists
│   │   │   ├── comments.ts    # Routes des commentaires
│   │   │   ├── recommendations.ts # Routes des recommandations
│   │   │   └── shares.ts      # Routes de partage
│   │   └── index.ts           # Point d'entrée du serveur
│   └── discoverly.db           # Base de données SQLite (créée automatiquement)
│
└── package.json                # Dépendances frontend
```

## 🎨 Stack Technique

### Frontend
- **React 18** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Vite** - Build tool moderne
- **TailwindCSS** - Framework CSS
- **shadcn/ui** - Composants UI
- **React Router** - Navigation
- **Tanstack Query** - Gestion d'état serveur
- **Lucide React** - Icônes
- **Sonner** - Toast notifications

### Backend
- **Express** - Framework web Node.js
- **TypeScript** - Typage statique
- **SQLite (better-sqlite3)** - Base de données
- **JWT** - Authentification
- **bcrypt** - Hashage de mots de passe
- **Zod** - Validation de schémas

### API Musicale
- **Audius API** - Source de musiques (API publique décentralisée)

## 📊 Base de Données

La base de données SQLite contient les tables suivantes:

- **users** - Utilisateurs de l'application
- **playlists** - Playlists créées par les utilisateurs
- **playlist_tracks** - Musiques dans les playlists
- **likes** - Musiques likées par les utilisateurs
- **comments** - Commentaires sur les musiques
- **listening_history** - Historique d'écoute pour les recommandations
- **shares** - Liens de partage de musiques

## 🔒 Sécurité

- Mots de passe hashés avec **bcrypt**
- Authentification par **JWT tokens**
- Tokens stockés en localStorage (côté client)
- Middleware de protection des routes authentifiées
- Validation des entrées avec **Zod**

## 🐛 Dépannage

### Le serveur ne démarre pas
- Vérifiez que le port 3001 n'est pas déjà utilisé
- Vérifiez que toutes les dépendances sont installées (`npm install` dans `/server`)

### Le frontend ne se connecte pas au backend
- Vérifiez que le serveur backend est bien démarré sur http://localhost:3001
- Vérifiez l'URL dans `src/lib/api.ts` (doit être `http://localhost:3001/api`)

### Erreur de CORS
- Le backend est configuré pour accepter toutes les origines en développement
- En production, configurez CORS pour n'accepter que votre domaine

## 📝 Prochaines Étapes

Pour améliorer l'application, vous pouvez:

1. **Ajouter des images de profil utilisateur**
2. **Implémenter un système de followers**
3. **Créer des playlists collaboratives**
4. **Ajouter la recherche de musiques**
5. **Implémenter un système de notation (étoiles)**
6. **Créer un système de playlists publiques/privées**
7. **Ajouter des statistiques d'écoute**
8. **Implémenter un algorithme de recommandation plus sophistiqué**

## 🎉 Profitez de Discoverly !

Découvrez de nouvelles musiques, créez vos playlists et partagez vos découvertes !
