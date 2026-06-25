// ============================================================
// LAUNCHPAD — AppContext.jsx (CORRIGÉ, COMPLET & SÉCURISÉ)
// État global + navigation React Router + authentification API
// ============================================================

import { createContext, useContext, useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authApi, kycApi, setAccessToken, clearAccessToken } from "../utils/api";
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
} from "../config/routes";

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

  // ─── Token Helper sécurisé pour les requêtes natives ──────
  const getAccessToken = useCallback(() => {
    return localStorage.getItem("launchpad_access_token") || "";
  }, []);

  // ─── Toast System ─────────────────────────────────────────
  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ─── Navigation ───────────────────────────────────────────
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

  // ─── Réhydrater la session au chargement ───────────────────
  useEffect(() => {
    const rehydrateSession = async () => {
      const refreshToken = localStorage.getItem("launchpad_refresh_token");
      if (!refreshToken) {
        setAuthLoading(false);
        return;
      }

      try {
        const response = await authApi.refresh(refreshToken);
        const { user, accessToken, refreshToken: newRefresh } = response.data;

        setAccessToken(accessToken);
        localStorage.setItem("launchpad_access_token", accessToken);
        localStorage.setItem("launchpad_refresh_token", newRefresh);
        setCurrentUser(user);

        if (window.location.pathname === "/" || currentPage === "home") {
          const dashMap = {
            student:  "dashboard-student",
            investor: "dashboard-investor",
            admin:    "admin",
          };
          navigate(dashMap[user.role] || "home");
        }
      } catch {
        localStorage.removeItem("launchpad_refresh_token");
        localStorage.removeItem("launchpad_access_token");
        clearAccessToken();
      } finally {
        setAuthLoading(false);
      }
    };

    rehydrateSession();
  }, [currentPage, navigate]);

  // ─── Fonction login() branchée sur l'API ───────────────────
  const login = useCallback(async (credentials) => {
    try {
      if (typeof credentials === "string") {
        setCurrentUser({ role: credentials, name: `Démo ${credentials}`, kycValidated: true });
        const dashMap = {
          student:  "dashboard-student",
          investor: "dashboard-investor",
          admin:    "admin",
        };
        navigate(dashMap[credentials] || "home");
        showToast(`Mode démo : Connecté en tant que ${credentials}`, "info");
        return;
      }

      const response = await authApi.login(credentials);
      const { user, accessToken, refreshToken } = response.data;

      setAccessToken(accessToken);
      localStorage.setItem("launchpad_access_token", accessToken);
      localStorage.setItem("launchpad_refresh_token", refreshToken);

      setCurrentUser(user);
      showToast(`Ravi de vous revoir !`, "success");

      const dashMap = {
        student:  "dashboard-student",
        investor: "dashboard-investor",
        admin:    "admin",
      };
      navigate(dashMap[user.role] || "home");

    } catch (error) {
      showToast(error.message || "Erreur de connexion.", "error");
      throw error;
    }
  }, [navigate, showToast]);

  // ─── Enregistrement de compte branché sur l'API ─────────────
  const registerAccount = useCallback(async (payload) => {
    try {
      const response = await authApi.register(payload);
      const { user, accessToken, refreshToken } = response.data;

      setAccessToken(accessToken);
      localStorage.setItem("launchpad_access_token", accessToken);
      localStorage.setItem("launchpad_refresh_token", refreshToken);
      setCurrentUser(user);

      const dashMap = {
        student:  "dashboard-student",
        investor: "dashboard-investor",
        admin:    "admin",
      };
      navigate(dashMap[user.role] || "home");
      showToast("Compte créé avec succès !", "success");
      return user;
    } catch (error) {
      showToast(error.message || "Erreur lors de la création du compte.", "error");
      throw error;
    }
  }, [navigate, showToast]);

  // ─── Fonction de déconnexion ──────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignorer les erreurs de logout
    } finally {
      clearAccessToken();
      localStorage.removeItem("launchpad_access_token");
      localStorage.removeItem("launchpad_refresh_token");
      setCurrentUser(null);
      setCollabStep("found");
      setCollabTarget(null);
      setSavedProjects([]);
      navigate("home");
    }
  }, [navigate]);

  // ─── Flux d'Interactions Projets (Branchés sur le Backend Neon - SÉCURISÉ) ───
  const toggleLike = useCallback(async (projectId) => {
    const token = getAccessToken();

    if (!token) {
      showToast("Vous devez être connecté pour aimer un projet", "error");
      return;
    }

    if (!projectId || projectId === "undefined") {
      console.error("❌ AppContext: Impossible de basculer le like, l'ID est indéfini.");
      return;
    }

    let previousProjectsState = [];
    let previousSelectedProjectState = null;

    // 1. Mise à jour optimiste immédiate (Tolérance type string/number via ==)
    setProjects(prev => {
      previousProjectsState = prev;
      return prev.map(p => {
        const pId = p.id || p.project_id;
        if (String(pId) !== String(projectId)) return p;
        const willBeLiked = !p.likedByMe;
        return {
          ...p,
          likedByMe: willBeLiked,
          likes: willBeLiked ? (p.likes || 0) + 1 : Math.max(0, (p.likes || 0) - 1),
        };
      });
    });

    setSelectedProject(prev => {
      previousSelectedProjectState = prev;
      if (!prev) return prev;
      const prevId = prev.id || prev.project_id || prev.data?.id;
      if (String(prevId) !== String(projectId)) return prev;
      const willBeLiked = !prev.likedByMe;
      return {
        ...prev,
        likedByMe: willBeLiked,
        likes: willBeLiked ? (prev.likes || 0) + 1 : Math.max(0, (prev.likes || 0) - 1),
      };
    });

    // 2. Persistance asynchrone
    try {
      const envUrl = import.meta.env.VITE_API_URL || "";
      const cleanBaseUrl = envUrl.replace(/\/api\/?$/, "");

      const response = await fetch(`${cleanBaseUrl}/api/projects/${projectId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        showToast("Votre session a expiré. Veuillez vous reconnecter.", "error");
        setProjects(previousProjectsState);
        setSelectedProject(previousSelectedProjectState);
        return;
      }

      if (!response.ok) throw new Error("Échec de la synchronisation du like.");

      const jsonRes = await response.json();
      const backendPayload = jsonRes.project || jsonRes.data || jsonRes;

      if (backendPayload) {
        const serverLikes = backendPayload.likesCount ?? backendPayload.likes ?? 0;
        const serverLiked = backendPayload.likedByMe ?? true;

        const syncState = p => {
          const pId = p.id || p.project_id;
          return String(pId) !== String(projectId) ? p : { ...p, likes: serverLikes, likedByMe: serverLiked };
        };

        setProjects(prev => prev.map(syncState));
        setSelectedProject(prev => {
          if (!prev) return prev;
          const prevId = prev.id || prev.project_id || prev.data?.id;
          return String(prevId) === String(projectId) 
            ? { ...prev, likes: serverLikes, likedByMe: serverLiked } 
            : prev;
        });
      }
    } catch (error) {
      console.error("Erreur d'enregistrement du Like:", error);
      setProjects(previousProjectsState);
      setSelectedProject(previousSelectedProjectState);
    }
  }, [getAccessToken, showToast]);

 const addComment = useCallback(async (projectId, text, user) => {
  if (!projectId || projectId === "undefined") {
    console.error("❌ AppContext: Impossible d'ajouter le commentaire, l'ID est indéfini.");
    return;
  }

  try {
    const envUrl = import.meta.env.VITE_API_URL || "";
    const cleanBaseUrl = envUrl.replace(/\/api\/?$/, ""); 
    const token = getAccessToken();

    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${cleanBaseUrl}/api/projects/${projectId}/comments`, {
      method: "POST",
      headers,
      body: JSON.stringify({ content: text }) 
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      console.error("❌ Détails du refus serveur :", errData);
      throw new Error("Le serveur a refusé le commentaire.");
    }
    
    const jsonRes = await response.json();
    // Gère les structures { data: ... } ou directement l'objet renvoyé
    const dbComment = jsonRes.data || jsonRes.comment || jsonRes;

    // 🛡️ NORMALISATION ROBUSTE (Prise en compte du snake_case de Prisma)
    const backendUser = dbComment.user || dbComment.author;
    const firstName = backendUser?.first_name || backendUser?.firstName || user?.firstName || "";
    const lastName = backendUser?.last_name || backendUser?.lastName || user?.lastName || "";
    const computedAuthor = `${firstName} ${lastName}`.trim() || user?.name || "Anonyme";
    const computedAvatar = backendUser?.avatar_url || backendUser?.avatar || user?.avatar || "U";

    const processedComment = {
      id: dbComment.id || Date.now(),
      author: computedAuthor,
      avatar: computedAvatar,
      content: dbComment.content || text, 
      text: dbComment.content || text, // Fallback de sécurité
      createdAt: dbComment.createdAt || new Date().toISOString(),
      likes: 0
    };

    // ── MISE À JOUR SYNCHRONE DES ÉTATS GLOBAUX ───────────────────────────
    const updateState = p => {
      const pId = p.id || p.project_id;
      if (String(pId) !== String(projectId)) return p;
      
      // On s'assure que tous les commentaires existants ont bien la propriété 'content'
      const existingComments = (p.comments || []).map(c => ({
        ...c,
        content: c.content || c.text || "" 
      }));

      return {
        ...p,
        comments: [...existingComments, processedComment],
        commentsCount: (p.commentsCount || p.comments_count || existingComments.length) + 1
      };
    };

    // 1. Met à jour la liste dans le catalogue
    setProjects(prev => prev.map(updateState));
    
    // 2. Met à jour de manière critique le projet actuellement affiché sur l'écran
    setSelectedProject(prev => {
      if (!prev) return prev;
      const prevId = prev.id || prev.project_id || prev.data?.id;
      return String(prevId) !== String(projectId) ? prev : updateState(prev);
    });

    showToast("Commentaire ajouté !", "success");
  } catch (error) {
    console.error("Erreur d'ajout du commentaire:", error);
    showToast("Erreur lors de l'envoi du commentaire", "error");
  }
}, [getAccessToken, showToast]);

  const incrementShare = useCallback((projectId) => {
    setProjects(prev => prev.map(p => {
      const pId = p.id || p.project_id;
      return String(pId) !== String(projectId) ? p : { ...p, shareCount: (p.shareCount || 0) + 1 };
    }));
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

  // ─── Annonces Investisseurs ───────────────────────────────
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

  // ─── Soumission KYC via FormData sécurisé et clés mappées ───
  const submitKyc = useCallback(async (docs) => {
    try {
      const formData = new FormData();
      
      const keyMapping = {
        cniFile: "cni_file",
        selfieFile: "selfie", 
        certifScol: "certif_scol",
        carteEtu: "carte_etu",
        repCniFile: "rep_cni_file",
        domicile: "domicile",
        rccmFile: "rccm_file"
      };

      Object.entries(docs).forEach(([key, value]) => {
        const backendKey = keyMapping[key] || key;
        if (value instanceof File) {
          formData.append(backendKey, value);
        } else if (value !== undefined && value !== null) {
          formData.append(backendKey, String(value));
        }
      });

      await kycApi.submit(formData);

      setKycDocs(docs);
      setCurrentUser(u => ({ ...u, kycStatus: "submitted" }));
      showToast("Documents envoyés ! Résultat sous 24–48h.", "info");

    } catch (error) {
      const serverMessage = error.data?.message || error.message;
      showToast(serverMessage || "Erreur lors de la soumission.", "error");
      throw error;
    }
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
    getAccessToken,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}