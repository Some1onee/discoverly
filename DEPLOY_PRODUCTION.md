# 🚀 Déploiement Discoverly React + Node.js - GitHub + Ubuntu

## Stack Technique
- **Frontend** : React + Vite + TypeScript
- **Backend** : Node.js + Express + TypeScript + sql.js
- **Serveur** : Ubuntu + Nginx + PM2 (ou systemd)

---

## Partie 1️⃣ : Pousser sur GitHub

### Étape 1 : Préparer le projet

**Sur votre PC Windows** :

```powershell
# Ouvrir PowerShell dans le dossier du projet
cd "C:\Users\nielp\Desktop\DEV\DISCORVERLY\DISCORVERLY\discoverly-soundscape-main"
```

### Étape 2 : Vérifier .gitignore

Le `.gitignore` existe déjà. Vérifiez qu'il contient bien :

```
node_modules
dist
.env
*.log
.DS_Store
```

### Étape 3 : Pousser sur GitHub

```powershell
# Si pas encore initialisé
git init

# Ajouter tous les fichiers
git add .

# Premier commit
git commit -m "Initial commit - Discoverly React + Node.js"

# Lier au dépôt GitHub
git remote add origin https://github.com/Some1onee/discoverly.git

# Pousser sur GitHub
git push -u origin main
```

**En cas d'erreur d'authentification** :
- Allez sur GitHub : Settings > Developer settings > Personal access tokens
- Generate new token (classic)
- Cochez "repo"
- Copiez le token et utilisez-le comme mot de passe

---

## Partie 2️⃣ : Déploiement sur Ubuntu

### Prérequis sur le serveur

```bash
# Se connecter au serveur
ssh root@VOTRE_IP_SERVEUR

# Mise à jour du système
sudo apt update && sudo apt upgrade -y

# Installer Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Vérifier les versions
node --version  # Doit être v20.x.x
npm --version

# Installer Nginx et PM2
sudo apt install -y nginx git
sudo npm install -g pm2
```

### Cloner le projet

```bash
# Créer un dossier pour l'application
sudo mkdir -p /var/www
cd /var/www

# Cloner depuis GitHub
sudo git clone https://github.com/Some1onee/discoverly.git
cd discoverly

# Donner les permissions à l'utilisateur courant
sudo chown -R $USER:$USER /var/www/discoverly
```

---

## Partie 3️⃣ : Configuration du Backend

```bash
cd /var/www/discoverly/server

# Installer les dépendances
npm install

# Créer le fichier .env
nano .env
```

**Contenu du `.env`** :
```env
PORT=3000
NODE_ENV=production
JWT_SECRET=votre-secret-jwt-super-long-et-aleatoire-ici
DATABASE_PATH=./discoverly.db
FRONTEND_URL=http://VOTRE_IP_SERVEUR
```

**Générer un JWT_SECRET** :
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Compiler le TypeScript** :
```bash
npm run build
```

---

## Partie 4️⃣ : Configuration du Frontend

```bash
cd /var/www/discoverly

# Installer les dépendances
npm install

# Créer le fichier .env pour le frontend
nano .env
```

**Contenu du `.env` frontend** :
```env
VITE_API_URL=http://VOTRE_IP_SERVEUR:3000
```

**Build de production** :
```bash
npm run build
```

Les fichiers compilés seront dans `/var/www/discoverly/dist`

---

## Partie 5️⃣ : Configuration PM2 (Backend)

### Créer le fichier de config PM2

```bash
cd /var/www/discoverly
nano ecosystem.config.cjs
```

**Contenu** :
```javascript
module.exports = {
  apps: [{
    name: 'discoverly-backend',
    script: './server/dist/index.js',
    cwd: '/var/www/discoverly/server',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/www/discoverly/server/logs/error.log',
    out_file: '/var/www/discoverly/server/logs/out.log',
    log_file: '/var/www/discoverly/server/logs/combined.log',
    time: true
  }]
};
```

