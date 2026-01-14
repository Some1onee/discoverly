# ⚡ Commandes Rapides - Discoverly React + Node.js

## 🚀 Sur Windows - Développement Local

### Lancer l'application en dev

```powershell
# Terminal 1 - Backend
cd server
npm install
npm run dev

# Terminal 2 - Frontend  
cd ..
npm install
npm run dev
```

L'application sera accessible sur http://localhost:8080

### Pousser sur GitHub

```powershell
# Après modifications
git add .
git commit -m "Description des changements"
git push origin main
```

---

## 🖥️ Sur Ubuntu - Déploiement Initial (À faire une seule fois)

### Installation complète

```bash
# 1. Node.js + outils
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git
sudo npm install -g pm2

# 2. Cloner le projet
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/Some1onee/discoverly.git
cd discoverly
sudo chown -R $USER:$USER /var/www/discoverly

# 3. Backend
cd server
npm install
nano .env  # Configurer (voir guide complet)
npm run build

# 4. Frontend
cd ..
npm install
nano .env  # Ajouter VITE_API_URL
npm run build

# 5. PM2
nano ecosystem.config.cjs  # Copier depuis le guide
mkdir -p server/logs
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup  # Copier/coller la commande affichée

# 6. Nginx
sudo nano /etc/nginx/sites-available/discoverly  # Copier depuis le guide
sudo ln -s /etc/nginx/sites-available/discoverly /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 7. Firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# 8. Script de mise à jour
mkdir -p backups
nano update.sh  # Copier depuis le guide
chmod +x update.sh
```

---

## 🎮 Gestion Quotidienne

### Contrôler le Backend (PM2)

```bash
# Démarrer
pm2 start ecosystem.config.cjs
pm2 start discoverly-backend

# Arrêter
pm2 stop discoverly-backend

# Redémarrer
pm2 restart discoverly-backend

# Recharger (sans downtime)
pm2 reload discoverly-backend

# Statut
pm2 status
pm2 list

# Logs
pm2 logs discoverly-backend
pm2 logs discoverly-backend -f  # En direct
pm2 logs discoverly-backend --lines 100
pm2 logs discoverly-backend --err  # Erreurs seulement

# Monitoring
pm2 monit

# Supprimer
pm2 delete discoverly-backend
```

### Contrôler Nginx (Frontend)

```bash
# Redémarrer
sudo systemctl restart nginx

# Recharger config (sans downtime)
sudo systemctl reload nginx

# Statut
sudo systemctl status nginx

# Tester la config
sudo nginx -t

# Logs
sudo tail -f /var/log/nginx/discoverly_error.log
sudo tail -f /var/log/nginx/discoverly_access.log
```

---

## 🔄 Mise à Jour de l'Application

### Depuis votre PC Windows

```powershell
# 1. Faire vos modifications
# 2. Tester localement
# 3. Pousser sur GitHub
git add .
git commit -m "Description"
git push origin main
```

### Sur le serveur Ubuntu

```bash
# Méthode 1 : Script automatique (RECOMMANDÉ)
/var/www/discoverly/update.sh

# Méthode 2 : Manuelle
cd /var/www/discoverly

# Sauvegarder la BDD
cp server/discoverly.db backups/db_backup_$(date +%Y%m%d_%H%M%S).db

# Pull depuis GitHub
git pull origin main

# Backend
cd server
npm install
npm run build

# Frontend
cd ..
npm install
npm run build

# Redémarrer
pm2 restart discoverly-backend
sudo systemctl reload nginx

# Vérifier
pm2 status
```

---

## 🆘 Dépannage Express

### Le site ne marche pas

```bash
# 1. Vérifier les services
pm2 status
sudo systemctl status nginx

# 2. Voir les logs
pm2 logs discoverly-backend --lines 50
sudo tail -f /var/log/nginx/discoverly_error.log

# 3. Redémarrer tout
pm2 restart discoverly-backend
sudo systemctl restart nginx
```

