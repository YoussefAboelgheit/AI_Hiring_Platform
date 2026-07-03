# Job & Assessment Flow Diagrams

## 1. JOB STATUS STATE MACHINE

```mermaid
stateDiagram-v2
    [*] --> Drafted : HR creates job\nPOST /api/jobs
    Drafted --> Open : setTimeout(5min) OR\npublishExpiredDraftJobs()\n(server.js every 60s)
    Drafted --> Deleted : DELETE /api/jobs/:id\n(HR within 5min window)

    state Drafted {
        [*] --> Editable
        Editable --> Expired : editableUntil passed
        Expired --> [*]
    }

    Open --> Closed : PATCH /api/jobs/admin/:id/status\n(admin only)
    Open --> Deleted : DELETE /api/jobs/:id\n(HR or admin)

    Closed --> Open : PATCH /api/jobs/admin/:id/status\n(admin only)
    Closed --> Deleted : DELETE /api/jobs/:id\n(admin only)

    note right of Drafted
        isPublished: false
        acceptApplications: false
        editableUntil: now + 5min
        embeddingStatus: pending
        HR can edit job & manage assessment
    end note

    note right of Open
        isPublished: true
        acceptApplications: true
        editableUntil: null
        embeddingStatus: ready
        Candidates can view, apply, take assessment
    end note
```

---

## 2. ASSESSMENT STATUS STATE MACHINE

```mermaid
stateDiagram-v2
    [*] --> None : Job created with\nassessment params omitted

    [*] --> Drafted : Job created with\nassessmentQuestionCount > 0

    state Drafted {
        [*] --> AiGenerating : type = "AI"
        AiGenerating --> AiReady : Gemini generates\nrepositorySize questions
        AiReady --> AiRegenerating : HR clicks\nregenerate
        AiRegenerating --> AiReady : Old questions deleted,\nnew ones generated

        [*] --> ManualAdding : type = "MANUAL"
        ManualAdding --> ManualReady : HR adds questions\none by one
        ManualReady --> ManualAdding : More questions added

        AiReady --> ManualAdding : HR changes type\nto "MANUAL"

        AiReady --> None : HR changes type\nto "NONE"
        ManualReady --> None : HR changes type\nto "NONE"
        None --> AiGenerating : HR changes type\nto "AI"
        None --> ManualAdding : HR changes type\nto "MANUAL"
    }

    Drafted --> Locked : Job.editableUntil expires\nOR\nlockExpiredAssessments()\n(job.router.js every 60s)

    Locked --> [*] : Job deleted

    note right of Drafted
        HR can:
        - PATCH /:jobId/assessment (type/count/difficulty)
        - POST /:jobId/assessment/questions (manual)
        - PUT /questions/:qId (edit)
        - DELETE /questions/:qId
        - POST /questions/:qId/regenerate
        - POST /:jobId/assessment/regenerate
        All guarded by getEditableJob()
    end note

    note right of Locked
        Questions IMMUTABLE
        Candidates can:
        - POST /:jobId/assessment/start
        - POST /:jobId/assessment/submit
        HR can only VIEW questions
    end note
```

---

## 3. COMPLETE CANDIDATE FLOW (Apply → Assessment)

