# LaunchPad

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

Lancer ces commandes depuis chaque dossier indiqué, dans deux terminaux séparés.

Backend (`backEnd/`) — copier puis renseigner l'exemple d'environnement avant
de démarrer. Il fournit une URL PostgreSQL locale d'exemple ; le serveur
PostgreSQL doit être disponible et les deux secrets JWT doivent être distincts.

Sous PowerShell, depuis `backEnd/`, créer le fichier local :

```powershell
Copy-Item .env.example .env
```

Modifier ensuite `.env` pour y indiquer les identifiants PostgreSQL locaux.
Les valeurs fournies pour les secrets JWT sont des exemples à remplacer.

```bash
# Depuis backEnd/
npm install
npm run db:generate
npm run db:migrate:deploy
npm test
npm run dev
```

Ne pas utiliser les valeurs d'exemple pour un déploiement. `npm run
db:migrate:deploy` applique les migrations en attente à la base indiquée par
`DATABASE_URL`.

`npm test` lance les tests de contrats backend avec le runner natif Node.js ;
aucun test end-to-end dépendant de la base n'est inclus pour le moment.

Frontend (`LaunchPad/`) :

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

Créer `LaunchPad/.env` pour le frontend :

```env
VITE_API_URL=http://localhost:5000/api
```

Le backend (`backEnd`) requiert au minimum `DATABASE_URL`, `JWT_SECRET` et
`JWT_REFRESH_SECRET`. `FRONTEND_URL` sert à configurer CORS. Les intégrations
Cloudinary, Resend et paiements nécessitent leurs propres identifiants selon les
fonctionnalités activées ; ne jamais committer ces secrets.

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
Le backend doit être démarré et relié à une base configurée pour valider les
parcours réels. `VITE_API_URL` doit pointer vers sa racine `/api`.

### Modules Principaux

- **Authentification** : Login, register, refresh token
- **Projets** : CRUD, likes, commentaires, publication
- **Messagerie** : Conversations, messages temps réel
- **Paiements** : MTN, Orange, Stripe integration
- **KYC** : Soumission et validation documents
- **Forum** : Posts et réponses
- **Notifications** : In-app et push
- **Academy** : catalogue, inscriptions et progression enregistrés via l'API
- **Interactions Academy** : likes persistés par compte et commentaires liés aux cours publiés
- **Administration** : gestion Academy, investissements et modération/création des publications du forum

### Contrats vérifiés dans le code

- Lecture des messages : `GET /api/conversations/:id/messages`
- Marquage comme lu : `POST /api/conversations/:id/read`
- Investissements : `GET /api/investments?page=...`
- Academy : `GET /api/academy/courses`, inscription et progression via les routes
  `/api/academy/...`
- Academy : `GET /api/academy/courses/:id` accepte une session facultative et
  renvoie les commentaires/auteurs, les compteurs et l'état `likedByMe` si le
  membre est connecté. Aimer un cours (`PUT .../:id/like`) et commenter
  (`POST .../:id/comments`) requièrent une session.
- Admin : `/api/admin/academy/*`, `/api/admin/investments-control` et
  `/api/admin/forum/*` sont réservés aux administrateurs. Les annonces créées
  par un administrateur apparaissent publiquement sous `adminlaunchpad`.

Les appels Socket.IO sont authentifiés par JWT. Un utilisateur ne peut rejoindre
que les rooms de ses propres conversations.

## ✅ État d'intégration et de validation

| Niveau | Signification | État dans ce dépôt |
|---|---|---|
| Codé | L'interface et le traitement existent | Routes frontend/backend et parcours Academy présents |
| Branché | Le frontend appelle les contrats backend | API messagerie, investissements, Academy et Socket.IO câblés |
| Validé localement | Build/lint exécutés sans erreur bloquante | Build OK ; lint OK avec 9 avertissements Hook préexistants |
| Validé end-to-end | Parcours vérifié avec base et services réels | Non revendiqué par ce README ; nécessite une configuration active |

La présence d'une route ou d'un écran ne signifie pas que les paiements ont été
validés auprès des opérateurs. Les webhooks, identifiants sandbox/production et
parcours de remboursement doivent être testés dans leur environnement dédié.

### Academy : état documenté au 2026-10-07

- Le panneau **Admin → Academy** gère les cours et leur publication ; les
  membres consultent uniquement les cours publiés.
- Les likes sont enregistrés par utilisateur et le serveur accepte un état
  désiré (`liked: true/false`), ce qui rend la répétition d'une requête sûre.
- Les commentaires sont enregistrés et renvoient le compte auteur. Les erreurs
  réseau et les erreurs de validation restent visibles à l'utilisateur.
- Le détail d'un cours utilise l'authentification facultative pour renvoyer
  `likedByMe`. Les commentaires sont chargés avec la relation Prisma `user`.
- Les contrôles statiques ciblés sont passés : ESLint Academy, syntaxe Node des
  fichiers backend Academy et `prisma validate`. Cela ne remplace pas un test
  connecté à une base et à des comptes réels.

## 🎯 Fonctionnalités Principales

- **Exploration de projets** : Filtrage par catégorie, stade, recherche
- **Publication de projets** : Création, édition, soumission pour modération
- **Investissement** : Paiement sécurisé via escrow
- **Messagerie temps réel** : Conversations directes, typing indicators
- **KYC** : Validation d'identité pour accès complet
- **Forum communautaire** : Discussions et échanges
- **Badges et réputation** : Système de gamification
- **Academy** : cours publiés, likes/commentaires membres, inscriptions et progression

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
- [Guide du projet et des pages](./PROJECT_GUIDE.md)
- [Documentation API](../SPRINT_PLAN.md)
- [Roadmap Backend](./BACKEND_ROADMAP.md)

## 📄 Licence

Propriétaire - LaunchPad Platform

---

**Dernière mise à jour** : 2026-10-07
