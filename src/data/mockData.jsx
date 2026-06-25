// ============================================================
// LAUNCHPAD — mockData.js  ⚙️ FICHIER COMPLET AJUSTÉ
// Chemin : src/data/mockData.js
// Remplacer TOUT le contenu par ce fichier
// ============================================================

// ── Projets sauvegardés par l'investisseur ──
export const SAVED_PROJECTS = [1, 2, 5];

// ── Investor Requests (Marketplace UI) ──
export const INVESTOR_REQUESTS = [
  {
    id: 1,
    authorId: 2,
    authorName: "Jean-Paul Mbarga",
    authorAvatar: "JM",
    authorCompany: "Cameroon Tech Ventures",
    type: "job", // "job" | "mission" | "collaboration"
    title: "Recherche développeur IA pour startup GreenTech",
    description: "Nous cherchons un développeur Python/ML pour rejoindre une startup de livraison verte. Projet de 6 mois avec possibilité de CDI.",
    skills: ["Python", "Machine Learning", "TensorFlow", "Docker"],
    budget: "1 300 000 XAF / mois",
    duration: "6 mois",
    remote: true,
    applicants: 3,
    createdAt: "Il y a 2 jours",
    status: "active",
  },
  {
    id: 2,
    authorId: 2,
    authorName: "Jean-Paul Mbarga",
    authorAvatar: "JM",
    authorCompany: "Cameroon Tech Ventures",
    type: "mission",
    title: "Mission : Audit technique d'une app HealthTech",
    description: "Besoin d'un expert React/Node.js pour auditer le code d'une startup HealthTech avant levée de fonds Series A.",
    skills: ["React", "Node.js", "Audit", "Sécurité"],
    budget: "300 000 XAF / jour",
    duration: "1 semaine",
    remote: true,
    applicants: 7,
    createdAt: "Il y a 5 jours",
    status: "active",
  },
  {
    id: 3,
    authorId: 2,
    authorName: "BEAC Capital",
    authorAvatar: "BC",
    authorCompany: "BEAC Capital",
    type: "collaboration",
    title: "Recherche co-fondateur technique pour AgriTech",
    description: "Fonds cherche un CTO technique pour co-fonder une startup AgriTech. Equity proposée entre 15% et 25%.",
    skills: ["Agriculture", "IoT", "Mobile", "B2B"],
    budget: "Equity 15-25%",
    duration: "Long terme",
    remote: false,
    applicants: 2,
    createdAt: "Il y a 1 semaine",
    status: "active",
  },
];