### Créer les dossiers de logs

```bash
mkdir -p /var/www/discoverly/server/logs
```

### Démarrer le backend avec PM2

```bash
cd /var/www/discoverly

# Démarrer
pm2 start ecosystem.config.cjs

# Sauvegarder la config PM2
pm2 save

# Démarrer PM2 au boot
pm2 startup
# Copiez et exécutez la commande affichée

# Vérifier le statut
pm2 status
pm2 logs discoverly-backend
```

---

## Partie 6️⃣ : Configuration Nginx

```bash
sudo nano /etc/nginx/sites-available/discoverly
```

**Contenu** :
```nginx
# Backend API
upstream backend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name VOTRE_IP_SERVEUR;  # Remplacez par votre IP ou domaine
    
    # Logs
    access_log /var/log/nginx/discoverly_access.log;
    error_log /var/log/nginx/discoverly_error.log;
    
    # Frontend (React build)
    root /var/www/discoverly/dist;
    index index.html;
    
    # Servir le frontend React
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Proxy API vers le backend Node.js
    location /api/ {
        proxy_pass http://backend/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Augmenter la taille max des uploads
    client_max_body_size 100M;
    
    # Cache pour les assets statiques
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Activer le site** :
```bash
sudo ln -s /etc/nginx/sites-available/discoverly /etc/nginx/sites-enabled/
sudo nginx -t  # Tester la config
sudo systemctl restart nginx
```

---

## Partie 7️⃣ : Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## 🎮 Commandes de Gestion PM2

### Contrôler le backend

```bash
# Démarrer
pm2 start ecosystem.config.cjs

# Arrêter
pm2 stop discoverly-backend

# Redémarrer
pm2 restart discoverly-backend

# Recharger (sans downtime)
pm2 reload discoverly-backend

# Statut
pm2 status

# Logs en direct
pm2 logs discoverly-backend

# Logs des erreurs
pm2 logs discoverly-backend --err

# Monitoring
pm2 monit
```

### Liste complète des commandes PM2

```bash
pm2 list              # Liste des apps
pm2 show [app]        # Détails d'une app
pm2 delete [app]      # Supprimer une app
pm2 restart all       # Redémarrer toutes les apps
pm2 stop all          # Arrêter toutes les apps
pm2 save              # Sauvegarder la config
pm2 resurrect         # Restaurer les apps sauvegardées
```

---

## 🔄 Mise à jour de l'application

### Créer un script de mise à jour

```bash
nano /var/www/discoverly/update.sh
```

**Contenu** :
```bash
#!/bin/bash
set -e

echo "🚀 Mise à jour de Discoverly..."

# Sauvegarder la BDD
echo "📦 Sauvegarde de la base de données..."
cp /var/www/discoverly/server/discoverly.db /var/www/discoverly/backups/db_backup_$(date +%Y%m%d_%H%M%S).db

# Se positionner dans le projet
cd /var/www/discoverly

# Pull depuis GitHub
echo "⬇️ Récupération des changements depuis GitHub..."
git pull origin main

# Backend
echo "🔧 Mise à jour du backend..."
cd server
npm install
npm run build

# Frontend
echo "🎨 Mise à jour du frontend..."
cd ..
npm install
npm run build

# Redémarrer le backend
echo "🔄 Redémarrage du backend..."
pm2 restart discoverly-backend

# Redémarrer Nginx (pour le frontend)
echo "🔄 Redémarrage de Nginx..."
sudo systemctl reload nginx

# Statut
pm2 status

echo "✅ Mise à jour terminée avec succès !"
```

**Rendre exécutable** :
```bash
mkdir -p /var/www/discoverly/backups
chmod +x /var/www/discoverly/update.sh
```

**Pour mettre à jour** :
```bash
/var/www/discoverly/update.sh
```

---

## 📝 Workflow de développement

### Sur votre PC Windows

```powershell
# 1. Faire vos modifications dans le code
# ...

