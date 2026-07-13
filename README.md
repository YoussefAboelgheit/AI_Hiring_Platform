# HireAI — AI-Powered Hiring Platform

> A full-stack recruitment platform that leverages Google Gemini AI and vector embeddings to automate the full hiring lifecycle — from CV parsing and job matching to AI-generated assessments and intelligent candidate analysis.

**Main Purpose:** Streamline recruitment by connecting candidates and recruiters through an intelligent, AI-driven pipeline. Recruiters create jobs with auto-generated assessments, candidates apply with CVs that are automatically parsed and matched, and the platform provides AI-powered scoring, analysis, and anti-cheating measures.

---

## Table of Contents

- [Features](#features) — Registration, JWT auth, email verification, candidate/recruiter/admin capabilities, AI CV parsing, job matching, assessments, chat, and anti-cheating
- [Tech Stack](#tech-stack) — React 19, Express 4, MongoDB, Google Gemini AI, Ollama/OpenAI embeddings, Supabase Storage, JWT auth, and supporting libraries


- [Environment Variables](#environment-variables) — All required and optional config: server, JWT, email, Supabase, Gemini, Ollama, embedding, and parser settings
- [Installation](#installation) — Prerequisites, dependency setup, .env configuration, running backend/frontend, seeding data, and running tests

- [AI Features](#ai-features) — Resume parsing, job parsing, embedding generation, cosine similarity matching, assessment generation, candidate analysis, candidate feedback, and AI chat/mock interview
- [Assessment Flow](#assessment-flow) — Complete flow from job creation through assessment config, publishing, candidate application, quiz taking, auto-grading, and HR review
- [Anti-Cheating System](#anti-cheating-system) — 8 monitored violation types, 3-strike auto-submit rule, fullscreen enforcement, violation logging and HR review
- [Security](#security) — JWT dual-token auth, bcrypt hashing, token blacklisting, httpOnly cookies, RBAC, input validation, CORS, score visibility controls
- [Development Guidelines](#development-guidelines) — Folder organization, naming conventions, ES modules, middleware patterns, AI service isolation, Git workflow

- [Troubleshooting](#troubleshooting) — MongoDB connection issues, missing env vars, frontend API issues, build failures, AI/email/job auto-publish troubleshooting
- [Roadmap](#roadmap) — Planned enhancements: video interviews, WebSockets, analytics dashboard, calendar integration, multi-language support, HRIS integration

- [License](#license) — All Rights Reserved (proprietary and confidential)

---

## Features

### Authentication

- User registration (candidate / recruiter / admin)
- JWT-based login with access + refresh tokens
- Email verification flow
- Password reset via email
- Token blacklisting on logout
- Auto-refresh of expired access tokens via Axios interceptor

### Candidate

- Browse published jobs with filtering, search, and pagination
- View job details and enrichment data
- Apply to jobs with CV upload (PDF / DOCX)
- AI-powered CV parsing and job matching score (hidden from candidate)
- Take AI-generated assessments (multiple-choice quiz)
- Auto-save assessment progress
- Anti-cheating violation detection during assessments
- View application status (Pending / Reviewed / Accepted / Rejected)
- View AI-generated feedback reports on rejected applications
- Save jobs for later
- AI chat assistant and mock interview
- Profile management with CV, skills, education, experience

### Recruiter / HR

- Create job drafts with a 5-minute editable window (auto-publishes after expiry)
- Manage jobs (edit draft, close, delete)
- AI assessment generator (auto-generate questions via Gemini or add manually)
- Review, edit, regenerate, or delete assessment questions
- View applicants sorted by match score and assessment score
- AI-powered candidate analysis (strengths, weaknesses, summary, recommendation)
- Top candidates ranking with AI analysis
- Generate and send feedback reports to rejected candidates
- Bulk email invitations
- Profile management with company details

### Admin

- Dashboard overview
- User management (CRUD)
- Job management (force publish / close / delete any job)
- Category management (CRUD)

### AI Features

- **CV Parsing:** Extracts structured data (name, email, skills, experience, education, projects, etc.) from PDF/DOCX using Gemini AI
- **Job Parsing:** Extracts structured job data from job postings using Gemini AI with local fallback
- **Embeddings:** Generates vector embeddings for resumes and jobs using Ollama (`nomic-embed-text`) or OpenAI (`text-embedding-3-small`)
- **Similarity Search:** Cosine similarity between resume and job embeddings for match scoring
- **Assessment Generation:** Generates multiple-choice questions via Gemini (repository = questionCount × 5)
- **Candidate Analysis:** Analyzes applicants vs job requirements using Gemini
- **Candidate Feedback:** Generates constructive feedback for rejected candidates
- **AI Chat:** General career chat and mock interview simulation

### Anti-Cheating

- Instructions page shown before assessment starts
- Desktop-only enforcement via fullscreen mode
- Violation tracking: tab switch, fullscreen exit, copy, paste, cut, right-click, drag start, devtools shortcut
- Max 3 violations before auto-flag and auto-submit
- All violations recorded with timestamps for HR review

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19, Vite 8 |
| **Routing** | React Router v7 |
| **State Management** | TanStack Query v5 (server state), Context API (auth) |
| **UI Library** | Bootstrap 5, react-bootstrap, bootstrap-icons, react-icons |
| **Forms** | Formik, Yup |
| **Animation** | Framer Motion |
| **HTTP Client** | Axios |
| **Backend Runtime** | Node.js, Express 4 |
| **Database ODM** | Mongoose 8 (MongoDB) |
| **Authentication** | JWT (jsonwebtoken), bcryptjs |
| **Validation** | express-validator |
| **File Upload** | Multer |
| **File Storage** | Supabase Storage |
| **Vector Database** | Supabase pgvector (optional, alongside in-document embeddings) |
| **AI Provider** | Google Gemini AI (`@google/generative-ai`) |
| **Embeddings** | Ollama (`nomic-embed-text`) or OpenAI (`text-embedding-3-small`) |
| **PDF/DOCX Parsing** | pdf-parse, mammoth |
| **Email** | Nodemailer |
| **API Documentation** | Swagger UI (OpenAPI 3.0, YAML) |
| **Testing** | Node.js built-in `node:test` |
| **Logging** | Morgan |

---

## Project Structure

```
AI_Hiring_Platform/
├── Backend/
│   ├── __tests__/                     # Test files
│   │   └── assessmentViolation.test.js
│   ├── config/                        # Database, env, assessment constants
│   │   ├── assessment.js
│   │   ├── DB.js
│   │   └── env.js
│   ├── controllers/                   # Request handlers
│   │   ├── auth.controller.js
│   │   ├── assessment.controller.js
│   │   ├── category.controller.js
│   │   ├── chat.controller.js
│   │   ├── cvParser.controller.js
│   │   ├── embeddings.controller.js
│   │   ├── job.controller.js
│   │   └── user.controller.js
│   ├── docs/                          # Architecture and flow documentation
│   │   ├── flow.mermaid.md
│   │   ├── jobs-api.md
│   │   └── jobs-openapi.yaml
│   ├── middlewares/                    # Express middleware
│   │   ├── authMW.js                  #   JWT verification
│   │   ├── authorizeMW.js             #   Role-based access
│   │   ├── errorHandlingMW.js         #   Central error handler
│   │   ├── jobOwnershipMW.js          #   Job ownership checks
│   │   ├── jobOwnershipByJobIdMW.js
│   │   ├── notFoundMW.js              #   404 handler
│   │   ├── optionalAuthMW.js          #   Optional auth
│   │   └── uploadMW.js                #   Multer file upload
│   ├── models/                        # Mongoose schemas (17 models)
│   │   ├── assessment.js
│   │   ├── assessmentViolation.js
│   │   ├── blacklistedToken.js
│   │   ├── candidateAnswer.js
│   │   ├── candidateAssessment.js
│   │   ├── category.js
│   │   ├── chatConversation.js
│   │   ├── emailVerificationToken.js
│   │   ├── job.js
│   │   ├── jobApplication.js
│   │   ├── parsedJob.js
│   │   ├── parsedResume.js
│   │   ├── passwordResetToken.js
│   │   ├── question.js
│   │   ├── refreshToken.js
│   │   ├── savedJob.js
│   │   └── user.js
│   ├── routes/                        # Express route definitions
│   │   ├── auth.router.js
│   │   ├── category.router.js
│   │   ├── chat.router.js
│   │   ├── cv.router.js
│   │   ├── embeddings.router.js
│   │   ├── job.router.js
│   │   └── user.router.js
│   ├── scripts/                       # Migration scripts
│   │   └── migrate-remove-avatar.js
│   ├── services/                      # Business logic
│   │   ├── ai/                        #   AI-related services
│   │   │   ├── assessment/            #     Assessment generation service
│   │   │   ├── embeddings/            #     Embedding generation & tests
│   │   │   ├── parser/                #     JSON validator for AI output
│   │   │   ├── parsing/               #     Resume parser service
│   │   │   ├── prompts/               #     AI prompt templates
│   │   │   ├── providers/             #     AI provider factory & Gemini provider
│   │   │   ├── geminiClient.js        #     Core Gemini client with retry
│   │   │   ├── jobParserService.js    #     AI job parser
│   │   │   └── ...test scripts
│   │   ├── candidateAnalysis.service.js
│   │   ├── candidateFeedback.service.js
│   │   ├── chat.service.js
│   │   ├── embedding.service.js
│   │   ├── jobApplicationMatching.service.js
│   │   ├── jobEnrichment.service.js
│   │   ├── jobParser.service.js
│   │   ├── resumeEnrichment.service.js
│   │   └── vector.service.js
│   ├── util/                          # Utility functions
│   │   ├── apiFeatures.js             #   Query filtering, search, sort, paginate
│   │   ├── httpError.js               #   Custom HTTP error class
│   │   ├── seed.js                    #   Database seeder
│   │   ├── sendEmail.js               #   Email sender (Nodemailer)
│   │   └── supabaseClient.js          #   Supabase client
│   ├── validations/                   # express-validator schemas
│   │   ├── assessmentValidators.js
│   │   ├── authValidators.js
│   │   ├── categoryValidators.js
│   │   ├── chatValidators.js
│   │   ├── cvParserValidators.js
│   │   ├── jobValidators.js
│   │   ├── paramValidators.js
│   │   ├── userValidators.js
│   │   └── validateResults.js
│   ├── app.js                         # Express app setup
│   ├── server.js                      # Server entry point
│   ├── openapi.yaml                   # OpenAPI specification
│   ├── collection.json                # Postman collection
│   ├── package.json
│   └── .env.example
│
├── Frontend/
│   ├── public/
│   │   ├── favicon.png
│   │   └── favicon.svg
│   ├── docs/
│   │   └── UI_SCREEN_MAPPING.md
│   ├── src/
│   │   ├── assets/                    # Images, videos, illustrations
│   │   ├── components/                # Reusable React components
│   │   │   ├── admin/
│   │   │   ├── assessment/
│   │   │   ├── auth/
│   │   │   ├── candidate/
│   │   │   ├── common/
│   │   │   └── recruiter/
│   │   ├── constants/                 # Enums, query keys
│   │   ├── context/                   # React context providers
│   │   │   ├── AuthContext.jsx
│   │   │   ├── AppShellProvider.jsx
│   │   │   ├── shellContext.js
│   │   │   └── useAuth.js
│   │   ├── hooks/                     # Custom hooks
│   │   │   ├── useAntiCheating.js
│   │   │   └── useAssessment.js
│   │   ├── layouts/                   # Layout components per role
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── AuthLayout.jsx
│   │   │   ├── CandidateLayout.jsx
│   │   │   ├── PublicLayout.jsx
│   │   │   ├── RecruiterLayout.jsx
│   │   │   └── StandaloneLayout.jsx
│   │   ├── mock/                      # Mock data (development)
│   │   ├── pages/                     # Page components
│   │   │   ├── admin/                 #   4 pages
│   │   │   ├── auth/                  #   4 pages
│   │   │   ├── candidate/             #   15 pages
│   │   │   ├── public/                #   5 pages
│   │   │   ├── recruiter/             #   14 pages
│   │   │   └── settings/              #   1 page
│   │   ├── routes/                    # Route configuration
│   │   │   ├── AppRoutes.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── GuestRoute.jsx
│   │   │   └── rolePaths.js
│   │   ├── schemas/                   # Yup validation schemas
│   │   ├── services/                  # API client & service modules
│   │   │   ├── storage/               #   Local storage helpers
│   │   │   ├── apiClient.js           #   Axios client with interceptors
│   │   │   ├── authService.js
│   │   │   ├── jobService.js
│   │   │   ├── applicationService.js
│   │   │   ├── assessmentService.js
│   │   │   └── ...
│   │   ├── utils/                     # Utility functions
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

## Architecture Overview

The system follows a layered architecture:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 19 + Vite)                   │
│                                                                     │
│  Pages ──> Services (Axios) ──> Context/Auth ──> Components        │
│         TanStack Query for server state caching                    │
└──────────────────────────┬──────────────────────────────────────────┘
                           │  HTTP (JSON)
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    BACKEND API (Express.js)                         │
│                                                                     │
│  Routes ──> Middleware (auth, authorization, upload, validation)    │
│                │                                                    │
│                ▼                                                    │
│           Controllers (req/res handling)                            │
│                │                                                    │
│                ▼                                                    │
│           Services (business logic)                                 │
│            │              │                                         │
│            ▼              ▼                                         │
│      ┌──────────┐  ┌──────────┐                                     │
│      │ MongoDB   │  │ AI Layer │                                     │
│      │ (Mongoose)│  │          │                                     │
│      └──────────┘  │ Gemini   │                                     │
│                    │ Ollama   │                                     │
│                    │ OpenAI   │                                     │
│                    └──────────┘                                     │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │ External Services                                         │      │
│  │  ┌────────────┐  ┌────────────────┐  ┌───────────────┐   │      │
│  │  │ Supabase   │  │ Nodemailer     │  │ Supabase      │   │      │
│  │  │ (Storage)  │  │ (Email)        │  │ (pgvector)    │   │      │
│  │  └────────────┘  └────────────────┘  └───────────────┘   │      │
│  └──────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────┘
```

**Key architectural decisions:**

- **Draft → Auto-Publish:** Jobs are created as "Drafted" with a 5-minute editable window. After expiry, they auto-publish to "Open" status. A `setTimeout` per job + a `setInterval` fallback every 60 seconds ensures reliability across server restarts.
- **Assessment Repository:** Each assessment generates `questionCount × 5` questions. Each candidate receives a random subset of `questionCount` questions, preventing answer sharing.
- **Scores Hidden from Candidates:** Match scores, assessment scores, and AI evaluations are stripped from API responses for candidate-facing endpoints.
- **Dual Embedding Storage:** Embeddings are stored both in MongoDB documents (embedded) and optionally in Supabase pgvector for advanced vector search.
- **AI Provider Abstraction:** A provider factory pattern allows swapping AI providers (currently Gemini is the only implementation).

---

## Database Models

The platform uses **17 MongoDB collections** managed through Mongoose.

| Model | Collection | Purpose | Key Fields | Relationships |
|---|---|---|---|---|
| **User** | `users` | All platform users (candidate, hr, admin) | name, email, password (bcrypt), role, bio, skills, education, experience, CV, company details | Referenced by Job (recruiter), JobApplication (candidate), CandidateAssessment, etc. |
| **Job** | `jobs` | Job postings | title, description, workplace, jobType, skills, status, parsedJob, embedding, embeddingStatus | recruiter → User, category → Category, assessment → Assessment |
| **JobApplication** | `jobapplications` | Candidate job applications | CV, matchScore, matchingStatus, assessmentScore, assessmentStatus, aiEvaluation, status | job → Job, candidate → User, parsedResume → ParsedResume |
| **Assessment** | `assessments` | Assessment configuration per job | type (NONE/MANUAL/AI), questionCount, repositorySize, difficulty, status | job → Job (unique) |
| **Question** | `questions` | Assessment questions | question, options[4], correctAnswer, explanation, topic, difficulty | assessment → Assessment |
| **CandidateAssessment** | `candidateassessments` | Candidate assessment attempt | selectedQuestionIds, score, startedAt, submittedAt, status, violationCount, isFlagged | candidate → User, job → Job, assessment → Assessment |
| **CandidateAnswer** | `candidateanswers` | Individual answers per question | selectedAnswer, isCorrect | candidateAssessment → CandidateAssessment, question → Question |
| **AssessmentViolation** | `assessmentviolations` | Anti-cheating violations | type (TAB_SWITCH, FULLSCREEN_EXIT, COPY, etc.), timestamp, metadata | attempt → CandidateAssessment, candidate → User, assessment → Assessment |
| **Category** | `categories` | Job categories | name | Referenced by Job |
| **ParsedJob** | `parsedjobs` | AI-parsed job data | parsedData, isValid, validationErrors, embeddingRefs | job → Job |
| **ParsedResume** | `parsedresumes` | AI-parsed resume data | parsedData, isValid, embedding, embeddingStatus | user → User |
| **SavedJob** | `savedjobs` | Bookmarked jobs | - | candidate → User, job → Job |
| **ChatConversation** | `chatconversations` | AI chat sessions | type (general/mock_interview), messages[], status, title | candidate → User, job → Job |
| **RefreshToken** | `refreshtokens` | JWT refresh tokens | token (bcrypt), expiresAt | user → User |
| **BlacklistedToken** | `blacklistedtokens` | Invalidated JWT tokens | token (unique), expiresAt (TTL index) | - |
| **EmailVerificationToken** | `emailverificationtokens` | Email verification | token (bcrypt), expiresAt | user → User |
| **PasswordResetToken** | `passwordresettokens` | Password reset | token (bcrypt), expiresAt | user → User |

---

## API Documentation

All API endpoints are prefixed with `/api`. API documentation is available at `/docs` when the server is running (Swagger UI).

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Request Body | Response | Description |
|---|---|---|---|---|---|
| POST | `/register` | No | JSON: name, email, password, role + optional files | User object | Register new user (email verification sent) |
| POST | `/login` | No | JSON: email, password | accessToken, refreshToken (cookie) | Login with credentials |
| POST | `/logout` | Yes | - | Message | Logout (blacklists token) |
| POST | `/refresh` | No | - | accessToken | Refresh access token using httpOnly cookie |
| GET | `/me` | Yes | - | User object | Get current authenticated user |
| PATCH | `/reset-password` | Yes | JSON: currentPassword, newPassword | Message | Change password |
| POST | `/forgot-password` | No | JSON: email | Message | Send password reset email |
| POST | `/confirm-forgot-password` | No | JSON: token, newPassword | Message | Reset password with token |
| GET | `/verify-email` | No | Query: token | Message | Verify email address |
| POST | `/resend-verification-email` | No | JSON: email | Message | Resend verification email |

### Jobs (`/api/jobs`)

| Method | Endpoint | Auth | Request Body / Params | Response | Description |
|---|---|---|---|---|---|
| GET | `/` | No | Query: status, workplace, jobType, search, sort, page, limit, fields | Job[] | List published jobs (with filters) |
| GET | `/category/:category` | No | Path: category name | Job[] | List jobs by category |
| POST | `/` | HR | JSON: title, description, workplace, jobType, skills + optional assessment fields | Job | Create job draft (auto-assessment optional) |
| GET | `/:id` | No | Path: jobId | Job | Get job by ID |
| PATCH | `/:id` | HR | JSON: job fields | Job | Update draft job (within 5-min window) |
| DELETE | `/:id` | HR/Admin | Path: jobId | Message | Delete job |
| GET | `/:id/enrichment` | No | Path: jobId | Enrichment data | Get AI enrichment data (parsedJob, embedding) |

### Applications (`/api/jobs`)

| Method | Endpoint | Auth | Request Body | Response | Description |
|---|---|---|---|---|---|
| POST | `/:id/apply` | Candidate | Form-data: CV (PDF/DOCX) | Application | Apply to job with CV |
| GET | `/applied/me` | Candidate | - | Application[] | Get my applications (scores hidden) |
| GET | `/applications/:id` | Candidate | Path: applicationId | Application | Get single application (scores hidden) |
| POST | `/applications/:id/retry` | Candidate | Form-data: CV | Application | Retry failed match calculation |
| GET | `/hr/my-jobs/applications` | HR | - | Jobs with applications | Get all jobs with applications + scores |
| GET | `/:id/applications` | HR | Path: jobId | Applications with scores | Get applications for a job |
| PATCH | `/:jobId/applications/:applicationId/status` | HR | JSON: status | Application | Update application status |
| GET | `/:id/applications/top-analysis` | HR/Admin | Path: jobId | Top candidates analysis | AI analysis of top 3 candidates |
| GET | `/:jobId/applications/:applicationId/analysis` | HR/Admin | Path: jobId, applicationId | Candidate analysis | AI analysis of single candidate |
| GET | `/applications/:applicationId/feedback` | Candidate | Path: applicationId | Feedback report | AI feedback for candidate |
| POST | `/saved/me` | Candidate | - | SavedJob | Get my saved jobs |
| POST | `/:jobId/save` | Candidate | Path: jobId | SavedJob | Toggle save job |

### Assessments - HR (`/api/jobs`)

| Method | Endpoint | Auth | Request Body | Response | Description |
|---|---|---|---|---|---|
| POST | `/:jobId/assessment/generate` | HR | JSON: questionCount, difficulty, topics | Assessment | Generate AI questions |
| GET | `/:jobId/assessment` | HR/Candidate | Path: jobId | Assessment + Questions | Get assessment (HR sees answers, candidate does not) |
| PATCH | `/:jobId/assessment` | HR | JSON: type, questionCount, difficulty, topics | Assessment | Update assessment settings |
| POST | `/:jobId/assessment/regenerate` | HR | - | Assessment | Regenerate all questions |
| POST | `/:jobId/assessment/questions` | HR | JSON: question, options, correctAnswer, explanation, topic, difficulty | Question | Add manual question |
| PUT | `/assessment/questions/:questionId` | HR | JSON: question fields | Question | Edit a question |
| DELETE | `/assessment/questions/:questionId` | HR | Path: questionId | 204 | Delete a question |
| POST | `/assessment/questions/:questionId/regenerate` | HR | Path: questionId | Question | Regenerate one question via AI |

### Assessments - Candidate (`/api/jobs`)

| Method | Endpoint | Auth | Request Body | Response | Description |
|---|---|---|---|---|---|
| POST | `/:jobId/assessment/start` | Candidate | Path: jobId | CandidateAssessment + Questions | Start assessment (random question subset) |
| POST | `/:jobId/assessment/answers` | Candidate | Path: jobId | Message | Auto-save answers |
| POST | `/:jobId/assessment/submit` | Candidate | JSON: answers[{questionId, selectedAnswer}] | Score result | Submit and auto-grade |
| POST | `/:jobId/assessment/violations` | Candidate | JSON: type, metadata | Message | Report a violation |
| GET | `/:jobId/assessment/violations` | HR | Path: jobId | Violation[] | Get violations for a job |

### Admin (`/api/jobs/admin`)

| Method | Endpoint | Auth | Request Body | Response | Description |
|---|---|---|---|---|---|
| PATCH | `/:id/status` | Admin | JSON: status (Drafted/Open/Closed) | Job | Update any job's status |
| DELETE | `/:id` | Admin | Path: jobId | Message | Delete any job |

### Categories (`/api/categories`)

| Method | Endpoint | Auth | Request Body | Response | Description |
|---|---|---|---|---|---|
| GET | `/` | No | - | Category[] | List all categories |
| GET | `/:id` | No | Path: categoryId | Category | Get category by ID |
| POST | `/` | Admin | JSON: name | Category | Create category |
| PATCH | `/:id` | Admin | JSON: name | Category | Update category |
| DELETE | `/:id` | Admin | Path: categoryId | Message | Delete category |

### CV Parser (`/api/cv`)

| Method | Endpoint | Auth | Request Body | Response | Description |
|---|---|---|---|---|---|
| POST | `/parse` | Yes | Form-data: CV (PDF/DOCX) | ParsedResume | Parse and enrich CV via AI |

### Embeddings (`/api/embeddings`)

| Method | Endpoint | Auth | Request Body | Response | Description |
|---|---|---|---|---|---|
| POST | `/generate` | Yes | JSON: parsedResumeId | Message | Generate resume embeddings |
| POST | `/generate-job` | Yes | JSON: jobId | Message | Generate job embeddings |

### Chat (`/api/chat`)

| Method | Endpoint | Auth | Request Body | Response | Description |
|---|---|---|---|---|---|
| POST | `/conversations` | Candidate | JSON: type (general/mock_interview), jobId | Conversation | Create chat conversation |
| GET | `/conversations` | Candidate | - | Conversation[] | List conversations |
| GET | `/conversations/:id` | Candidate | Path: conversationId | Conversation | Get conversation with messages |
| POST | `/conversations/:id/messages` | Candidate | JSON: content | Message | Send message + get AI reply |
| POST | `/conversations/:id/end` | Candidate | Path: conversationId | Summary | End mock interview + get summary |

### Users (`/api/users`)

| Method | Endpoint | Auth | Request Body | Response | Description |
|---|---|---|---|---|---|
| GET | `/` | Admin | Query: filters | User[] | List all users |
| POST | `/` | Admin | JSON: user fields | User | Create user |
| GET | `/:id` | Yes | Path: userId | User | Get user by ID |
| PATCH | `/:id` | Yes | JSON: profile fields | User | Update user |
| DELETE | `/:id` | Admin | Path: userId | Message | Delete user |

---

## Environment Variables

Create a `.env` file in both `Backend/` and `Frontend/` directories. Example files are provided (`.env.example`).

### Backend (`Backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `3001` | Server port |
| `MONGO_URI` | Yes | - | MongoDB connection string (e.g. MongoDB Atlas) |
| `JWT_ACCESS_TOKEN_SECRET` | Yes | - | Secret key for signing JWT access tokens |
| `JWT_ACCESS_TOKEN_EXP` | No | `30m` | Access token expiration duration |
| `JWT_REFRESH_TOKEN_SECRET` | Yes | - | Secret key for signing JWT refresh tokens |
| `JWT_REFRESH_TOKEN_EXP` | No | `7d` | Refresh token expiration duration |
| `NODE_ENV` | No | `development` | Environment (development/production) |
| `EMAIL_USER` | For email features | - | Nodemailer email account (SMTP) |
| `EMAIL_PASS` | For email features | - | Nodemailer email password or app password |
| `CLIENT_URL` | No | `http://localhost:5173` | Frontend URL (CORS origin) |
| `SERVER_URL` | No | `http://localhost:3001` | Backend URL |
| `SUPABASE_URL` | For file storage | - | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | For file storage | - | Supabase service role key |
| `SUPABASE_BUCKET` | For file storage | `uploads` | Supabase storage bucket name |
| `GEMINI_API_KEY` | For AI features | - | Google AI Studio API key (get from aistudio.google.com) |
| `GEMINI_MODEL` | No | `gemini-flash-lite-latest` | Gemini model identifier |
| `GEMINI_MAX_ATTEMPTS` | No | `2` | Max retry attempts for Gemini calls |
| `GEMINI_RETRY_DELAY_MS` | No | `700` | Delay between retries (ms) |
| `GEMINI_TIMEOUT_MS` | No | `30000` | Gemini request timeout (ms) |
| `OLLAMA_EMBED_URL` | For embeddings | `http://localhost:11434/api/embed` | Ollama embedding API URL |
| `OLLAMA_EMBED_MODEL` | For embeddings | `nomic-embed-text` | Ollama embedding model name |
| `EMBEDDING_TIMEOUT_MS` | No | `30000` | Embedding request timeout (ms) |
| `JOB_PARSER_PROVIDER` | No | `local` | Job parser provider (local or ai) |
| `JOB_PARSER_FALLBACK_ON_AI_FAILURE` | No | `true` | Fallback to local parser if AI fails |

### Frontend (`Frontend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | No | `http://localhost:3001/api` | Backend API base URL |

---

## Installation

### Prerequisites

- Node.js >= 18 (tested with 22+)
- MongoDB instance (local or Atlas)
- (Optional) Ollama running locally for embeddings (`nomic-embed-text` model)
- (Optional) Google Gemini API key for AI features

### Steps

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd AI_Hiring_Platform
   ```

2. **Install Backend dependencies**

   ```bash
   cd Backend
   npm install
   ```

3. **Configure Backend environment**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and fill in your configuration values (at minimum `MONGO_URI`, `JWT_ACCESS_TOKEN_SECRET`, `JWT_REFRESH_TOKEN_SECRET`).

4. **Install Frontend dependencies**

   ```bash
   cd ../Frontend
   npm install
   ```

5. **Configure Frontend environment**

   ```bash
   cp .env.example .env
   ```

6. **Run the Backend**

   ```bash
   cd ../Backend
   npm run dev      # Development with nodemon
   # or
   npm start        # Production
   ```

   The server starts at `http://localhost:3001`. Swagger docs available at `http://localhost:3001/docs`.

7. **Run the Frontend**

   Open a new terminal:

   ```bash
   cd Frontend
   npm run dev      # Vite dev server
   ```

   The frontend starts at `http://localhost:5173` (with API proxy to backend).

### Seed Data (Optional)

```bash
cd Backend
npm run seed
```

---

## Running Tests

Tests use Node.js built-in `node:test` (no third-party test runner required).

```bash
cd Backend
npm test
```

This runs all test files matching `./__tests__/**/*.test.js`.

### Current Test Coverage

- **Backend/__tests__/assessmentViolation.test.js** — 13 tests across 4 suites:
  - Violation creation and counting
  - Warning thresholds
  - Auto-submit conditions
  - API response format

### Development Test Scripts

Additional test/utility scripts in `Backend/services/ai/`:

```bash
node services/ai/parsing/testParser.js            # Test resume parser
node services/ai/embeddings/testCv.js             # Test CV embeddings
node services/ai/embeddings/testJob.js            # Test job embeddings
node services/ai/embeddings/testSimilarity.js     # Test similarity calculations
node util/test-gemini.js                          # Test Gemini API connection
```

---

## AI Features

### Resume Parsing

**How it works:**
1. Candidate uploads a CV (PDF or DOCX)
2. Text is extracted using `pdf-parse` or `mammoth`
3. Extracted text is sent to Gemini AI with a structured prompt requesting JSON output
4. Gemini returns structured data: fullName, email, phone, skills[], experience[], education[], projects[], certifications[], languages[], summary
5. Parsed data is stored in `ParsedResume` model and linked to the `User`
6. A background enrichment step generates embeddings for the parsed resume

### Job Parsing

**How it works:**
1. HR creates a job posting with title, description, skills, requirements
2. The job parser (`JobParserService`) attempts AI parsing via Gemini
3. Gemini extracts structured skills, requirements, and normalized fields
4. If AI fails, a local rule-based parser provides fallback (controlled by `JOB_PARSER_PROVIDER` and `JOB_PARSER_FALLBACK_ON_AI_FAILURE` env vars)
5. The parsed job data is stored in `Job.parsedJob`

### Embeddings

**How it works:**
1. Text from resumes and jobs is built into normalized strings
2. Embeddings are generated using Ollama (`nomic-embed-text` model) by default, or OpenAI (`text-embedding-3-small`)
3. For Ollama: `POST http://localhost:11434/api/embed` with the model and input text
4. Embeddings are stored:
   - In MongoDB directly on the `Job` and `ParsedResume` documents
   - Optionally in Supabase pgvector via `vector.service.js`

### Similarity Search (Job Matching)

**How it works:**
1. When a candidate applies, the application triggers `calculateApplicationMatch()`
2. The candidate's resume is parsed by AI (if not already parsed)
3. Resume embeddings are generated
4. Job embeddings (generated during job creation/enrichment) are compared with resume embeddings
5. Cosine similarity is calculated: `cosineSimilarity(jobEmbedding, resumeEmbedding)` → value in [-1, 1]
6. Score is converted to 0-100: `round(((similarity + 1) / 2) * 10000) / 100`
7. The match score is stored on `JobApplication.matchScore` and the matching status is updated to `completed`

### Assessment Generation

**How it works:**
1. HR configures assessment during job creation or via PATCH: questionCount, difficulty (Auto/Easy/Medium/Hard/Mixed), topics
2. When triggered, Gemini AI generates `questionCount × 5` (repository multiplier) multiple-choice questions
3. Each question has: question, 4 options, correctAnswer, explanation, topic, difficulty level
4. JSON validation ensures correct format and structure
5. Questions are stored in the `Question` collection linked to the `Assessment`
6. When a candidate starts the assessment, `questionCount` questions are randomly selected from the repository
7. This ensures each candidate gets a different subset, preventing answer sharing

### Candidate Analysis (HR)

**How it works:**
1. HR requests analysis of a single candidate or top candidates for a job
2. The system builds a prompt with the job requirements and the candidate's resume + assessment data
3. Gemini AI analyzes the match and returns: strengths[], weaknesses[], summary, recommendation
4. Results are stored in `JobApplication.aiEvaluation` and displayed to HR

### Candidate Feedback

**How it works:**
1. When a candidate's application is rejected, HR can request feedback generation
2. Gemini AI generates constructive feedback including: strengths[], weaknesses[], summary, howToImprove
3. Feedback is stored in `JobApplication.candidateFeedback`
4. Candidates can view their feedback on the AI Feedback page

### AI Chat / Mock Interview

**How it works:**
1. Candidates can start a general career chat or a job-specific mock interview
2. Two system prompt templates guide the AI behavior:
   - **General chat:** Career advisor persona answering questions about jobs, skills, career paths
   - **Mock interview:** Simulates a job interview with questions based on the job's requirements, evaluates answers, and provides feedback
3. Messages are stored in `ChatConversation.messages[]` with `user` and `assistant` roles
4. When ending a mock interview, Gemini generates a performance summary

---

## Assessment Flow

The complete flow from job creation to candidate assessment:

```
Job Created by HR (Drafted, 5-min edit window)
│
├─ Optional: HR configures assessment at creation
│  (assessmentQuestionCount, difficulty, topics)
│  → Background: AI generates repositorySize questions (questionCount × 5)
│
├─ OR: HR configures assessment later via PATCH
│  → Can choose AI, Manual, or None
│
├─ HR reviews questions, edits/manually adds/regenerates as needed
│
├─ After 5 minutes: Job auto-publishes (status → Open)
│  → Assessment auto-locks (immutable)
│
├─ Candidate browses and applies (POST /apply with CV)
│  → Background: CV parsed, embeddings generated, match score calculated
│
├─ If assessment exists: Candidate starts assessment
│  → Random selection of questionCount questions from repository
│  → Anti-cheating enforced (fullscreen, violation tracking)
│  → Auto-save progress available
│
├─ Candidate submits answers
│  → Auto-graded: answers compared to correctAnswer
│  → Score = percentage (correct/total × 100)
│  → CandidateAssessment status: completed
│  → JobApplication assessmentScore updated
│
├─ HR views applicants (sorted by matchScore desc, then assessmentScore desc)
│  → Match score (CV-based): 0-100
│  → Assessment score (quiz): 0-100
│  → AI analysis available per candidate
│
└─ HR reviews, updates status (Reviewed / Accepted / Rejected)
   → If rejected: AI feedback can be generated for candidate
```

---

## Anti-Cheating System

### Overview

The anti-cheating system ensures assessment integrity by monitoring candidate behavior during quiz sessions.

### Enforcement

- **Instructions Page:** Candidates see an instructions page before starting the assessment, detailing rules and consequences
- **Fullscreen Enforcement:** Assessment requires fullscreen mode; exiting fullscreen counts as a violation
- **Desktop Only:** The assessment must be taken on a desktop device (no mobile support)

### Monitored Violations

| Violation Type | Trigger |
|---|---|
| `TAB_SWITCH` | Candidate switches to another browser tab |
| `FULLSCREEN_EXIT` | Candidate exits fullscreen mode |
| `COPY` | Candidate uses Ctrl+C / copy |
| `PASTE` | Candidate uses Ctrl+V / paste |
| `CUT` | Candidate uses Ctrl+X / cut |
| `RIGHT_CLICK` | Candidate uses right-click context menu |
| `DRAG_START` | Candidate attempts to drag page content |
| `DEVTOOLS_SHORTCUT` | Candidate opens browser devtools |

### Violation Flow

1. Each violation is sent to `POST /api/jobs/:jobId/assessment/violations` with the violation type and metadata
2. Violations are stored in `AssessmentViolation` collection with timestamps
3. The `CandidateAssessment.violationCount` is incremented
4. At 3 violations (`MAX_VIOLATIONS`), the candidate is flagged (`isFlagged: true`) and the assessment is auto-submitted
5. HR can view all violations per job via `GET /api/jobs/:jobId/assessment/violations`
6. HR sees violation flags on the candidate review page

### Implementation

The frontend `useAntiCheating.js` hook implements violation detection:
- `visibilitychange` + `blur` events for tab switching
- `fullscreenchange` event for fullscreen exit
- `copy`, `cut`, `paste`, `contextmenu`, `dragstart` event listeners
- Keyboard shortcut detection for DevTools (F12, Ctrl+Shift+I, etc.)

---

## Security

### Authentication & Authorization

- **JWT Tokens:** Access tokens (short-lived, default 30min) and refresh tokens (long-lived, default 7 days)
- **Password Hashing:** bcrypt with salt rounds (10 for user passwords, 11 for tokens)
- **Token Blacklisting:** Logged-out tokens stored in `BlacklistedToken` collection with TTL auto-expiry
- **httpOnly Cookies:** Refresh tokens stored in httpOnly, secure (production), sameSite cookies
- **Role-Based Access:** Three roles (candidate, hr, admin) enforced via `authorizeMW.js`
- **Email Verification:** New accounts must verify their email before they can log in

### API Security

- **Input Validation:** All endpoints validated with `express-validator` schemas
- **Job Ownership:** Middleware ensures HR can only modify their own jobs
- **Error Handling:** Centralized error handler prevents stack leaks; sanitizes Mongoose/Multer errors
- **CORS:** Restricted to `CLIENT_URL` origin with credentials support
- **Rate Limiting:** To Be Completed (not currently implemented)

### Data Security

- **Scores Hidden:** Match scores, assessment scores, and AI evaluations are stripped from candidate-facing API responses
- **Password Reset:** Reset tokens are hashed before storage
- **Refresh Tokens:** Stored hashed (bcrypt) in database
- **File Upload:** CVs stored in Supabase Storage (not directly on server)

---

## Development Guidelines

### Folder Organization

- Backend follows MVC-like pattern: routes → controllers → services → models
- AI services are isolated under `services/ai/` with their own subdirectories
- Frontend follows feature-based organization: pages grouped by role (candidate/recruiter/admin/auth/public)
- Shared components live in `components/common/`

### Naming Conventions

- **Files:** kebab-case for config, middleware, util files (`authMW.js`, `apiFeatures.js`); descriptive names for services and controllers
- **Models:** PascalCase, singular (`User`, `JobApplication`, `CandidateAssessment`)
- **Routes:** RESTful, plural (`/api/jobs`, `/api/users`, `/api/categories`)
- **Database fields:** camelCase (`matchScore`, `assessmentStatus`, `embeddingStatus`)

### Code Style

- ES Modules throughout (`import`/`export`)
- Express middleware chain pattern (validation → auth → authorization → handler)
- Controllers handle req/res only; business logic lives in services
- AI prompts are stored as separate template files in `services/ai/prompts/`
- Async/await with try-catch; centralized error handling via `next(error)`

### Git Workflow

- **Branch naming:** `feature/`, `fix/`, `chore/` prefixes recommended
- **Commit conventions:** Descriptive present-tense messages (e.g., "Add assessment scoring pipeline")
- **Pull Requests:** Include description of changes, related issues, and testing notes

---

## Deployment

### Backend

1. Set `NODE_ENV=production`
2. Ensure all environment variables are configured (especially `MONGO_URI`, JWT secrets, `SUPABASE_*`, `GEMINI_API_KEY`)
3. Build is not required for the backend (Node.js source)
4. Start with:

   ```bash
   cd Backend
   npm start
   ```

### Frontend

1. Build the static assets:

   ```bash
   cd Frontend
   npm run build
   ```

2. The output is in `Frontend/dist/`
3. Serve with any static file server (nginx, Apache, etc.)
4. Ensure `VITE_API_URL` points to the production backend URL
5. Or use the Vite preview server:

   ```bash
   npm run preview
   ```

### Production Considerations

- **MongoDB:** Use MongoDB Atlas with proper security (IP whitelist, strong password, encryption)
- **JWT Secrets:** Use strong, random secrets (not placeholder values)
- **HTTPS:** Enable SSL/TLS for both frontend and backend
- **Supabase:** Configure CORS and bucket policies for production
- **Gemini API:** Use a production API key with appropriate quotas
- **Ollama:** If using local embeddings, ensure Ollama is running on the server
- **Email:** Use a production SMTP service (SendGrid, Mailgun, etc.)
- **No Docker configuration found** — manual deployment or containerization to be added

---

## Troubleshooting

### MongoDB Connection

```
MongooseServerSelectionError: connect ECONNREFUSED ...
```

- Ensure MongoDB is running and accessible
- Check `MONGO_URI` in `.env` is correct
- If using Atlas, whitelist your IP address
- Check network connectivity and firewall settings

### Missing Environment Variables

- Verify all required variables are set in `Backend/.env`
- The app may crash on startup if critical variables are missing
- Check for typos (e.g., `MONGO_URI` vs `MONGODB_URI`)

### Frontend API Issues

```
Failed to load resource: net::ERR_CONNECTION_REFUSED
```

- Ensure the backend server is running on port 3001
- Check `VITE_API_URL` in `Frontend/.env`
- The Vite dev server proxies `/api` to `http://localhost:3001` — ensure the proxy target matches

### Build Issues (Frontend)

```bash
npm run build
```

- Ensure all dependencies are installed (`npm install`)
- Check for ESLint errors (`npm run lint`)
- Clear Vite cache if needed: `rm -rf node_modules/.vite`

### Node Version

- Minimum Node.js 18 (LTS recommended)
- Tested with Node.js 22+ 
- Use `nvm` or `fnm` to manage Node versions if needed

### AI Features Not Working

- Verify `GEMINI_API_KEY` is set and valid (generate at https://aistudio.google.com)
- Check `OLLAMA_EMBED_URL` if using local embeddings
- Ensure Ollama is running: `ollama serve`
- Verify the model is pulled: `ollama pull nomic-embed-text`
- Check Gemini model name in `GEMINI_MODEL` (default: `gemini-flash-lite-latest`)

### Email Features Not Working

- Verify `EMAIL_USER` and `EMAIL_PASS` are correct
- For Gmail, use an App Password (not your regular password)
- Check spam/junk folders for verification emails

### Job Auto-Publish Not Working

- The background worker checks every 60 seconds (`server.js`)
- Ensure the server is running continuously
- Check server logs for errors from `publishExpiredDraftJobs()`

---

## Roadmap

To Be Completed — potential future enhancements based on the current architecture:

- AI-powered video interviews with recording and analysis
- Real-time notifications via WebSockets (Socket.io)
- Enhanced chatbot with multi-turn conversation memory
- Advanced analytics dashboard (hire funnel, time-to-hire, source tracking)
- Automated scheduling (calendar integration for interviews)
- One-click job posting to external boards (LinkedIn, Indeed)
- Team collaboration for recruiters (shared notes, reviews)
- Mobile app (React Native)
- Multi-language support
- Skills gap analysis and upskilling recommendations
- Integration with HRIS/ATS systems

---

## Contributing

1. **Fork** the repository
2. **Create a branch** for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following the [development guidelines](#development-guidelines)
4. **Commit** with a descriptive message:
   ```bash
   git commit -m "Add feature: description of what was implemented"
   ```
5. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request** with a clear description of the changes and any testing notes

### Before Submitting

- Run tests: `cd Backend && npm test`
- Lint the frontend: `cd Frontend && npm run lint`
- Ensure no secrets or credentials are committed
- Update documentation if adding new features

---

## License

All Rights Reserved.

This project and its source code are proprietary and confidential. Unauthorized copying, distribution, modification, or use of this software, via any medium, is strictly prohibited without prior written permission.