```mermaid
flowchart TB
    %% Registration
    A["Candidate Register/Login\nPOST /api/auth/register or /login"] --> B["Browse Jobs\nGET /api/jobs"]

    %% Apply
    B --> C["Apply to Job\nPOST /api/jobs/{jobId}/apply\nForm-data: CV (pdf/docx)"]
    C --> D["JobApplication Created\nstatus: Pending\nmatchingStatus: pending\nassessmentStatus: null\nmatchScore: null\nassessmentScore: null"]

    %% Background matching
    D --> E{"Background:\ncalculateApplicationMatch()"}
    E --> F["1. Parse CV via AI → parsedResume"]
    F --> G["2. Generate resume embedding"]
    G --> H["3. Cosine similarity\njobEmbedding ↔ resumeEmbedding\n→ value in [-1, 1]"]
    H --> I["4. Convert to matchScore\nround(((sim+1)/2)*10000)/100\n→ value in [0.00, 100.00]"]
    I --> J["5. Save to JobApplication\nmatchingStatus: completed"]

    %% Check assessment availability
    J --> K{"Job has active\nassessment?"}

    K -- No --> L["✅ Flow ends here\nCandidate can view\napplication status"]

    K -- Yes --> M["Start Assessment\nPOST /api/jobs/{jobId}/assessment/start"]

    %% Guards
    M --> M1{"Guards"}
    M1 --> M2["job.status === 'Open'?"]
    M1 --> M3["assessment.status === 'Locked'?"]
    M1 --> M4["No existing completed\nCandidateAssessment?"]
    M2 -- No --> ERR1["403: Job not open"]
    M3 -- No --> ERR2["404: No active assessment"]
    M4 -- No --> M5["Return existing score\n(already completed)"]

    %% Question selection
    M2 -- Yes --> M6
    M3 -- Yes --> M6
    M4 -- Yes --> M6

    M6["Random question selection\nshuffle(allQuestions)\n.slice(0, questionCount)"]
    M6 --> M7["Create CandidateAssessment\nstatus: pending\nselectedQuestionIds: [...]"]
    M7 --> M8["Return questions to candidate\nWITHOUT correctAnswer"]
    M8 --> M9["Display:\nquestion + options[4]\n(candidate answers)"]

    %% Submit
    M9 --> N["Submit Assessment\nPOST /api/jobs/{jobId}/assessment/submit\nBody: { answers: [{questionId, selectedAnswer}] }"]

    %% Scoring
    N --> O["For each answer:"]
    O --> P{"answer.selectedAnswer ===\nquestion.correctAnswer?"}
    P -- Yes --> Q["isCorrect = true\nscore++"]
    P -- No --> R["isCorrect = false"]
    Q --> S["Save CandidateAnswer\n{ question, selectedAnswer, isCorrect }"]
    R --> S
    S --> T["All answers processed?"]
    T -- No --> O
    T -- Yes --> U["Update CandidateAssessment\nscore: raw count\nsubmittedAt: now\nstatus: completed"]

    U --> V["Calculate percentage\nround(score/total * 100)"]
    V --> W["Update JobApplication\nassessmentScore: percentage\nassessmentStatus: completed"]
    W --> X["Return result\n{ score, total, percentage }"]

    %% Styling - application lifecycle
    style D fill:#e1f5fe,stroke:#0288d1
    style J fill:#e1f5fe,stroke:#0288d1
    style W fill:#e1f5fe,stroke:#0288d1

    %% Styling - background process
    style E fill:#fff3e0,stroke:#f57c00
    style F fill:#fff3e0,stroke:#f57c00
    style G fill:#fff3e0,stroke:#f57c00
    style H fill:#fff3e0,stroke:#f57c00
    style I fill:#fff3e0,stroke:#f57c00
    style J fill:#fff3e0,stroke:#f57c00

    %% Styling - assessment flow
    style M6 fill:#e8f5e9,stroke:#388e3c
    style M7 fill:#e8f5e9,stroke:#388e3c
    style M8 fill:#e8f5e9,stroke:#388e3c
    style N fill:#e8f5e9,stroke:#388e3c
    style X fill:#e8f5e9,stroke:#388e3c

    %% Styling - errors
    style ERR1 fill:#ffebee,stroke:#d32f2f
    style ERR2 fill:#ffebee,stroke:#d32f2f
```

---

## 4. DATA RELATIONSHIPS (Model Links)

