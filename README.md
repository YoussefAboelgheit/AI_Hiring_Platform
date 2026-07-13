# Joblio

> A full-stack recruitment platform that leverages Google Gemini AI and vector embeddings to automate the full hiring lifecycle — from CV parsing and job matching to AI-generated assessments and intelligent candidate analysis.

The platform connects **candidates** and **recruiters** through an intelligent, AI-driven pipeline. Recruiters create jobs with auto-generated assessments, candidates apply with CVs that are automatically parsed and semantically matched, and the system provides AI-powered scoring, analysis, proctoring, and feedback.

---

## 1. Overview

HireAI streamlines recruitment by replacing manual screening with AI-driven automation. Candidates browse and apply to jobs, while their CVs are parsed by Gemini AI into structured data. Vector embeddings (via Ollama or OpenAI) enable semantic matching between resumes and job descriptions, producing a 0–100 match score. HR teams can generate AI-powered assessments with anti-cheating proctoring, analyze candidates, and send automated feedback.

The system uses a **Controller-Service-Repository** architecture on Express.js with MongoDB persistence, JWT dual-token authentication, Supabase file storage, and background workers for publishing, expiry, and enrichment tasks.

---

## 2. Features

### Authentication & Security
Registration with email verification, JWT access + refresh tokens, password reset via email, token blacklisting on logout, and httpOnly cookie-based refresh. Three roles enforced: candidate, hr, admin.

### Candidate
Browse published jobs with filtering, search, and pagination. Apply with CV upload (PDF/DOCX) — CV is automatically parsed by Gemini, embedded as a vector, and semantically matched against the job. Take AI-generated assessments with anti-cheating proctoring (8 violation types, 3-strike auto-submit). View application status and AI-generated feedback on rejections. Save jobs for later. Chat with the AI assistant or practice with mock interviews tailored to specific jobs.

### Recruiter / HR
Create job drafts with a 5-minute editable window (auto-publishes after expiry). Configure AI, manual, or no assessment per job. Review, edit, regenerate, or delete assessment questions during the draft window. View applicants sorted by match score and assessment score. Request AI analysis of individual candidates or top 3 matches. Generate and send AI-powered feedback to rejected candidates. Manage company profile with detailed information.

### Admin
Dashboard overview, full user management (CRUD), force publish/close/delete any job, and category management.

### AI Capabilities

**Resume Parsing** — When a candidate uploads a CV (PDF/DOCX), text is extracted via `pdf-parse` or `mammoth` and sent to Gemini AI. The model returns structured JSON: name, contact, skills, work experience, education, projects, certifications, and a professional summary. The parsed data is stored as a `ParsedResume` and linked to the user profile for reuse across applications.

**Job Enrichment** — Job postings created by HR are automatically parsed by Gemini to extract normalized fields: required and preferred skills, experience level, education requirements, responsibilities, benefits, location, salary range, and keywords. A rule-based fallback parser kicks in if the AI call fails (configurable via environment variables).

**Vector Embeddings** — Both resumes and jobs are converted into vector embeddings using Ollama (`nomic-embed-text` model, local) or OpenAI (`text-embedding-3-small`). Embeddings are stored directly in MongoDB documents and optionally in Supabase pgvector for advanced vector search.

**Semantic Matching** — When a candidate applies, cosine similarity is computed between the resume embedding and the job embedding. The raw similarity score (range -1 to 1) is converted to a 0–100 match score and stored on the application. This powers the HR sorting view where candidates are ranked by best match.

**Assessment Generation** — HR can configure AI-powered assessments by specifying question count, difficulty (Auto, Easy, Medium, Hard, Mixed), and topics. Gemini generates a repository of `questionCount × 5` multiple-choice questions, each with 4 options, a correct answer, an explanation, and a difficulty label. When a candidate takes the assessment, a random subset of `questionCount` questions is selected, preventing answer sharing between candidates.

