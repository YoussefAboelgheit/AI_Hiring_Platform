import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAboutContent } from "../../services/contentService";
import LoadingState from "../../components/common/LoadingState";
import BackButton from "../../components/common/BackButton";

export default function AboutPage() {
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAboutContent()
      .then(setContent)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingState message="Loading..." />;
  if (!content) return null;

  return (
    <>
      <section className="public-section landing-hero" style={{ paddingBottom: 48 }}>
        <div className="container">
          <BackButton fallbackTo="/" label="Back to Home" />
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8 text-center">
              <div className="landing-hero-badge">
                <i className="bi bi-info-circle" aria-hidden="true" /> About HireAI
              </div>
              <h1 className="landing-hero-title">
                Building the Future of <span style={{ color: "var(--primary)" }}>Intelligent Hiring</span>
              </h1>
              <p className="landing-hero-desc mx-auto" style={{ maxWidth: 640 }}>
                HireAI is an AI-powered recruitment platform that helps companies find, evaluate, and hire top talent — while giving every candidate a fair, transparent experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="public-section-sm bg-white">
        <div className="container">
          <div className="row g-4">
            <div className="col-12 col-md-6">
              <div className="hcard p-4 p-lg-5 h-100">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-bullseye fs-4 text-primary" aria-hidden="true" />
                  <h2 className="fs-4 fw-bold mb-0">Our Mission</h2>
                </div>
                <p className="text-muted mb-0 lh-lg">{content.mission}</p>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="hcard p-4 p-lg-5 h-100">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-eye fs-4 text-primary" aria-hidden="true" />
                  <h2 className="fs-4 fw-bold mb-0">Our Vision</h2>
                </div>
                <p className="text-muted mb-0 lh-lg">{content.vision}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="public-section" style={{ background: "var(--body-bg)" }}>
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="section-heading">AI Recruitment Benefits</h2>
            <p className="text-muted">Why modern teams choose HireAI for their hiring pipeline.</p>
          </div>
          <div className="row g-4">
            {content.benefits.map((b) => (
              <div key={b.title} className="col-12 col-sm-6 col-lg-3">
                <div className="hcard p-4 h-100">
                  <div className="feature-icon-wrap">
                    <i className={`bi ${b.icon}`} aria-hidden="true" />
                  </div>
                  <div className="fw-bold mb-2">{b.title}</div>
                  <p className="text-muted small mb-0">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="public-section-sm bg-white">
        <div className="container">
          <div className="cta-banner">
            <h2 className="text-white fw-bold mb-3">Ready to transform your hiring?</h2>
            <p className="text-white-75 mb-4">Join thousands of companies and candidates already using HireAI.</p>
            <div className="d-flex flex-wrap gap-3 justify-content-center">
              <button type="button" className="btn-cta-primary" onClick={() => navigate("/register")}>Get Started</button>
              <button type="button" className="btn-cta-outline" onClick={() => navigate("/")}>Back to Home</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
