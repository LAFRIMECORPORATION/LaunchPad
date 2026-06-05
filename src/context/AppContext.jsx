// ============================================================
// LAUNCHPAD — AppContext.jsx
// État global + navigation React Router + authentification API
// ============================================================

import { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  NOTIFICATIONS,
  CONVERSATIONS,
  PROJECTS,
  SAVED_PROJECTS,
  INVESTOR_REQUESTS,
} from "../data/mockData";
import {
  getPathForPage,
  getPageFromPath,
  getDashboardPathForRole,
} from "../config/routes";
import { authApi, setToken, clearToken, getToken } from "../services/api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const routerNavigate = useNavigate();
  const location = useLocation();

  // ─── Authentification ─────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ─── Navigation dérivée de l'URL ────────────────────────────
  const currentPage = useMemo(
    () => getPageFromPath(location.pathname),
    [location.pathname]
  );

  // ─── Projets & Flux d'Interactions ────────────────────────
  const [projects, setProjects] = useState(PROJECTS);
  const [savedProjects, setSavedProjects] = useState(SAVED_PROJECTS);
  const [selectedProject, setSelectedProject] = useState(null);

  // ─── Annonces Investisseurs ───────────────────────────────
  const [investorRequests, setInvestorRequests] = useState(INVESTOR_REQUESTS);

  // ─── Documents KYC ────────────────────────────────────────
  const [kycDocs, setKycDocs] = useState([]);

  // ─── Notifications & Messagerie ───────────────────────────
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [conversations, setConversations] = useState(CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState(1);

  // ─── Flux de Collaboration ────────────────────────────────
  const [collabStep, setCollabStep] = useState("found");
  const [collabTargetProject, setCollabTarget] = useState(null);

  // ─── Interface Utilisateur ────────────────────────────────
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState(null);
  const [teamContact, setTeamContact] = useState(null);

  // ─── Restauration de session au démarrage ────────────────
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setAuthLoading(false);
      return;
    }

    authApi.me()
      .then(({ user }) => setCurrentUser(user))
      .catch(() => clearToken())
      .finally(() => setAuthLoading(false));
  }, []);

  // ─── Navigation (compatible avec l'ancien navigate("explore")) ──
  const navigate = useCallback((page, opts = {}) => {
    if (opts.project) setSelectedProject(opts.project);
    if (opts.collab !== undefined) setCollabStep(opts.collab);
    if (opts.collabStep !== undefined) setCollabStep(opts.collabStep);
    if (opts.target) setCollabTarget(opts.target);
    if (opts.collabTarget) setCollabTarget(opts.collabTarget);
    if (opts.teamContact) setTeamContact(opts.teamContact);

    routerNavigate(getPathForPage(page, opts));
    window.scrollTo(0, 0);
  }, [routerNavigate]);

  const goBack = useCallback(() => {
    routerNavigate(-1);
  }, [routerNavigate]);

  // ─── Toast System ─────────────────────────────────────────
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ─── Authentification API ─────────────────────────────────
  const loginWithCredentials = useCallback(async ({ email, password, role }) => {
    const { user, token } = await authApi.login({ email, password, role });
    setToken(token);
    setCurrentUser(user);
    routerNavigate(getDashboardPathForRole(user.role));
    window.scrollTo(0, 0);
    showToast(`Bienvenue ${user.firstName} !`, "success");
    return user;
  }, [routerNavigate, showToast]);

  const registerAccount = useCallback(async (payload) => {
    const { user, token } = await authApi.register(payload);
    setToken(token);
    setCurrentUser(user);
    routerNavigate(getDashboardPathForRole(user.role));
    window.scrollTo(0, 0);
    showToast("Compte créé avec succès !", "success");
    return user;
  }, [routerNavigate, showToast]);

  /** Rétrocompatibilité demo — préférer loginWithCredentials */
  const login = useCallback(async (roleOrPayload) => {
    if (typeof roleOrPayload === "string") {
      showToast("Utilisez email + mot de passe pour vous connecter.", "info");
      return;
    }
    return loginWithCredentials(roleOrPayload);
  }, [loginWithCredentials, showToast]);

  const logout = useCallback(async () => {
    try {
      if (getToken()) await authApi.logout();
    } catch {
      // Déconnexion locale même si l'API échoue
    } finally {
      clearToken();
      setCurrentUser(null);
      setCollabStep("found");
      setCollabTarget(null);
      setSavedProjects([]);
      routerNavigate("/");
      window.scrollTo(0, 0);
    }
  }, [routerNavigate]);

  // ─── Flux d'Interactions Projets ──────────────────────────
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
      return {
        ...p,
        comments: [...p.comments, {
          id: Date.now(),
          author: user?.name || "Anonyme",
          avatar: user?.avatar || "??",
          text,
          time: "À l'instant",
          likes: 0,
        }],
      };
    }));
  }, []);

  const incrementShare = useCallback((projectId) => {
    setProjects(prev => prev.map(p =>
      p.id !== projectId ? p : { ...p, shareCount: p.shareCount + 1 }
    ));
  }, []);

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

  const isSaved = isProjectSaved;

  // ─── Investor Requests ────────────────────────────────────
  const addInvestorRequest = useCallback((request, user) => {
    setInvestorRequests(prev => [{
      id: Date.now(),
      authorId: user?.id,
      authorName: user?.name,
      authorAvatar: user?.avatar,
      authorCompany: user?.company,
      applicants: 0,
      createdAt: "À l'instant",
      status: "active",
      ...request,
    }, ...prev]);
    showToast("Votre annonce a été publiée avec succès !", "success");
  }, [showToast]);

  const applyToRequest = useCallback((requestId) => {
    setInvestorRequests(prev => prev.map(r =>
      r.id !== requestId ? r : { ...r, applicants: r.applicants + 1 }
    ));
    showToast("Votre candidature a bien été envoyée à l'investisseur !", "success");
  }, [showToast]);

  // ─── KYC ──────────────────────────────────────────────────
  const submitKyc = useCallback((docs) => {
    setKycDocs(docs);
    setCurrentUser(u => ({ ...u, kycStatus: "submitted" }));
    showToast("Documents envoyés ! L'administrateur examine votre dossier sous 24–48h.", "info");
  }, [showToast]);

  const approveKyc = useCallback(() => {
    setCurrentUser(u => ({ ...u, kycValidated: true, kycStatus: "approved" }));
    showToast("✅ KYC validé ! Vous avez maintenant accès à toutes les fonctionnalités.", "success");
  }, [showToast]);

  const requireKyc = useCallback(() => {
    if (!currentUser) return true;
    if (currentUser.role === "admin") return false;
    if (currentUser.kycValidated) return false;
    navigate("kyc-verification");
    return true;
  }, [currentUser, navigate]);

  // ─── Notifications ────────────────────────────────────────
  const unreadCount = notifications.filter(n => n.unread).length;
  const markAllRead = useCallback(() => {
    setNotifications(n => n.map(x => ({ ...x, unread: false })));
  }, []);

  // ─── Messagerie ───────────────────────────────────────────
  const unreadMessages = conversations.reduce((acc, c) => acc + c.unread, 0);

  const sendMessage = useCallback((convId, text) => {
    setConversations(prev => prev.map(c =>
      c.id !== convId ? c : {
        ...c,
        unread: 0,
        lastTime: "À l'instant",
        messages: [...c.messages, {
          id: Date.now(), from: "me", text, time: "À l'instant", me: true,
        }],
      }
    ));
  }, []);

  // ─── Collaboration ────────────────────────────────────────
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

  const value = {
    currentUser,
    authLoading,
    currentPage,
    pageHistory: [],
    navigate,
    goBack,
    login,
    loginWithCredentials,
    registerAccount,
    logout,

    kycDocs,
    submitKyc,
    approveKyc,
    requireKyc,

    projects,
    selectedProject,
    setSelectedProject,
    selProject: selectedProject,
    setSelProject: setSelectedProject,
    toggleLike,
    addComment,
    incrementShare,

    savedProjects,
    toggleSave,
    isProjectSaved,
    isSaved,

    investorRequests,
    addInvestorRequest,
    applyToRequest,

    notifications,
    unreadCount,
    markAllRead,

    conversations,
    activeConvId,
    setActiveConvId,
    sendMessage,
    unreadMessages,

    collabStep,
    setCollabStep,
    collabTargetProject,
    setCollabTarget,
    collabTarget: collabTargetProject,
    startCollabFlow,
    acceptCollab,
    declineCollab,

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