// ── Projets Globaux (Mocks détaillés) ──
export const PROJECTS = [
  {
    id: 1,
    title: "EcoDeliv",
    tagline: "Livraison zéro carbone par cargo-vélo autonome",
    category: "GreenTech",
    description: "EcoDeliv déploie une flotte de cargo-vélos autonomes pilotés par IA, optimisant les tournées en temps réel pour les commerces locaux de Yaoundé et Douala.",
    desc: "EcoDeliv déploie une flotte de cargo-vélos autonomes pilotés par IA, optimisant les tournées en temps réel pour les commerces locaux de Yaoundé et Douala.", // Sécurité UI
    problem: "Les livraisons du dernier kilomètre représentent 25% des émissions CO₂ en ville.",
    solution: "Cargo-vélos autonomes + IA d'optimisation des tournées en temps réel.",
    model: "Commission 8% / livraison + abonnement 30 000 XAF/mois commerçants.",
    stage: "MVP",
    goal: 75000000,
    raised: 28000000,
    tags: ["IA", "Logistique", "GreenTech"],
    emoji: "🌿",
    color: "#22C55E",
    colorBg: "#F0FDF4",
    investors: 8,
    deadline: "30 mai 2026",
    equity: "8%",
    teamSize: 3,
    views: 342,
    status: "active",
    authorId: 1,
    createdAt: "2026-03-15",
    comments: [
      { id: 1, author: "Sophie Tran", avatar: "ST", text: "Super concept ! Avez-vous pensé à une intégration avec les vélos cargo existants ?", time: "Il y a 2h", likes: 4 },
      { id: 2, author: "Jean-Paul Mbarga", avatar: "JM", text: "Très bon projet. Le modèle économique est solide.", time: "Hier", likes: 7 }
    ],
    shareCount: 18,
  },
  {
    id: 2,
    title: "MindFlow",
    tagline: "Application santé mentale guidée par IA pour étudiants",
    category: "HealthTech",
    description: "MindFlow propose un accompagnement psychologique personnalisé par IA, accessible 24h/24 pour les étudiants camerounais en difficulté.",
    desc: "MindFlow propose un accompagnement psychologique personnalisé par IA, accessible 24h/24 pour les étudiants camerounais en difficulté.", // Sécurité UI
    problem: "1 étudiant sur 3 souffre d'anxiété ou de dépression sans accès à un suivi adapté.",
    solution: "Chatbot thérapeutique + sessions guidées + suivi de l'humeur quotidien.",
    model: "Freemium : gratuit basique, 6 000 XAF/mois premium.",
    stage: "Beta",
    goal: 120000000,
    raised: 48000000,
    tags: ["IA", "Santé", "Mobile"],
    emoji: "🧠",
    color: "#8B5CF6",
    colorBg: "#F3EFFE",
    investors: 12,
    deadline: "15 juin 2026",
    equity: "10%",
    teamSize: 2,
    views: 518,
    status: "active",
    authorId: 2,
    createdAt: "2026-02-28",
    comments: [],
    shareCount: 12,
  },
  {
    id: 3,
    title: "FarmLink",
    tagline: "Mise en relation directe agriculteurs–consommateurs",
    category: "AgriTech",
    description: "Marketplace B2C qui connecte les petits agriculteurs camerounais avec les consommateurs urbains pour des achats directs et équitables.",
    desc: "Marketplace B2C qui connecte les petits agriculteurs camerounais avec les consommateurs urbains pour des achats directs et équitables.", // Sécurité UI
    problem: "Les agriculteurs touchent seulement 20% du prix final de leurs produits.",
    solution: "Plateforme de vente directe avec logistique mutualisée.",
    model: "Commission 5% + abonnement agriculteur 18 000 XAF/mois.",
    stage: "Commercialisé",
    goal: 50000000,
    raised: 14000000,
    tags: ["Marketplace", "AgriTech", "B2C"],
    emoji: "🌾",
    color: "#F59E0B",
    colorBg: "#FFFBEB",
    investors: 4,
    deadline: "1 juillet 2026",
    equity: "12%",
    teamSize: 4,
    views: 201,
    status: "active",
    authorId: 3,
    createdAt: "2026-01-10",
    comments: [],
    shareCount: 5,
  },
  {
    id: 4,
    title: "PayEasy",
    tagline: "Super-app de paiement Mobile Money inter-opérable",
    category: "FinTech",
    description: "Plateforme unifiée permettant les transferts instantanés entre MTN MoMo et Orange Money sans frais cachés.",
    desc: "Plateforme unifiée permettant les transferts instantanés entre MTN MoMo et Orange Money sans frais cachés.", // Sécurité UI
    problem: "L'interopérabilité entre opérateurs Mobile Money est complexe et coûteuse.",
    solution: "API unifiée + wallet multi-opérateur + transferts instantanés.",
    model: "Commission 0,5% par transaction (vs 2-3% marché actuel).",
    stage: "Prototype",
    goal: 200000000,
    raised: 15000000,
    tags: ["Mobile Money", "FinTech", "Paiements"],
    emoji: "💳",
    color: "#3B82F6",
    colorBg: "#EFF6FF",
    investors: 3,
    deadline: "30 août 2026",
    equity: "6%",
    teamSize: 2,
    views: 98,
    status: "active",
    authorId: 4,
    createdAt: "2026-04-01",
    comments: [],
    shareCount: 9,
  },
  {
    id: 5,
    title: "LearnCam",
    tagline: "Tuteur IA personnalisé pour lycéens et étudiants camerounais",
    category: "EdTech",
    description: "Plateforme d'apprentissage adaptatif alignée sur les programmes officiels MINESEC et MINESUP du Cameroun.",
    desc: "Plateforme d'apprentissage adaptatif alignée sur les programmes officiels MINESEC et MINESUP du Cameroun.", // Sécurité UI
    problem: "Le soutien scolaire de qualité coûte 15 000–40 000 XAF/h, inaccessible pour la majorité.",
    solution: "Tuteur IA disponible 24h/24 à 3 000 XAF/mois, couvrant toutes les matières.",
    model: "Freemium + abonnement 3 000 XAF/mois + licences établissements.",
    stage: "Beta",
    goal: 60000000,
    raised: 36000000,
    tags: ["IA", "Education", "B2C"],
    emoji: "📚",
    color: "#0EA5B0",
    colorBg: "#E0F7F8",
    investors: 9,
    deadline: "20 mai 2026",
    equity: "9%",
    teamSize: 3,
    views: 445,
    status: "active",
    authorId: 5,
    createdAt: "2026-03-01",
    comments: [],
    shareCount: 31,
  },
  {
    id: 6,
    title: "DataMesh",
    tagline: "Infrastructure data décentralisée pour PMEs africaines",
    category: "SaaS",
    description: "Plateforme no-code permettant aux PMEs camerounaises de créer et gérer leur infrastructure data sans compétences techniques.",
    desc: "Plateforme no-code permettant aux PMEs camerounaises de créer et gérer leur infrastructure data sans compétences techniques.", // Sécurité UI
    problem: "80% des PMEs n'ont pas de stratégie data faute de moyens techniques.",
    solution: "Connecteurs plug-and-play + dashboards automatiques + IA analytique.",
    model: "SaaS : 30 000 à 180 000 XAF/mois selon taille entreprise.",
    stage: "Commercialisé",
    goal: 150000000,
    raised: 54000000,
    tags: ["Cloud", "Data", "SaaS"],
    emoji: "𗄞",
    color: "#5B73F5",
    colorBg: "#EEF2FF",
    investors: 15,
    deadline: "1 juin 2026",
    equity: "7%",
    teamSize: 5,
    views: 612,
    status: "active",
    authorId: 1,
    createdAt: "2026-01-20",
    comments: [],
    shareCount: 22,
  },
];

