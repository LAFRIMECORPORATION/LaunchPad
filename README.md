# 🚀 LaunchPad - Frontend

Plateforme de financement participatif et de collaboration connectant des porteurs de projets étudiants et des investisseurs.

## 📋 Description

LaunchPad est une application web full-stack permettant aux étudiants entrepreneurs de publier leurs projets et aux investisseurs de les financer de manière sécurisée via un système d'escrow. La plateforme intègre également des fonctionnalités de messagerie temps réel, de KYC, de forum et de collaboration.

## 🛠️ Stack Technique

- **React 19.2.4** - Framework UI
- **Vite 8.0.4** - Build tool & dev server
- **React Router 7.14.1** - Routage client
- **Socket.io Client 4.8.3** - WebSockets pour temps réel
- **ESLint** - Linting du code

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev

# Build pour production
npm run build

# Preview du build de production
npm run preview

# Linter
npm run lint
```

## 🔧 Configuration

Créer un fichier `.env` à la racine du projet :

```env
VITE_API_URL=http://localhost:5000/api
```

## 📁 Structure du Projet

```
src/
├── components/       # Composants réutilisables
│   ├── UI/           # Composants UI de base
│   ├── SocialActions.jsx
│   └── CommentSection.jsx
├── context/          # Contexte global d'application
│   └── AppContext.jsx
├── config/           # Configuration de l'application
│   └── routes.js
├── pages/            # Pages de l'application
│   ├── Home.jsx
│   ├── Explore.jsx
│   ├── ProjectDetail.jsx
│   ├── Messages.jsx
│   └── ...
├── utils/            # Utilitaires
│   ├── api.js        # Client API
│   └── socket.js     # Client Socket.io
├── routes/           # Configuration des routes
│   └── AppRoutes.jsx
└── main.jsx          # Point d'entrée
```

## 🔌 API Backend

Le frontend communique avec le backend LaunchPad via REST API et WebSockets.

### Modules Principaux

- **Authentification** : Login, register, refresh token
- **Projets** : CRUD, likes, commentaires, publication
- **Messagerie** : Conversations, messages temps réel
- **Paiements** : MTN, Orange, Stripe integration
- **KYC** : Soumission et validation documents
- **Forum** : Posts et réponses
- **Notifications** : In-app et push

## 🎯 Fonctionnalités Principales

- **Exploration de projets** : Filtrage par catégorie, stade, recherche
- **Publication de projets** : Création, édition, soumission pour modération
- **Investissement** : Paiement sécurisé via escrow
- **Messagerie temps réel** : Conversations directes, typing indicators
- **KYC** : Validation d'identité pour accès complet
- **Forum communautaire** : Discussions et échanges
- **Badges et réputation** : Système de gamification

## 🔐 Sécurité

- JWT tokens avec refresh automatique
- Protection des routes sensibles
- Validation des entrées côté backend
- HTTPS en production

## 📱 Responsive

L'application est optimisée pour :
- Desktop (1920px+)
- Tablettes (768px - 1024px)
- Mobile (< 768px)

## 🐛 Développement

### Debugging

```bash
# Lancer avec logs détaillés
npm run dev -- --debug
```

### Hot Module Replacement

Vite fournit HMR natif pour un développement rapide.

## 📦 Déploiement

### Vercel (Recommandé)

Le projet inclut une configuration `vercel.json`.

```bash
# Build pour Vercel
npm run build
```

### Autres plateformes

```bash
# Build
npm run build

# Le dossier dist/ contient les fichiers statiques
```

## 🔗 Liens Utiles

- [Backend Repository](../backEnd)
- [Documentation API](../SPRINT_PLAN.md)
- [Roadmap Backend](./BACKEND_ROADMAP.md)

## 📄 Licence

Propriétaire - LaunchPad Platform

---

**Dernière mise à jour** : 2026-07-30