**Candidate Analysis** — HR can request AI analysis of individual applicants or the top 3 matched candidates. Gemini evaluates the candidate's resume and assessment results against the job requirements and returns: strengths, weaknesses, a concise summary, and a hire recommendation. Results are cached to avoid regenerating on repeat views.

**Candidate Feedback** — For rejected candidates, HR can generate AI-powered feedback reports. Gemini produces encouraging, constructive feedback including strengths, areas for improvement, and specific advice on how to grow — written in candidate-friendly language. The feedback is stored on the application and visible to the candidate.

**AI Chat and Mock Interviews** — Candidates can start general career chats or job-specific mock interviews. For mock interviews, Gemini simulates a real interviewer using the job's requirements as context, evaluates answers, and provides feedback. When the interview ends, Gemini generates a comprehensive performance summary covering strengths, weaknesses, and recommendations.

### Anti-Cheating
Before starting an assessment, candidates see an instructions page. The assessment enforces fullscreen mode and tracks 8 violation types: tab switch, fullscreen exit, copy, paste, cut, right-click, drag start, and devtools shortcut. At 3 violations the candidate is flagged and the assessment is auto-submitted. All violations are recorded with timestamps for HR review.

---

## 3. Prerequisites

- **Node.js 18+** (tested with 22+)
- **MongoDB** instance (local or Atlas)
- **Ollama** (optional) — for local embeddings with `nomic-embed-text` model
- **Google Gemini API key** (optional) — for AI features

---

## 4. Installation

Clone the repository and install dependencies:

```bash
git clone <repo-url>
cd AI_Hiring_Platform/Backend
npm install
cp .env.example .env
```

Configure the `.env` file with your values (at minimum `MONGO_URI`, `JWT_ACCESS_TOKEN_SECRET`, `JWT_REFRESH_TOKEN_SECRET`).

Then install frontend dependencies:

```bash
cd ../Frontend
npm install
cp .env.example .env
```

Optionally seed the database with an admin user:

```bash
cd ../Backend
npm run seed
```

---

## 5. Environment Variables

**Server** — `PORT` (default 3001), `MONGO_URI`, `NODE_ENV`

**JWT** — `JWT_ACCESS_TOKEN_SECRET`, `JWT_ACCESS_TOKEN_EXP` (default 30m), `JWT_REFRESH_TOKEN_SECRET`, `JWT_REFRESH_TOKEN_EXP` (default 7d)

**Email** — `EMAIL_USER`, `EMAIL_PASS`, `CLIENT_URL`, `SERVER_URL`

**Supabase** — `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET` (default uploads)

**Gemini AI** — `GEMINI_API_KEY`, `GEMINI_MODEL` (default gemini-flash-lite-latest), `GEMINI_MAX_ATTEMPTS` (default 2), `GEMINI_RETRY_DELAY_MS` (default 700), `GEMINI_TIMEOUT_MS` (default 30000)

**Embeddings** — `OLLAMA_EMBED_URL` (default http://localhost:11434/api/embed), `OLLAMA_EMBED_MODEL` (default nomic-embed-text), `EMBEDDING_TIMEOUT_MS` (default 30000)

**Parser** — `JOB_PARSER_PROVIDER` (default local), `JOB_PARSER_FALLBACK_ON_AI_FAILURE` (default true)

---

## 6. Running the Project

**Backend** — starts on port 3001 with Swagger docs at `/docs`:

```bash
cd Backend
npm run dev
```

**Frontend** — starts on port 5173 with API proxy to the backend:

```bash
cd Frontend
npm run dev
```

**Tests** — uses Node.js built-in test runner:

```bash
cd Backend
npm test
```

---

## 7. Authors

**Joblio Team**

---

## 8. License

All Rights Reserved.

This project and its source code are proprietary and confidential. Unauthorized copying, distribution, modification, or use of this software, via any medium, is strictly prohibited without prior written permission.