// ── Recommandations d'IA Algorithmiques ──
export const SIMILAR_PROJECTS = [
  { id: 7, title: "GreenMove", similarity: 82, category: "GreenTech", desc: "Mobilité durable en campus universitaire de Yaoundé" },
  { id: 8, title: "CarbonZero", similarity: 74, category: "GreenTech", desc: "Compensation carbone B2B automatisée" },
  { id: 9, title: "VeloCity", similarity: 68, category: "Mobilité", desc: "Flotte vélos électriques partagés urbains" },
];

// ── UTILISATEURS ──
export const USERS = {
  student: {
    id: 1,
    name: "Alice Mboumba",
    firstName: "Alice",
    role: "student",
    avatar: "NC",
    university: "Université de Yaoundé I",
    location: "Yaoundé, Cameroun",
    bio: "Étudiante en Master IA et développement durable à l'UY1. Fondatrice d'EcoDeliv. Passionnée par la tech au service de l'environnement africain.",
    skills: ["Machine Learning", "Python", "Node.js", "GreenTech", "Entrepreneuriat"],
    links: { linkedin: "#", github: "#", portfolio: "#" },
    stats: { views: 248, raised: "28M XAF", collabs: 2, score: 4.8 },
    joinedAt: "Janvier 2026",
    kycValidated: false, // Passer à true pour tester l'accès complet post-validation
    kycStatus: "pending", // "pending" | "submitted" | "approved" | "rejected"
  },
  investor: {
    id: 2,
    name: "Jean-Paul Mbarga",
    firstName: "Jean-Paul",
    role: "investor",
    avatar: "JM",
    company: "Cameroon Tech Ventures",
    location: "Douala, Cameroun",
    bio: "Partner chez Cameroon Tech Ventures. Spécialisé FinTech, AgriTech et GreenTech en Afrique Centrale. Tickets entre 500K et 50M XAF.",
    interests: ["GreenTech", "IA & ML", "FinTech", "AgriTech"],
    criteria: {
      minTicket: "500 000 XAF",
      maxTicket: "50 000 000 XAF",
      stage: "MVP+",
      region: "Afrique Centrale",
    },
    stats: { projects: 14, avgReturn: "+18%", rating: 4.9, invested: "340M XAF" },
    portfolio: [
      { name: "EcoDeliv", amount: "18M XAF", return: "+12%" },
      { name: "DataMesh", amount: "30M XAF", return: "+8%" },
      { name: "NutriAI", amount: "12M XAF", return: "-2%" },
      { name: "LearnCam", amount: "9M XAF", return: "+22%" },
    ],
    joinedAt: "Octobre 2025",
    kycValidated: false,
    kycStatus: "pending",
  },
  admin: {
    id: 3,
    name: "Admin Launchpad",
    firstName: "Admin",
    role: "admin",
    avatar: "AD",
  },
};

