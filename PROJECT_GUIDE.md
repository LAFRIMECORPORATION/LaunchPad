# Guide du projet LaunchPad

_Dernière mise à jour : 2026-10-07._

Ce document sert de carte de lecture du dépôt : il décrit le rôle de chaque écran
frontend, les principaux modules backend et le trajet des données. Il décrit le
code présent ; « branché » ne signifie pas « validé en production ».

> **Mise à jour 2026-10-07 :** les interactions Academy sont désormais
> documentées avec leur contrat réel. Le détail d'un cours fonctionne avec ou
> sans session, les likes/commentaires nécessitent une session et les auteurs
> des commentaires sont lus via la relation Prisma `user`. Les contrôles ciblés
> de syntaxe, lint et schéma Prisma sont passés ; le parcours avec une vraie
> base/API n'a pas été validé end-to-end.

## 1. Vue d'ensemble

LaunchPad est une application React/Vite connectée à une API Express/Prisma et à
une base PostgreSQL. Les utilisateurs publient et découvrent des projets,
échangent, collaborent et suivent des investissements. Le backend applique les
contrôles d'authentification, de rôle, de KYC et de propriété selon les routes.

### Lire un parcours de bout en bout

1. `src/routes/AppRoutes.jsx` relie une URL à un écran.
2. `src/context/AppContext.jsx` centralise la session, l'utilisateur et certains
   états partagés et expose les actions aux composants React.
3. `src/utils/api.js` ajoute les paramètres, les jetons et le traitement HTTP.
   `src/utils/socket.js` gère la connexion temps réel.
4. `backEnd/src/server.js` applique les middlewares et monte les routeurs sous
   `/api`.
5. Le routeur appelle un contrôleur (`modules/*/*.controller.js`), puis le
   service correspondant (`*.service.js`) utilise Prisma ou un service externe.
6. Les erreurs remontent au middleware central du backend.

Les sources à consulter en premier sont [AppRoutes](./src/routes/AppRoutes.jsx),
[AppContext](./src/context/AppContext.jsx), [client API](./src/utils/api.js),
[serveur backend](../backEnd/src/server.js) et le [schéma de données](../backEnd/prisma/schema.prisma).

## 2. Écrans frontend — page par page

| Écran | À quoi il sert | Données et actions principales |
|---|---|---|
| [Home.jsx](./src/pages/Home.jsx) | Accueil et découverte | Projets mis en avant via l'API ; certains éléments éditoriaux/carrousel restent statiques. |
| [Login.jsx](./src/pages/Login.jsx) | Connexion | `authApi.login`, session et redirection selon le rôle retourné par l'API. |
| [Register.jsx](./src/pages/Register.jsx) | Création de compte | `authApi.register`, parcours d'inscription multi-étapes. |
| [Explore.jsx](./src/pages/Explore.jsx) | Recherche de projets | `projectsApi.list`, filtres et navigation vers le détail. |
| [ProjectDetail.jsx](./src/pages/ProjectDetail.jsx) | Détail d'un projet | API projets, commentaires, likes, sauvegarde, contact et accès au paiement. |
| [Publish.jsx](./src/pages/Publish.jsx) | Création d'un projet | Formulaire envoyé à l'API projets, puis soumission/modération. |
| [SavedProjects.jsx](./src/pages/SavedProjects.jsx) | Projets enregistrés | État partagé/local et synchronisation des sauvegardes selon le parcours. |
| [DashboardStudent.jsx](./src/pages/DashboardStudent.jsx) | Tableau de bord étudiant | Projets et fil ; raccourcis vers création, collaboration et suivi. |
| [DashboardInverstor.jsx](./src/pages/DashboardInverstor.jsx) | Tableau de bord investisseur | API investissements, projets recommandés et fil. |
| [ProfileStudent.jsx](./src/pages/ProfileStudent.jsx) | Profil étudiant | Profil utilisateur et projets associés. |
| [ProfileInverstor.jsx](./src/pages/ProfileInverstor.jsx) | Profil investisseur | Profil utilisateur et investissements. |
| [ProfileDetail.jsx](./src/pages/ProfileDetail.jsx) | Profil d'un autre membre | API utilisateurs/projets et démarrage d'une conversation. |
| [ProfileEdit.jsx](./src/pages/ProfileEdit.jsx) | Édition du profil | Mise à jour du compte et des préférences via l'API utilisateurs. |
| [Messages.jsx](./src/pages/Messages.jsx) | Conversations et messages | API messagerie pour l'historique ; Socket.IO pour les événements en temps réel. |
| [PaymentPage.jsx](./src/pages/PaymentPage.jsx) | Investir dans un projet | API MTN, Orange Money ou Stripe ; exige les prérequis backend/KYC configurés. |
| [KycVerification.jsx](./src/pages/KycVerification.jsx) | Vérification d'identité | Envoi et consultation du dossier KYC. |
| [AppointmentsPage.jsx](./src/pages/AppointmentsPage.jsx) | Rendez-vous | Disponibilités et cycle de vie des rendez-vous via l'API. |
| [Collaboration.jsx](./src/pages/Collaboration.jsx) | Recherche et demandes de collaboration | API collaborations et projets. |
| [InvestorRequests.jsx](./src/pages/InvestorRequests.jsx) | Offres et candidatures | API des demandes investisseurs et candidatures. |
| [DueDiligencePage.jsx](./src/pages/DueDiligencePage.jsx) | Analyse préalable d'un projet | API due diligence ; résultat dépend des services backend configurés. |
| [FeedPage.jsx](./src/pages/FeedPage.jsx) | Fil d'activité | API feed et actions de lecture. |
| [ForumPage.jsx](./src/pages/ForumPage.jsx) | Discussions du forum | Liste, filtres et création via l'API forum. |
| [ForumPostDetail.jsx](./src/pages/ForumPostDetail.jsx) | Détail d'une discussion | API forum pour réponses et likes. |
| [Notification.jsx](./src/pages/Notification.jsx) | Notifications | API notifications ; lecture et actions depuis la liste. |
| [BadgesPage.jsx](./src/pages/BadgesPage.jsx) | Badges et réputation | API badges. |
| [Admin.jsx](./src/pages/Admin.jsx) | Console d'administration | Statistiques, utilisateurs, KYC, projets, investissements, Academy, forum et audit. |
| [AcademyAdminPanel.jsx](./src/pages/AcademyAdminPanel.jsx) | Gestion du catalogue Academy | CRUD de cours réservé à l'admin, brouillons, publication, indicateurs et recherche. |
| [AcademyPage.jsx](./src/pages/AcademyPage.jsx) | Catalogue et consultation de cours | API cours, inscriptions, progression, likes et commentaires. Les contenus publiés sont visibles par les autres comptes. |

