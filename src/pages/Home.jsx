import { useApp } from "../context/AppContext";
import { ProjectCard } from "../components/UI";
import { PROJECTS } from "..//data/mockData";
import { useState, useEffect } from "react";
import "./Home.css";

export default function Home() {
    const { navigate } = useApp();
    const [carouselIndex, setCarouselIndex] = useState(0);

    const carouselImages = [
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400&fit=crop",
        "https://images.unsplash.com/photo-1552993881-338de3afc3d7?w=1200&h=400&fit=crop",
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&h=400&fit=crop",
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=400&fit=crop",
        "https://images.unsplash.com/photo-1552993881-338de3afc3d7?w=1200&h=400&fit=crop",
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCarouselIndex(prev => (prev + 1) % carouselImages.length);
        }, 1000);
        return () => clearInterval(interval);
    }, [carouselImages.length]);

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

            {/* -- CAROUSEL --*/}
            <section className="home-carousel-section">
                <div className="home-carousel">
                    <div className="carousel-container">
                        {carouselImages.map((imgUrl, idx) => (
                            <div
                                key={idx}
                                className={`carousel-image ${idx === carouselIndex ? "active" : ""}`}
                                style={{
                                    backgroundImage: `url(${imgUrl})`,
                                    opacity: idx === carouselIndex ? 1 : 0,
                                }}
                            />
                        ))}
                    </div>
                    <div className="carousel-indicators">
                        {carouselImages.map((_, idx) => (
                            <button
                                key={idx}
                                className={`indicator ${idx === carouselIndex ? "active" : ""}`}
                                onClick={() => setCarouselIndex(idx)}
                            />
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
                    <button className="btn btn-primary btn-lg" onClick={() => navigate("register")} style={{ maxWidth: "100%", width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        commencer maintenant - c est gratuit
                    </button>
                </div>
            </section>

            {/* -- FOOTER --*/}
            <footer className="home-footer">
                <div className="footer-container">
                    <div className="footer-grid">
                        {/* Column 1: About */}
                        <div className="footer-col">
                            <h4 className="footer-title">À propos</h4>
                            <ul className="footer-links">
                                <li><a onClick={() => navigate("home")}>Launchpad</a></li>
                                <li><a>Qui sommes-nous?</a></li>
                                <li><a>Notre mission</a></li>
                                <li><a>Blog</a></li>
                            </ul>
                        </div>

                        {/* Column 2: Plateforme */}
                        <div className="footer-col">
                            <h4 className="footer-title">Plateforme</h4>
                            <ul className="footer-links">
                                <li><a onClick={() => navigate("explore")}>Découvrir les projets</a></li>
                                <li><a onClick={() => navigate("register")}>S'inscrire</a></li>
                                <li><a>Publier un projet</a></li>
                                <li><a>Centre d'aide</a></li>
                            </ul>
                        </div>

                        {/* Column 3: Communauté */}
                        <div className="footer-col">
                            <h4 className="footer-title">Communauté</h4>
                            <ul className="footer-links">
                                <li><a>Événements</a></li>
                                <li><a>Forum</a></li>
                                <li><a>Mentors</a></li>
                                <li><a>Partenaires</a></li>
                            </ul>
                        </div>

                        {/* Column 4: Légal */}
                        <div className="footer-col">
                            <h4 className="footer-title">Légal</h4>
                            <ul className="footer-links">
                                <li><a>Conditions d'utilisation</a></li>
                                <li><a>Politique de confidentialité</a></li>
                                <li><a>Cookies</a></li>
                                <li><a>Contactez-nous</a></li>
                            </ul>
                        </div>

                        {/* Column 5: Réseaux sociaux */}
                        <div className="footer-col">
                            <h4 className="footer-title">Nous suivre</h4>
                            <div className="footer-socials">
                                <a className="footer-social-btn">f</a>
                                <a className="footer-social-btn">𝕏</a>
                                <a className="footer-social-btn">in</a>
                                <a className="footer-social-btn">ig</a>
                            </div>
                        </div>
                    </div>

                    {/* Footer bottom */}
                    <div className="footer-bottom">
                        <div className="footer-bottom-left">
                            <p>© 2026 Launchpad. Tous droits réservés.</p>
                        </div>
                        <div className="footer-bottom-right">
                            <span>Fabriqué avec ❤️ au Cameroun</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}