// ── Messagerie Instantanée ──
export const CONVERSATIONS = [
  {
    id: 1,
    with: { name: "Jean-Paul Mbarga", avatar: "JM", online: true },
    unread: 2,
    lastTime: "14:32",
    messages: [
      { id: 1, from: "Jean-Paul Mbarga", text: "Bonjour ! J'ai vu votre projet EcoDeliv et je suis très intéressé.", time: "14:28", me: false },
      { id: 2, from: "me", text: "Merci beaucoup ! Nous serions ravis d'en discuter avec vous.", time: "14:30", me: true },
      { id: 3, from: "Jean-Paul Mbarga", text: "Pouvez-vous me partager votre pitch deck complet ?", time: "14:32", me: false },
    ],
  },
  {
    id: 2,
    with: { name: "BEAC Capital", avatar: "BC", online: false },
    unread: 0,
    lastTime: "11:00",
    messages: [
      { id: 1, from: "BEAC Capital", text: "Pouvez-vous partager votre pitch deck ?", time: "11:00", me: false },
    ],
  },
  {
    id: 3,
    with: { name: "Sophie Tran", avatar: "ST", online: true },
    unread: 1,
    lastTime: "Hier",
    messages: [
      { id: 1, from: "Sophie Tran", text: "Je peux rejoindre l'équipe EcoDeliv 🚀", time: "Hier", me: false },
    ],
  },
  {
    id: 4,
    with: { name: "Afriland Ventures", avatar: "AV", online: false },
    unread: 0,
    lastTime: "Lun",
    messages: [
      { id: 1, from: "Afriland Ventures", text: "RDV la semaine prochaine ?", time: "Lun", me: false },
    ],
  },
];

// ── Activités et Notifications ──
export const NOTIFICATIONS = [
  { id: 1, icon: "💼", title: "Nouvel investisseur intéressé", desc: "Jean-Paul Mbarga a consulté EcoDeliv et demandé votre pitch deck.", time: "Il y a 2h", unread: true, type: "investor" },
  { id: 2, icon: "🤝", title: "Demande de collaboration", desc: "Sophie Tran souhaite collaborer sur MindFlow.", time: "Il y a 5h", unread: true, type: "collaboration" },
  { id: 3, icon: "⭐", title: "Projet mis en vedette", desc: "EcoDeliv a été sélectionné projet de la semaine !", time: "Hier 09:00", unread: true, type: "system" },
  { id: 4, icon: "💬", title: "Nouveau message", desc: "BEAC Capital vous a envoyé un message.", time: "Hier 14:30", unread: false, type: "message" },
  { id: 5, icon: "🤖", title: "Projet similaire détecté", desc: "VeloCity (72% similaire) vient d'être publié.", time: "Il y a 2 jours", unread: false, type: "ai" },
  { id: 6, icon: "✅", title: "Projet validé", desc: "MindFlow a été validé par la modération.", time: "Il y a 3 jours", unread: false, type: "system" },
];

// ── Backoffice & Modération Administrateur ──
export const ADMIN_DATA = {
  stats: {
    users: 2418,
    projects: 382,
    pending: 8,
    reports: 3,
    kycPending: 4,
  },
  pendingProjects: [
    { id: 1, title: "EcoDeliv V2", type: "Mise à jour", author: "Alice M.", date: "Aujourd'hui" },
    { id: 2, title: "PayEasy Pro", type: "Nouveau", author: "Thomas R.", date: "Hier" },
    { id: 3, title: "DataLeakShield", type: "Nouveau", author: "Léa P.", date: "Hier" },
    { id: 4, title: "NutriBot", type: "Nouveau", author: "Karim S.", date: "Il y a 2j" },
  ],
  pendingKyc: [
    { id: 1, name: "Alice Mboumba", role: "Étudiante", university: "Université de Yaoundé I", date: "Aujourd'hui", docs: 4 },
    { id: 2, name: "Marc Essomba", role: "Étudiant", university: "Université de Douala", date: "Hier", docs: 3 },
    { id: 3, name: "Camtech SARL", role: "Investisseur", company: "Camtech", date: "Hier", docs: 3 },
    { id: 4, name: "Sophie Ndoumbe", role: "Étudiante", university: "ENSP Yaoundé", date: "Il y a 2j", docs: 4 },
  ],
  reports: [
    { id: 1, reason: "Contenu trompeur", target: "FakeProject XYZ", severity: "urgent" },
    { id: 2, reason: "Spam de messages", target: "Utilisateur #4421", severity: "medium" },
    { id: 3, reason: "Plagiat détecté", target: "CopyStartup", severity: "urgent" },
  ],
  recentUsers: [
    { id: 1, name: "Alice Mboumba", role: "Étudiant", date: "Aujourd'hui", projects: 2, status: "active" },
    { id: 2, name: "Jean-Paul Mbarga", role: "Investisseur", date: "Hier", projects: 0, status: "active" },
    { id: 3, name: "Sophie Tran", role: "Étudiant", date: "Hier", projects: 1, status: "pending" },
    { id: 4, name: "Karim Sow", role: "Étudiant", date: "Il y a 2j", projects: 1, status: "active" },
  ],
};

