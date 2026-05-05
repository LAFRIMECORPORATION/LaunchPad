// ============================================================
// LAUNCHPAD — AppContext
// ============================================================

import { createContext, useContext, useState, useCallback } from "react";
import { USERS, NOTIFICATIONS, CONVERSATIONS, PROJECTS, SAVED_PROJECTS, INVESTOR_REQUESTS } from "../data/mockData";


const AppContext = createContext(null);

export function AppProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [projects, setProjects] = useState(PROJECTS)
    const [currentPage, setCurrentPage] = useState("home");
    const [pageHistory, setPageHistory] = useState([]);
    const [notifications, setNotifications] = useState(NOTIFICATIONS);
    const [conversations, setConversations] = useState(CONVERSATIONS);
    const [activeConvId, setActiveConvId] = useState(1);
    const [selProject, setSelProject] = useState(null);
    const [collabStep, setCollabStep] = useState("found");
    const [collabTarget, setCollabTarget] = useState(null);
    const [toast, setToast] = useState(null);
    const [savedProjects, setSavedProjects] = useState(SAVED_PROJECTS)
    const [investorRequests, setInvestorRequests] = useState(INVESTOR_REQUESTS);

    // Sauvegarder / unsave un projet
    const toggleSave = useCallback((projectId) => {
        setSavedProjects(prev =>
            prev.includes(projectId)
                ? prev.filter(id => id !== projectId)
                : [...prev, projectId]
        );
    }, [setSavedProjects]);

    const isProjectSaved = useCallback((projectId) => {
        return savedProjects.includes(projectId);
    }, [savedProjects]);

    // Ajouter une investor request
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
    }, [setInvestorRequests]);

    // Postuler à une request
    const applyToRequest = useCallback((requestId) => {
        setInvestorRequests(prev => prev.map(r =>
            r.id !== requestId ? r : { ...r, applicants: r.applicants + 1 }
        ));
    }, [setInvestorRequests]);


    /* ── Navigation ── */
    const navigate = useCallback((page, opts = {}) => {
        setPageHistory(h => [...h, currentPage]);
        setCurrentPage(page);
        if (opts.project) setSelProject(opts.project);
        if (opts.collab) setCollabStep(opts.collab);
        if (opts.target) setCollabTarget(opts.target);
        window.scrollTo(0, 0);
    }, [currentPage]);

    const goBack = useCallback(() => {
        setPageHistory(h => {
            if (!h.length) return h;
            setCurrentPage(h[h.length - 1]);
            return h.slice(0, -1);
        });
    }, []);

    {/* gestion des likes et commentaire*/ }

    const toggleLike = useCallback((projectId) => {
        setProjects(prev => prev.map(p => {
            if (p.id !== projectId) return p;
            return {
                ...p,
                likedByMe: !p.likedByMe,
                likes: p.likedByMe ? p.likes - 1 : p.likes + 1,
            }
        }))
    }, []);

    const addComment = useCallback((projectId, text, user) => {
        setProjects(prev => prev.map(p => {
            if (p.id !== projectId) return p;
            const newComment = {
                id: Date.now(),
                author: user?.name || "Anonyme",
                avatar: user?.avatar || "??",
                text,
                time: "A l instant",
                likes: 0,
            }
            return { ...p, comments: [...p.comments, newComment] };
        }))
    }, []);

    const incrementShare = useCallback((projectId) => {
        setProjects(prev => prev.map(p => p.id !== projectId ? p : {
            ...p, shareCount: p.shareCount + 1
        }))
    }, [])



    /* ── Auth ── */
    const login = useCallback((role) => {

        // nettoie la valeur recue

        const cleanRole = role?.toString().trim().toLowerCase();
        console.log("login() recu :", role);
        console.log("login() nettoyé :", cleanRole)
        // verifie que le role est valide
        const validRoles = ["student", "investor", "admin"];
        if (!validRoles.includes(cleanRole)) {
            console.error("Role invalide :", cleanRole);
            return
        }
        // definit l utilisateur  connecté 
        const user = USERS[cleanRole];
        setCurrentUser(user);
        // redirectio selon le role
        const redirectMap = {
            student: "dashboard-student",
            investor: "dashboard-investor",
            admin: "admin",



        }

        const destination = redirectMap[cleanRole];

        setCurrentPage(user)
        setPageHistory([]);

        setTimeout(() => {
            // reset l historique et redirige

            setCurrentPage(destination);
            window.scrollTo(0, 0);
        }, 50)

    }, []);

    const logout = useCallback(() => {
        setCurrentUser(null);
        setCollabStep("found");
        setCurrentPage("home");
        setPageHistory([]);
        window.scrollTo(0, 0)
    }, []);

    // verifie si l utilisateur peut acceder a une page





    /* ── Notifications ── */
    const unreadCount = notifications.filter(n => n.unread).length;
    const markAllRead = useCallback(() => {
        setNotifications(n => n.map(x => ({ ...x, unread: false })));
    }, []);

    /* ── Messages ── */
    const unreadMessages = conversations.reduce((acc, c) => acc + c.unread, 0);
    const sendMessage = useCallback((convId, text) => {
        setConversations(prev => prev.map(c =>
            c.id !== convId ? c : {
                ...c,
                unread: 0,
                lastTime: "À l'instant",
                messages: [...c.messages, { id: Date.now(), from: "me", text, time: "À l'instant", me: true }],
            }
        ));
    }, []);

    /* ── Toast ── */
    const showToast = useCallback((message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3500);
    }, []);

    const value = {
        currentUser,
        currentPage,
        pageHistory,
        navigate,
        goBack,
        login,
        logout,
        notifications,
        unreadCount,
        markAllRead,
        conversations,
        activeConvId,
        setActiveConvId,
        sendMessage,
        unreadMessages,
        selProject,
        setSelProject,
        collabStep,
        setCollabStep,
        collabTarget,
        setCollabTarget,
        toast,
        showToast,
        projects,
        toggleLike,
        addComment,
        incrementShare,
        savedProjects,
        toggleSave,
        isProjectSaved,
        investorRequests,
        addInvestorRequest,
        applyToRequest,

    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useApp must be used within AppProvider");
    return ctx;
}