# 🎯 QUICK REFERENCE — Actions Requises Backend

## HIÉRARCHIE DE PRIORITÉS (Mise à jour 2026-07-30)

### ✅ COMPLÉTÉ
1. **Authentification** - JWT, refresh tokens, register/login/logout ✅
2. **Utilisateurs** - CRUD profils, upload avatar ✅
3. **Projets** - CRUD complet, likes, commentaires, publication, modération ✅
4. **KYC** - Soumission documents, validation admin ✅
5. **Messagerie REST** - Conversations, messages, marquage lu ✅
6. **Messagerie Temps Réel** - Socket.io, typing, presence, read receipts ✅
7. **Paiements** - MTN/Orange/Stripe integration, webhooks, escrow ✅
8. **Notifications** - In-app, routes de lecture/push ✅
9. **Forum** - Posts, replies, likes ✅
10. **Collaborations** - Requests, accept/decline ✅
11. **Badges** - Attribution automatique ✅
12. **Feed** - Events, timeline ✅
13. **Investor Requests** - Publication, candidatures ✅
14. **Appointments** - CRUD de rendez-vous ✅
15. **Due Diligence** - Routes et service ✅
16. **Admin** - Modération projets, KYC, statistiques ✅

### 🟠 VALIDATION & TESTS (Priorité actuelle)
1. **Paiements Sandbox** - Tests end-to-end MTN/Orange/Stripe (⏱️ 3-5 jours)
2. **Performance DB** - Index Prisma, optimisation requêtes (⏱️ 2-3 jours)
3. **Tests E2E** - Scénarios utilisateur complets (⏱️ 5-7 jours)
4. **Sécurité** - Audit endpoints, rate limiting avancé (⏱️ 3-5 jours)

### 🟡 AMÉLIORATIONS (Post-MVP)
1. **Upload Fichiers** - Attachements messages, documents projets (⏱️ 3-5 jours)
2. **Push Notifications** - Web Push complet (⏱️ 2-3 jours)
3. **Due Diligence IA** - Intégration OpenAI/GPT (⏱️ 1 semaine)
4. **Analytics** - Dashboard admin avancé (⏱️ 5-7 jours)
5. **Search** - Recherche avancée projets (⏱️ 3-5 jours)

---

## API ENDPOINTS (État actuel : 100% implémentés)

