import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authHero from "../../assets/illustrations/auth-hero.png";
import s from "./LandingPage.module.css";

// ─── Static Data ─────────────────────────────────────────────────────────────
const STATS = [
  { value: "50K+", label: "Candidates Analyzed" },
  { value: "95%",  label: "Match Accuracy" },
  { value: "10K+", label: "Interviews Scheduled" },
  { value: "500+", label: "Companies Using HireAI" },
];

const LOGOS = ["Google", "Microsoft", "Amazon", "Netflix", "Spotify", "Airbnb"];

const FEATURES = [
  { icon: "bi-person-lines-fill", color: "#7C3AED", bg: "#EDE9FE", title: "AI CV Screening",     desc: "Automatically extract and analyze data from thousands of resumes with pinpoint accuracy." },
  { icon: "bi-trophy-fill",       color: "#D97706", bg: "#FEF3C7", title: "Candidate Ranking",   desc: "Proprietary algorithms rank candidates based on skill-match, cultural fit, and potential." },
  { icon: "bi-clipboard2-pulse-fill", color: "#0EA5E9", bg: "#E0F2FE", title: "AI Assessments",  desc: "Generate role-specific dynamic tests that evaluate technical depth and soft skills." },
  { icon: "bi-chat-dots-fill",    color: "#10B981", bg: "#D1FAE5", title: "Automated Feedback",  desc: "Deliver personalized, constructive feedback to every applicant, maintaining brand reputation." },
  { icon: "bi-diagram-3-fill",    color: "#F43F5E", bg: "#FFE4E6", title: "Smart Matching",      desc: "AI matches the right candidates to the right roles based on multiple intelligent factors." },
  { icon: "bi-bar-chart-line-fill", color: "#8B5CF6", bg: "#EDE9FE", title: "Analytics & Insights", desc: "Real-time dashboards and reports to track your hiring performance and team productivity." },
];

const STEPS = [
  { num: "01", icon: "bi-plug-fill",        title: "Connect & Integrate", desc: "Connect your ATS or upload resumes to get started." },
  { num: "02", icon: "bi-robot",            title: "AI Screening",        desc: "Our AI scans and analyzes candidates instantly." },
  { num: "03", icon: "bi-star-fill",        title: "Rank & Shortlist",    desc: "Top candidates are ranked based on match score." },
  { num: "04", icon: "bi-person-check-fill",title: "Human Interview",     desc: "Review shortlisted candidates and conduct interviews." },
  { num: "05", icon: "bi-trophy-fill",      title: "Hire the Best",       desc: "Make confident, data-driven hiring decisions." },
];

const TESTIMONIALS = [
  { stars: 5, text: "HireAI has cut our time-to-hire by 70%. The AI matching is incredibly accurate and saves us hours every week.",              name: "Jessica Martinez", role: "Head of Talent, TechCorp",    initials: "JM", color: "#7C3AED" },
  { stars: 5, text: "The best recruitment platform we've ever used. The insights and analytics help us make smarter hiring decisions.",            name: "Mark Thompson",    role: "HR Director, InnovateX",      initials: "MT", color: "#0EA5E9" },
  { stars: 5, text: "Super easy to use and the AI assessments are a game changer! Highly recommended.",                                           name: "Priya Sharma",     role: "Talent Manager, GrowthLabs", initials: "PS", color: "#10B981" },
];

const FAQS = [
  { q: "How does AI screening work?",         a: "Our AI analyzes resumes using NLP and ML to extract skills, experience, and match them against your job requirements automatically." },
  { q: "How accurate are the match scores?",  a: "Our matching algorithm achieves 95% accuracy based on data from over 50,000 successful placements." },
  { q: "Can I upload resumes manually?",      a: "Yes! You can upload resumes in bulk via CSV, PDF, or connect directly to your existing ATS." },
  { q: "Can I integrate with my existing ATS?", a: "HireAI integrates with all major ATS platforms including Greenhouse, Lever, Workday, and more." },
  { q: "Is my data safe and secure?",         a: "We use enterprise-grade encryption and are fully GDPR compliant. Your data is never shared with third parties." },
  { q: "Is HireAI free to use?",              a: "We offer a free trial with full access. No credit card required to get started." },
];

