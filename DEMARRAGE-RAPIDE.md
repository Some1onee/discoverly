# 🚀 Démarrage Rapide - Discoverly

## ⚠️ Problème Résolu
Le problème avec `better-sqlite3` a été corrigé ! J'ai remplacé par `sql.js` qui fonctionne sans compilation.

## 📝 Étapes de Démarrage

### 1️⃣ Installation du Backend

```powershell
cd server
npm install
```

> ⏳ L'installation peut prendre 1-2 minutes...

### 2️⃣ Créer l'utilisateur par défaut

```powershell
npm run create-user
```

Cela créera l'utilisateur:
- **Username**: niel
- **Email**: niel@example.com  
- **Password**: password123

### 3️⃣ Démarrer le Backend (Terminal 1)

```powershell
npm run dev
```

✅ Le serveur démarre sur **http://localhost:3001**

### 4️⃣ Démarrer le Frontend (Terminal 2)

Ouvrez un **nouveau terminal** :

```powershell
# Retourner au dossier racine
cd ..

# Démarrer Vite
npm run dev
```

✅ L'application démarre sur **http://localhost:8080**

---

## 🎯 Test de l'Application

1. Ouvrez http://localhost:8080
2. Cliquez sur **"Connexion"**
3. Utilisez les identifiants:
   - **Email**: niel@example.com
   - **Password**: password123
4. Explorez toutes les fonctionnalités !

---

## ✨ Fonctionnalités Disponibles

- ✅ **Authentification** - Inscription/Connexion
- ✅ **Liker des musiques** - Sauvegardés en base de données
- ✅ **Créer des playlists** - Organiser vos musiques
- ✅ **Commenter** - Partager vos avis
- ✅ **Partager** - Créer des liens de partage
- ✅ **Recommandations** - Basées sur vos goûts musicaux

---

## 🔧 Dépannage

### Le backend ne démarre pas
```powershell
# Supprimez node_modules et réinstallez
cd server
Remove-Item -Recurse -Force node_modules
npm install
```

### Erreur "Cannot find module"
```powershell
# Assurez-vous d'être dans le bon dossier
cd server
npm install
```

### La base de données ne se crée pas
```powershell
# Relancez le script de création d'utilisateur
npm run create-user
```

---

## 📂 Structure

```
discoverly-soundscape-main/
├── src/                    # Frontend React
├── server/                 # Backend Node.js
│   ├── src/
│   │   ├── db/            # Base de données SQLite
│   │   ├── routes/        # Routes API
│   │   └── index.ts       # Point d'entrée
│   └── discoverly.db      # Base de données (créée automatiquement)
└── package.json
```

---

## 🎉 C'est Parti !

Vous êtes prêt à utiliser Discoverly avec toutes ses fonctionnalités avancées ! 🎵