### Authentification (5 endpoints) ✅
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
GET    /api/auth/me
```

### Utilisateurs & Profils (5 endpoints) ✅
```
GET    /api/users
GET    /api/users/:id
PUT    /api/users/:id
POST   /api/users/:id/avatar
POST   /api/users/:id/resume
```

### Projets (12 endpoints) ✅
```
POST   /api/projects
GET    /api/projects
GET    /api/projects/mine
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
POST   /api/projects/:id/cover
POST   /api/projects/:id/publish
GET    /api/projects/:id/similar
POST   /api/projects/:id/like
POST   /api/projects/:id/save
POST   /api/projects/:id/comments
GET    /api/projects/:id/comments
POST   /api/projects/:id/comments/:commentId/like
```

### Investissements & Paiement (10 endpoints) ✅
```
POST   /api/investments
GET    /api/investments
GET    /api/investments/:id
POST   /api/payments/mtn/init
POST   /api/payments/orange/init
POST   /api/payments/stripe/init
GET    /api/payments/:investmentId/status
POST   /api/payments/mtn/webhook
POST   /api/payments/orange/webhook
POST   /api/payments/stripe/webhook
POST   /api/payments/cancel-expired
```

### KYC (8 endpoints) ✅
```
POST   /api/kyc/submit
GET    /api/kyc/:id
PUT    /api/kyc/:id
GET    /api/kyc/:id/status
PUT    /api/kyc/:id/approve       [ADMIN]
PUT    /api/kyc/:id/reject        [ADMIN]
GET    /api/admin/kyc/pending     [ADMIN]
POST   /api/kyc/:id/request-docs
```

### Messages (7 endpoints) ✅
```
POST   /api/messages
GET    /api/conversations
POST   /api/conversations/direct
GET    /api/conversations/:id/messages
POST   /api/conversations/:id/read
DELETE /api/messages/:id
GET    /api/messages/unread-count
```

### Forum (6 endpoints) ✅
```
POST   /api/forum/posts
GET    /api/forum/posts
GET    /api/forum/posts/:id
PUT    /api/forum/posts/:id
DELETE /api/forum/posts/:id
POST   /api/forum/posts/:id/replies
```

### Collaboration (5 endpoints) ✅
```
POST   /api/collaborations
GET    /api/collaborations/:id
PUT    /api/collaborations/:id/accept
PUT    /api/collaborations/:id/decline
GET    /api/collaborations/inbox
```

### Rendez-vous (5 endpoints) ✅
```
POST   /api/appointments
GET    /api/appointments
GET    /api/appointments/:id
PUT    /api/appointments/:id
DELETE /api/appointments/:id
GET    /api/availability/:userId
```

### Notifications (4 endpoints) ✅
```
GET    /api/notifications
PUT    /api/notifications/mark-all-read
DELETE /api/notifications/:id
POST   /api/push/subscribe
```

### Admin (6 endpoints) ✅
```
GET    /api/admin/projects/pending
PUT    /api/admin/projects/:id/approve
PUT    /api/admin/projects/:id/reject
GET    /api/admin/kyc
GET    /api/admin/users
GET    /api/admin/statistics
```

### Investor Requests (4 endpoints) ✅
```
POST   /api/investor-requests
GET    /api/investor-requests
GET    /api/investor-requests/:id
POST   /api/investor-requests/:id/apply
```

### Badges (2 endpoints) ✅
```
GET    /api/badges/user/:id
POST   /api/badges/award/:userId/:badge  [INTERNAL]
```

### Feed & Due Diligence (3 endpoints) ✅
```
GET    /api/feed
POST   /api/due-diligence/analyze
GET    /api/due-diligence/:projectId
```

---

## DATABASE SCHEMA

### Users
```sql
id, email, password_hash, role (student/investor/admin), 
first_name, last_name, avatar_url, bio, university/company,
kyc_status (pending/submitted/approved/rejected), 
kyc_validated (boolean), created_at, updated_at
```

### Projects
```sql
id, title, description, category, emoji, color_bg,
goal, raised, equity, deadline, status (draft/published/funded/closed),
author_id, team_size, created_at, updated_at,
-- Relations
tags[], images[], documents[]
```

### KYC Documents
```sql
id, user_id, step (1/2/3), document_type (id/selfie/university/business),
file_url, status (pending/approved/rejected), 
submitted_at, reviewed_at, reviewer_id, notes
```

### Investments
```sql
id, investor_id, project_id, amount, status (pending/confirmed/refunded),
investment_date, equity_percentage, escrow_id
```

### Payments
```sql
id, investment_id, amount, method (stripe/mtn/orange),
status (pending/processing/completed/failed),
transaction_id, receipt_url, created_at
```

### Messages
```sql
id, conversation_id, sender_id, content, file_urls[], 
created_at, read_at
```

### Conversations
```sql
id, participants[] (user_ids), last_message_id, 
created_at, updated_at
```

### Forum Posts
```sql
id, category, title, content, author_id, 
likes_count, replies_count, created_at, updated_at
```

### Collaborations
```sql
id, requester_id, project_id, status (pending/accepted/declined),
message, created_at
```

### Notifications
```sql
id, user_id, type (investment/message/kyc/forum), 
related_id, content, read, created_at
```

---

## TÂCHES DE DÉVELOPPEMENT

### Semaine 1
```
[ ] Setup Node/Express + PostgreSQL
[ ] Database schema creation
[ ] Auth endpoints (register, login, logout)
[ ] User profile endpoints
[ ] File upload (S3/similar)
```

### Semaine 2
```
[ ] Projects CRUD endpoints
[ ] KYC submission + storage
[ ] Messaging endpoints (basic)
[ ] Notifications setup
[ ] Input validation + error handling
```

### Semaine 3
```
[ ] Stripe integration
[ ] MTN Mobile Money integration
[ ] Orange Money integration
[ ] Escrow system
[ ] Payment confirmation workflow
```

### Semaine 4
```
[ ] KYC admin approval workflow
[ ] Forum posts persistence
[ ] Collaboration requests
[ ] Admin dashboard endpoints
[ ] Cleanup + optimization
```

---

## EXTERNAL INTEGRATIONS

```
⭐ Stripe (Payment)
   - API Key setup
   - Test mode cards
   - Webhook handling
   - Documentation: stripe.com/docs