// ── Espace Collaboratif Projets ──
export const TEAM_SPACE = {
  name: "EcoDeliv × GreenMove",
  members: [
    { name: "Alice Mboumba", avatar: "AL", role: "CEO / Lead", project: "EcoDeliv" },
    { name: "Lucas Bernard", avatar: "LB", role: "CTO", project: "GreenMove" },
    { name: "Sophie Tran", avatar: "ST", role: "Designer", project: "EcoDeliv" },
  ],
  updates: [
    { author: "Alice Mboumba", avatar: "AL", text: "MVP livré en avance ! Tests utilisateurs démarrent lundi.", time: "Il y a 1h" },
    { author: "Lucas Bernard", avatar: "LB", text: "Algorithme d'optimisation de tournées optimisé — réduction de 23% du temps.", time: "Hier" },
    { author: "Sophie Tran", avatar: "ST", text: "Maquettes v2 disponibles sur Figma.", time: "Il y a 2 jours" },
  ],
  tasks: [
    { title: "Finaliser le pitch deck", done: true, assignee: "Alice" },
    { title: "Intégration API cartographie", done: true, assignee: "Lucas" },
    { title: "Tests beta utilisateurs", done: false, assignee: "Sophie" },
    { title: "Préparer démo investisseurs", done: false, assignee: "Alice" },
  ],
};

// ── Feed data ──
export const FEED_ITEMS = [
  { id: 1, type: "project", icon: "📦", actor: "Alice Mboumba", avatar: "AL", action: "a publié un nouveau projet", target: "EcoDeliv v2.0", time: "Il y a 10 min", category: "GreenTech", desc: "Livraison zéro carbone par cargo-vélo autonome — Mise à jour majeure !", likes: 12, comments: 3 },
  { id: 2, type: "funded", icon: "💰", actor: "LearnCam", avatar: "📚", action: "a atteint", target: "60% de son objectif", time: "Il y a 2h", category: "EdTech", desc: "Tuteur IA camerounais — 36M XAF levés sur 60M XAF !", likes: 28, comments: 7 },
  { id: 3, type: "collab", icon: "🤝", actor: "FarmLink × GreenMove", avatar: "🌾", action: "ont formé une collaboration", target: "", time: "Il y a 4h", category: "AgriTech", desc: "Association stratégique pour une supply chain agricole verte au Cameroun.", likes: 19, comments: 4 },
  { id: 4, type: "badge", icon: "🏆", actor: "Sophie Tran", avatar: "ST", action: "a obtenu le badge", target: "🔥 Projet Trending", time: "Hier 14:00", category: "", desc: "MindFlow a dépassé les 500 vues en 24h !", likes: 45, comments: 9 },
  { id: 5, type: "marketplace", icon: "💼", actor: "Cameroon Tech Ventures", avatar: "JM", action: "a publié une offre", target: "Stage Dev IA — 150 000 XAF", time: "Hier 10:00", category: "IA & ML", desc: "Stage de 6 mois en développement IA pour le campus de Douala.", likes: 33, comments: 11 },
  { id: 6, type: "academy", icon: "📚", actor: "Launchpad Academy", avatar: "🎓", action: "nouveau cours disponible", target: "Pitcher à un investisseur", time: "Il y a 2 jours", category: "Formation", desc: "45 min · Guide complet avec exemples concrets du marché camerounais.", likes: 67, comments: 18 },
];