### Accès et rôles

Les routes frontend définissent les écrans accessibles et certains parcours
gèrent leurs propres contrôles. Le backend reste la frontière de sécurité :
notamment, les routes Academy d'administration sont sous `/api/admin` et
protégées par authentification et rôle administrateur. Un masquage d'écran côté
frontend n'est jamais un contrôle d'accès suffisant.

## 3. Academy : règles actuelles et mode d'emploi

### Administrateur

1. Ouvrir **Admin → Academy**.
2. Remplir le formulaire titre, description, format, niveau, durée, icône et
   lien de contenu. Les liens doivent être HTTP(S).
3. Enregistrer comme brouillon, puis utiliser **Publier** lorsque la ressource
   est prête. Les nouveaux cours restent privés tant qu'ils ne sont pas publiés.
4. Utiliser **Modifier**, **Dépublier** et **Supprimer** dans le catalogue.
   Supprimer un cours entraîne la suppression de ses inscriptions, likes et
   commentaires liés (relations en cascade).

Les routes d'administration sont :

| Méthode | Route | Action |
|---|---|---|
| GET | `/api/admin/academy/courses` | Liste complète et statistiques admin |
| POST | `/api/admin/academy/courses` | Création d'un brouillon (ou publication explicite) |
| PUT | `/api/admin/academy/courses/:id` | Modification partielle et publication/dépublication |
| DELETE | `/api/admin/academy/courses/:id` | Suppression et journal d'audit |

### Autres comptes

Les visiteurs peuvent lister et ouvrir les cours publiés, consulter le lien de
ressource, et lire les commentaires. Un compte connecté peut s'inscrire, marquer
sa progression, aimer un cours et commenter. Il ne reçoit pas les routes de
création/modification/suppression. Les cours déjà présents dans la base sont
publiés lors de la migration afin de ne pas les faire disparaître ; les nouveaux
restent en brouillon par défaut.

Le like utilise `PUT /api/academy/courses/:id/like` avec `{ liked: boolean }` :
le frontend envoie l'état cible plutôt qu'une bascule, et l'API persiste un seul
like par membre et cours. Les commentaires utilisent
`POST /api/academy/courses/:id/comments` avec `{ content }`. Le détail du cours
inclut jusqu'à 100 commentaires récents, leur auteur (`user` et alias `author`
pour l'affichage), `commentsCount`, `likesCount` et `likedByMe` pour le membre
connecté. La consultation du catalogue et du détail reste publique.

**Limite produit :** `isPremium` est actuellement une étiquette éditoriale. Le
dépôt ne contient pas de contrôle d'abonnement Academy qui verrouille les liens
premium ; ne pas présenter cette case comme une barrière de paiement.

### Administration forum et investissements

