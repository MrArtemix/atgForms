# Guide de Déploiement - Brobroli Artisans

Ce document explique comment déployer l'application complète (Next.js + Python Backend) en production.

## 1. Backend Python (Génération PDF)

Le backend Python doit tourner en permanence pour générer les PDF officiels.

### Prérequis
- Python 3.10+
- Pip

### Installation
```bash
cd python-backend
# Créer l'environnement virtuel si nécessaire
python3 -m venv venv
source venv/bin/activate
# Installer les dépendances
pip install -r requirements.txt
```

### Lancement en Production
Il est recommandé d'utiliser un serveur WSGI comme `gunicorn` :
```bash
pip install gunicorn
# Lancement sur le port 8002
gunicorn --bind 0.0.0.0:8002 main:app
```

## 2. Application Frontend (Next.js)

### Variables d'Environnement
Configurez les variables suivantes sur votre plateforme de déploiement (Vercel, Docker, etc.) :
- `NEXT_PUBLIC_SUPABASE_URL` : URL de votre projet Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : Clé anonyme Supabase
- `SUPABASE_SERVICE_ROLE_KEY` : Clé de rôle service (pour les opérations admin)
- `NEXT_PUBLIC_PYTHON_BACKEND_URL` : URL de votre serveur Python (ex: `https://votre-api-python.com`)

### Build & Start
```bash
npm install
npm run build
npm run start
```

## 3. Configuration Supabase

Assurez-vous que :
1. Le bucket de stockage `response-uploads` est bien créé et configuré en **"Public"**.
2. Les politiques RLS (Row Level Security) sont correctement appliquées sur les tables `form_responses` et `response_answers`.

---

## 📂 Structure des Fichiers Archivés
Les fichiers de développement et tests ont été déplacés dans `/archives_dev` pour ne pas encombrer le projet de production. Vous pouvez les ignorer lors du déploiement.
