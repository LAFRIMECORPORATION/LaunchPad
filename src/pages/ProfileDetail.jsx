// ============================================================
// LAUNCHPAD — Profile Detail Page (Dynamic User Profile)
// Chemin : src/pages/ProfileDetail.jsx
// ============================================================

import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Avatar, Badge, ProjectCard } from "../components/UI";
import { usersApi, messagesApi, projectsApi } from "../utils/api";
import "./OtherPages.css";

export default function ProfileDetail() {
  const { userId } = useParams();
  const location = useLocation();
  const { navigate, currentUser, showToast, updateCurrentUser } = useApp();

  const [user, setUser] = useState(null);
  const [userProjects, setUserProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef(null);
  const returnConversationId = location.state?.fromConversationId || null;

  // ── Charger le profil de l'utilisateur ──────────────────
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const targetId = userId || currentUser?.id;
        if (!targetId) return;

        const res = await usersApi.getById(targetId);
        const loadedUser = res.data?.user || res.data;
        setUser({
          ...loadedUser,
          profile: loadedUser?.profile || {},
          interests: Array.isArray(loadedUser?.interests)
            ? loadedUser.interests
            : Array.isArray(loadedUser?.profile?.interests)
              ? loadedUser.profile.interests
              : [],
        });
        setError(null);

        // Charger les projets de l'utilisateur (étudiant/auteur)
        projectsApi.list({ authorId: targetId, limit: 12 })
          .then(projRes => {
            const list = projRes.data?.projects || projRes.data || [];
            setUserProjects(Array.isArray(list) ? list : []);
          })
          .catch(() => setUserProjects([]));

      } catch (err) {
        console.error("Erreur chargement profil :", err);
        setError(err.message || "Impossible de charger le profil");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId, currentUser?.id]);

  // ── Upload de photo de couverture depuis le profil ─────
  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    try {
      setUploadingCover(true);
      const res = await usersApi.uploadCover(user.id, file);
      const coverUrl = res.data?.coverImageUrl || res.coverImageUrl || res.data?.profile?.coverImageUrl;
      setUser(prev => ({
        ...prev,
        profile: { ...prev.profile, coverImageUrl: coverUrl }
      }));
      if (currentUser?.id === user.id && typeof updateCurrentUser === "function") {
        updateCurrentUser({ profile: { ...currentUser.profile, coverImageUrl: coverUrl } });
      }
      showToast("Photo de couverture mise à jour !", "success");
    } catch (err) {
      showToast(err.message || "Erreur lors du changement de couverture.", "error");
    } finally {
      setUploadingCover(false);
    }
  };

  // ── Créer ou récupérer la conversation et rediriger ─────
  const startConversation = async () => {
    try {
      const res = await messagesApi.createDirect(user.id);
      const conv = res.data?.conversation || res.data;
      navigate("messages", { targetConversationId: conv.id });
    } catch (err) {
      console.error("Erreur création conversation :", err);
      showToast("Erreur lors du démarrage de la conversation", "error");
    }
  };

  if (loading) {
    return (
      <div className="animate-fadeUp" style={{ textAlign: "center", padding: 40 }}>
        <p style={{ color: "var(--text-secondary)" }}>Chargement du profil...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="animate-fadeUp" style={{ textAlign: "center", padding: 40 }}>
        <p style={{ color: "var(--error)" }}>❌ {error || "Profil non trouvé"}</p>
        <button className="btn btn-secondary" onClick={() => navigate("home")} style={{ marginTop: 20 }}>
          Retour à l'accueil
        </button>
      </div>
    );
  }

  const profile = user.profile || {};
  const interests = user.interests || profile.interests || [];
  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="animate-fadeUp">
      {returnConversationId && (
        <div style={{ marginBottom: 16 }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate("messages", { targetConversationId: returnConversationId })}
          >
            ← Retour à la discussion
          </button>
        </div>
      )}

      {/* ─── En-tête du profil avec photo de couverture modifiable ─── */}
      <div style={{ position: "relative", marginBottom: 60 }}>
        <div
          className="profile-cover"
          style={{
            backgroundImage: profile.coverImageUrl ? `url(${profile.coverImageUrl})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            backgroundColor: "var(--bg-secondary)",
          }}
        >
          {isOwnProfile && (
            <div style={{ position: "absolute", top: 12, right: 12 }}>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleCoverChange}
              />
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                style={{ background: "rgba(0,0,0,0.6)", color: "white", border: "none" }}
              >
                📷 {uploadingCover ? "Upload…" : "Changer la couverture"}
              </button>
            </div>
          )}
        </div>

        <div className="profile-avatar-wrap">
          <Avatar
            label={user.avatarUrl || user.firstName?.[0] || "U"}
            size="2xl"
            ring
            style={{ background: "linear-gradient(135deg, #22C55E, #5B73F5)" }}
          />
        </div>

        <div className="profile-header-bar" style={{ paddingLeft: 160 }}>
          <div>
            <div className="profile-name">
              {`${user.firstName || "Utilisateur"} ${user.lastName || ""}`.trim()}
            </div>
            <div className="profile-sub">
              {user.role === "investor" ? "Investisseur" : user.role === "student" ? "Étudiant" : "Utilisateur"}
              {profile.location ? ` · ${profile.location}` : ""}
            </div>
            <div style={{ marginTop: 10 }}>
              {user.kycValidated ? (
                <span className="kyc-badge kyc-badge--verified">✅ Compte vérifié</span>
              ) : (
                <span className="kyc-badge kyc-badge--pending">⚠️ Non vérifié</span>
              )}
            </div>
          </div>

          {!isOwnProfile && (
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary" onClick={startConversation}>
                💬 Écrire
              </button>
              <button className="btn btn-secondary" onClick={() => navigate("appointments", { targetUserId: user.id })}>
                📅 Fixer RDV
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Section principale ────────────────────────────── */}
      <div className="two-col">
        <div className="two-col-main" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* À propos */}
          <div className="card" style={{ padding: 22 }}>
            <div className="section-title" style={{ marginBottom: 12 }}>À propos</div>
            <p className="profile-about-text">
              {user.bio || profile.bio || "Aucune description disponible."}
            </p>
            {interests.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
                {interests.map((interest) => (
                  <Badge key={interest} color="green">{interest}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Domaines cibles pour Investisseurs */}
          {user.role === "investor" && (
            <div className="card" style={{ padding: 22 }}>
              <div className="section-title" style={{ marginBottom: 12 }}>💼 Domaines d'investissement visés</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {(interests.length > 0 ? interests : ["AgriTech", "FinTech", "HealthTech", "GreenTech"]).map(sector => (
                  <Badge key={sector} color="purple">{sector}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Projets publiés par l'étudiant / utilisateur */}
          <div className="card" style={{ padding: 22 }}>
            <div className="section-title" style={{ marginBottom: 14 }}>
              🚀 Projets publiés ({userProjects.length})
            </div>
            {userProjects.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
                Cet utilisateur n'a pas encore publié de projets.
              </p>
            ) : (
              <div className="grid-2">
                {userProjects.map(p => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    onClick={() => navigate("project-detail", { project: p })}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── Barre latérale ────────────────────────────── */}
        <div className="two-col-side">
          {user.role === "investor" && (
            <div className="card" style={{ padding: 20, marginBottom: 20 }}>
              <div className="section-title" style={{ marginBottom: 14 }}>Critères d'investissement</div>
              {[
                ["💰", "Ticket minimum", profile.minTicket ? `${Number(profile.minTicket).toLocaleString("fr-FR")} XAF` : "Non spécifié"],
                ["📈", "Ticket maximum", profile.maxTicket ? `${Number(profile.maxTicket).toLocaleString("fr-FR")} XAF` : "Non spécifié"],
                ["📊", "Stade privilégié", profile.stage || "MVP / Growth"],
                ["🌍", "Zones ciblées", profile.investmentRegions?.length ? profile.investmentRegions.join(", ") : "Cameroun (CEMAC)"],
              ].map(([icon, label, value]) => (
                <div key={label} className="profile-info-row" style={{ display: "flex", gap: 8, padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                  <span>{icon}</span>
                  <span style={{ color: "var(--text-secondary)", flex: 1 }}>{label}</span>
                  <span style={{ fontWeight: 700 }}>{value}</span>
                </div>
              ))}
            </div>
          )}

          <div className="card" style={{ padding: 20 }}>
            <div className="section-title" style={{ marginBottom: 12 }}>Informations</div>
            {[
              ["📅", "Membre depuis", user.createdAt ? new Date(user.createdAt).toLocaleDateString("fr-FR") : "—"],
              ["🏢", "Société / Université", profile.company || profile.university || "Non spécifié"],
              ["📍", "Localisation", profile.location || "Cameroun"],
            ].map(([icon, label, value]) => (
              <div key={label} className="profile-info-row" style={{ display: "flex", gap: 8, padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                <span>{icon}</span>
                <span style={{ color: "var(--text-secondary)", flex: 1 }}>{label}</span>
                <span style={{ fontWeight: 700 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
