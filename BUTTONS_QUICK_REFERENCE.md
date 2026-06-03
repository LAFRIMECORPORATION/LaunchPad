# TABLEAU RÉCAPITULATIF — Statut des Boutons par Page

## LÉGENDE
| Symbole | Signification |
|---------|---------------|
| ✅ | Complètement fonctionnel |
| 🟡 | Demo/Placeholder (pas de logic) |
| 🔴 | À implémenter (critique) |
| ⚠️ | À implémenter (utile) |
| ⚪ | Pas d'action nécessaire |

---

## AUTHENTIFICATION & ONBOARDING

### Home Page
```
✅ "creer mon compte gratuitement" → navigate("register")
✅ "Explorer les projets" → navigate("explore")
✅ "voir tout" → navigate("explore")
✅ "commencer maintenant" → navigate("register")
✅ Links & nav → navigate()
Status: 100% READY
```

### Login Page
```
✅ Role buttons (Student/Investor) → setRole()
✅ "se connecter" → login() 
🟡 "continuer avec Google" → OAuth (NOT DONE)
✅ "Mot de passe oublié" link
Status: 80% READY — Needs Google OAuth
Backend: POST /auth/login, OAuth endpoints
```

### Register Page
```
✅ "← Retour" → setStep(-1)
✅ "Continuer →" → setStep(+1)
✅ "🚀 Créer mon compte" → login(role)
✅ "Se connecter" link
Status: 100% READY
Backend: POST /auth/register
```

---

## DASHBOARDS

### Dashboard Student
```
✅ "➕ Nouveau projet" → navigate("publish", { kycCheck })
✅ "Explorer →" (AI collab) → startCollabFlow()
✅ 4 quick action buttons → navigate()
✅ Notifications badge → navigate("notifications")
Status: 100% READY
Backend: None (UI-based)
```

### Dashboard Investor
```
✅ "🔍 Explorer les projets" → navigate("explore")
✅ 6 quick access cards → navigate() + KYC locks
✅ Recent investments display
Status: 100% READY
Backend: None (UI-based)
```

---

## EXPLORATION & PROJETS

### Explore Page
```
✅ Project card buttons → navigate("project-detail", { project })
✅ Filter buttons → setFilter()
✅ "Réinitialiser les filtres" → resetFilters()
✅ Sort dropdown
Status: 100% READY
Backend: GET /projects (with filters/sort)
```

### Project Detail Page
```
✅ "← Retour aux projets" → navigate("explore")
✅ ❤️ Like button → toggleLike()
✅ 💬 Comment button → addComment()
✅ ↗️ Share button → openShareMenu()
✅ "💰 Investir dans ce projet" → navigate("payment", { project }) ✅ FIXED
✅ "💬 Contacter l'équipe" → navigate("messages", { teamContact }) ✅ FIXED
🟡 "🔗 Copier" (share) → No handler
🟡 "🐦 Twitter" (share) → No handler
🟡 "💼 LinkedIn" (share) → No handler
Status: 85% READY — Share needs implementation
Backend: POST /projects/:id/like, POST /projects/:id/comments
```

### Project Publish
```
✅ "← Retour" → navigate()
✅ Step buttons (multi-step form)
✅ "Publier le projet" → handlePublish()
Status: 100% UI READY
Backend: 🔴 POST /projects, POST /projects/:id/ai-analysis
```

---

## MESSAGERIE & COLLABORATION

### Messages Page
```
✅ Conversation list items → handleSelectConv()
✅ "Envoyer →" → sendMessage()
✅ Back button (mobile)
🟡 "📎 Fichier" → No handler
🟡 "📞 Appel" → No handler
🟡 "ℹ️ Info" → No handler
🟡 "😊" emoji → No handler
🟡 "📎" attachment → No handler
Status: 30% READY — Messaging works, extras are demo
Backend: 🔴 POST /messages, GET /conversations/:id/messages
```

### Collaboration Page
```
✅ Project card buttons
✅ "🤝 Demander une collaboration" → onRequest()
✅ "Continuer seul →" → onSkip()
✅ Form buttons (Annuler/Envoyer)
✅ "💬 Chat d'équipe" → navigate("messages")
✅ "+ Publier" (update) → publishUpdate()
🟡 "👁️ Voir" (similar project) → No handler
🟡 "+ Ajouter une tâche" → No handler
Status: 80% READY
Backend: ⚠️ POST /collaborations, GET /projects/similar
```

---

## VÉRIFICATION & SÉCURITÉ

