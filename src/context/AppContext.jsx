// ============================================================
// LAUNCHPAD — AppContext.jsx
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
        localStorage.setItem("launchpad_refresh_token", newRefresh);
        setCurrentUser(user);

        // Rediriger vers le dashboard si sur la page home
        if (window.location.pathname === "/" || currentPage === "home") {
          const dashMap = {
            student:  "dashboard-student",
            investor: "dashboard-investor",
            admin:    "admin",
          };
          navigate(dashMap[user.role] || "home");
        }
      } catch {
        // Token invalide ou expiré → déconnexion silencieuse
        localStorage.removeItem("launchpad_refresh_token");
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
      // Si on reçoit une string (role) → mode démo (mockData)
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

      // Appel API réel
      const response = await authApi.login(credentials);
      const { user, accessToken, refreshToken } = response.data;

      // Stocker les tokens
      setAccessToken(accessToken);
      localStorage.setItem("launchpad_refresh_token", refreshToken);

      // Mettre à jour le state
      setCurrentUser(user);
      showToast(`Ravi de vous revoir !`, "success");

      // Rediriger
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
      // Ignorer les erreurs de logout (token déjà expiré, etc.)
    } finally {
      clearAccessToken();
      localStorage.removeItem("launchpad_refresh_token");
      setCurrentUser(null);
      setCollabStep("found");
      setCollabTarget(null);
      setSavedProjects([]);
      navigate("home");
    }
  }, [navigate]);

  // ─── Flux d'Interactions Projets ───────────────────────────
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

  // ─── Soumission KYC via FormData sécurisé ──────────────────
 // ─── Soumission KYC via FormData sécurisé et clés mappées ───
  const submitKyc = useCallback(async (docs) => {
    try {
      const formData = new FormData();
      
      // Dictionnaire de correspondance Frontend (camelCase) -> Backend (snake_case)
      const keyMapping = {
        cniFile: "cni_file",
        selfieFile: "selfie", // Aligne-le selon le nom de ton state frontend (ex: selfie ou selfieFile)
        certifScol: "certif_scol",
        carteEtu: "carte_etu",
        // Clés investisseurs au cas où :
        repCniFile: "rep_cni_file",
        domicile: "domicile",
        rccmFile: "rccm_file"
      };

      Object.entries(docs).forEach(([key, value]) => {
        // On récupère le nom attendu par le backend, sinon on garde la clé d'origine
        const backendKey = keyMapping[key] || key;

        if (value instanceof File) {
          formData.append(backendKey, value);
        } else if (value !== undefined && value !== null) {
          formData.append(backendKey, String(value));
        }
      });

      // L'appel utilise à présent api.postFormData de manière native et sécurisée
      await kycApi.submit(formData);

      // Mettre à jour l'état local si le serveur valide la requête
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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}