- **Admin → Forum** permet de créer/modifier une publication officielle,
  rechercher, épingler, masquer puis restaurer une publication. Un post écrit
  par un compte admin est affiché au public sous `adminlaunchpad`.
- **Admin → Investissements** permet de filtrer/rechercher et consulter le
  détail/historique des investissements. « Marquer remboursé » ne rembourse
  pas réellement le moyen de paiement : cela enregistre un statut interne et
  un motif dans LaunchPad.

## 4. Modules backend

| Module | Responsabilité |
|---|---|
| [auth](../backEnd/src/modules/auth/auth.router.js) | Inscription, connexion, renouvellement/révocation des jetons et session courante. |
| [users](../backEnd/src/modules/users/users.router.js) | Profils, utilisateurs et médias de profil. |
| [projects](../backEnd/src/modules/projects/projects.router.js) | Découverte, création, mise à jour, publication, interactions et modération de projets. |
| [messages](../backEnd/src/modules/messages/messages.router.js) | Conversations, messages, lecture et annonces globales admin. |
| [academy](../backEnd/src/modules/academy/academy.router.js) | Catalogue publié, inscriptions, progression, likes et commentaires. |
| [admin](../backEnd/src/modules/admin/admin.router.js) | Opérations privilégiées : utilisateurs, KYC, projets, Academy, forum et audit. |
| [kyc](../backEnd/src/modules/kyc/kyc.router.js) | Dépôt de documents et décisions de vérification. |
| [payments](../backEnd/src/modules/payments/payments.router.js) | Initiation, webhooks de paiement, investissements et escrow. |
| [forum](../backEnd/src/modules/forum/forum.router.js) | Publications, réponses et interactions communautaires. |
| [feed](../backEnd/src/modules/feed/feed.router.js) | Fil d'activité et état de lecture. |
| [notifications](../backEnd/src/modules/notifications/notification.router.js) | Notifications en application et actions associées. |
| [push](../backEnd/src/modules/push/push.router.js) | Abonnements aux notifications push. |
| [appointments](../backEnd/src/modules/appointments/appointments.router.js) | Disponibilités et rendez-vous. |
| [collaborations](../backEnd/src/modules/collaborations/collaborations.router.js) | Demandes de collaboration et réponses. |
| [investor requests](<../backEnd/src/modules/investor requests/investor requests.router.js>) | Offres d'investisseurs et candidatures. |
| [due diligence](<../backEnd/src/modules/due diligence/due diligence.router.js>) | Analyse et rapports de due diligence. |
| [badges](../backEnd/src/modules/badges/badges.router.js) | Réputation et badges. |
| [reports](../backEnd/src/modules/reports/reports.router.js) | Signalements utilisateurs. |

Le serveur ajoute les middlewares communs (Helmet, CORS, limitation de débit,
logs, parseurs, 404 et erreurs). Prisma persiste les données dans PostgreSQL.
Cloudinary, Resend, Stripe, MTN/Orange Money et OpenAI sont des intégrations
externes conditionnelles ; leur code présent ne prouve pas que les comptes
fournisseurs ou webhooks sont opérationnels.

## 5. Modèle de données et points à vérifier

- Le [schéma Prisma](../backEnd/prisma/schema.prisma) décrit les relations et les
  valeurs autorisées par le modèle. Les migrations SQL versionnent les évolutions.
- `AcademyCourse.publishedAt` distingue les brouillons du catalogue public.
  `AcademyCourseLike` et `AcademyCourseComment` sont reliés au cours et à
  l'utilisateur ; suppression du cours ou du compte cascade sur ces lignes.
- Les routes de lecture des cours sont publiques mais n'exposent que les cours
  publiés. Les actions sociales et les inscriptions exigent une session.
- Les erreurs de validation, l'état sans cours, et les appels qui échouent
  doivent rester visibles : ne pas remplacer une API indisponible par de faux
  résultats.
- Le frontend comprend encore des états hybrides et du contenu éditorial
  statique. Vérifier écran par écran les données réelles avant d'annoncer un
  parcours comme prêt en production.

## 6. Installation et vérifications

Lancer l'API dans `backEnd/` après avoir renseigné son fichier `.env` (au minimum
`DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`) :

```powershell
npm install
npm run db:generate
npm run db:migrate:deploy
npm run dev
```

`npm run db:migrate:status` affiche les migrations en attente sans les appliquer.

Lancer le frontend dans `LaunchPad/`, avec `VITE_API_URL` pointant vers l'API :

```powershell
npm install
npm run dev
npm run lint
npm run build
```

La validation du schéma, le build et le lint ne remplacent pas un test
end-to-end. Utiliser une base et des clés sandbox dédiées avant tout test des
paiements ; ne jamais ajouter `.env` au dépôt.
