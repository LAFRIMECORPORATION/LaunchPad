# Analyse du front LaunchPad

> **Mise à jour 2026-10-07 :** cet état remplace les constats antérieurs quand
> ils divergent. Le détail Academy charge maintenant les auteurs de commentaires
> par la relation Prisma correcte (`user`) et utilise une authentification
> facultative pour déterminer `likedByMe`. Les likes et commentaires sont
> connectés aux mutations backend ; leur validation avec une base active reste
> à réaliser.

## 1. Vue fonctionnelle

Le front correspond à une plateforme sociale et d’investissement qui couvre :

- profils étudiant et investisseur
- publication et consultation de projets
- feed social et interactions
- messagerie
- notifications
- forum
- administration

## 2. Points forts

- navigation centralisée et claire
- structure de pages et composants cohérente
- logique de dashboards et parcours d’authentification déjà présente
- API client centralisée et réutilisable

## 3. Points de friction

- variantes de profils et écrans d’édition redondants
- logique de données globalisée dans AppContext
- dépendances UI/API confondues dans les mêmes modules
- certains écrans sont encore alimentés par des données de test ou des variantes de mock
- les photo de profil / couverture ont besoin de standardisation, surtout pour un produit moderne

## 4. Analyse par module de front

### Profil

- le besoin UX est clair et bien identifié
- plusieurs écrans de profil semblent concurrents au lieu d’être unifiés
- l’édition doit devenir un flux unique et partagé entre rôles

### Projets

- la publication et la consultation de projets sont bien structurées
- la logique de détail, likes, commentaires et favoris est alignée avec le produit ciblé

### Social / feed / forum

- le composant social est bien pensé sur le plan produit
- toutefois, il faut harmoniser les actions et les états récupérés depuis l’API

### Messages / notifications

- modules utiles, mais ils doivent rester alignés avec les routes backend réelles
- rendre la couche API plus stricte et stable

## 5. Bugs et incohérences détectées

- plusieurs écrans de profil semblent dupliquer la même logique
- certaines routes API sont obsolètes ou ne correspondent pas au backend actuel
- le contexte global mélange trop de responsabilités
- les mock data restent trop présents pour un produit qui a besoin de fiabilité

## 6. Mise à jour de l’état après correctifs

Les correctifs principaux ont été appliqués et vérifiés :

- nettoyage des états de chargement et des effets React redondants
- harmonisation des données de like et d’upload sur les profils
- suppression des variables inutilisées et des erreurs de lint bloquantes
- validation de build front réussie dans [LaunchPad](LaunchPad)

État de validation :

- `npm run build` : OK
- `npm run lint` : 0 erreur, 9 warnings non bloquants

## 7. Plan de refonte du front priorisé

1. Standardiser les composants de profil et d’édition
2. Supprimer les doublons de pages et de styles
3. Séparer le contexte global et la logique API
4. Centraliser les règles de photo de profil / couverture
5. Définir des tests UI sur les parcours critiques
6. Harmoniser les états de chargement et d’erreur sur les pages

## 8. Recommandation finale

Le front est désormais dans un état de stabilité exploitable : il compile correctement et les erreurs bloquantes de lint ont été traitées. Les points restants sont surtout des recommandations de qualité et de structure, sans blocage fonctionnel immédiat.

## État Academy et interfaces d'administration

- `AcademyPage.jsx` consomme `academyApi` : consultation du catalogue et du
  détail, inscription, progression, like explicite et publication de
  commentaires. Les actions de like/commentaire demandent une session.
- `Admin.jsx` monte des panneaux dédiés pour l'Academy, les investissements et
  le forum. `ForumAdminPanel.jsx` publie les annonces d'un administrateur sous
  le nom public `adminlaunchpad`.
- La commande ESLint ciblée sur `AcademyPage.jsx` et `api.js` a réussi après
  les correctifs. Le lint global et le build étaient également passés lors de
  la vérification précédente, mais ces résultats ne démontrent pas le
  fonctionnement de services externes ni un parcours end-to-end.