```mermaid
erDiagram
    Job ||--|| Assessment : has
    Job ||--o{ JobApplication : receives
    Assessment ||--o{ Question : contains
    JobApplication ||--o| CandidateAssessment : triggers
    CandidateAssessment ||--o{ CandidateAnswer : records

    Job {
        ObjectId _id PK
        ObjectId recruiter FK
        ObjectId category FK
        string title
        string description
        string workplace "Onsite | Hybrid | Remote"
        string jobType "Intern | Full Time | Part Time"
        string[] skills
        string status "Drafted | Open | Closed"
        date editableUntil "now + 5min, cleared on publish"
        boolean isPublished
        boolean acceptApplications
        string requirements
        string location
        date applicationEnd
        object parsedJob "AI-enriched job data"
        number[] embedding "vector for cosine matching"
        string embeddingStatus "pending | ready | failed"
    }

    Assessment {
        ObjectId _id PK
        ObjectId job FK "unique"
        string type "NONE | MANUAL | AI"
        number questionCount
        number repositorySize "questionCount * 5"
        string difficulty "Auto | Easy | Medium | Hard | Mixed"
        string topics
        string status "Drafted | Locked"
        ObjectId generatedBy FK
    }

    Question {
        ObjectId _id PK
        ObjectId assessment FK
        string question
        string[] options "exactly 4"
        string correctAnswer
        string explanation
        string topic
        string difficulty "Easy | Medium | Hard"
    }

    JobApplication {
        ObjectId _id PK
        ObjectId job FK
        ObjectId candidate FK "unique per job"
        string CV "file path"
        ObjectId parsedResume FK
        object jobSnapshot "copy at application time"
        number matchScore "0-100, cosine similarity"
        string matchingStatus "pending | completed | failed | skipped"
        string matchingError
        number matchedAgainstJobVersion
        number assessmentScore "0-100, percentage"
        string assessmentStatus "pending | completed | not_started | null"
        object aiEvaluation "strengths, weaknesses, summary, recommendation"
        string status "Pending | Reviewed | Accepted | Rejected | Deleted"
    }

    CandidateAssessment {
        ObjectId _id PK
        ObjectId candidate FK "unique per job"
        ObjectId job FK
        ObjectId assessment FK
        ObjectId[] selectedQuestionIds FK
        number score "raw correct count"
        date submittedAt
        string status "pending | completed"
    }

    CandidateAnswer {
        ObjectId _id PK
        ObjectId candidateAssessment FK
        ObjectId question FK
        string selectedAnswer
        boolean isCorrect
    }
```

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| **repositorySize = questionCount × 5** | Each candidate gets a different random subset, preventing answer sharing |
| **correctAnswer hidden from candidates** | Prevents cheating; HR still sees it during draft review |
| **5-min draft window** | Gives HR time to review/edit before auto-publishing |
| **Dual publish mechanism** | `setTimeout` per job (primary) + `setInterval` every 60s (fallback after restart) |
| **scores stripped at API layer** | `sanitizeApplicationForCandidate()` removes matchScore/assessmentScore/aiEvaluation before JSON serialization |
| **applications sorted by matchScore desc → assessmentScore desc → createdAt asc** | HR sees best candidates first |
| **workplace**: Onsite, Hybrid, Remote | — |
| **jobType**: Intern, Full Time, Part Time | — |
| **difficulty**: Auto, Easy, Medium, Hard, Mixed | — |

---

## 5. HR FLOW (Create Job + Configure Assessment)

