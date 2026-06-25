# 🎯 QUICK REFERENCE — Actions Requises Backend

## HIÉRARCHIE DE PRIORITÉS

### 🔴 TRÈS URGENT (Bloque le MVP)
1. **Paiement** - MTN/Orange/Stripe integration (⏱️ 1-2 semaines)
2. **KYC Admin** - Workflow de validation (⏱️ 3-5 jours)
3. **Messagerie** - Persistence (⏱️ 3-5 jours)
4. **Publication Projets** - DB + AI (⏱️ 1 semaine)

### 🟠 IMPORTANT (Complète les features)
5. **Rendez-vous/Appointments** - Cal.com integration (⏱️ 3-5 jours)
6. **Forum** - Posts persistence (⏱️ 3-5 jours)
7. **Collaboration Requests** - Workflow complet (⏱️ 3-5 jours)
8. **Notifications** - Real-time ou polling (⏱️ 3-5 jours)

### 🟡 UTILE (Nice-to-have)
9. **Édition Profil** - Profile updates (⏱️ 2-3 jours)
10. **Partage Social** - OAuth Twitter/LinkedIn (⏱️ 3-5 jours)
11. **Admin Dashboard** - Full moderation (⏱️ 5-7 jours)
12. **Due Diligence IA** - AI scoring (⏱️ 1 semaine)

### ⚪ MINIMAL (UI seulement)
- Emoji picker (Messages)
- File attachments UI
- Collaboration task management

---

## API ENDPOINTS À CRÉER

### Authentification (5 endpoints)
```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
POST   /auth/refresh-token
GET    /auth/verify
```

### Utilisateurs & Profils (5 endpoints)
```
GET    /users/:id
GET    /users/current
PUT    /users/:id
POST   /users/:id/avatar
POST   /users/:id/resume
```

### Projets (10 endpoints)
```
POST   /projects
GET    /projects
GET    /projects/:id
PUT    /projects/:id
DELETE /projects/:id
GET    /projects/similar/:id
POST   /projects/:id/publish
GET    /projects?filter=...&sort=...
POST   /projects/:id/like
POST   /projects/:id/comments
```

### Investissements & Paiement (12 endpoints) ⭐ PRIORITÉ
```
POST   /investments
GET    /investments
GET    /investments/:id
PUT    /investments/:id
POST   /payments/initialize
POST   /payments/confirm
POST   /payments/mtn/initiate
POST   /payments/orange/initiate
POST   /payments/stripe/charge
GET    /payments/:id/status
POST   /escrow/:id/verify
POST   /escrow/:id/release
```

### KYC (8 endpoints) ⭐ PRIORITÉ
```
POST   /kyc/submit
GET    /kyc/:id
PUT    /kyc/:id
GET    /kyc/:id/status
PUT    /kyc/:id/approve       [ADMIN]
PUT    /kyc/:id/reject        [ADMIN]
GET    /admin/kyc/pending     [ADMIN]
POST   /kyc/:id/request-docs
```

### Messages (6 endpoints) ⭐ PRIORITÉ
```
POST   /messages
GET    /conversations/:id/messages
POST   /conversations
GET    /conversations
GET    /conversations/:id
DELETE /messages/:id
```

### Forum (6 endpoints)
```
POST   /forum/posts
GET    /forum/posts
GET    /forum/posts/:id
PUT    /forum/posts/:id
DELETE /forum/posts/:id
POST   /forum/posts/:id/replies
```

### Collaboration (5 endpoints)
```
POST   /collaborations
GET    /collaborations/:id
PUT    /collaborations/:id/accept
PUT    /collaborations/:id/decline
GET    /collaborations/inbox
```

### Rendez-vous (5 endpoints)
```
POST   /appointments
GET    /appointments
GET    /appointments/:id
PUT    /appointments/:id
DELETE /appointments/:id
GET    /availability/:userId
```

### Notifications (4 endpoints)
```
GET    /notifications
PUT    /notifications/mark-all-read
DELETE /notifications/:id
WebSocket /notifications (real-time)
```

### Admin (6 endpoints)
```
GET    /admin/projects          [ADMIN]
PUT    /admin/projects/:id/approve  [ADMIN]
PUT    /admin/projects/:id/reject   [ADMIN]
GET    /admin/kyc              [ADMIN]
GET    /admin/users            [ADMIN]
GET    /admin/statistics       [ADMIN]
```

### Investor Requests (4 endpoints)
```
POST   /investor-requests
GET    /investor-requests
GET    /investor-requests/:id
POST   /investor-requests/:id/apply
```

### Badges (2 endpoints)
```
GET    /badges/user/:id
POST   /badges/award/:userId/:badge  [INTERNAL]
```

### AI & Due Diligence (2 endpoints) ⭐ FUTUR
```
POST   /due-diligence/analyze
GET    /due-diligence/:projectId
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

Generated: June 3, 2026