// ─── Scroll Reveal Hook ───────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); observer.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  useScrollReveal();

  return (
    <>
      {/* ── HERO ── */}
      <section className={s.hero}>
        <div className={s.heroGlow} />
        <div className="container">
          <div className="row align-items-center g-4 g-lg-5">
            <div className={`col-12 col-lg-6 ${s.heroCopy}`}>
              <div className={s.badge}>
                <i className="bi bi-stars me-2" style={{ color: "var(--primary)" }} />
                Revolutionizing Recruitment
              </div>
              <h1 className={s.heroTitle}>
                AI-Powered <span style={{ color: "var(--primary)" }}>Recruitment</span> Platform
              </h1>
              <p className={s.heroDesc}>
                The future of hiring is human-centered and AI-driven. Automate the mundane and focus on what truly matters: finding the perfect fit.
              </p>
              <div className={`d-flex flex-wrap gap-3 mb-4 ${s.heroBtns}`}>
                <button className="btn-primary-custom btn-lg-custom" onClick={() => navigate("/register")}>
                  Get Started Free <i className="bi bi-arrow-right ms-1" />
                </button>
                <button className="btn-outline-custom btn-lg-custom" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>View Demo</button>
              </div>
              <div className={`d-flex align-items-center gap-2 ${s.heroSocial}`}>
                <div className={s.avatarGroup}>
                  {["#7C3AED","#0EA5E9","#10B981","#F43F5E"].map((c, i) => (
                    <div key={i} className={s.avatar} style={{ background: c, marginLeft: i ? -10 : 0 }} />
                  ))}
                </div>
                <span style={{ fontSize: 13, color: "#64748B" }}>
                  <strong style={{ color: "#1E293B" }}>Join 500+ companies</strong> already hiring smarter
                </span>
              </div>
            </div>
            <div className={`col-12 col-lg-6 text-center ${s.heroVisual}`}>
              <div className="hero-illustration-wrap">
                <img src={authHero} alt="HireAI Dashboard" className="hero-illustration-img" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUSTED BY ── */}
      <section className={s.trusted}>
        <div className="container">
          <p className={s.trustedLabel}>Trusted by modern teams worldwide</p>
          <div className={s.logoRow}>
            {LOGOS.map((logo) => (
              <span key={logo} className={s.logoItem}>{logo}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding: "48px 0", background: "#fff" }}>
        <div className="container">
          <div className="row g-3">
            {STATS.map((st, i) => (
              <div key={st.label} className="col-6 col-md-3">
                <div className={`${s.statCard} reveal revealDelay${i + 1}`}>
                  <div className={s.statValue}>{st.value}</div>
                  <div className={s.statLabel}>{st.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: "80px 0", background: "#F8FAFC" }}>
        <div className="container">
          <div className="text-center mb-5 reveal">
            <div className={s.sectionEyebrow}>POWERFUL FEATURES</div>
            <h2 className={s.sectionTitle}>Everything you need to hire better</h2>
            <p className={s.sectionDesc}>Our AI tools help you attract, evaluate and hire the best talent 10x faster.</p>
          </div>
          <div className="row g-4">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`col-12 col-sm-6 col-lg-4 reveal revealDelay${(i % 3) + 1}`}>
                <div className={s.featureCard}>
                  <div className={s.featureIcon} style={{ background: f.bg }}>
                    <i className={`bi ${f.icon}`} style={{ color: f.color, fontSize: 22 }} />
                  </div>
                  <div className={s.featureTitle}>{f.title}</div>
                  <p className={s.featureDesc}>{f.desc}</p>
                  <a href="#features" className={s.learnMore}>Learn more →</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <section style={{ padding: "80px 0", background: "#fff" }}>
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-12 col-lg-5 reveal">
              <div className={s.sectionEyebrow}>REAL-TIME DASHBOARD</div>
              <h2 className={s.sectionTitle} style={{ textAlign: "left" }}>
                All your hiring in one intelligent dashboard
              </h2>
              <p style={{ color: "#64748B", marginBottom: 24 }}>
                Get a complete overview of your recruitment pipeline, candidate quality, and team performance in real-time.
              </p>
              <ul className={s.checkList}>
                {["Track every candidate in your pipeline","AI-powered match scores & insights","Team collaboration made simple","Data-driven hiring decisions"].map((item, i) => (
                  <li key={item} className={`${s.checkItem} reveal revealDelay${i + 1}`}>
                    <i className="bi bi-check-circle-fill" style={{ color: "var(--primary)", marginRight: 10 }} />
                    {item}
                  </li>
                ))}
              </ul>
              <button className="btn-primary-custom" style={{ marginTop: 24 }} onClick={() => navigate("/login")}>
                Explore Dashboard →
              </button>
            </div>
            <div className="col-12 col-lg-7 reveal revealDelay2">
              <div className={s.dashboardMock}>
                <div className={s.dashHeader}>
                  <span style={{ fontWeight: 700, color: "var(--primary)", fontSize: 15 }}>⚡ HireAI</span>
                  <span style={{ fontSize: 12, color: "#64748B" }}>Welcome back, Sarah 👋</span>
                </div>
                <div className={s.dashStats}>
                  {[{ label: "Candidates", val: "12,642", up: "+10.3%" },{ label: "Interviews", val: "32", up: "+48.0%" },{ label: "Hired", val: "156", up: "+12.2%" },{ label: "Days to Hire", val: "28", up: "+1.1%" }].map((d) => (
                    <div key={d.label} className={s.dashStat}>
                      <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 2 }}>{d.label}</div>
                      <div style={{ fontWeight: 700, fontSize: 18, color: "#1E293B" }}>{d.val}</div>
                      <div style={{ fontSize: 11, color: "#10B981" }}>{d.up}</div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: "0 16px 16px" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#64748B", marginBottom: 10 }}>Top Candidates</div>
                  {[{ name: "John Smith", score: 94, skills: "React, Node.js" },{ name: "Sarah Johnson", score: 92, skills: "Python, ML" },{ name: "Michael Lee", score: 89, skills: "Java, Spring" }].map((c) => (
                    <div key={c.name} className={s.dashRow}>
                      <div className={s.dashAvatar}>{c.name[0]}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: "#94A3B8" }}>{c.skills}</div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)" }}>{c.score}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: "80px 0", background: "#F8FAFC" }}>
        <div className="container">
          <div className="text-center mb-5 reveal">
            <div className={s.sectionEyebrow}>HOW IT WORKS</div>
            <h2 className={s.sectionTitle}>A smarter hiring process in 5 simple steps</h2>
          </div>
          <div className="row g-4">
            {STEPS.map((st, i) => (
              <div key={st.num} className={`col-12 col-sm-6 col-lg reveal revealDelay${i + 1}`} style={{ position: "relative" }}>
                {i < STEPS.length - 1 && <div className={`${s.stepConnector} d-none d-lg-block`} />}
                <div className={s.stepCard}>
                  <div className={s.stepNum}>{st.num}</div>
                  <div className={s.stepIconWrap}>
                    <i className={`bi ${st.icon}`} style={{ fontSize: 24, color: "var(--primary)" }} />
                  </div>
                  <div className={s.stepTitle}>{st.title}</div>
                  <p className={s.stepDesc}>{st.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: "80px 0", background: "#fff" }}>
        <div className="container">
          <div className="text-center mb-5 reveal">
            <div className={s.sectionEyebrow}>WHAT OUR CUSTOMERS SAY</div>
            <h2 className={s.sectionTitle}>Loved by recruitment teams</h2>
          </div>
          <div className="row g-4">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className={`col-12 col-md-4 reveal revealDelay${i + 1}`}>
                <div className={s.testimonialCard}>
                  <div style={{ marginBottom: 12 }}>
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <i key={j} className="bi bi-star-fill" style={{ color: "#F59E0B", fontSize: 14, marginRight: 2 }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.7, marginBottom: 20 }}>"{t.text}"</p>
                  <div className="d-flex align-items-center gap-3">
                    <div className={s.testimonialAvatar} style={{ background: t.color }}>{t.initials}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#1E293B" }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: "#94A3B8" }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section style={{ padding: "80px 0", background: "#F8FAFC" }}>
        <div className="container">
          <div className="text-center mb-5 reveal">
            <div className={s.sectionEyebrow}>FREQUENTLY ASKED QUESTIONS</div>
            <h2 className={s.sectionTitle}>Have questions? We've got answers.</h2>
          </div>
          <div className="row justify-content-center">
            <div className="col-12 col-lg-10">
              <div className="row g-3">
                {FAQS.map((faq, i) => (
                  <div key={i} className={`col-12 col-md-6 reveal revealDelay${(i % 2) + 1}`}>
                    <div
                      className={`${s.faqCard} ${openFaq === i ? s.faqCardOpen : ""}`}
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      <div className={s.faqQ}>
                        <span>{faq.q}</span>
                        <i className={`bi bi-chevron-down ${s.faqArrow} ${openFaq === i ? s.faqArrowOpen : ""}`} />
                      </div>
                      <div className={`${s.faqAnswer} ${openFaq === i ? s.faqAnswerOpen : ""}`}>
                        <p className={s.faqA}>{faq.a}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={`${s.ctaSection} reveal`}>
        <div className={s.ctaGlow} />
        <div className={s.ctaGlow2} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="row align-items-center justify-content-between g-4">
            <div className="col-12 col-lg-7 text-center text-lg-start">
              <h2 style={{ color: "#3B0764", fontWeight: 800, fontSize: "clamp(26px,4vw,44px)", marginBottom: 12 }}>
                Ready to hire smarter?
              </h2>
              <p style={{ color: "#6D28D9", marginBottom: 0, fontSize: 17 }}>
                Join 500+ companies already using HireAI to build amazing teams.
              </p>
            </div>
            <div className="col-12 col-lg-4 text-center text-lg-end">
              <button className={s.ctaBtn} onClick={() => navigate("/register")}>
                Get Started Free →
              </button>
              <p style={{ color: "#7C3AED", fontSize: 12, marginTop: 12, marginBottom: 0, opacity: 0.6 }}>
                No credit card required • Free forever
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}