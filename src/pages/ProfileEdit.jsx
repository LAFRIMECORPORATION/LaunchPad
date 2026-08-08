import { useMemo, useRef, useState } from "react";
import { useApp } from "../context/AppContext";
import { usersApi } from "../utils/api";
import "./OtherPages.css";

export default function ProfileEdit() {
  const { currentUser, navigate, showToast, updateCurrentUser } = useApp();
  const profile = currentUser?.profile || {};
  const avatarInput = useRef(null);
  const coverInput = useRef(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState("");
  const [form, setForm] = useState(() => ({
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    bio: currentUser?.bio || "",
    university: profile.university || "",
    company: profile.company || "",
    location: profile.location || "",
    linkedinUrl: profile.linkedinUrl || "",
    githubUrl: profile.githubUrl || "",
    portfolioUrl: profile.portfolioUrl || "",
    interests: (profile.interests || []).join(", "),
    skills: (profile.skills || []).join(", "),
    investmentRegions: (profile.investmentRegions || []).join(", "),
  }));

  const isInvestor = currentUser?.role === "investor";
  const coverUrl = profile.coverImageUrl;
  const avatarUrl = currentUser?.avatarUrl;
  const initials = useMemo(() => `${form.firstName?.[0] || "U"}${form.lastName?.[0] || ""}`.toUpperCase(), [form.firstName, form.lastName]);

  function update(field, value) { setForm(current => ({ ...current, [field]: value })); }
  function list(value) { return value.split(",").map(item => item.trim()).filter(Boolean); }

  async function saveProfile(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        bio: form.bio.trim(),
        profile: {
          university: form.university.trim() || undefined,
          company: form.company.trim() || undefined,
          location: form.location.trim() || undefined,
          linkedinUrl: form.linkedinUrl.trim() || undefined,
          githubUrl: form.githubUrl.trim() || undefined,
          portfolioUrl: form.portfolioUrl.trim() || undefined,
          interests: list(form.interests),
          skills: list(form.skills),
          investmentRegions: list(form.investmentRegions),
        },
      };
      const response = await usersApi.update(currentUser.id, payload);
      const updated = response.data?.user || response.user || response.data || response;
      updateCurrentUser?.({ ...currentUser, ...updated, profile: { ...currentUser.profile, ...payload.profile } });
      showToast("Profil mis à jour.", "success");
      navigate(isInvestor ? "profile-investor" : "profile-student");
    } catch (error) {
      showToast(error.message || "Impossible de mettre à jour le profil.", "error");
    } finally { setSaving(false); }
  }

  async function upload(kind, file) {
    if (!file) return;
    setUploading(kind);
    try {
      const response = kind === "avatar"
        ? await usersApi.uploadAvatar(currentUser.id, file)
        : await usersApi.uploadCover(currentUser.id, file);
      const updated = response.data?.user || response.user || response.data || response;
      
      if (kind === "avatar") {
        updateCurrentUser?.({ ...currentUser, avatarUrl: updated.avatarUrl });
      } else {
        updateCurrentUser?.({ 
          ...currentUser, 
          profile: { ...currentUser.profile, coverImageUrl: updated.coverImageUrl } 
        });
      }
      
      showToast(kind === "avatar" ? "Photo de profil mise à jour." : "Photo de couverture mise à jour.", "success");
    } catch (error) {
      showToast(error.message || "Erreur lors de l'envoi de la photo.", "error");
    } finally { setUploading(""); }
  }

  if (!currentUser) return null;

  return (
    <div className="profile-edit-page animate-fadeUp">
      <div className="profile-edit-hero">
        <div className="profile-edit-cover" style={coverUrl ? { backgroundImage: `url(${coverUrl})` } : undefined}>
          <span className="profile-edit-cover-label">Photo de couverture</span>
          <button type="button" className="profile-edit-photo-btn" onClick={() => coverInput.current?.click()} disabled={uploading === "cover"}>
            {uploading === "cover" ? "Envoi…" : "📷 Modifier"}
          </button>
          <input ref={coverInput} hidden type="file" accept="image/*" onChange={event => upload("cover", event.target.files?.[0])} />
        </div>
        <div className="profile-edit-avatar-wrap">
          <div className="profile-edit-avatar" style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}>{!avatarUrl && initials}</div>
          <button type="button" className="profile-edit-avatar-btn" onClick={() => avatarInput.current?.click()} disabled={uploading === "avatar"}>
            {uploading === "avatar" ? "…" : "📷"}
          </button>
          <input ref={avatarInput} hidden type="file" accept="image/*" onChange={event => upload("avatar", event.target.files?.[0])} />
        </div>
        <div className="profile-edit-hero-copy">
          <span className="profile-edit-eyebrow">Votre espace personnel</span>
          <h1>Modifier le profil</h1>
          <p>{isInvestor ? "Présentez votre thèse et vos critères pour recevoir de meilleures opportunités." : "Mettez en valeur votre parcours, vos compétences et vos projets."}</p>
        </div>
      </div>

      <form className="profile-edit-form card" onSubmit={saveProfile}>
        <div className="profile-edit-section"><h2>Identité</h2><p>Les informations visibles sur votre profil public.</p></div>
        <div className="profile-edit-grid">
          <label>Prénom<input value={form.firstName} onChange={event => update("firstName", event.target.value)} required /></label>
          <label>Nom<input value={form.lastName} onChange={event => update("lastName", event.target.value)} required /></label>
          <label className="profile-edit-full">Présentation<textarea rows="4" value={form.bio} onChange={event => update("bio", event.target.value)} placeholder="Parlez de vous en quelques lignes…" /></label>
          <label>Localisation<input value={form.location} onChange={event => update("location", event.target.value)} placeholder="Douala, Cameroun" /></label>
          <label>{isInvestor ? "Entreprise" : "Université"}<input value={isInvestor ? form.company : form.university} onChange={event => update(isInvestor ? "company" : "university", event.target.value)} /></label>
        </div>

        <div className="profile-edit-section"><h2>{isInvestor ? "Thèse d’investissement" : "Compétences"}</h2><p>Séparez les éléments par des virgules.</p></div>
        <div className="profile-edit-grid">
          <label className="profile-edit-full">{isInvestor ? "Secteurs et régions ciblés" : "Compétences"}<input value={isInvestor ? form.investmentRegions : form.skills} onChange={event => update(isInvestor ? "investmentRegions" : "skills", event.target.value)} placeholder={isInvestor ? "FinTech, Cameroun, CEMAC" : "React, Design, Marketing"} /></label>
          <label className="profile-edit-full">Centres d'intérêt<input value={form.interests} onChange={event => update("interests", event.target.value)} /></label>
        </div>

        <div className="profile-edit-section"><h2>Liens professionnels</h2><p>Ajoutez vos profils publics pour renforcer votre crédibilité.</p></div>
        <div className="profile-edit-grid">
          <label>LinkedIn<input type="url" value={form.linkedinUrl} onChange={event => update("linkedinUrl", event.target.value)} placeholder="https://linkedin.com/in/..." /></label>
          <label>GitHub<input type="url" value={form.githubUrl} onChange={event => update("githubUrl", event.target.value)} placeholder="https://github.com/..." /></label>
          <label className="profile-edit-full">Portfolio<input type="url" value={form.portfolioUrl} onChange={event => update("portfolioUrl", event.target.value)} placeholder="https://..." /></label>
        </div>

        <div className="profile-edit-actions"><button type="button" className="btn btn-secondary" onClick={() => navigate(isInvestor ? "profile-investor" : "profile-student")} disabled={saving}>Annuler</button><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer les modifications"}</button></div>
      </form>
    </div>
  );
}