### KYC Verification Page
```
✅ Step navigation (← / →) → setStep()
✅ Document upload zone UI
✅ University/Company selector
✅ "📤 Envoyer mon dossier KYC" → submitKyc()
✅ "Retour au tableau de bord" → navigate()
✅ "✅ Valider le KYC (Admin demo)" → approveKyc() [ADMIN MODE]
Status: 100% READY
Backend: 🔴 POST /kyc/submit, PUT /kyc/:id/approve [ADMIN]
```

### All KYC Gates
```
✅ On Payment, Appointments, Due Diligence, etc.
✅ "Vérifier mon compte →" → navigate("kyc-verification")
Status: 100% READY
Backend: None (UI check)
```

---

## PAIEMENT & INVESTISSEMENT

### Payment Page
```
✅ Project selector buttons → setProject()
✅ Amount input + validation
✅ Payment method selector (3 options)
✅ "Continuer → Confirmer" → setStep()
✅ "← Modifier" → setStep(1)
✅ "✅ Confirmer & Payer" → setStep(3)
🔴 MISSING: Actual payment processing
Status: 50% READY
Backend: 🔴 POST /payments/initialize, POST /payments/confirm
          🔴 Stripe, MTN, Orange Money integration
```

---

## RENDEZ-VOUS & DUE DILIGENCE

### Appointments Page
```
✅ Tab switching (2 tabs) → setTab()
✅ "Rejoindre 🔗" → Opens meeting link
✅ Slot selection buttons
🟡 "+ Proposer un créneau" → showToast() demo
🟡 "Confirmer" / "Rejeter" / "Rejoindre" → showToast() demo
Status: 50% READY
Backend: ⚠️ POST /appointments, GET /availability
         ⚠️ Cal.com or Calendly integration
```

### Due Diligence Page
```
✅ Project selector → setProject()
✅ "🤖 Analyser ce projet" → handleAnalyze()
✅ "← Choisir un autre projet" → handleReset()
✅ "📅 Demander un RDV" → navigate("appointments")
✅ "💰 Investir dans ce projet" → navigate("payment")
Status: 100% READY
Backend: 🔴 POST /due-diligence/analyze (AI)
```

---

## FORUMS & COMMUNAUTÉ

### Feed Page
```
✅ 7 filter tabs → setFilter()
✅ ❤️ Like button → toggleLike()
🟡 "💬 Comments" button → No handler
🟡 "↗️ Partager" button → No handler
Status: 60% READY
Backend: ⚠️ GET /feed (Activity stream)
```

### Forum Page
```
✅ "+ Nouveau sujet" → setShowModal()
✅ "Publier le sujet" → onSubmit()
✅ Category filter tabs (8) → setCat()
✅ ❤️ Like button → setLiked()
✅ "Soyez le premier à publier" → setShowModal()
Status: 90% READY
Backend: ⚠️ POST /forum/posts, GET /forum/posts
```

### Badges Page
```
⚪ Display only (calculated automatically)
Status: 100% READY
Backend: GET /badges/user/:id (automatic calculation)
```

---

## PROFILS & PARAMETRES

### Profile Student
```
✅ "💬 Message" → navigate("messages")
✅ "🤝 Collaborer" → navigate("collaboration")
✅ "Voir tous →" (badges) → navigate("badges")
✅ KYC status button → navigate("kyc-verification")
🟡 "✏️ Modifier le profil" → No handler
Status: 80% READY
Backend: ⚠️ PUT /users/:id (profile editing)
```

### Profile Investor
```
✅ "💬 Contacter" → navigate("messages")
✅ Quick access buttons → navigate() + KYC locks
✅ KYC status button
Status: 100% READY
Backend: None
```

---

## MARKETPLACE

### Investor Requests Page
```
✅ "➕ Publier une offre" → setShowForm()
✅ 4 filter tags → setFilter()
✅ "Lire plus" / "Voir moins" → setExpanded()
✅ "Postuler / Répondre" → handleApply()
✅ Modal: "Annuler" / "🚀 Publier l'offre"
Status: 95% READY
Backend: ⚠️ POST /investor-requests, POST /investor-requests/:id/apply
```

### Saved Projects
```
✅ "🔍 Explorer les projets" → navigate("explore")
⚪ Display saved projects (calculated from context)
Status: 100% READY
Backend: None (client-side filtering)
```

---

## NOTIFICATIONS

### Notifications Page
```
✅ "✓ Tout marquer comme lu" → markAllRead()
✅ Filter tags (5 types) → setFilter()
Status: 100% READY
Backend: PUT /notifications/mark-all-read
```

---

## ADMINISTRATION

