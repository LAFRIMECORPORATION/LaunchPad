import { useApp } from "../context/AppContext";
import { ProjectCard } from "../components/UI";
import { PROJECTS } from "..//data/mockData";
import "./Home.css";

export default function Home() {
    const { navigate } = useApp();

    return (

        <div className="animate-fadeUp">

            {/* -- HERO --*/}

            <section className="home-hero">

                <div className="home-hero-glow" />
                <div className="home-hero-inner">

                    <div className="home-eyebrow">
                        la plateforme #1 pour les startups etudiantes
                    </div>

                    <h1 className="home-h1">
                        Connectez vos idées aux {" "}
                        <span className="gradient-text">bons investisseurs</span>
                    </h1>

                    <p className="home-lead">
                        Launchpad connecte les etudiants innovants avec des investisseurs visionnaires. Publiez vos projets, trouvez des co-fondateurs, levez des fonds
                    </p>
                    <div className="home-cta-row">

                        <button className="btn btn-primary btn-xl" onClick={() => navigate("register")}>
                            creer mon compte gratuitement
                        </button>
                        <button className="btn btn-secondary btn-xl" onClick={() => navigate("explore")}>
                            Explorer les projets
                        </button>

                    </div>
                    {/* stats strip */}

                    <div className="home-stats">
                        {[
                            ["2 400+", "Etudiants inscrits"],
                            ["380+", "Projets publiés"],
                            ["140+", "investisseurs actifs"],
                            ["2.4M fcfa", "financements lévés"],
                        ].map(([v, l]) => (

                            <div key={l} className="home-stat">
                                <div className="home-stat-value"> {v} </div>
                                <div className="home-stat-label"> {l} </div>

                            </div>

                        ))}

                    </div>

                </div>


            </section>

            {/* -- comment ca marche --*/}

            <section className="home-section" >
                <h2 className="home-section-title">comment ca marche</h2>
                <div className="home-how-grid">
                    {[
                        { n: "01", icon: "✍️", title: "Créez votre profil", desc: "Inscrivez-vous en tant qu'étudiant ou investisseur en quelques minutes." },
                        { n: "02", icon: "📦", title: "Publiez ou explorez", desc: "Les étudiants publient leurs projets, les investisseurs les découvrent." },
                        { n: "03", icon: "🤝", title: "Connectez-vous", desc: "Échangez via la messagerie, demandez des collaborations, finalisez vos partenariats." },
                    ].map(s => (

                        <div key={s.n} className="home-how-card">

                            <div className="home*how-num"> {s.n} </div>
                            <div className="home-how-icon"> {s.icon} </div>
                            <div className="home-how-title"> {s.title} </div>
                            <div className="home-how-desc"> {s.desc} </div>

                        </div>

                    ))}

                </div>

            </section>

            {/* -- projets en vedette -- */}

            <section className="home-section" style={{ paddingTop: 0 }}>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>

                    <h2 style={{ fontFamily: "var(--font-display) ", fontSize: 28, fontWeight: 800, letterSpacing: "-.03em" }}>

                        Projets en vedette

                    </h2>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate("explore")}>
                        voir tout

                    </button>

                </div>

                <div className="grid-3">

                    {PROJECTS.slice(0, 3).map(p => (
                        <ProjectCard
                            key={p.id}
                            project={p}
                            onClick={() => navigate('project-detail', { project: p })}

                        />
                    ))}

                </div>

            </section>

            {/* -- CTA ---*/}
            <section className="home-section" style={{ paddingTop: 0 }}>
                <div className="home-cta-banner">

                    <h2 className="home-cta-title">
                        pret a lancer votre projet?
                    </h2>
                    <p className="home-cta-sub">
                        regoignez des milliers d etudiants qui transforment leurs ides en startups financées.
                    </p>
                    <button className="btn btn-primary btn-xl" onClick={() => navigate("register")}>

                        commencer maintenant - c est gratuit

                    </button>

                </div>

            </section>

        </div>

    )
}