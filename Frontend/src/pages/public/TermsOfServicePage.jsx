export default function TermsOfServicePage() {
  return (
    <>
      <section className="public-section landing-hero" style={{ paddingBottom: 48 }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8 text-center">
              <div className="landing-hero-badge">
                <i className="bi bi-file-earmark-text" aria-hidden="true" /> Legal
              </div>
              <h1 className="landing-hero-title">Terms of Service</h1>
              <p className="landing-hero-desc mx-auto" style={{ maxWidth: 640 }}>
                These terms govern your use of the Joblio recruitment platform. Please read them carefully.
              </p>
              <p className="text-muted small mb-0">Last updated: July 12, 2026</p>
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
                  Welcome to Joblio (the "Platform"), an AI-powered recruitment platform operated by
                  Joblio ("we", "us", or "our"). These Terms of Service ("Terms") govern your access to
                  and use of the Platform, including all features, AI services, and content available
                  through the Platform. By registering for or using the Platform, you agree to be bound
                  by these Terms. If you do not agree, you must not use the Platform.
                </p>

                {/* 1. Acceptance of Terms */}
                <section>
                  <h2 className="fs-5 fw-bold mb-2">1. Acceptance of Terms</h2>
                  <p className="text-muted mb-0 lh-lg">
                    By creating an account, accessing, or using Joblio in any way, you confirm that
                    you have read, understood, and agree to be bound by these Terms, our Privacy
                    Policy, and any other policies referenced herein. If you are using the Platform on
                    behalf of an organisation, you represent that you have the authority to bind that
                    organisation to these Terms. If you do not agree to any part of these Terms, you
                    must discontinue use immediately.
                  </p>
                </section>

                <hr className="my-4" />

                {/* 2. Eligibility */}
                <section>
                  <h2 className="fs-5 fw-bold mb-2">2. Eligibility</h2>
                  <p className="text-muted mb-0 lh-lg">
                    You must be at least 18 years of age to use the Platform. By creating an account,
                    you represent and warrant that:
                  </p>
                  <ul className="text-muted lh-lg mb-0">
                    <li>You are at least 18 years old.</li>
                    <li>You have the legal capacity to enter into a binding agreement.</li>
                    <li>All registration information you provide is accurate, current, and complete.</li>
                    <li>You are not located in a country subject to trade sanctions or embargoes.</li>
                    <li>You are not a person or entity barred from using the Platform under applicable law.</li>
                  </ul>
                </section>

                <hr className="my-4" />

                {/* 3. Account Registration */}
                <section>
                  <h2 className="fs-5 fw-bold mb-2">3. Account Registration</h2>
                  <p className="text-muted mb-0 lh-lg">
                    To access most features of the Platform, you must register for an account. During
                    registration, you must provide your full name, a valid email address, a password,
                    and select your role (Candidate or Recruiter). You may also optionally upload a
                    profile image, company logo, or CV at the time of registration.
                  </p>
                  <p className="text-muted mb-0 lh-lg">
                    You are solely responsible for maintaining the confidentiality of your login
                    credentials, including your password and any authentication tokens issued to your
                    account. You must notify us immediately of any unauthorised use of your account.
                    We are not liable for any loss or damage arising from your failure to safeguard
                    your account credentials.
                  </p>
                  <p className="text-muted mb-0 lh-lg">
                    After registration, you will receive an email verification link. Your account will
                    not be fully activated until you verify your email address. We may resend
                    verification emails at your request.
                  </p>
                </section>

                <hr className="my-4" />

                {/* 4. User Roles */}
                <section>
                  <h2 className="fs-5 fw-bold mb-2">4. User Roles</h2>
                  <p className="text-muted mb-0 lh-lg">
                    Joblio supports three distinct user roles, each with different capabilities and
                    responsibilities:
                  </p>
                  <h3 className="fs-6 fw-bold mt-3 mb-1">4.1 Candidate</h3>
                  <p className="text-muted mb-0 lh-lg">
                    Candidates are individuals seeking employment. Candidates may browse and search
                    job listings, save jobs, apply to open positions, complete AI-generated
                    assessments, view AI-generated feedback on rejected applications, and manage their
                    professional profile including CV, skills, and education history.
                  </p>
                  <h3 className="fs-6 fw-bold mt-3 mb-1">4.2 Recruiter</h3>
                  <p className="text-muted mb-0 lh-lg">
                    Recruiters (referred to as "HR" on the Platform) represent companies or
                    organisations hiring for open positions. Recruiters may create and manage job
                    postings, review candidate applications, view AI-generated candidate analyses,
                    generate and manage AI-powered assessments, update application statuses, and
                    manage their company profile.
                  </p>
                  <h3 className="fs-6 fw-bold mt-3 mb-1">4.3 Administrator</h3>
                  <p className="text-muted mb-0 lh-lg">
                    Administrators manage the Platform at a system level. Administrators may view,
                    create, edit, and delete user accounts; manage job categories; and oversee all
                    job listings. Administrator access is granted solely by Joblio.
                  </p>
                </section>

                <hr className="my-4" />

                {/* 5. User Responsibilities */}
                <section>
                  <h2 className="fs-5 fw-bold mb-2">5. User Responsibilities</h2>
                  <p className="text-muted mb-0 lh-lg">
                    All users of the Platform agree to:
                  </p>
                  <ul className="text-muted lh-lg mb-0">
                    <li>Provide accurate, truthful, and up-to-date information in their profile and all submissions.</li>
                    <li>Maintain the security of their account and notify us of any unauthorised access.</li>
                    <li>Comply with all applicable laws and regulations when using the Platform.</li>
                    <li>Not use the Platform for any unlawful, fraudulent, or harmful purpose.</li>
                    <li>Not interfere with the proper operation of the Platform or its underlying systems.</li>
                    <li>Not attempt to circumvent any security measures, rate limits, or access controls.</li>
                    <li>Not reproduce, scrape, or commercially exploit Platform content without our written permission.</li>
                  </ul>
                </section>

                <hr className="my-4" />

                {/* 6. Recruiter Responsibilities */}
                <section>
                  <h2 className="fs-5 fw-bold mb-2">6. Recruiter Responsibilities</h2>
                  <p className="text-muted mb-0 lh-lg">
                    Recruiters who post jobs or evaluate candidates on the Platform additionally agree to:
                  </p>
                  <ul className="text-muted lh-lg mb-0">
                    <li>Ensure all job postings describe genuine, currently available positions.</li>
                    <li>Not post jobs that discriminate against any protected class under applicable law.</li>
                    <li>Not use the Platform to collect candidate data for purposes other than evaluating candidates for the posted position.</li>
                    <li>Make final hiring decisions based on a holistic review; AI-generated analyses and match scores are decision-support tools only and must not be the sole basis for any employment decision.</li>
                    <li>Comply with all applicable employment, data protection, and anti-discrimination laws when using candidate information obtained through the Platform.</li>
                    <li>Respond to candidates and update application statuses within a reasonable timeframe.</li>
                    <li>Not post misleading, fraudulent, or spam job listings.</li>
                  </ul>
                </section>

                <hr className="my-4" />

                {/* 7. Candidate Responsibilities */}
                <section>
                  <h2 className="fs-5 fw-bold mb-2">7. Candidate Responsibilities</h2>
                  <p className="text-muted mb-0 lh-lg">
                    Candidates who apply for jobs or use Platform features additionally agree to:
                  </p>
                  <ul className="text-muted lh-lg mb-0">
                    <li>Submit accurate and truthful CVs, skills, education history, and other professional information.</li>
                    <li>Not apply to jobs for which they are not genuinely interested or qualified.</li>
                    <li>Not submit spam or duplicate applications.</li>
                    <li>Complete AI assessments honestly and without external assistance. Cheating, collusion, or using automated tools to complete assessments is strictly prohibited.</li>
                    <li>Not misrepresent their identity, qualifications, or experience.</li>
                    <li>Not use another person's account to apply for jobs or take assessments.</li>
                  </ul>
                </section>

                <hr className="my-4" />

                {/* 8. Job Posting Rules */}
                <section>
                  <h2 className="fs-5 fw-bold mb-2">8. Job Posting Rules</h2>
                  <p className="text-muted mb-0 lh-lg">
                    Recruiters may create job postings with the following fields: title, description,
                    category, workplace type (Onsite, Hybrid, or Remote), job type (Intern, Full Time,
                    or Part Time), required skills, requirements, location, and application end date.
                  </p>
                  <p className="text-muted mb-0 lh-lg">
                    Job postings have the following lifecycle:
                  </p>
                  <ul className="text-muted lh-lg mb-0">
                    <li><strong>Drafted:</strong> Jobs are initially created in draft status. Drafted jobs are not visible to candidates. Recruiters may edit draft jobs within a limited editing window. After the editing window expires, drafts are automatically published.</li>
                    <li><strong>Open:</strong> Published jobs are visible to candidates and accept applications. Open jobs cannot be edited; they can only be closed.</li>
                    <li><strong>Closed:</strong> Jobs with a closed status no longer accept applications and cannot be reopened or edited.</li>
                    <li>Jobs with an application end date in the past are automatically closed.</li>
                  </ul>
                  <p className="text-muted mb-0 lh-lg">
                    When a job is deleted, all associated applications are preserved with a snapshot
                    of the job listing at the time of deletion. Candidates will see the job status as
                    "Job has been deleted" in their applications list.
                  </p>
                  <p className="text-muted mb-0 lh-lg">
                    All job postings must comply with applicable employment laws and must not contain
                    discriminatory requirements, false information, or content that infringes on
                    third-party rights.
                  </p>
                </section>

                <hr className="my-4" />

                {/* 9. AI Features Disclaimer */}
                <section>
                  <h2 className="fs-5 fw-bold mb-2">9. AI Features Disclaimer</h2>
                  <p className="text-muted mb-0 lh-lg">
                    Joblio uses artificial intelligence, including Google Gemini, to provide the
                    following features:
                  </p>
                  <ul className="text-muted lh-lg mb-0">
                    <li><strong>Resume Parsing:</strong> AI extracts structured data (name, contact details, skills, experience, education, certifications, and other professional information) from uploaded CVs and resumes.</li>
                    <li><strong>Job Parsing:</strong> AI analyses job descriptions to extract structured information about required skills, responsibilities, qualifications, and other job attributes.</li>
                    <li><strong>Resume-Job Matching:</strong> AI generates vector embeddings of both resumes and jobs, then computes a similarity score (0–100) to estimate candidate-job fit.</li>
                    <li><strong>Candidate Analysis (Recruiter):</strong> AI generates strengths, weaknesses, a summary, and a hiring recommendation for each candidate relative to a specific job.</li>
                    <li><strong>Candidate Feedback (Candidate):</strong> AI generates constructive feedback for rejected candidates, including strengths, areas for improvement, and actionable advice.</li>
                    <li><strong>Assessment Generation:</strong> AI generates multiple-choice question banks tailored to a job description, including questions, answer options, correct answers, explanations, and difficulty levels.</li>
                    <li><strong>Question Regeneration:</strong> AI regenerates individual assessment questions on demand.</li>
                  </ul>
                  <p className="text-muted mt-3 mb-0 lh-lg">
                    <strong>Important Limitations:</strong> AI outputs may contain inaccuracies,
                    omissions, or errors. AI-generated match scores, candidate analyses, and feedback
                    are estimates based on available data and should not be treated as definitive or
                    conclusive. The AI may occasionally produce incorrect or incomplete information.
                    You should independently verify any AI-generated output before relying on it for
                    any hiring or career decision.
                  </p>
                </section>

                <hr className="my-4" />

                {/* 10. AI Matching Disclaimer */}
                <section>
                  <h2 className="fs-5 fw-bold mb-2">10. AI Matching Disclaimer</h2>
                  <p className="text-muted mb-0 lh-lg">
                    The AI-powered job-candidate matching feature computes a match score based on
                    semantic similarity between job requirements and candidate profiles. This score
                    is a decision-support tool only and does not guarantee candidate suitability,
                    job performance, or hiring success.
                  </p>
                  <p className="text-muted mb-0 lh-lg">
                    Recruiters are solely responsible for all hiring decisions. AI match scores must
                    not be used as the sole or primary basis for accepting, rejecting, or
                    discriminating against any candidate. Recruiters should consider the full context
                    of each application, including the candidate's complete profile, interview
                    performance, and any other relevant information beyond the AI-generated score.
                  </p>
                  <p className="text-muted mb-0 lh-lg">
                    Candidates should not rely solely on AI-generated match scores or feedback to
                    assess their qualifications. The AI does not evaluate soft skills, cultural fit,
                    or other intangible factors that may affect hiring decisions.
                  </p>
                </section>

                <hr className="my-4" />

                {/* 11. AI Assessment Terms */}
                <section>
                  <h2 className="fs-5 fw-bold mb-2">11. AI Assessment Terms</h2>
                  <p className="text-muted mb-0 lh-lg">
                    Recruiters may configure and generate AI-powered assessments for their job
                    postings. Assessments consist of multiple-choice questions with four answer
                    options, a correct answer, and an explanation.
                  </p>
                  <p className="text-muted mb-0 lh-lg">
                    Recruiters may configure the following assessment parameters: type (AI-generated,
                    manually created, or none), question count, difficulty level (Auto, Easy, Medium,
                    Hard), topic focus areas, and duration (5 to 180 minutes). Assessments may be
                    AI-generated or manually created by the recruiter.
                  </p>
                  <p className="text-muted mb-0 lh-lg">
                    Candidates invited to complete an assessment agree to the following:
                  </p>
                  <ul className="text-muted lh-lg mb-0">
                    <li>Assessments are timed. The timer begins when the candidate starts the assessment and expires after the configured duration.</li>
                    <li>If the timer expires, the assessment is automatically submitted with whatever answers have been saved. Unanswered questions are marked as incorrect.</li>
                    <li>Candidates must not cheat, collude, use automated tools, or seek external assistance during assessments.</li>
                    <li>Assessments are auto-graded. The score is recorded and visible to the recruiter as part of the candidate's application.</li>
                    <li>Candidates who do not complete the assessment by the stated deadline (typically 3 days from the invitation) may have their application automatically rejected.</li>
                  </ul>
                </section>

                <hr className="my-4" />

                {/* 12. User Content */}
                <section>
                  <h2 className="fs-5 fw-bold mb-2">12. User Content</h2>
                  <p className="text-muted mb-0 lh-lg">
                    "User Content" means any information, materials, or data that you submit, upload,
                    post, or otherwise make available on the Platform. This includes, but is not
                    limited to: CVs and resumes, profile images, company logos, job descriptions,
                    assessment questions, cover letters, attachments, skills, education history, and
                    any feedback or comments.
                  </p>
                  <p className="text-muted mb-0 lh-lg">
                    <strong>Ownership:</strong> You retain all ownership rights to your User Content.
                    We do not claim ownership of any User Content you submit.
                  </p>
                  <p className="text-muted mb-0 lh-lg">
                    <strong>License to Joblio:</strong> By submitting User Content to the Platform,
                    you grant Joblio a worldwide, non-exclusive, royalty-free license to use,
                    reproduce, store, process, analyse, display, and transmit your User Content
                    solely for the purpose of operating, providing, and improving the Platform. This
                    includes processing your content through AI systems (such as Google Gemini) to
                    enable features described in Section 9.
                  </p>
                  <p className="text-muted mb-0 lh-lg">
                    <strong>Your Warranties:</strong> You represent and warrant that:
                  </p>
                  <ul className="text-muted lh-lg mb-0">
                    <li>You own or have the necessary rights, licenses, and consents to submit your User Content.</li>
                    <li>Your User Content does not infringe any third-party intellectual property, privacy, or other rights.</li>
                    <li>Your User Content is accurate and not misleading.</li>
                    <li>Your User Content does not contain malware, viruses, or other harmful code.</li>
                  </ul>
                </section>

                <hr className="my-4" />

                {/* 13. File Upload Policy */}
                <section>
                  <h2 className="fs-5 fw-bold mb-2">13. File Upload Policy</h2>
                  <p className="text-muted mb-0 lh-lg">
                    The Platform allows users to upload the following types of files:
                  </p>
                  <ul className="text-muted lh-lg mb-0">
                    <li><strong>CVs and Resumes:</strong> PDF or DOCX format, maximum 50 MB per file.</li>
                    <li><strong>Profile Images:</strong> PNG or JPEG format.</li>
                    <li><strong>Company Logos:</strong> PNG or JPEG format.</li>
                    <li><strong>Attachments:</strong> Any additional files linked via URL (the Platform does not directly host attachment files).</li>
                  </ul>
                  <p className="text-muted mt-3 mb-0 lh-lg">
                    All uploaded files are stored securely using Supabase cloud storage. Files may
                    be processed by our AI systems (including Google Gemini) to provide Platform
                    features such as CV parsing and skill extraction. Uploaded CVs may also be
                    converted into vector embeddings for matching purposes.
                  </p>
                  <p className="text-muted mb-0 lh-lg">
                    By uploading a file, you confirm that:
                  </p>
                  <ul className="text-muted lh-lg mb-0">
                    <li>The file does not contain malware, viruses, or malicious code.</li>
                    <li>The file does not infringe any third-party rights.</li>
                    <li>The file does not contain illegal, discriminatory, or offensive content.</li>
                    <li>You have consent from any individuals whose personal data appears in the file (for example, reference letters containing third-party information).</li>
                  </ul>
                  <p className="text-muted mb-0 lh-lg">
                    Candidates may set their CV visibility to "public" or "private". Public CVs may
                    be visible to recruiters browsing the Platform. Private CVs are only visible to
                    recruiters to whom the candidate has applied.
                  </p>
                </section>

                <hr className="my-4" />

                {/* 14. Acceptable Use */}
                <section>
                  <h2 className="fs-5 fw-bold mb-2">14. Acceptable Use</h2>
                  <p className="text-muted mb-0 lh-lg">
                    You agree not to use the Platform for any of the following prohibited activities:
                  </p>
                  <ul className="text-muted lh-lg mb-0">
                    <li>Posting fake, fraudulent, or misleading job listings.</li>
                    <li>Posting job listings that discriminate on the basis of race, colour, religion, gender, sexual orientation, national origin, age, disability, or any other protected characteristic.</li>
                    <li>Sending spam, unsolicited messages, or harassing communications through the Platform.</li>
                    <li>Impersonating any person, organisation, or entity, or misrepresenting your affiliation with any person or entity.</li>
                    <li>Uploading files containing malware, viruses, worms, Trojan horses, or any other malicious or harmful code.</li>
                    <li>Infringing any copyright, trademark, patent, trade secret, or other intellectual property right of any party.</li>
                    <li>Scraping, data mining, or extracting content from the Platform through automated means without our prior written consent.</li>
                    <li>Using bots, scripts, or automated tools to create accounts, apply to jobs, or interact with the Platform in any way that violates these Terms.</li>
                    <li>Cheating on AI assessments, including using automated tools, seeking external help, or colluding with others.</li>
                    <li>Interfering with or disrupting the integrity or performance of the Platform, its servers, or its underlying infrastructure.</li>
                    <li>Attempting to probe, scan, or test the vulnerability of the Platform's security systems without authorisation.</li>
                    <li>Using the Platform for any unlawful purpose or in violation of any applicable local, national, or international law.</li>
                  </ul>
                </section>

                <hr className="my-4" />

                {/* 15. Privacy & Data Processing */}
                <section>
                  <h2 className="fs-5 fw-bold mb-2">15. Privacy &amp; Data Processing</h2>
                  <p className="text-muted mb-0 lh-lg">
                    Your privacy is important to us. Our Privacy Policy explains how we collect, use,
                    store, and disclose your personal information. By using the Platform, you consent
                    to the collection and use of your personal information as described in the
                    <a href="/privacy"> Privacy Policy</a>, which is incorporated into these Terms by reference.
                  </p>
                  <p className="text-muted mb-0 lh-lg">
                    Key data processing points relevant to these Terms include:
                  </p>
                  <ul className="text-muted lh-lg mb-0">
                    <li>We collect and process your name, email address, CV or resume, skills, education history, company details, and other professional information you provide.</li>
                    <li>Your uploaded CVs and profile data may be processed by AI systems (including Google Gemini) to enable resume parsing, job matching, candidate analysis, and feedback features.</li>
                    <li>Your data is stored securely using MongoDB (database) and Supabase (file storage).</li>
                    <li>We use trusted third-party service providers, including Google (Gemini AI), OpenAI (optional embeddings), and Ollama (optional embeddings), to process data strictly for the purpose of providing Platform features.</li>
                    <li>We retain your data for as long as your account is active or as needed to provide the service, comply with legal obligations, and enforce our agreements.</li>
                    <li>You may request access to, correction of, or deletion of your personal data by contacting us or through your account settings where available.</li>
                  </ul>
                </section>

                <hr className="my-4" />

                {/* 16. Third-Party Services */}
                <section>
                  <h2 className="fs-5 fw-bold mb-2">16. Third-Party Services</h2>
                  <p className="text-muted mb-0 lh-lg">
                    Joblio relies on several third-party service providers to operate the Platform.
                    These include:
                  </p>
                  <ul className="text-muted lh-lg mb-0">
                    <li><strong>Google Gemini (Google Generative AI)</strong> — Provides AI capabilities for resume parsing, job parsing, candidate analysis, candidate feedback, and assessment generation.</li>
                    <li><strong>OpenAI</strong> — Optionally provides vector embeddings for resume-job matching (configurable by the Platform operator).</li>
                    <li><strong>Ollama</strong> — Optionally provides local vector embeddings for resume-job matching.</li>
                    <li><strong>Supabase</strong> — Provides cloud file storage for uploaded CVs, profile images, and company logos.</li>
                    <li><strong>MongoDB (Mongoose)</strong> — Provides database storage for all Platform data.</li>
                    <li><strong>Nodemailer (Gmail SMTP)</strong> — Provides email delivery for verification, password reset, and notification emails.</li>
                  </ul>
                  <p className="text-muted mt-3 mb-0 lh-lg">
                    We are not responsible for the availability, accuracy, or performance of any
                    third-party service. These providers process your data only on our instructions
                    and under contractual obligations of confidentiality and security. However, we
                    encourage you to review the privacy policies of these providers for more
                    information about their data handling practices.
                  </p>
                </section>

                <hr className="my-4" />

                {/* 17. Automated Decisions */}
                <section>
                  <h2 className="fs-5 fw-bold mb-2">17. Automated Decisions</h2>
                  <p className="text-muted mb-0 lh-lg">
                    The Platform performs several automated actions that may affect your account,
                    applications, or job postings. By using the Platform, you acknowledge and agree
                    to the following automated processes:
                  </p>
                  <ul className="text-muted lh-lg mb-0">
                    <li><strong>Auto-Publishing of Draft Jobs:</strong> Job postings created without save-as-draft mode are automatically published after a short editing window (approximately 5 minutes).</li>
                    <li><strong>Auto-Closing of Expired Jobs:</strong> Jobs whose application end date has passed are automatically closed and stop accepting applications.</li>
                    <li><strong>Auto-Submission of Timed Assessments:</strong> Candidate assessments with an active timer are automatically submitted when the timer expires. Answers saved up to that point are graded.</li>
                    <li><strong>Auto-Rejection of Applications:</strong> Applications for which the candidate does not complete the required assessment within the deadline (typically 3 days) may be automatically rejected. A notification email is sent to the candidate.</li>
                    <li><strong>Auto-Locking of Assessments:</strong> Assessments are automatically locked when the associated job is published or the draft editing window expires. Locked assessments cannot be modified.</li>
                    <li><strong>Auto-Matching:</strong> When a candidate applies to a job, the Platform automatically parses their CV, generates embeddings, computes a match score, and stores the result as part of the application.</li>
                  </ul>
                  <p className="text-muted mt-3 mb-0 lh-lg">
                    These automated processes are designed to ensure the smooth operation of the
                    Platform. We are not liable for any consequences arising from these automated
                    actions, including but not limited to auto-rejected applications due to missed
                    deadlines, auto-submitted assessments, or auto-closed jobs.
                  </p>
                </section>

                <hr className="my-4" />

                {/* 18. Communications */}
                <section>
                  <h2 className="fs-5 fw-bold mb-2">18. Communications</h2>
                  <p className="text-muted mb-0 lh-lg">
                    By creating an account, you consent to receive electronic communications from
                    Joblio. These communications may include:
                  </p>
                  <ul className="text-muted lh-lg mb-0">
                    <li>Email verification messages (sent after registration).</li>
                    <li>Password reset links (sent upon your request).</li>
                    <li>Application status notifications (accepted, rejected, or reviewed).</li>
                    <li>Assessment invitations and deadline reminders.</li>
                    <li>Automatic rejection notifications for missed assessment deadlines.</li>
                    <li>Service-related announcements and important account updates.</li>
                  </ul>
                  <p className="text-muted mt-3 mb-0 lh-lg">
                    You may opt out of non-essential communications through your account settings or
                    by contacting us. However, you cannot opt out of essential service-related
                    communications such as email verification, password resets, or legal notices.
                  </p>
                  <p className="text-muted mb-0 lh-lg">
                    Communications between recruiters and candidates are facilitated through the
                    Platform. Recruiters may send email invitations to candidates. Candidates will
                    receive email notifications about their application status changes.
                  </p>
                </section>

                <hr className="my-4" />

                {/* 19. Intellectual Property */}
                <section>
                  <h2 className="fs-5 fw-bold mb-2">19. Intellectual Property</h2>
                  <p className="text-muted mb-0 lh-lg">
                    <strong>Platform IP:</strong> The Joblio name, logo, brand, software, design,
                    layout, and all non-user-generated content are the exclusive property of Joblio
                    or its licensors. The Platform's code, AI models (excluding third-party
                    providers), algorithms, and proprietary technology are protected by copyright,
                    trademark, and other intellectual property laws. You may not copy, modify,
                    reverse-engineer, distribute, sell, or create derivative works of the Platform
                    without our express written permission.
                  </p>
                  <p className="text-muted mb-0 lh-lg">
                    <strong>User Content IP:</strong> As stated in Section 12, you retain all
                    ownership rights to your User Content. You grant Joblio a limited license to
                    process and display your content as necessary to provide the Platform's services.
                  </p>
                  <p className="text-muted mb-0 lh-lg">
                    <strong>Feedback:</strong> If you provide us with suggestions, ideas, or feedback
                    about the Platform, you grant us an unrestricted, perpetual, irrevocable,
                    royalty-free license to use and incorporate that feedback without compensation.
                  </p>
                </section>

                <hr className="my-4" />

                {/* 20. Service Availability */}
                <section>
                  <h2 className="fs-5 fw-bold mb-2">20. Service Availability</h2>
                  <p className="text-muted mb-0 lh-lg">
                    We strive to keep the Platform available and accessible at all times. However, we
                    do not guarantee uninterrupted, error-free, or continuous service. The Platform
                    may be temporarily unavailable due to:
                  </p>
                  <ul className="text-muted lh-lg mb-0">
                    <li>Scheduled maintenance or upgrades.</li>
                    <li>Downtime or performance issues with third-party providers (Google Gemini, Supabase, MongoDB, or others).</li>
                    <li>Unforeseen technical failures, network issues, or force majeure events.</li>
                    <li>Rate limits or capacity constraints imposed by third-party AI providers.</li>
                  </ul>
                  <p className="text-muted mt-3 mb-0 lh-lg">
                    We are not liable for any loss, inconvenience, or damage resulting from service
                    unavailability. We will use reasonable efforts to notify users in advance of
                    planned maintenance and to restore service promptly after any unplanned outage.
                  </p>
                </section>

                <hr className="my-4" />

                {/* 21. Disclaimer of Warranties */}
                <section>
                  <h2 className="fs-5 fw-bold mb-2">21. Disclaimer of Warranties</h2>
                  <p className="text-muted mb-0 lh-lg">
                    THE PLATFORM AND ALL FEATURES, INCLUDING AI-GENERATED OUTPUTS, ARE PROVIDED "AS
                    IS" AND "AS AVAILABLE" WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR
                    IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, JOBLIO DISCLAIMS ALL WARRANTIES,
                    INCLUDING BUT NOT LIMITED TO:
                  </p>
                  <ul className="text-muted lh-lg mb-0">
                    <li>Warranties of merchantability, fitness for a particular purpose, and non-infringement.</li>
                    <li>Warranties that the Platform will be uninterrupted, error-free, secure, or free from viruses or other harmful components.</li>
                    <li>Warranties regarding the accuracy, completeness, reliability, or usefulness of any AI-generated content, match scores, candidate analyses, feedback, or assessment results.</li>
                    <li>Warranties that any job posting will result in a successful hire or that any application will lead to employment.</li>
                  </ul>
                  <p className="text-muted mt-3 mb-0 lh-lg">
                    NO ADVICE OR INFORMATION OBTAINED THROUGH THE PLATFORM CREATES ANY WARRANTY NOT
                    EXPRESSLY STATED IN THESE TERMS.
                  </p>
                </section>

                <hr className="my-4" />

                {/* 22. Limitation of Liability */}
                <section>
                  <h2 className="fs-5 fw-bold mb-2">22. Limitation of Liability</h2>
                  <p className="text-muted mb-0 lh-lg">
                    TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL JOBLIO, ITS
                    OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR THIRD-PARTY SERVICE PROVIDERS BE
                    LIABLE FOR ANY:
                  </p>
                  <ul className="text-muted lh-lg mb-0">
                    <li>INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.</li>
                    <li>LOSS OF PROFITS, REVENUE, DATA, OR BUSINESS OPPORTUNITIES.</li>
                    <li>DAMAGES ARISING FROM HIRING DECISIONS MADE BASED ON AI-GENERATED OUTPUTS, MATCH SCORES, OR ANALYSES.</li>
                    <li>DAMAGES ARISING FROM AUTOMATED PLATFORM ACTIONS (AUTO-REJECTION, AUTO-SUBMISSION, AUTO-CLOSING OF JOBS).</li>
                    <li>DAMAGES ARISING FROM UNAUTHORISED ACCESS TO YOUR ACCOUNT OR DATA.</li>
                    <li>DAMAGES ARISING FROM THIRD-PARTY SERVICE PROVIDER FAILURES.</li>
                  </ul>
                  <p className="text-muted mt-3 mb-0 lh-lg">
                    OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING FROM OR RELATING TO THESE TERMS
                    OR YOUR USE OF THE PLATFORM SHALL NOT EXCEED THE GREATER OF $100 OR THE TOTAL
                    AMOUNTS PAID BY YOU TO JOBLIO IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM (IF
                    ANY). THIS LIMITATION APPLIES REGARDLESS OF THE LEGAL THEORY UNDER WHICH THE
                    CLAIM IS BROUGHT, WHETHER IN CONTRACT, TORT, NEGLIGENCE, STRICT LIABILITY, OR
                    OTHERWISE.
                  </p>
                </section>

                <hr className="my-4" />

                {/* 23. Indemnification */}
                <section>
                  <h2 className="fs-5 fw-bold mb-2">23. Indemnification</h2>
                  <p className="text-muted mb-0 lh-lg">
                    You agree to indemnify, defend, and hold harmless Joblio, its affiliates,
                    officers, directors, employees, and agents from and against any and all claims,
                    liabilities, damages, losses, costs, and expenses (including reasonable legal
                    fees) arising out of or related to:
                  </p>
                  <ul className="text-muted lh-lg mb-0">
                    <li>Your use of the Platform in violation of these Terms.</li>
                    <li>Your User Content, including any claims that your content infringes third-party rights or violates applicable law.</li>
                    <li>Your violation of any applicable law, regulation, or third-party right.</li>
                    <li>Any dispute between you and another user of the Platform (including disputes between recruiters and candidates).</li>
                    <li>Your job postings, including claims of discrimination, misrepresentation, or unlawful employment practices.</li>
                  </ul>
                </section>

                <hr className="my-4" />

                {/* 24. Account Suspension & Termination */}
                <section>
                  <h2 className="fs-5 fw-bold mb-2">24. Account Suspension &amp; Termination</h2>
                  <p className="text-muted mb-0 lh-lg">
                    <strong>Suspension:</strong> We may suspend your access to the Platform
                    immediately without prior notice if we reasonably believe that you have violated
                    these Terms, engaged in prohibited conduct (as described in Section 14), or if
                    your actions pose a security or legal risk to Joblio, other users, or third
                    parties.
                  </p>
                  <p className="text-muted mb-0 lh-lg">
                    <strong>Termination by You:</strong> You may terminate your account at any time
                    by contacting us or through your account settings (where available). Upon
                    termination, your access to the Platform will cease. Your User Content may be
                    retained or deleted in accordance with our Privacy Policy and data retention
                    practices.
                  </p>
                  <p className="text-muted mb-0 lh-lg">
                    <strong>Termination by Us:</strong> We reserve the right to terminate or
                    permanently disable your account for any reason, including but not limited to:
                  </p>
                  <ul className="text-muted lh-lg mb-0">
                    <li>Repeated or serious violations of these Terms.</li>
                    <li>Creation of fake or fraudulent job listings.</li>
                    <li>Harvesting or misusing candidate data.</li>
                    <li>Engaging in discriminatory hiring practices.</li>
                    <li>Inactivity for an extended period.</li>
                    <li>Request by law enforcement or government agency.</li>
                    <li>Upon your death or if your organisation ceases to exist.</li>
                  </ul>
                  <p className="text-muted mt-3 mb-0 lh-lg">
                    Upon termination, your right to use the Platform immediately ceases. Sections
                    that by their nature should survive termination (including but not limited to
                    Sections 12, 15, 19, 21, 22, 23, and 26) will survive.
                  </p>
                </section>

                <hr className="my-4" />

                {/* 25. Changes to These Terms */}
                <section>
                  <h2 className="fs-5 fw-bold mb-2">25. Changes to These Terms</h2>
                  <p className="text-muted mb-0 lh-lg">
                    We may modify these Terms from time to time. When we make material changes, we
                    will notify you by updating the "Last updated" date at the top of these Terms
                    and, where appropriate, by sending an email notification to the address
                    associated with your account.
                  </p>
                  <p className="text-muted mb-0 lh-lg">
                    Changes become effective on the date they are posted. Your continued use of the
                    Platform after any changes indicates your acceptance of the revised Terms. If you
                    do not agree with the changes, you must stop using the Platform and terminate
                    your account.
                  </p>
                  <p className="text-muted mb-0 lh-lg">
                    We encourage you to review these Terms periodically for any updates.
                  </p>
                </section>

                <hr className="my-4" />

                {/* 26. Governing Law */}
                <section>
                  <h2 className="fs-5 fw-bold mb-2">26. Governing Law</h2>
                  <p className="text-muted mb-0 lh-lg">
                    These Terms shall be governed by and construed in accordance with the laws of the
                    Arab Republic of Egypt, without regard to its conflict of law principles.
                  </p>
                  <p className="text-muted mb-0 lh-lg">
                    Any dispute arising out of or relating to these Terms or your use of the Platform
                    shall be resolved exclusively in the courts of Cairo, Egypt. You hereby submit to
                    the personal jurisdiction of such courts for the purpose of any such dispute.
                  </p>
                  <p className="text-muted mb-0 lh-lg">
                    Notwithstanding the foregoing, Joblio may seek injunctive or other equitable
                    relief in any court of competent jurisdiction to protect its intellectual property
                    or confidential information.
                  </p>
                </section>

                <hr className="my-4" />

                {/* 27. Contact Information */}
                <section>
                  <h2 className="fs-5 fw-bold mb-2">27. Contact Information</h2>
                  <p className="text-muted mb-0 lh-lg">
                    If you have any questions, concerns, or requests regarding these Terms or the
                    Platform, you may contact us at:
                  </p>
                  <p className="text-muted mb-0 lh-lg">
                    <strong>Email:</strong> support@joblio.app<br />
                    <strong>Legal Inquiries:</strong> legal@joblio.app
                  </p>
                  <p className="text-muted mb-0 lh-lg">
                    We will use reasonable efforts to respond to your inquiry within a reasonable
                    timeframe.
                  </p>
                </section>

              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
