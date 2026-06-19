# HireAI UI Export — Screen Catalog & Route Mapping

> **Source:** `UI Export/HR_ (2).zip` (extracted to `UI Export/` and copied to `src/assets/screens/`)  
> **Generated:** 2026-06-19  
> **Status:** Export is the visual source of truth. Architecture/routing/services unchanged unless noted below.

---

## 1. Screen Catalog (27 files)

### Public / Auth (3 numbered + 0 unnumbered)

| # | Export File | Role | Description |
|---|-------------|------|-------------|
| 01 | `01 — Landing Page.png` | Public | Marketing landing: hero, features, workflow, CTA, footer |
| 03 | `03 — login.png` | Auth | Split login: purple promo panel + form (single Login button) |
| 03 | `03 — Register.png` | Auth | Split register: role cards (Candidate/Recruiter), phone field |

### Candidate (13 screens)

| # | Export File | Role | Description |
|---|-------------|------|-------------|
| 04 | `04 — Complete Profile.png` | Candidate | Onboarding profile form (avatar, resume upload) |
| 05 | `05 — Candidate Dashboard.png` | Candidate | Dashboard: stats, recent applications, assessments todo |
| 06 | `06 — Browse Jobs.png` | Candidate | Job grid with filters, Go Pro sidebar card |
| 07 | `07 — Job Details.png` | Candidate | Job detail + apply sidebar |
| 08 | `08 — Apply Job.png` | Candidate | CV upload + cover letter |
| 09 | `09 — Application Submitted.png` | Candidate | Success confirmation after apply |
| 10 | `10 — My Applications.png` | Candidate | Applications table |
| 11 | `11 — Application Details (Pending Review).png` | Candidate | Pending state |
| 11 | `11 — Application Details (Accepted).png` | Candidate | Accepted/shortlisted state |
| 11 | `11 — Application Details (Rejected).png` | Candidate | Rejected state + AI feedback CTA |
| 12 | `12 — Assessment.png` | Candidate | Fullscreen assessment quiz |
| 14 | `14 — AI Feedback Report (Rejected Flow).png` | Candidate | AI feedback report |
| 15 | `15 — Profile.png` | Candidate | Candidate profile page |

### Recruiter (9 numbered + 2 unnumbered)

| # | Export File | Role | Description |
|---|-------------|------|-------------|
| 16 | `16 — Recruiter Dashboard.png` | Recruiter | KPI cards, recent apps, AI matches, charts |
| — | `image 1.png` | Recruiter | **My Jobs** list (job cards, Create Job) |
| — | `image 2.png` | Recruiter | **Create New Job** multi-step form |
| 19 | `19 — Assessment Generator.png` | Recruiter | AI-generated assessment questions |
| 21 | `21 — Applicants List.png` | Recruiter | Ranked applicants for a role |
| 22 | `22 — Candidate Review.png` | Recruiter | Full candidate profile review |
| 23 | `23 — AI Recommendation.png` | Recruiter | Candidate Synthesis / AI recommendation |
| 24 | `24 — Feedback Report (Recruiter View).png` | Recruiter | Recruiter feedback report |
| 25 | `25 — Top Candidates.png` | Recruiter | Top 10 podium rankings |
| 26 | `26 — Email Invitations.png` | Recruiter | Bulk email invitation composer |

### Shared Assets (1)

| File | Usage |
|------|-------|
| `AdobeExpressPhotos_...png` | Auth left-panel 3D illustration (login/register) |

---

## 2. Screen → Route Mapping

### All routes (including newly added)

| Export Screen | Route | Page Component | Status |
|---------------|-------|----------------|--------|
| 04 Complete Profile | `/candidate/profile/complete` | `CompleteProfilePage` (standalone) | Implemented |
| 09 Application Submitted | `/candidate/application-submitted` | `ApplicationSubmittedPage` (standalone) | Implemented |
| 15 Profile | `/candidate/profile` | `CandidateProfilePage` | Implemented |
| image 1 My Jobs | `/recruiter/jobs` | `MyJobsPage` | Implemented |
| image 2 Create Job | `/recruiter/jobs/new` | `PostJobPage` | Multi-step UI |
| 19 Assessment Generator | `/recruiter/assessment-generator` | `AssessmentGeneratorPage` | Implemented |
| 23 AI Recommendation | `/recruiter/ai-recommendation` | `AIRecommendationPage` | Implemented |
| 26 Email Invitations | `/recruiter/email-invitations` | `EmailInvitationsPage` | Implemented |
| — About (retained) | `/about` | `AboutPage` (direct URL only, not in navbar) | Retained |

### Previously implemented routes

