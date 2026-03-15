<p align="center">
  <img src="python-backend/static/Logo brobroli version institutionnelle.png" alt="Brobroli Logo" width="280"/>
</p>

<h1 align="center">ATG Forms — Brobroli</h1>

<p align="center">
  <strong>Plateforme professionnelle de création, gestion et traitement de formulaires pour l'enregistrement des artisans en Côte d'Ivoire.</strong>
</p>

<p align="center">
  <a href="https://forms.atg.ci">Site officiel</a> ·
  <a href="#démarrage-rapide">Démarrage rapide</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#fonctionnalités">Fonctionnalités</a> ·
  <a href="#déploiement">Déploiement</a>
</p>

---

## Vue d'ensemble

**ATG Forms** est une application SaaS complète développée par [ATG (Africa Technology Group)](https://atg.ci) pour la gestion de l'enregistrement officiel des artisans via la plateforme **Brobroli by ADEM**. Elle permet la création de formulaires complexes, la collecte de réponses, la génération automatique de fiches PDF officielles et la gestion multi-workspace.

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Stack technique](#stack-technique)
- [Structure du projet](#structure-du-projet)
- [Prérequis](#prérequis)
- [Démarrage rapide](#démarrage-rapide)
- [Variables d'environnement](#variables-denvironnement)
- [Déploiement](#déploiement)
- [Contribution](#contribution)
- [Licence](#licence)

## Fonctionnalités

### 🧩 Constructeur de Formulaires

| Fonctionnalité | Description |
|---|---|
| **Éditeur visuel Drag & Drop** | Construction intuitive de formulaires multi-pages avec drag-and-drop |
| **+25 types de champs** | Texte, nombre, email, téléphone, date, choix unique/multiple, dropdown, échelle linéaire, notation, matrice, upload de fichier, upload d'image, signature, et plus |
| **Logique conditionnelle** | Affichage/masquage de champs basé sur les réponses de l'utilisateur |
| **Validation avancée** | Règles de validation personnalisables par champ |
| **En-têtes et sections** | Organisation structurée avec en-têtes de formulaire, titres de section et séparateurs |
| **Aperçu en direct** | Prévisualisation du formulaire en temps réel |

### 📊 Gestion des Réponses

| Fonctionnalité | Description |
|---|---|
| **Tableau de bord analytique** | Visualisation des statistiques et graphiques de réponses |
| **Vue détaillée** | Consultation individuelle de chaque réponse avec tous les champs |
| **Export de données** | Export des réponses au format Excel (`.xlsx`) |
| **Temps réel** | Mise à jour automatique des réponses via Supabase Realtime |

### 📄 Génération de Documents PDF

| Fonctionnalité | Description |
|---|---|
| **Fiche Officielle d'Enregistrement** | Génération automatique de la fiche officielle des artisans Brobroli avec mise en page professionnelle |
| **Photo et signature** | Intégration de la photo de profil et de la signature manuscrite dans le PDF |
| **QR Code de validation** | QR code embarqué pour la vérification d'authenticité |
| **Templates personnalisables** | Système de templates extensible pour d'autres types de documents |

### 🏢 Multi-Tenant & Workspaces

| Fonctionnalité | Description |
|---|---|
| **Workspaces** | Espaces de travail isolés avec gestion des membres et des rôles |
| **Filiales** | Organisation hiérarchique : holding → filiales → projets |
| **Invitations** | Système d'invitation par lien avec gestion des accès |
| **RLS (Row Level Security)** | Sécurité granulaire au niveau de chaque ligne de données via Supabase |

### 🎨 Personnalisation

| Fonctionnalité | Description |
|---|---|
| **Thèmes** | Personnalisation des couleurs, polices et styles du formulaire |
| **Formulaires intégrables** | Embedding via iframe sur des sites tiers (`/embed/[slug]`) |
| **Lien de partage** | Lien public dédié pour chaque formulaire (`/f/[slug]`) |

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        TRAEFIK (Reverse Proxy)                   │
│                         forms.atg.ci                             │
├──────────────┬───────────────────────────────────────────────────┤
│              │                                                   │
│    /*        │    /generate-pdf, /static/*                       │
│              │                                                   │
▼              ▼                                                   │
┌──────────────────┐        ┌─────────────────────────┐           │
│   Next.js 16     │        │   Flask (Python)         │           │
│   Frontend       │───────▶│   PDF Generator          │           │
│   Port 3000      │        │   Port 8002              │           │
│                  │        │                           │           │
│  • UI/UX         │        │  • ReportLab              │          │
│  • API Routes    │        │  • Gunicorn (prod)        │          │
│  • Auth          │        │  • Static assets          │          │
└────────┬─────────┘        └───────────────────────────┘          │
         │                                                         │
         ▼                                                         │
┌──────────────────────────────────────────────────────────────────┤
│                     SUPABASE (Backend-as-a-Service)               │
│                                                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │ PostgreSQL │  │  Auth      │  │  Storage   │  │  Realtime  │ │
│  │ (Database) │  │  (JWT)     │  │  (Uploads) │  │  (WS)      │ │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │
└──────────────────────────────────────────────────────────────────┘
```

## Stack technique

### Frontend

| Technologie | Version | Rôle |
|---|---|---|
| [Next.js](https://nextjs.org/) | 16.1 | Framework React (App Router, Server Components) |
| [React](https://react.dev/) | 19.2 | Bibliothèque UI |
| [TypeScript](https://typescriptlang.org/) | 5.x | Typage statique |
| [Tailwind CSS](https://tailwindcss.com/) | 4.x | Styling utilitaire |
| [Radix UI](https://radix-ui.com/) | Latest | Composants d'interface accessibles |
| [Zustand](https://zustand.docs.pmnd.rs/) | 5.x | State management |
| [Recharts](https://recharts.org/) | 3.x | Graphiques et visualisations |
| [@dnd-kit](https://dndkit.com/) | 6.x | Drag and Drop |
| [Zod](https://zod.dev/) | 4.x | Validation de schémas |
| [Lucide React](https://lucide.dev/) | Latest | Icônes |

### Backend

| Technologie | Version | Rôle |
|---|---|---|
| [Supabase](https://supabase.com/) | Latest | Base de données, Auth, Storage, Realtime |
| [Flask](https://flask.palletsprojects.com/) | 3.x | API de génération PDF |
| [ReportLab](https://www.reportlab.com/) | 4.2 | Génération PDF avancée |
| [Gunicorn](https://gunicorn.org/) | Latest | Serveur WSGI pour la production |
| [Pillow](https://pillow.readthedocs.io/) | 12.x | Traitement d'images |

### Infrastructure

| Technologie | Rôle |
|---|---|
| [Docker](https://docker.com/) | Conteneurisation |
| [Docker Compose](https://docs.docker.com/compose/) | Orchestration de services |
| [Traefik](https://traefik.io/) | Reverse proxy, TLS/SSL, routage |

## Structure du projet

```
.
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Pages d'authentification
│   │   │   ├── login/                # Connexion
│   │   │   ├── signup/               # Inscription
│   │   │   └── forgot-password/      # Mot de passe oublié
│   │   ├── (dashboard)/              # Pages du tableau de bord
│   │   │   ├── dashboard/            # Accueil dashboard
│   │   │   ├── forms/                # Gestion des formulaires
│   │   │   │   └── [formId]/
│   │   │   │       ├── edit/         # Éditeur de formulaire
│   │   │   │       ├── responses/    # Réponses collectées
│   │   │   │       ├── analytics/    # Statistiques
│   │   │   │       ├── settings/     # Paramètres
│   │   │   │       ├── theme/        # Personnalisation
│   │   │   │       └── preview/      # Aperçu
│   │   │   ├── filiales/             # Gestion des filiales
│   │   │   ├── workspaces/           # Gestion des espaces de travail
│   │   │   ├── templates/            # Templates de documents
│   │   │   ├── notifications/        # Centre de notifications
│   │   │   ├── profile/              # Profil utilisateur
│   │   │   └── help/                 # Aide et support
│   │   ├── f/[slug]/                 # Formulaire public (répondant)
│   │   ├── embed/[slug]/             # Formulaire intégrable (iframe)
│   │   └── api/                      # API Routes
│   │       ├── forms/                # CRUD formulaires
│   │       ├── responses/            # Soumission & lecture des réponses
│   │       ├── workspaces/           # Gestion des workspaces
│   │       ├── filiales/             # Gestion des filiales
│   │       └── uploads/              # Upload de fichiers
│   ├── components/
│   │   ├── builder/                  # Composants du constructeur de formulaire
│   │   │   └── fields/              # 25+ composants de champs
│   │   ├── renderer/                 # Moteur de rendu de formulaire
│   │   ├── responses/                # Composants de gestion des réponses
│   │   ├── themes/                   # Composants de thématisation
│   │   ├── layout/                   # Sidebar, header, navigation
│   │   ├── common/                   # Composants partagés
│   │   └── ui/                       # Design system (Radix UI)
│   ├── lib/
│   │   ├── services/                 # Couche d'accès aux données Supabase
│   │   ├── hooks/                    # React hooks personnalisés
│   │   ├── utils/                    # Utilitaires (PDF, export, validation)
│   │   ├── supabase/                 # Client Supabase (client, serveur, admin)
│   │   └── constants/                # Constantes (types de champs, limites)
│   ├── stores/                       # Zustand stores
│   └── types/                        # Types TypeScript
├── python-backend/
│   ├── main.py                       # Serveur Flask (API PDF)
│   ├── fiche_officielle.py           # Générateur de fiche artisan (ReportLab)
│   ├── static/                       # Assets statiques (logos, images)
│   ├── requirements.txt              # Dépendances Python
│   └── Dockerfile                    # Image Docker du backend
├── supabase/
│   └── migrations/                   # Migrations SQL (schéma de base de données)
├── Dockerfile                        # Image Docker du frontend (Next.js)
├── docker-compose.yaml               # Orchestration Docker + labels Traefik
├── DEPLOYMENT.md                     # Guide de déploiement
└── package.json                      # Dépendances Node.js
```

## Prérequis

- **Node.js** ≥ 20.x
- **Python** ≥ 3.10
- **Docker** & **Docker Compose** (pour le déploiement)
- Un projet **Supabase** configuré

## Démarrage rapide

### 1. Cloner le dépôt

```bash
git clone https://github.com/MrArtemix/atgForms.git
cd atgForms
```

### 2. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_PYTHON_BACKEND_URL=http://localhost:8002
```

### 3. Installer et lancer le frontend

```bash
npm install
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

### 4. Installer et lancer le backend Python

```bash
cd python-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

Le serveur PDF sera accessible sur [http://localhost:8002](http://localhost:8002).

## Variables d'environnement

| Variable | Requis | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL de votre projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Clé anonyme Supabase (frontend) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Clé service Supabase (backend, opérations admin) |
| `NEXT_PUBLIC_APP_URL` | ✅ | URL publique de l'application |
| `NEXT_PUBLIC_PYTHON_BACKEND_URL` | ✅ | URL du serveur Python de génération PDF |

## Déploiement

Le projet est conçu pour être déployé via **Docker Compose** avec un reverse proxy **Traefik**.

### Production avec Docker

```bash
# Construire les images
docker compose build

# Lancer les services
docker compose up -d

# Vérifier le statut
docker compose ps
```

> **Note** : Le fichier `docker-compose.yaml` est configuré pour le domaine `forms.atg.ci` via les labels Traefik. Modifiez-le selon votre domaine.

### Configuration Supabase requise

1. **Bucket Storage** : Créez un bucket `response-uploads` en mode **public** pour les uploads de fichiers et photos.
2. **Migrations SQL** : Appliquez les migrations situées dans `supabase/migrations/` pour initialiser le schéma de base de données.
3. **RLS Policies** : Les politiques de sécurité sont définies dans les fichiers de migration.

## Schéma de la base de données

```
forms ──────────────── form_pages ──────── form_fields
  │                                            │
  └── form_responses ──────────────── response_answers
  │
  └── document_templates

workspaces ────── workspace_members
  │
  └── forms

holdings ──── filiales ──── projets
```

## Contribution

1. **Fork** le dépôt
2. Créez votre branche : `git checkout -b feature/ma-fonctionnalite`
3. Committez vos changements : `git commit -m 'Ajouter ma fonctionnalité'`
4. Poussez votre branche : `git push origin feature/ma-fonctionnalite`
5. Ouvrez une **Pull Request**

### Conventions de code

- **Langue du code** : Anglais (noms de variables, fonctions, composants)
- **Langue de l'interface** : Français
- **Linting** : ESLint avec la configuration Next.js
- **Formatage** : Prettier (recommandé)

## Auteur & Développeur

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/MrArtemix">
        <img src="https://github.com/MrArtemix.png" width="100px;" alt="Artemix"/><br />
        <sub><b>Artemix</b></sub>
      </a>
      <br />
      <sub>Lead Developer & Architecte</sub>
    </td>
    <td align="center">
      <b>Gnazou Goudi Bernard</b>
      <br /><br />
      <sub>Analyste-Concepteur & Développeur<br/>de Systèmes d'Information</sub>
    </td>
  </tr>
</table>

| Information | Détail |
|---|---|
| **Développeur** | Artemix ([@MrArtemix](https://github.com/MrArtemix)) |
| **Email** | [artemixroot@gmail.com](mailto:artemixroot@gmail.com) |
| **Entreprise** | AIS — Adinrin Intelligence Systems |
| **GitHub** | [github.com/MrArtemix/atgForms](https://github.com/MrArtemix/atgForms) |
| **Site Web** | [forms.atg.ci](https://forms.atg.ci) |

## Licence

Ce projet est un logiciel propriétaire développé par **AIS (Adinrin Intelligence Systems)**. Tous droits réservés.

---

<p align="center">
  Développé par <strong>AIS</strong> — Adinrin Intelligence Systems
</p>
