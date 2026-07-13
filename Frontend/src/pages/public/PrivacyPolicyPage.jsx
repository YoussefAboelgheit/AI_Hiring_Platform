import BackButton from "../../components/common/BackButton";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: "We collect information you provide when creating an account, completing your profile, applying to jobs, or posting roles. This may include your name, email address, resume or CV, skills, education history, company details, and other professional information you choose to share on Joblio.",
  },
  {
    title: "2. How We Use Your Information",
    body: "We use your information to operate the platform, match candidates with roles, power AI-assisted screening and feedback, communicate about applications and account activity, and improve our services. We do not sell your personal data to third parties.",
  },
  {
    title: "3. AI Processing",
    body: "When you upload a resume or participate in assessments, parts of that content may be processed by AI systems to extract skills, generate match scores, or provide feedback. These outputs are used within Joblio to support hiring decisions and are subject to the same access controls as other profile data.",
  },
  {
    title: "4. CV Visibility & Sharing",
    body: "Candidates can set CV visibility to public or private. Recruiters and hiring teams only see candidate materials as permitted by platform rules and your visibility settings. Company profile information shared by HR users may appear to candidates browsing roles from that organization.",
  },
  {
    title: "5. Data Storage & Security",
    body: "We store account and profile data securely and use industry-standard measures to protect it in transit and at rest. Access to personal data is limited to authorized personnel and systems required to provide the service.",
  },
  {
    title: "6. Cookies & Session Data",
    body: "We use session storage and similar technologies to keep you signed in, remember preferences, and maintain security. You can clear local session data by signing out of your account.",
  },
  {
    title: "7. Your Rights",
    body: "You may request access to, correction of, or deletion of your personal data through your account settings where available, or by contacting us. You can also update profile fields, remove attachments, or change privacy preferences such as CV visibility at any time.",
  },
  {
    title: "8. Retention",
    body: "We retain account and hiring-related data for as long as your account is active or as needed to provide the service, comply with legal obligations, resolve disputes, and enforce our agreements. When an account is deleted, associated personal data is removed or anonymized in line with our retention practices.",
  },
  {
    title: "9. Third-Party Services",
    body: "Joblio may use trusted vendors for hosting, file storage, email delivery, and AI processing. These providers process data only on our instructions and under appropriate confidentiality and security obligations.",
  },
  {
    title: "10. Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. Material changes will be reflected on this page with an updated “Last updated” date. Continued use of Joblio after changes means you acknowledge the revised policy.",
  },
  {
    title: "11. Contact Us",
    body: "If you have questions about this Privacy Policy or how we handle your data, contact us at privacy@joblio.app or through the Contact options on the Joblio website.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className="public-section landing-hero" style={{ paddingBottom: 48 }}>
        <div className="container">
          <BackButton fallbackTo="/" label="Back to Home" />
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8 text-center">
              <div className="landing-hero-badge">
                <i className="bi bi-shield-lock" aria-hidden="true" /> Legal
              </div>
              <h1 className="landing-hero-title">Privacy Policy</h1>
              <p className="landing-hero-desc mx-auto" style={{ maxWidth: 640 }}>
                How Joblio collects, uses, and protects your information when you use our recruitment platform.
              </p>
              <p className="text-muted small mb-0">Last updated: July 8, 2026</p>
            </div>
          </div>
        </div>
      </section>

      <section className="public-section-sm bg-white" style={{ paddingBottom: 80 }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8">
              <div className="hcard p-4 p-lg-5">
                <p className="text-muted lh-lg mb-4">
                  This Privacy Policy describes how Joblio (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) handles personal information
                  for candidates, recruiters, and visitors who use our website and services.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                  {SECTIONS.map((section) => (
                    <div key={section.title}>
                      <h2 className="fs-5 fw-bold mb-2">{section.title}</h2>
                      <p className="text-muted mb-0 lh-lg">{section.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