| Export Screen | Current Route | Page Component | Match Status |
|---------------|---------------|----------------|--------------|
| 01 Landing Page | `/` | `LandingPage` | Update UI |
| 03 login | `/login` | `LoginPage` | Update UI |
| 03 Register | `/register` | `RegisterPage` | Update UI |
| 05 Candidate Dashboard | `/candidate/dashboard` | `CandidateDashboard` | Update UI |
| 06 Browse Jobs | `/candidate/jobs` | `BrowseJobsPage` | Update UI |
| 07 Job Details | `/candidate/jobs/:id` | `JobDetailPage` | Update UI |
| 08 Apply Job | `/candidate/jobs/:id/apply` | `ApplyJobPage` | Update UI |
| 10 My Applications | `/candidate/applications` | `MyApplicationsPage` | Update UI |
| 11 Application Details (×3) | `/candidate/applications/:id` | `ApplicationDetailPage` | Update UI (status variants) |
| 12 Assessment | `/candidate/assessments` | `AssessmentPage` | Update UI |
| 14 AI Feedback Report | `/candidate/feedback` | `AIFeedbackPage` | Update UI |
| 16 Recruiter Dashboard | `/recruiter/dashboard` | `RecruiterDashboard` | Update UI |
| 21 Applicants List | `/recruiter/applications` | `ApplicantsListPage` | Update UI |
| 22 Candidate Review | `/recruiter/candidates/:id` | `CandidateReviewPage` | Update UI |
| 24 Feedback (Recruiter) | `/recruiter/feedback` | `RecruiterFeedbackPage` | Update UI |
| 25 Top Candidates | `/recruiter/top-candidates` | `TopCandidatesPage` | Update UI |

### Export screens with NO current route (reported — not implemented without routing change)

_All previously missing routes have been implemented. See table above._

### Current route with NO export screen

| Current Route | Page | Notes |
|---------------|------|-------|
| `/about` | `AboutPage` | Not in UI export — keep or remove per product decision |

---

## 3. Candidate vs Recruiter Screens

### Candidate (13 export screens)

`04, 05, 06, 07, 08, 09, 10, 11×3, 12, 14, 15`

**Export sidebar (consistent):** Dashboard · Jobs · Applications · Assessments · Feedback · Profile  
**Bottom widget:** Go Pro / Pro Account upgrade card (varies by screen)

### Recruiter (11 export screens)

`16, image1, image2, 19, 21, 22, 23, 24, 25, 26`

**Export sidebar (varies — see inconsistencies):**
- Screen 16: Dashboard · Jobs · Applications · **Talent Pool** · **Analytics** · Profile
- Screens 19–26, image1, image2: Dashboard · Jobs · Applications · **Assessments** · **Feedback** · Profile

---

## 4. Gaps & Inconsistencies (read before UI work)

### Missing screen numbers in export
`02, 13, 17, 18, 20` — no files provided. Likely candidates:
- **17/18/20:** may have been merged into `image 1` (My Jobs) or `image 2` (Create Job)
- **13:** unknown (possibly removed from scope)
- **02:** unknown (possibly removed from scope)

### Duplicate numbering
| Number | Files |
|--------|-------|
| **03** | login.png + Register.png |
| **11** | Accepted + Pending Review + Rejected (intentional status variants) |

### Internal export inconsistencies
1. **Recruiter sidebar differs** between screen 16 (Talent Pool, Analytics) vs screens 19–26 (Assessments, Feedback). App uses the **Assessments / Feedback** pattern (majority of export screens).
2. **Recruiter Dashboard (16)** shows charts (Candidate Source, Monthly Goal) not present on other recruiter screens.
3. **Login screen** shows single “Login” button; app uses demo role toggle for quick access (functional placeholder).
4. **Top Candidates (25)** not in recruiter sidebar — reached from Applications / Dashboard.
5. **Recruiter Profile** appears in export sidebar; no dedicated profile route — nav item links to dashboard as placeholder.

### Implementation status (2026-06-19)

| Area | Status |
|------|--------|
| All 27 export screens | Routed and implemented |
| Option 2 missing routes | Complete |
| Post Job (image 2) | Multi-step form + live preview + AI optimization |
| About page | Retained at `/about`, not in navbar |
| Architecture | Page → Service → Mock unchanged |

---

## 5. Asset Paths (for implementation)

```
src/assets/
├── screens/           # Reference PNGs (one per export screen)
├── illustrations/
│   └── auth-hero.png  # Login/register left panel
```

Reference screens during UI implementation:
`import ref from '../../assets/screens/05-candidate-dashboard.png'` (for dev comparison only)

---

## 6. Implementation Priority (UI layer only)

1. Shared: sidebars, topbar, navbar, footer, `index.css` tokens
2. Public/Auth: Landing, Login, Register
3. Candidate: Dashboard → Jobs flow → Applications → Assessment → Feedback
4. Recruiter: Dashboard → Post Job → Applicants → Review → Feedback → Top Candidates