```mermaid
sequenceDiagram
    actor HR
    participant API as Express API
    participant JobDB as Job Collection
    participant AssessDB as Assessment Collection
    participant AI as Gemini AI

    Note over HR, AI: ──── PHASE 1: CREATE JOB ────

    HR->>API: POST /api/jobs<br>{ title, skills, workplace,<br>  assessmentQuestionCount: 5,<br>  assessmentDifficulty: "Medium",<br>  assessmentTopics: "Node.js" }
    API->>JobDB: Insert Job<br>status: "Drafted"<br>editableUntil: now + 5min
    alt assessmentQuestionCount provided
        API->>AssessDB: Create Assessment<br>status: "Drafted", type: "AI"<br>questionCount: 5
        API->>AI: generateAssessment() (background)
        AI-->>AssessDB: Insert 25 questions<br>(repositorySize = 5 × 5)
    end
    API-->>HR: 201 { job, message }

    Note over HR, AI: ──── OR: Create job WITHOUT assessment params ────

    HR->>API: POST /api/jobs<br>{ title, skills, workplace, ...<br>(no assessment fields) }
    API->>JobDB: Insert Job<br>status: "Drafted"<br>editableUntil: now + 5min
    Note over AssessDB: No Assessment created yet
    API-->>HR: 201 { job }

    Note over HR, AI: ──── PHASE 2: SET ASSESSMENT SETTINGS ────
    Note over HR, AI: (only needed if assessment was not<br>configured at creation, or to change type)

    HR->>API: PATCH /api/jobs/{jobId}/assessment<br>{ type: "AI", questionCount: 5,<br>  difficulty: "Medium", topics: "Node.js" }
    API->>AssessDB: Upsert assessment settings
    alt type = "AI" and no questions exist
        API->>AI: Generate questions (background)
        AI-->>AssessDB: Insert repositorySize questions
    else type = "MANUAL"
        Note over API: HR adds questions individually<br>via POST .../assessment/questions
    else type = "NONE"
        Note over API: Assessment disabled
    end
    API-->>HR: 200 { assessment }

    Note over HR, AI: ──── PHASE 3: REVIEW & EDIT QUESTIONS ────

    HR->>API: GET /api/jobs/{jobId}/assessment
    API-->>HR: 200 { assessment, questions }<br>(includes correctAnswer for HR)

    alt Add manual question
        HR->>API: POST /api/jobs/{jobId}/assessment/questions<br>{ question, options[4], correctAnswer,<br>  explanation, topic, difficulty }
        API-->>HR: 201 { question }
    else Edit a question
        HR->>API: PUT /api/jobs/assessment/questions/{questionId}<br>{ question, options, correctAnswer, ... }
        API-->>HR: 200 { question }
    else Delete a question
        HR->>API: DELETE /api/jobs/assessment/questions/{questionId}
        API-->>HR: 204
    else Regenerate one question (AI)
        HR->>API: POST /api/jobs/assessment/questions/{questionId}/regenerate
        API-->>HR: 200 { question }
    else Regenerate all questions (AI)
        HR->>API: POST /api/jobs/{jobId}/assessment/regenerate
        API-->>HR: 200 { assessment }
    end

    Note over HR, AI: ──── PHASE 4: JOB PUBLISHES (Auto) ────

    Note over HR, AI: After 5 minutes (editableUntil expires):<br>1. Job status → "Open"<br>2. Assessment status → "Locked"<br>3. Candidates can now apply & take assessment
```

### Endpoint Reference

| Phase | Method | Endpoint | Purpose | Auth | Body |
|---|---|---|---|---|---|
| **1** | `POST` | `/api/jobs` | Create job + optional assessment config | HR | `{ title, skills, ..., assessmentQuestionCount?, assessmentDifficulty?, assessmentTopics? }` |
| **2** | `PATCH` | `/api/jobs/{jobId}/assessment` | Set/change assessment type & settings | HR | `{ type?, questionCount?, difficulty?, topics? }` |
| **3a** | `GET` | `/api/jobs/{jobId}/assessment` | View assessment + questions (with answers) | HR | — |
| **3b** | `POST` | `/api/jobs/{jobId}/assessment/questions` | Add one manual question | HR | `{ question, options[4], correctAnswer, explanation, topic, difficulty }` |
| **3c** | `PUT` | `/api/jobs/assessment/questions/{questionId}` | Edit a question | HR | `{ question?, options?, correctAnswer?, ... }` |
| **3d** | `DELETE` | `/api/jobs/assessment/questions/{questionId}` | Delete a question | HR | — |
| **3e** | `POST` | `/api/jobs/assessment/questions/{questionId}/regenerate` | AI-regenerate one question | HR | — |
| **3f** | `POST` | `/api/jobs/{jobId}/assessment/regenerate` | AI-regenerate ALL questions | HR | — |
| **4** | *(auto)* | Background worker (every 60s) | Publish job + lock assessment | — | — |

### Key Points

1. **Set assessment at creation** — include `assessmentQuestionCount` in `POST /api/jobs`. Assessment auto-generates with `type: "AI"`. No separate PATCH needed.
2. **OR create job without assessment** — leave out `assessmentQuestionCount`. Use `PATCH /api/jobs/{jobId}/assessment` to configure later.
3. **`PATCH` can change type** — switch AI ↔ MANUAL ↔ NONE during the 5-min draft window.
4. **All Phase 3** only works while assessment is `"Drafted"`. Once locked (5 min), questions are immutable.
5. **No explicit HR publish** — publishing is automatic after 5 min. Admin can override via `PATCH /api/jobs/admin/{jobId}/status`.
