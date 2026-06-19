import authHero from "../../assets/illustrations/auth-hero.png";

export default function AuthHeroPanel() {
  return (
    <div className="auth-left">
      <div className="auth-left-content">
        <div className="auth-badge">
          <i className="bi bi-stars" aria-hidden="true" /> AI-Powered Talent Matching
        </div>
        <h2 className="auth-headline">
          Start hiring <span className="auth-accent">smarter</span> today.
        </h2>
        <p className="auth-subtext">
          Join over 5,000+ companies using HireAI to automate their recruitment workflow and find the perfect human match through intelligent data.
        </p>
      </div>
      <div className="hero-illustration-wrap">
        <img src={authHero} alt="" className="hero-illustration-img" />
      </div>
    </div>
  );
}