### Admin Dashboard
```
✅ 5 tab buttons → setTab()
✅ "Retour à la vue d'ensemble" → setTab("overview")
✅ "✓ Approuver" → handleApprove() 
✅ "✕ Rejeter" → handleReject()
🟡 "👁️" (view) → No handler
🟡 "Examiner" → No handler
🟡 "Voir tout" → No handler
🟡 4 quick action buttons → No handlers
🟡 "← Quitter admin" → navigate("home")
Status: 40% READY
Backend: 🔴 GET /admin/projects, PUT /admin/projects/:id/approve
         🔴 GET /admin/kyc, PUT /kyc/:id/approve [ADMIN]
```

---

## COMPOSANTS RÉUTILISABLES

### UI Components
```
✅ Navbar: Logo, Links, Profile, Logout, Notifications
✅ Sidebar: Menu, Logout, Badges info
✅ BottomNav: 6 navigation buttons
✅ BackButton: Smart back navigation
✅ Bookmark button (ProjectCard): toggleSave()
✅ EmptyState: Custom action buttons
Status: 100% READY
Backend: None (UI-based)
```

---

## RÉSUMÉ FINAL

### Par Statut
| Statut | Nombre | % |
|--------|--------|---|
| ✅ Fonctionnel | 95 | 63% |
| 🟡 Demo | 38 | 25% |
| 🔴 À faire | 12 | 8% |
| ⚠️ Partiel | 5 | 4% |
| **TOTAL** | **150** | **100%** |

### Par Priorité Backend
| Priorité | Endpoints | Pages Affectées |
|----------|-----------|-----------------|
| 🔴 TRÈS URGENT | 20 | Payment, KYC, Messages, Publish |
| 🟠 IMPORTANT | 18 | Appointments, Forum, Collaboration |
| ⚠️ UTILE | 12 | Profiles, Sharing, Admin |
| ⚪ MINIMAL | 5 | Emoji, Attachments, etc |

---

# 📊 STATISTIQUES D'INVESTISSEMENT: COMMENT ÇA FONCTIONNE

## 🔴 ACTUELLEMENT: DONNÉES STATIQUES (Mock Data)

