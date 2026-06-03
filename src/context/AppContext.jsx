// ============================================================
// LAUNCHPAD — AppContext.jsx ⚙️ SYNCHRONISÉ ET ENTIÈREMENT MIS À JOUR
// Fusion complète : KYC Flow + Interaction (Likes/Comments) + Investor Requests
// ============================================================

import { createContext, useContext, useState, useCallback } from "react";
import { 
  USERS, 
  NOTIFICATIONS, 
  CONVERSATIONS, 
  PROJECTS, 
  SAVED_PROJECTS, 
  INVESTOR_REQUESTS 
} from "../data/mockData";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // ─── Authentification & Navigation ────────────────────────
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("home");
  const [pageHistory, setPageHistory] = useState([]);

  // ─── Projets & Flux d'Interactions ────────────────────────
  const [projects, setProjects] = useState(PROJECTS);
  const [savedProjects, setSavedProjects] = useState(SAVED_PROJECTS);
  const [selectedProject, setSelectedProject] = useState(null); // Unifié (anciennement selProject)

  // ─── Annonces Investisseurs (Investor Requests) ───────────
  const [investorRequests, setInvestorRequests] = useState(INVESTOR_REQUESTS);

  // ─── Documents KYC (Vérification d'identité) ──────────────
  const [kycDocs, setKycDocs] = useState([]);

  // ─── Notifications & Messagerie ───────────────────────────
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [conversations, setConversations] = useState(CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState(1);

  // ─── Flux de Collaboration (AI / Team) ────────────────────
  const [collabStep, setCollabStep] = useState("found");
  const [collabTargetProject, setCollabTarget] = useState(null); // Unifié avec collabTarget

  // ─── Interface Utilisateur (UI) & Feedbacks ───────────────
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState(null);
  const [teamContact, setTeamContact] = useState(null);

  // ─── Navigation Logic ─────────────────────────────────────
  const navigate = useCallback((page, opts = {}) => {
    setPageHistory(h => [...h, currentPage]);
    setCurrentPage(page);
    if (opts.project)           setSelectedProject(opts.project);
    if (opts.collab !== undefined) setCollabStep(opts.collab);
    if (opts.collabStep !== undefined) setCollabStep(opts.collabStep);
    if (opts.target)            setCollabTarget(opts.target);
    if (opts.collabTarget)      setCollabTarget(opts.collabTarget);
    if (opts.teamContact)       setTeamContact(opts.teamContact);
    window.scrollTo(0, 0);
  }, [currentPage]);

  const goBack = useCallback(() => {
    setPageHistory(h => {
      if (!h.length) return h;
      setCurrentPage(h[h.length - 1]);
      return h.slice(0, -1);
    });
  }, []);

  // ─── Flux d'Interactions Projets (Likes, Comments, Shares) ──
  const toggleLike = useCallback((projectId) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        likedByMe: !p.likedByMe,
        likes: p.likedByMe ? p.likes - 1 : p.likes + 1,
      };
    }));
  }, []);

  const addComment = useCallback((projectId, text, user) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== projectId) return p;
      const newComment = {
        id: Date.now(),
        author: user?.name || "Anonyme",
        avatar: user?.avatar || "??",
        text,
        time: "À l'instant",
        likes: 0,
      };
      return { ...p, comments: [...p.comments, newComment] };
    }));
  }, []);

  const incrementShare = useCallback((projectId) => {
    setProjects(prev => prev.map(p => 
      p.id !== projectId ? p : { ...p, shareCount: p.shareCount + 1 }
    ));
  }, []);

  // ─── Sauvegarde de Projets (Bookmark) ─────────────────────
  const toggleSave = useCallback((projectId) => {
    setSavedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  }, []);

  const isProjectSaved = useCallback((projectId) => {
    return savedProjects.includes(projectId);
  }, [savedProjects]);

  // Même fonction aliasée pour assurer la compatibilité ascendante
  const isSaved = isProjectSaved;

  // ─── Annonces Investisseurs (Requests) Actions ────────────
  const addInvestorRequest = useCallback((request, user) => {
    const newRequest = {
      id: Date.now(),
      authorId: user?.id,
      authorName: user?.name,
      authorAvatar: user?.avatar,
      authorCompany: user?.company,
      applicants: 0,
      createdAt: "À l'instant",
      status: "active",
      ...request,
    };
    setInvestorRequests(prev => [newRequest, ...prev]);
    showToast("Votre annonce a été publiée avec succès !", "success");
  }, []);

  const applyToRequest = useCallback((requestId) => {
    setInvestorRequests(prev => prev.map(r =>
      r.id !== requestId ? r : { ...r, applicants: r.applicants + 1 }
    ));
    showToast("Votre candidature a bien été envoyée à l'investisseur !", "success");
  }, []);

  // ─── Authentification Logic ───────────────────────────────
  const login = useCallback((role) => {
    const cleanRole = role?.toString().trim().toLowerCase();

    const validRoles = ["student", "investor", "admin"];
    if (!validRoles.includes(cleanRole)) {
      console.error("Rôle invalide :", cleanRole);
      return;
    }

    const user = USERS[cleanRole];
    setCurrentUser(user);

    const redirectMap = {
      student: "dashboard-student",
      investor: "dashboard-investor",
      admin: "admin",
    };

    const destination = redirectMap[cleanRole];
    setPageHistory([]);

    setTimeout(() => {
      setCurrentPage(destination);
      window.scrollTo(0, 0);
    }, 50);
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setCollabStep("found");
    setCollabTarget(null);
    setSavedProjects([]);
    setCurrentPage("home");
    setPageHistory([]);
    window.scrollTo(0, 0);
  }, []);

  // ─── Gestion du KYC (Vérification d'Identité) ─────────────
  const submitKyc = useCallback((docs) => {
    setKycDocs(docs);
    setCurrentUser(u => ({ ...u, kycStatus: "submitted" }));
    showToast("Documents envoyés ! L'administrateur examine votre dossier sous 24–48h.", "info");
  }, []);

  const approveKyc = useCallback(() => {
    setCurrentUser(u => ({ ...u, kycValidated: true, kycStatus: "approved" }));
    showToast("✅ KYC validé ! Vous avez maintenant accès à toutes les fonctionnalités.", "success");
  }, []);

  // Passerelle de sécurité (Gate) : Redirige vers la vérification si pas validé
  const requireKyc = useCallback(() => {
    if (!currentUser) return true;
    if (currentUser.role === "admin") return false;
    if (currentUser.kycValidated)    return false;
    navigate("kyc-verification");
    return true;
  }, [currentUser, navigate]);

  // ─── Notifications Logic ──────────────────────────────────
  const unreadCount = notifications.filter(n => n.unread).length;
  
  const markAllRead = useCallback(() => {
    setNotifications(n => n.map(x => ({ ...x, unread: false })));
  }, []);

  // ─── Messagerie Logic ─────────────────────────────────────
  const unreadMessages = conversations.reduce((acc, c) => acc + c.unread, 0);

  const sendMessage = useCallback((convId, text) => {
    setConversations(prev => prev.map(c =>
      c.id !== convId ? c : {
        ...c,
        unread: 0,
        lastTime: "À l'instant",
        messages: [
          ...c.messages, 
          { id: Date.now(), from: "me", text, time: "À l'instant", me: true }
        ],
      }
    ));
  }, []);

  // ─── Flux de Collaboration Automatisé ──────────────────────
  const startCollabFlow = useCallback(() => {
    setCollabStep("detecting");
    setTimeout(() => setCollabStep("found"), 2000);
  }, []);

  const acceptCollab = useCallback((targetProject) => {
    setCollabTarget(targetProject);
    setCollabStep("accepted");
    setTimeout(() => {
      setCollabStep("team");
      navigate("team-space");
    }, 1500);
  }, [navigate]);

  const declineCollab = useCallback(() => {
    setCollabStep(null);
    navigate("dashboard-student");
  }, [navigate]);

  // ─── Toast System ─────────────────────────────────────────
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ─── Context Value Generation ─────────────────────────────
  const value = {
    // Auth & Navigation
    currentUser,
    currentPage,
    pageHistory,
    navigate,
    goBack,
    login,
    logout,
    
    // KYC Flow
    kycDocs,
    submitKyc,
    approveKyc,
    requireKyc,
    
    // Projets & Interactions
    projects,
    selectedProject,      // Nom unifié standardisé
    setSelectedProject,   // Set standardisé
    selProject: selectedProject,    // Rétrocompatibilité au cas où un composant appelle selProject
    setSelProject: setSelectedProject,
    toggleLike,
    addComment,
    incrementShare,
    
    // Favoris (Saved Projects)
    savedProjects,
    toggleSave,
    isProjectSaved,
    isSaved, // Alias
    
    // Annonces Investisseurs (Investor Requests)
    investorRequests,
    addInvestorRequest,
    applyToRequest,
    
    // Notifications
    notifications,
    unreadCount,
    markAllRead,
    
    // Messages
    conversations,
    activeConvId,
    setActiveConvId,
    sendMessage,
    unreadMessages,
    
    // Flux Collaboration
    collabStep,
    setCollabStep,
    collabTargetProject, // Nom unifié standardisé
    setCollabTarget,
    collabTarget: collabTargetProject, // Rétrocompatibilité
    startCollabFlow,
    acceptCollab,
    declineCollab,
    
    // UI Global State
    sidebarOpen,
    setSidebarOpen,
    toast,
    showToast,
    teamContact,
    setTeamContact,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}