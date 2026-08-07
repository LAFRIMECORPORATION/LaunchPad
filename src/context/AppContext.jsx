// ============================================================
// LAUNCHPAD — AppContext.jsx
// État global + navigation React Router + authentification API
// ============================================================

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  authApi,
  kycApi,
  messagesApi,
  projectsApi,
  notificationsApi,
  investorRequestsApi,
  setAccessToken,
  clearAccessToken,
} from "../utils/api";
import { connectSocket, disconnectSocket, getSocket } from "../utils/socket";
import { getPathForPage, getPageFromPath } from "../config/routes";

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
    [location.pathname],
  );

  // ─── Projets & Flux d'Interactions ────────────────────────
  const [projects, setProjects] = useState([]);
  const [savedProjects, setSavedProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  // ─── Annonces Investisseurs ───────────────────────────────
  const [investorRequests, setInvestorRequests] = useState([]);

  // ─── Documents KYC ────────────────────────────────────────
  const [kycDocs, setKycDocs] = useState([]);

  // ─── Notifications & Messagerie ───────────────────────────
  const [notifications, setNotifications] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeConvId, setActiveConvId] = useState(1);
  const [pendingConversation, setPendingConversation] = useState(null);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

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
  const navigate = useCallback(
    (page, opts = {}) => {
      if (opts.project) setSelectedProject(opts.project);
      if (opts.collab !== undefined) setCollabStep(opts.collab);
      if (opts.collabStep !== undefined) setCollabStep(opts.collabStep);
      if (opts.target) setCollabTarget(opts.target);
      if (opts.collabTarget) setCollabTarget(opts.collabTarget);
      if (opts.teamContact) setTeamContact(opts.teamContact);
      if (opts.targetUserId)
        setPendingConversation({ targetUserId: opts.targetUserId });
      if (opts.targetConversationId)
        setPendingConversation({ conversationId: opts.targetConversationId });

      const nextPath = page.startsWith("/") ? page : getPathForPage(page, opts);
      routerNavigate(nextPath, {
        state: opts.state,
      });
      window.scrollTo(0, 0);
    },
    [routerNavigate],
  );

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

        // Connecter Socket.io après réhydratation
        connectSocket();

        if (window.location.pathname === "/" || currentPage === "home") {
          const dashMap = {
            student: "dashboard-student",
            investor: "dashboard-investor",
            admin: "admin",
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
  const login = useCallback(
    async (credentials) => {
      try {
        if (typeof credentials === "string") {
          setCurrentUser({
            role: credentials,
            name: `Démo ${credentials}`,
            kycValidated: true,
          });
          const dashMap = {
            student: "dashboard-student",
            investor: "dashboard-investor",
            admin: "admin",
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

        // Connecter Socket.io après login
        connectSocket();

        showToast(`Ravi de vous revoir !`, "success");

        const dashMap = {
          student: "dashboard-student",
          investor: "dashboard-investor",
          admin: "admin",
        };
        navigate(dashMap[user.role] || "home");
      } catch (error) {
        showToast(error.message || "Erreur de connexion.", "error");
        throw error;
      }
    },
    [navigate, showToast],
  );

  // ─── Enregistrement de compte branché sur l'API ─────────────
  const registerAccount = useCallback(
    async (payload) => {
      try {
        const response = await authApi.register(payload);
        const { user, accessToken, refreshToken } = response.data;

        setAccessToken(accessToken);
        localStorage.setItem("launchpad_access_token", accessToken);
        localStorage.setItem("launchpad_refresh_token", refreshToken);
        setCurrentUser(user);

        // Connecter Socket.io après register
        connectSocket();

        const dashMap = {
          student: "dashboard-student",
          investor: "dashboard-investor",
          admin: "admin",
        };
        navigate(dashMap[user.role] || "home");
        showToast("Compte créé avec succès !", "success");
        return user;
      } catch (error) {
        showToast(
          error.message || "Erreur lors de la création du compte.",
          "error",
        );
        throw error;
      }
    },
    [navigate, showToast],
  );

  // ─── Fonction de déconnexion ──────────────────────────────
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignorer les erreurs de logout
    } finally {
      // Déconnecter Socket.io
      disconnectSocket();

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

  // ─── Flux d'Interactions Projets (Branchés sur le Backend Neon) ───
  const toggleLike = useCallback(
    async (projectId) => {
      // 1. Mise à jour optimiste immédiate de l'interface graphique
      setProjects((prev) =>
        prev.map((p) => {
          if (p.id !== projectId) return p;
          const willBeLiked = !p.likedByMe;
          return {
            ...p,
            likedByMe: willBeLiked,
            likes: willBeLiked
              ? (p.likes || 0) + 1
              : Math.max(0, (p.likes || 0) - 1),
          };
        }),
      );

      setSelectedProject((prev) => {
        if (!prev || prev.id !== projectId) return prev;
        const willBeLiked = !prev.likedByMe;
        return {
          ...prev,
          likedByMe: willBeLiked,
          likes: willBeLiked
            ? (prev.likes || 0) + 1
            : Math.max(0, (prev.likes || 0) - 1),
        };
      });

      // 2. Persistance asynchrone en base de données et recalibrage
      try {
        const jsonRes = await projectsApi.like(projectId);
        
        // On extrait la charge utile selon la structure de ton service (déballée ou imbriquée sous "project")
        const backendPayload = jsonRes.project || jsonRes.data || jsonRes;

        if (
          backendPayload &&
          (backendPayload.likesCount !== undefined ||
            backendPayload.likes !== undefined)
        ) {
          const serverLikes =
            backendPayload.likesCount !== undefined
              ? backendPayload.likesCount
              : backendPayload.likes;
          const serverLiked = backendPayload.likedByMe;

          const syncState = (p) =>
            p.id !== projectId
              ? p
              : { ...p, likes: serverLikes, likedByMe: serverLiked };
          setProjects((prev) => prev.map(syncState));
          setSelectedProject((prev) =>
            prev && prev.id === projectId
              ? { ...prev, likes: serverLikes, likedByMe: serverLiked }
              : prev,
          );
        }
      } catch (error) {
        console.error("Erreur d'enregistrement du Like:", error);
        // Rollback en cas d'erreur
        setProjects((prev) =>
          prev.map((p) =>
            p.id !== projectId
              ? p
              : { ...p, likedByMe: !p.likedByMe, likes: Math.max(0, (p.likes || 0) - 1) }
          )
        );
        throw error;
      }
    },
    [getAccessToken],
  );

  const addComment = useCallback(
    async (projectId, text, user) => {
      try {
        const jsonRes = await projectsApi.comment(projectId, text);

        // 🛡️ Extraction sécurisée : s'adapte à la structure enveloppée ou brute du contrôleur
        const dbComment = jsonRes.data?.comment || jsonRes.comment || jsonRes.data || jsonRes;

        if (!dbComment?.id) {
          throw new Error("Le serveur n'a pas renvoyé l'identifiant du commentaire.");
        }

        const processedComment = {
          id: dbComment.id,
          author: dbComment.author?.firstName || dbComment.author?.first_name
            ? `${dbComment.author.firstName || dbComment.author.first_name} ${dbComment.author.lastName || dbComment.author.last_name || ""}`
            : user?.firstName || user?.name || "Anonyme",
          avatar:
            dbComment.author?.avatarUrl || dbComment.author?.avatar_url ||
            dbComment.author?.avatar ||
            user?.avatarUrl || user?.avatar ||
            user?.firstName?.[0] || "??",
          text: dbComment.content || dbComment.text || text,
          time: "À l'instant",
          likes: 0,
          likedByMe: false,
        };

        setProjects((prev) =>
          prev.map((p) => {
            if (p.id !== projectId) return p;
            return {
              ...p,
              comments: [...(p.comments || []), processedComment],
            };
          }),
        );

        setSelectedProject((prev) => {
          if (!prev || prev.id !== projectId) return prev;
          return {
            ...prev,
            comments: [...(prev.comments || []), processedComment],
          };
        });

        showToast("Commentaire ajouté !", "success");
      } catch (error) {
        console.error("Erreur d'ajout du commentaire:", error);
        showToast("Erreur lors de l'envoi du commentaire", "error");
        throw error;
      }
    },
    [getAccessToken, showToast],
  );

  const incrementShare = useCallback((projectId) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id !== projectId ? p : { ...p, shareCount: (p.shareCount || 0) + 1 },
      ),
    );
  }, []);

  const toggleSave = useCallback(async (projectId) => {
    // Mise à jour optimiste immédiate
    setSavedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId],
    );
    try {
      await projectsApi.save(projectId);
    } catch (error) {
      // Annuler en cas d'erreur API
      setSavedProjects((prev) =>
        prev.includes(projectId)
          ? prev.filter((id) => id !== projectId)
          : [...prev, projectId],
      );
      console.error("Erreur sauvegarde projet :", error);
    }
  }, []);

  const isProjectSaved = useCallback(
    (projectId) => {
      return savedProjects.includes(projectId);
    },
    [savedProjects],
  );

  const isSaved = isProjectSaved;

  // ─── Annonces Investisseurs ───────────────────────────────
  const addInvestorRequest = useCallback(
    async (request) => {
      try {
        const res = await investorRequestsApi.create(request);
        const newRequest = res?.request ?? res?.data ?? res;
        setInvestorRequests((prev) => [newRequest, ...prev]);
        showToast("Votre annonce a été publiée avec succès !", "success");
        return newRequest;
      } catch (error) {
        showToast(error.message || "Erreur lors de la publication.", "error");
        throw error;
      }
    },
    [showToast],
  );

  const applyToRequest = useCallback(
    async (requestId) => {
      // Mise à jour optimiste
      setInvestorRequests((prev) =>
        prev.map((r) =>
          r.id !== requestId
            ? r
            : { ...r, applicants: (r.applicants || 0) + 1 },
        ),
      );
      try {
        await investorRequestsApi.apply(requestId);
        showToast(
          "Votre candidature a bien été envoyée à l'investisseur !",
          "success",
        );
      } catch (error) {
        // Annuler en cas d'échec
        setInvestorRequests((prev) =>
          prev.map((r) =>
            r.id !== requestId
              ? r
              : { ...r, applicants: Math.max(0, (r.applicants || 1) - 1) },
          ),
        );
        showToast(error.message || "Erreur lors de la candidature.", "error");
      }
    },
    [showToast],
  );

  // ─── Soumission KYC via FormData sécurisé et clés mappées ───
  const submitKyc = useCallback(
    async (docs) => {
      try {
        const formData = new FormData();

        const keyMapping = {
          cniFile: "cni_file",
          selfieFile: "selfie",
          certifScol: "certif_scol",
          carteEtu: "carte_etu",
          repCniFile: "rep_cni_file",
          domicile: "domicile",
          rccmFile: "rccm_file",
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
        setCurrentUser((u) => ({ ...u, kycStatus: "submitted" }));
        showToast("Documents envoyés ! Résultat sous 24–48h.", "info");
      } catch (error) {
        const serverMessage = error.data?.message || error.message;
        showToast(serverMessage || "Erreur lors de la soumission.", "error");
        throw error;
      }
    },
    [showToast],
  );

  const approveKyc = useCallback(() => {
    setCurrentUser((u) => ({
      ...u,
      kycValidated: true,
      kycStatus: "approved",
    }));
    showToast(
      "✅ KYC validé ! Vous avez maintenant accès à toutes les fonctionnalités.",
      "success",
    );
  }, [showToast]);

  const requireKyc = useCallback(() => {
    if (!currentUser) return true;
    if (currentUser.role === "admin") return false;
    if (currentUser.kycValidated) return false;
    navigate("kyc-verification");
    return true;
  }, [currentUser, navigate]);

  // ─── Notifications ────────────────────────────────────────
  const unreadCount = notifications.filter((n) => n.unread).length;
  const markAllRead = useCallback(async () => {
    setNotifications((n) => n.map((x) => ({ ...x, unread: false })));
    try {
      await notificationsApi.markAllRead();
    } catch (error) {
      console.error("Erreur mark all read :", error);
    }
  }, []);

  useEffect(() => {
    if (!currentUser?.id) return;
    messagesApi
      .getUnreadCount()
      .then((res) => {
        const count = res?.data?.unread ?? res?.unread ?? 0;
        setUnreadMessagesCount(count);
      })
      .catch((err) => {
        console.error("Erreur chargement nombre de messages non lus :", err);
      });
  }, [currentUser?.id]);

  // ─── Chargement des données depuis l'API après login ─────
  useEffect(() => {
    if (!currentUser?.id) return;

    projectsApi
      .list()
      .then((res) => {
        const list = res?.projects ?? res?.data ?? res ?? [];
        setProjects(Array.isArray(list) ? list : []);
      })
      .catch((err) => console.error("Erreur chargement projets :", err));

    messagesApi
      .getConversations()
      .then((res) => {
        // Backend: success(res, { conversations }) → { data: { conversations: [...] } }
        const list = res?.data?.conversations ?? res?.conversations ?? [];
        setConversations(Array.isArray(list) ? list : []);
      })
      .catch((err) => console.error("Erreur chargement conversations :", err));

    notificationsApi
      .getAll()
      .then((res) => {
        // Backend: success(res, { notifications, total, unreadCount }) → { data: { notifications: [...] } }
        const list = res?.data?.notifications ?? res?.notifications ?? [];
        setNotifications(Array.isArray(list) ? list : []);
      })
      .catch((err) => console.error("Erreur chargement notifications :", err));

    investorRequestsApi
      .list()
      .then((res) => {
        // Backend: success(res, { requests, total, page, totalPages }) → { data: { requests: [...] } }
        const list = res?.data?.requests ?? res?.requests ?? [];
        setInvestorRequests(Array.isArray(list) ? list : []);
      })
      .catch((err) => console.error("Erreur chargement annonces :", err));
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser?.id) return;

    const socket = getSocket() || connectSocket();
    if (!socket) return;

    const handleUnreadUpdate = ({
      conversationId,
      increment = 0,
      reset = false,
    } = {}) => {
      if (reset) {
        // Re-fetch le total réel depuis l'API pour éviter les dérives
        messagesApi
          .getUnreadCount()
          .then((res) =>
            setUnreadMessagesCount(res?.data?.unread ?? res?.unread ?? 0),
          )
          .catch(() => { });
        // Remettre à 0 le badge de la conversation concernée
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId || c.id === Number(conversationId)
              ? { ...c, unreadCount: 0 }
              : c,
          ),
        );
      } else {
        setUnreadMessagesCount((prev) => Math.max(0, prev + increment));
      }
    };

    const handleNewMessage = ({ message, conversationId }) => {
      // Mettre à jour l'aperçu de la conversation dans la liste
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId || c.id === Number(conversationId)
            ? {
              ...c,
              lastMessage: message,
              updatedAt: message?.createdAt || new Date().toISOString(),
            }
            : c,
        ),
      );
      // Incrémenter le badge seulement si l'utilisateur n'est pas sur cette conversation
      if (currentPage !== "messages" || activeConvId !== conversationId) {
        setUnreadMessagesCount((prev) => prev + 1);
      }
    };

    socket.on("unread_update", handleUnreadUpdate);
    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("unread_update", handleUnreadUpdate);
      socket.off("new_message", handleNewMessage);
    };
  }, [currentUser?.id, currentPage, activeConvId]);

  // ─── Messagerie ───────────────────────────────────────────
  const unreadMessages = unreadMessagesCount;

  const sendMessage = useCallback(
    async (convId, text) => {
      try {
        const res = await messagesApi.send(convId, text);
        // Backend: created(res, { message }) → { data: { message: {...} }, message: "Message envoyé." }
        // res.message est la chaîne "Message envoyé.", l'objet message est dans res.data.message
        const message = res?.data?.message ?? res?.data ?? res;
        // Mettre à jour l'aperçu de la conversation dans la liste
        setConversations((prev) =>
          prev.map((c) =>
            c.id !== convId
              ? c
              : {
                ...c,
                lastMessage: message,
                updatedAt: message?.createdAt || new Date().toISOString(),
              },
          ),
        );
        return message;
      } catch (error) {
        console.error("Erreur envoi message :", error);
        showToast("Erreur lors de l'envoi du message", "error");
        throw error;
      }
    },
    [showToast],
  );

  // ─── Collaboration ────────────────────────────────────────
  const startCollabFlow = useCallback(() => {
    setCollabStep("detecting");
    setTimeout(() => setCollabStep("found"), 2000);
  }, []);

  const acceptCollab = useCallback(
    (targetProject) => {
      setCollabTarget(targetProject);
      setCollabStep("accepted");
      setTimeout(() => {
        setCollabStep("team");
        navigate("team-space");
      }, 1500);
    },
    [navigate],
  );

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
    setProjects,
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
    setUnreadMessagesCount,
    pendingConversation,
    setPendingConversation,

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
