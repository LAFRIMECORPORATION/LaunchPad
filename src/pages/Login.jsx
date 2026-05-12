import { useState } from "react";
import { useApp } from "../context/AppContext";
import "./Auth.css"

export default function Login() {
    const { navigate, login } = useApp();
    const [role, setRole] = useState("student");
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("");

    function handlesubmit() {
        if (!email || !password) {
            setError("veuillez remplir tous les champs.");
            return;
        }
        // login gere maintenant la redirection automatique

        login(role);
    }

    return (
        <div className="auth-layout">

            {/* -- panneau decoratif --*/}
            <div className="auth-deco">

                <div className="auth-deco-title">Rejoignez l ecosysteme etudiant</div>
                <div className="auth-deco-sub">
                    Des milliers de startups etudiantes trouvent leurs premiers investisseurs sur Launchpad.
                </div>
                {[
                    ["🚀", "2 400+", "Étudiants actifs"],
                    ["💰", "€2.4M", "Financements levés"],
                    ["🤝", "380+", "Projets financés"],

                ].map(([ico, val, lbl]) => (
                    <div key={lbl} className="auth-deco-stat">
                        <span className="auth-deco-stat-icon"> {ico}

                        </span>
                        <div>
                            <div className="auth-deco-stat-val"> {val} </div>
                            <div className="auth-deco-stat-label"> {lbl} </div>
                        </div>

                    </div>
                ))}

            </div>

            {/* -- formulaire -- */}

            <div className="auth-panel">

                <div className="auth-card animate-fadeUp">

                    <div className="auth-logo" onClick={() => navigate("home")}>
                        Launchpad
                    </div>
                    <h1 className="auth*title">bon retour🤝</h1>
                    <p className="auth-sub">connectez vous a votre espace.</p>

                    <div className="auth-form">

                        {/* role toggle*/}
                        <div className="auth-role-toggle">
                            {[["student", "🎓 Étudiant"], ["investor", "💼 Investisseur"], ["admin", "⚙️ Admin"]].map(([r, l]) => (
                                <button key={r} className={`auth-role-btn${role === r ? " active" : ""}`}
                                    onClick={() => setRole(r)}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>

                        {/* email */}

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input className="form-input" type="email" placeholder="votre@email.com"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setError(""); }} />
                        </div>

                        {/* Password*/}
                        <div className="form-group">

                            <div style={{ display: "flex", justifyContent: "space-between" }}>

                                <label className="form-label"> Mot de passe</label>
                                <span className="auth-link" style={{ fontSize: 12 }} > oublié?</span>

                            </div>
                            <input className="form-input" type="password"
                                placeholder="********"
                                value={password}
                                onChange={e => { setPassword(e.target.value); setError(""); }} />

                        </div>

                        {error && <p style={{ fontSize: 12, color: "var (--danger) " }}> {error} </p>}

                        <button className="btn btn-primary btn-full btn-lg" onClick={handlesubmit}>

                            se connecter

                        </button>
                        <div className="divider-text">ou</div>
                        <button className="btn btn-secondary btn-full"> continuer avec Google</button>


                    </div>

                    <p className="auth-footer-text"> pas encore de compte? {""} <span className="auth-link" onClick={() => navigate("register")}></span> s inscrire gratuitement </p>
                </div>
            </div>

        </div>
    )

}