⭐ MTN Mobile Money
   - Business account setup
   - API credentials
   - Sandbox testing
   - Integration library

⭐ Orange Money
   - Business account
   - API credentials
   - Integration

🟡 Cal.com (Appointments)
   - OAuth setup
   - Webhook for booking
   - Calendar sync

🟡 OpenAI (Due Diligence AI)
   - API key
   - Model selection (GPT-4)
   - Prompt engineering

⚪ AWS S3 (File Storage)
   - Bucket setup
   - IAM credentials
   - CORS configuration
```

---

## SECURITY CHECKLIST

```
Authentication:
[ ] JWT tokens with expiration
[ ] Refresh token rotation
[ ] Password hashing (bcrypt)
[ ] Rate limiting on auth endpoints

Authorization:
[ ] Role-based access control (RBAC)
[ ] KYC validation before sensitive operations
[ ] Admin-only endpoints protected
[ ] User can only access own data

Data Protection:
[ ] HTTPS/TLS enforced
[ ] Sensitive fields encrypted
[ ] PII not logged
[ ] Input validation on all endpoints
[ ] SQL injection prevention (parameterized queries)

Audit:
[ ] Admin actions logged
[ ] Payment transactions audited
[ ] KYC reviews tracked
[ ] User data changes logged
```

---

## TESTING PLAN

### Unit Tests
```
- Authentication functions
- Input validators
- Payment calculation logic
- KYC status transitions
```

### Integration Tests
```
- User registration flow
- Payment flow (complete)
- KYC submission flow
- Message sending flow
- Forum post creation
```

### E2E Tests
```
- Investor finds project → Invests → Payment confirmed
- Student publishes project → Gets funded
- Admin reviews KYC → Approves
- User sends message → Receiver gets notification
```

### Load Testing
```
- 100 concurrent users
- 1000 projects in explore
- Message load 10 messages/sec
```

---

## GO-LIVE CHECKLIST

Before deploying to production:
```
[ ] All critical endpoints tested
[ ] Payment tested with real Stripe (small amount)
[ ] KYC validation working
[ ] Admin dashboard functional
[ ] Error handling comprehensive
[ ] Logging configured
[ ] Monitoring setup (Sentry, DataDog)
[ ] Database backups automated
[ ] SSL certificate installed
[ ] Environment variables configured
[ ] Rate limiting active
[ ] CORS properly configured
[ ] Database indexes optimized
```

---

## ÉTAT ACTUEL DU PROJET (2026-07-30)

### ✅ Modules Backend 100% Opérationnels
- Authentification complète avec JWT et refresh tokens
- Gestion utilisateurs et profils avec upload avatar
- Module projets avec CRUD, likes, commentaires, modération
- KYC complet avec soumission et validation admin
- Messagerie REST + temps réel avec Socket.io
- Paiements MTN/Orange/Stripe avec webhooks et escrow
- Notifications in-app et push subscriptions
- Forum avec posts, replies et likes
- Collaborations avec workflow accept/decline
- Badges et système de réputation
- Feed events et timeline
- Investor requests et candidatures
- Appointments et gestion rendez-vous
- Due diligence avec routes et service
- Admin dashboard avec modération

### 🎯 Prochaines Étapes Prioritaires
1. Validation sandbox paiements (tests réels)
2. Tests E2E complets
3. Performance DB (index Prisma)
4. Audit sécurité

---

**Dernière mise à jour** : 2026-07-30