// ── Badges data ──
export const BADGES_DATA = {
  student: [
    { id: "first_project", icon: "🌱", label: "Premier projet", desc: "Publier votre premier projet", earned: true, date: "10 Jan 2026", pts: 10 },
    { id: "trending", icon: "🔥", label: "Projet Trending", desc: "500+ vues en 24h", earned: true, date: "15 Jan 2026", pts: 20 },
    { id: "first_funding", icon: "💰", label: "Premier financement", desc: "Recevoir votre premier investissement", earned: false, pts: 50 },
    { id: "collaborator", icon: "🤝", label: "Collaborateur actif", desc: "Former 3 collaborations", earned: false, pts: 15 },
    { id: "featured", icon: "⭐", label: "Projet en vedette", desc: "Sélectionné par l'équipe Launchpad", earned: false, pts: 20 },
    { id: "top_student", icon: "🎓", label: "Top Étudiant", desc: "Top 10 de la semaine", earned: false, pts: 25 },
    { id: "networker", icon: "🌐", label: "Networker", desc: "10 connexions établies", earned: true, date: "20 Jan 2026", pts: 10 },
    { id: "pitchmaster", icon: "🎤", label: "Pitch Master", desc: "Compléter la Launchpad Academy", earned: false, pts: 30 },
  ],
  investor: [
    { id: "first_inv", icon: "💼", label: "Premier investissement", desc: "Réaliser votre premier deal", earned: false, pts: 50 },
    { id: "top_inv", icon: "🎯", label: "Top Investisseur", desc: "Top 10 mensuel", earned: false, pts: 25 },
    { id: "global", icon: "🌍", label: "Investisseur Global", desc: "Investir dans 3 pays différents", earned: false, pts: 30 },
    { id: "angel", icon: "🏆", label: "Angel Investor", desc: "10+ investissements réalisés", earned: false, pts: 100 },
    { id: "verified", icon: "✓", label: "Profil vérifié", desc: "KYC validé par l'administrateur", earned: false, pts: 20 },
  ],
};

// ── Academy data ──
export const COURSES = [
  { id: 1, icon: "🎤", title: "Comment pitcher à un investisseur africain", type: "Cours", duration: "45 min", level: "Débutant", premium: false, enrolled: 342, rating: 4.8 },
  { id: 2, icon: "💰", title: "Lever des fonds : du seed au Série A", type: "Webinaire", duration: "1h30", level: "Intermédiaire", premium: false, enrolled: 218, rating: 4.9 },
  { id: 3, icon: "📋", title: "Construire son business plan camerounais", type: "Guide PDF", duration: "30 min", level: "Débutant", premium: false, enrolled: 567, rating: 4.7 },
  { id: 4, icon: "⚖️", title: "Aspects juridiques : créer une SARL au Cameroun", type: "Cours", duration: "1h", level: "Intermédiaire", premium: true, enrolled: 134, rating: 4.6 },
  { id: 5, icon: "📊", title: "Cap table & dilution : comprendre l'equity", type: "Cours", duration: "55 min", level: "Avancé", premium: true, enrolled: 89, rating: 4.9 },
  { id: 6, icon: "🌍", title: "Expansion en Afrique Centrale : stratégies", type: "Webinaire", duration: "2h", level: "Avancé", premium: true, enrolled: 67, rating: 5.0 },
];

// ── Appointments data ──
export const APPOINTMENTS = [
  { id: 1, with: "Jean-Paul Mbarga", avatar: "JM", role: "Investisseur", company: "Cameroon Tech Ventures", date: "Mar 3 Juin 2026", time: "14h00 – 14h45", type: "Google Meet", link: "#", project: "EcoDeliv", status: "confirmed" },
  { id: 2, with: "Marie Fouda", avatar: "MF", role: "Investisseur", company: "BEAC Capital", date: "Jeu 5 Juin 2026", time: "10h00 – 10h30", type: "Zoom", link: "#", project: "EcoDeliv", status: "pending" },
];

// ── Forum data ──
export const FORUM_POSTS = [
  { id: 1, cat: "FinTech", title: "Comment structurer son equity pour des investisseurs africains ?", author: "Alice Mboumba", avatar: "AL", date: "Il y a 2h", replies: 12, likes: 28, pinned: true },
  { id: 2, cat: "AgriTech", title: "Ressources pour une startup AgriTech au Cameroun — Guide complet", author: "Lucas Bernard", avatar: "LB", date: "Hier", replies: 8, likes: 45, pinned: false },
  { id: 3, cat: "Conseils", title: "Retour d'expérience : lever des fonds à Douala en 2026", author: "Jean-Paul Mbarga", avatar: "JM", date: "Il y a 2 jours", replies: 24, likes: 67, pinned: false },
  { id: 4, cat: "IA & ML", title: "Les meilleurs modèles open-source pour des startups sans budget", author: "Sophie Tran", avatar: "ST", date: "Il y a 3 jours", replies: 15, likes: 39, pinned: false },
];