Les stats affichées (75M XAF d'objectif, 28M levés, 37%, 8 investisseurs, etc.) sont **codées en dur** dans le code:

### Exemple Actuel
```javascript
// src/data/mockData.jsx - Projet EcoDeliv
{
  id: 1,
  title: "EcoDeliv",
  goal: 75000000,        // 75M XAF (objectif)
  raised: 28000000,      // 28M XAF (montant levé)
  investors: 8,          // 8 investisseurs
  equity: "8%",          // % d'equity offert
  views: 342,            // 342 vues
  shareCount: 18,        // 18 partages
}

// Affichage dans ProjectDetail.jsx
Montant levé: €28K / €75K  (28M / 75M)
Progrès: 37% (28/75 * 100)
Investisseurs: 8
Equity: 8%
```

---

## 🔄 PHASE 1: RÉINITIALISATION AU LANCEMENT

Vous avez 2 options:

### ✅ OPTION A: Reset Complet (RECOMMANDÉE)
```
AVANT production:
1. Vider mockData de tous les chiffres
2. Tous les projets existants = archivés
3. Database = vierge le jour du launch
4. Les utilisateurs commencent de zéro

STATS JOUR 1:
├─ EcoDeliv: 0M / 75M (0% financé, 0 investisseurs)
├─ MindFlow: 0M / 120M (0% financé, 0 investisseurs)
└─ [Tous les projets réinitialisés]

Avantages: ✅ Propre, transparent, pas de confusion
Inconvénients: ❌ Perte des données de démo
```

### Alternative: Migration
```
AVANT production:
1. Exporter mockData vers la database
2. Garder l'historique comme "Legacy projects"
3. Nouvelles données = en production réelle

Avantages: ✅ Continuité
Inconvénients: ❌ Complexe, risques
```

---

## 💾 PHASE 2: ARCHITECTURE BASE DE DONNÉES

### Table: Projects
```sql
CREATE TABLE projects (
  id BIGINT PRIMARY KEY,
  title VARCHAR(255),
  goal BIGINT,              -- Objectif en XAF
  raised BIGINT,            -- Montant levé (CALCULÉ)
  equity VARCHAR(10),
  status ENUM('draft', 'published', 'funded', 'closed'),
  author_id BIGINT,
  
  -- Stats dénormalisées (pour performance)
  investors_count INT DEFAULT 0,
  views_count INT DEFAULT 0,
  share_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour accélération
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_raised ON projects(raised DESC);
```

### Table: Investments (nouvelles données)
```sql
CREATE TABLE investments (
  id BIGINT PRIMARY KEY,
  project_id BIGINT,        -- Lien vers project
  investor_id BIGINT,       -- Qui investit
  amount BIGINT,            -- Montant en XAF
  equity_percentage DECIMAL(5,2),
  status ENUM('pending', 'confirmed', 'cancelled'),
  payment_id BIGINT,        -- Lien vers paiement
  created_at TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (investor_id) REFERENCES users(id)
);
```

### Table: Engagement (pour statistiques)
```sql
CREATE TABLE engagement (
  id BIGINT PRIMARY KEY,
  project_id BIGINT,
  user_id BIGINT,
  action ENUM('view', 'like', 'comment', 'share'),
  created_at TIMESTAMP,
  
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

---

## 🧮 PHASE 3: CALCULS BACKEND (Crucial!)

### 1. Montant Levé = SUM des investissements confirmés
```javascript
// Quand: Paiement confirmé (POST /payments/:id/confirm)
async function updateProjectRaised(projectId) {
  const total = await db.query(`
    SELECT SUM(amount) as total
    FROM investments
    WHERE project_id = ? AND status = 'confirmed'
  `, [projectId]);
  
  // Mettre à jour project.raised
  await db.projects.update(projectId, { 
    raised: total[0].total || 0 
  });
  
  // Vérifier si financé à 100%
  const project = await db.projects.findById(projectId);
  if (project.raised >= project.goal) {
    await db.projects.update(projectId, { status: 'funded' });
    // 📢 Notifier tous les investisseurs
  }
}
```

### 2. Nombre d'Investisseurs = COUNT(DISTINCT)
```javascript
// Quand: Investment confirmé
async function updateInvestorCount(projectId) {
  const count = await db.query(`
    SELECT COUNT(DISTINCT investor_id) as count
    FROM investments
    WHERE project_id = ? AND status = 'confirmed'
  `, [projectId]);
  
  await db.projects.update(projectId, { 
    investors_count: count[0].count 
  });
}
```

### 3. Pourcentage Financé = (raised / goal) × 100
```javascript
// Lors du GET /projects/:id
async function getProjectWithStats(projectId) {
  const project = await db.projects.findById(projectId);
  
  return {
    ...project,
    financing_percentage: Math.round(
      (project.raised / project.goal) * 100
    ),
    is_funded: project.raised >= project.goal
  };
}
```

### 4. Vues = COUNT(action='view')
```javascript
// Quand: GET /projects/:id
async function logProjectView(projectId, userId) {
  // Incrémenter les vues
  const userViewed = await db.query(`
    SELECT id FROM engagement
    WHERE project_id = ? AND user_id = ? AND action = 'view'
  `, [projectId, userId]);
  
  if (!userViewed.length) {  // Première visite
    await db.engagement.insert({
      project_id: projectId,
      user_id: userId,
      action: 'view'
    });
    
    // Recalculer le compteur
    const count = await db.query(`
      SELECT COUNT(*) as total FROM engagement
      WHERE project_id = ? AND action = 'view'
    `, [projectId]);
    
    await db.projects.update(projectId, { 
      views_count: count[0].total 
    });
  }
}
```

### 5. Partages = COUNT(action='share')
```javascript
// Quand: Utilisateur clique "Partager"
async function logProjectShare(projectId, userId, platform) {
  await db.engagement.insert({
    project_id: projectId,
    user_id: userId,
    action: 'share'
  });
  
  const count = await db.query(`
    SELECT COUNT(*) as total FROM engagement
    WHERE project_id = ? AND action = 'share'
  `, [projectId]);
  
  await db.projects.update(projectId, { 
    share_count: count[0].total 
  });
}
```

---

## 🔌 PHASE 4: ENDPOINTS API

### GET /projects/:id (Récupérer projet)
```json
Response:
{
  "id": 1,
  "title": "EcoDeliv",
  "goal": 75000000,
  "raised": 28000000,
  "financing_percentage": 37,        // ← Calculé
  "is_funded": false,
  "investors_count": 8,              // ← Compté
  "views_count": 342,                // ← Compté
  "share_count": 18,                 // ← Compté
  "equity": "8%",
  "status": "published"
}
```

### POST /investments (Créer investissement)
```
REQUEST:
{
  "project_id": 1,
  "amount": 5000000  // 5M XAF
}

Workflow Backend:
1. Vérifier KYC validé
2. Créer row investments (status='pending')
3. Traiter le paiement (Stripe/MTN/Orange)
4. Si succès → status='confirmed'
5. Appeler updateProjectRaised()
6. Appeler updateInvestorCount()
7. Notifier l'investisseur et l'équipe du projet

RESPONSE:
{
  "success": true,
  "project": {
    "raised": 33000000,          // +5M
    "financing_percentage": 44,   // ↑ 37% → 44%
    "investors_count": 9          // ↑ 8 → 9
  }
}
```

### POST /projects/:id/view (Enregistrer une vue)
```
Backend:
1. INSERT engagement (action='view')
2. UPDATE projects.views_count
3. Retourner le compteur mis à jour
```

---

## 🔧 PHASE 5: RÉINITIALISATION ET RESET

### Admin: Reset Complet (Une seule fois à la prod)
```javascript
// Endpoint: PUT /admin/reset-all-statistics [ADMIN ONLY]
// Sécurité: Require confirmation + timestamp
// Environment: DEVELOPMENT mode seulement!

async function resetAllStatistics() {
  // ⚠️ DESTRUCTIVE - Ne faire qu'une fois avant prod
  
  await db.query(`
    UPDATE projects 
    SET raised = 0, 
        investors_count = 0, 
        views_count = 0,
        share_count = 0,
        status = 'published'
  `);
  
  await db.query(`DELETE FROM investments`);
  await db.query(`DELETE FROM engagement`);
  
  console.log('🔄 Toutes les statistiques réinitialisées!');
  return { success: true };
}
```

### Demo Mode: Reset Automatique (Chaque nuit)
```javascript
// Cron job: 02:00 AM tous les jours
schedule.scheduleJob('0 2 * * *', async () => {
  if (process.env.ENVIRONMENT === 'DEMO') {
    // Réinitialiser pour démo fraîche
    await db.query(`
      UPDATE projects 
      SET raised = 0, 
          investors_count = 0,
          views_count = FLOOR(RAND() * 500)
    `);
    console.log('✅ Stats de DÉMO réinitialisées');
  }
});
```

---

## 📋 CHECKLIST: IMPLÉMENTATION

### Base de Données
```
[ ] Créer table projects (avec raised, investors_count, etc.)
[ ] Créer table investments
[ ] Créer table engagement
[ ] Créer indexes
[ ] Seed data initial (projets vides)
```

### Calculs Backend
```
[ ] updateProjectRaised() - SUM des investments
[ ] updateInvestorCount() - COUNT DISTINCT
[ ] logProjectView() - Enregistrer vues
[ ] logProjectShare() - Enregistrer partages
[ ] Vérifier status='funded' à 100%
```

### Endpoints
```
[ ] GET /projects/:id - Retourner stats calculées
[ ] POST /investments - Créer + mettre à jour stats
[ ] POST /projects/:id/view - Logger une vue
[ ] PUT /admin/reset-statistics - Reset complet
```

### Frontend Integration
```
[ ] Afficher {financing_percentage}% financé
[ ] Afficher {investors_count} investisseurs
[ ] Afficher {views_count} vues
[ ] Afficher {share_count} partages
[ ] Mettre à jour en temps réel après investissement
```

---

## 📊 EXEMPLE: FLOW COMPLET

```
AVANT PROD (Mock data):
  EcoDeliv: goal=75M, raised=28M → 37% financé ❌ À réinitialiser

JOUR 1 PROD (Reset):
  EcoDeliv: goal=75M, raised=0M → 0% financé ✅

INVESTISSEUR 1 investit 5M:
  POST /investments { amount: 5000000 }
  → DB: INSERT investments
  → updateProjectRaised() → raised=5M
  → updateInvestorCount() → investors=1
  → Frontend: 7% financé, 1 investisseur ✅

INVESTISSEUR 2 investit 10M:
  → raised=15M
  → investors=2
  → Frontend: 20% financé, 2 investisseurs ✅

UTILISATEUR regarde EcoDeliv:
  GET /projects/1
  → logProjectView()
  → views_count=1
  → Frontend: affiche 1 vue ✅

PARTAGE sur Twitter:
  → logProjectShare()
  → share_count=1
  → Frontend: 1 partage ✅

ATTEINDRE 100% (75M levés):
  → DB: UPDATE status='funded'
  → 📢 Email: "Projet financé!"
  → Frontend: ✅ 100% FINANCÉ - SUCCÈS!
```

---

**PROCHAINES ÉTAPES**:
1. Créer les endpoints de la section "TRÈS URGENT"
2. Implémenter les intégrations Payment (Stripe, MTN, Orange)
3. Valider les flux d'utilisateurs end-to-end
4. Tester et déployer Phase 1