# 2. Tester localement
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd ..
npm run dev

# 3. Commiter et pousser sur GitHub
git add .
git commit -m "Description de vos changements"
git push origin main
```

### Sur le serveur Ubuntu

```bash
# 4. Mettre à jour l'application
/var/www/discoverly/update.sh
```

---

## 🆘 Dépannage

### Le backend ne démarre pas

```bash
# Voir les logs PM2
pm2 logs discoverly-backend --lines 100

# Vérifier la config
cd /var/www/discoverly/server
cat .env

# Tester le build
npm run build

# Redémarrer
pm2 restart discoverly-backend
```

### Erreur 502 Bad Gateway

```bash
# Le backend est probablement arrêté
pm2 status
pm2 restart discoverly-backend

# Vérifier que le port 3000 est écouté
sudo netstat -tulpn | grep 3000
```

### Le frontend ne se charge pas

```bash
# Vérifier que le build existe
ls -la /var/www/discoverly/dist

# Rebuild
cd /var/www/discoverly
npm run build

# Redémarrer Nginx
sudo systemctl restart nginx
```

### Problème de permissions

```bash
sudo chown -R $USER:$USER /var/www/discoverly
sudo chmod -R 755 /var/www/discoverly
```

---

## 📊 Monitoring

### Vérifier que tout fonctionne

```bash
# Backend PM2
pm2 status
pm2 monit  # Interface de monitoring

# Nginx
sudo systemctl status nginx

# Logs en temps réel
pm2 logs discoverly-backend -f
sudo tail -f /var/log/nginx/discoverly_error.log

# Utilisation des ressources
htop  # (sudo apt install htop si pas installé)
```

---

## 🗄️ Sauvegardes

### Sauvegarde manuelle

```bash
# Base de données
cp /var/www/discoverly/server/discoverly.db /var/www/discoverly/backups/db_backup_$(date +%Y%m%d).db

# Code complet
tar -czf /var/www/discoverly/backups/code_backup_$(date +%Y%m%d).tar.gz /var/www/discoverly
```

### Restaurer une sauvegarde

```bash
# Base de données
cp /var/www/discoverly/backups/db_backup_20251013.db /var/www/discoverly/server/discoverly.db
pm2 restart discoverly-backend
```

---

## 🎯 Checklist complète

- [ ] Node.js 20 LTS installé
- [ ] PM2 installé globalement
- [ ] Nginx installé
- [ ] Projet cloné depuis GitHub
- [ ] Dépendances backend installées
- [ ] Backend compilé (TypeScript → JavaScript)
- [ ] Fichier .env backend configuré
- [ ] Dépendances frontend installées
- [ ] Frontend buildé pour production
- [ ] PM2 configuré et démarré
- [ ] Nginx configuré
- [ ] Firewall configuré
- [ ] Script de mise à jour créé
- [ ] Application accessible via navigateur
- [ ] Tests réussis

---

## 🚀 C'est fini !

Votre application est maintenant déployée sur : **http://VOTRE_IP_SERVEUR**

**Commandes essentielles** :
```bash
# Gérer le backend
pm2 start ecosystem.config.cjs
pm2 stop discoverly-backend
pm2 restart discoverly-backend
pm2 logs discoverly-backend

# Gérer Nginx (frontend)
sudo systemctl restart nginx
sudo nginx -t

# Mettre à jour
/var/www/discoverly/update.sh
```

---

## 📱 URLs importantes

- **Frontend** : http://VOTRE_IP_SERVEUR
- **API Backend** : http://VOTRE_IP_SERVEUR/api/
- **GitHub** : https://github.com/Some1onee/discoverly
- **PM2 Web Interface** : `pm2 web` (puis http://VOTRE_IP:9615)

---

**Support** : Consultez les logs avec `pm2 logs` ou `sudo tail -f /var/log/nginx/discoverly_error.log`