### Erreur 502 Bad Gateway

```bash
# Le backend est probablement arrêté
pm2 status
pm2 restart discoverly-backend

# Vérifier que le port 3000 est écouté
sudo netstat -tulpn | grep 3000
# ou
sudo ss -tulpn | grep 3000
```

### Le frontend ne se charge pas

```bash
# Vérifier le build
ls -la /var/www/discoverly/dist

# Rebuild si nécessaire
cd /var/www/discoverly
npm run build
sudo systemctl reload nginx
```

### Backend plante au démarrage

```bash
# Voir les erreurs
pm2 logs discoverly-backend --err --lines 50

# Vérifier la config
cat /var/www/discoverly/server/.env

# Tester le build
cd /var/www/discoverly/server
npm run build
node dist/index.js  # Test manuel
```

### Problème après mise à jour

```bash
# Forcer le rebuild complet
cd /var/www/discoverly

# Backend
cd server
rm -rf node_modules dist
npm install
npm run build

# Frontend
cd ..
rm -rf node_modules dist
npm install
npm run build

# Redémarrer
pm2 restart discoverly-backend
sudo systemctl reload nginx
```

---

## 📊 Monitoring

```bash
# Dashboard PM2
pm2 monit

# Statut des services
pm2 status
sudo systemctl status nginx

# Utilisation ressources
htop  # Installer: sudo apt install htop

# Espace disque
df -h

# Mémoire
free -h

# Logs en direct
pm2 logs discoverly-backend -f
sudo tail -f /var/log/nginx/discoverly_error.log
```

---

## 🗄️ Sauvegardes

### Sauvegarde manuelle

```bash
# Base de données
cp /var/www/discoverly/server/discoverly.db /var/www/discoverly/backups/db_backup_$(date +%Y%m%d).db

# Code complet (optionnel)
tar -czf /var/www/discoverly/backups/code_backup_$(date +%Y%m%d).tar.gz /var/www/discoverly
```

### Restaurer

```bash
# Base de données
cp /var/www/discoverly/backups/db_backup_20251013.db /var/www/discoverly/server/discoverly.db
pm2 restart discoverly-backend
```

### Sauvegarde automatique (optionnel)

```bash
# Créer un script
nano /var/www/discoverly/backup.sh
```

Contenu :
```bash
#!/bin/bash
cp /var/www/discoverly/server/discoverly.db /var/www/discoverly/backups/db_backup_$(date +%Y%m%d_%H%M%S).db
# Garder seulement les 7 dernières
ls -t /var/www/discoverly/backups/db_backup_*.db | tail -n +8 | xargs rm -f
```

```bash
chmod +x /var/www/discoverly/backup.sh

# Ajouter au cron (quotidien à 3h)
crontab -e
# Ajouter: 0 3 * * * /var/www/discoverly/backup.sh
```

---

## 🔧 Commandes Utiles

### Node.js / NPM

```bash
# Versions
node --version
npm --version

# Nettoyer le cache NPM
npm cache clean --force

# Audit de sécurité
npm audit
npm audit fix
```

### Git

```bash
# Voir les changements
git status
git log --oneline -10

# Reset (ATTENTION: perte de modifications locales)
git reset --hard origin/main
```

### Permissions

```bash
# Réparer les permissions
sudo chown -R $USER:$USER /var/www/discoverly
sudo chmod -R 755 /var/www/discoverly
```

---

## 🌐 URLs Importantes

- **Frontend** : http://VOTRE_IP_SERVEUR
- **Backend API** : http://VOTRE_IP_SERVEUR/api/
- **GitHub** : https://github.com/Some1onee/discoverly
- **PM2 Web** : `pm2 web` puis http://VOTRE_IP:9615

---

## 📚 Aide Complète

Pour le guide complet avec toutes les explications : **DEPLOY_PRODUCTION.md**

---

**Support** : `pm2 logs discoverly-backend` ou `sudo tail -f /var/log/nginx/discoverly_error.log`
