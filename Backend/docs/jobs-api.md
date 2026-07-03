# Jobs API

## Folder Structure

```text
Backend/
  controllers/
    job.controller.js
  middlewares/
    authMW.js
    authorizeMW.js
    jobOwnershipMW.js
  models/
    category.js
    job.js
    jobApplication.js
    user.js
  routes/
    job.router.js
  validations/
    jobValidators.js
    paramValidators.js
    validateResults.js
```

## Endpoints

```text
POST   /api/jobs
GET    /api/jobs
GET    /api/jobs/:id
GET    /api/jobs/category/:category
GET    /api/jobs/applied/me
GET    /api/jobs/applications/:id //For Candidate
POST   /api/jobs/applications/:id/retry //For Candidate
GET    /api/jobs/hr/my-jobs/applications //For HR/Company
GET    /api/jobs/:id/applications //For HR/Company
GET    /api/jobs/:id/applications/top-analysis //For HR/Company
GET    /api/jobs/:jobId/applications/:applicationId/analysis //For HR/Company
POST   /api/jobs/:id/apply
PATCH  /api/jobs/:id
DELETE /api/jobs/:id
```

## Authorization Rules

```text
POST /api/jobs
  Requires Authorization: Bearer <hr-access-token>
  Only users with role "hr" can create jobs.
  New jobs are created as DRAFT for 5 minutes.
  Draft jobs are not published and cannot receive applications.
  After 5 minutes, they are automatically published as ACTIVE.

PATCH /api/jobs/:id
DELETE /api/jobs/:id
  Requires Authorization: Bearer <hr-access-token>
  Only the HR user stored in job.recruiter can update the job during the 5-minute draft period.
  After publishing, the HR can no longer edit the job.
  The HR user stored in job.recruiter or an admin can delete the job.
  When a job is deleted, related job applications are kept with status "Job has been deleted".
  Candidate application responses still include the deleted job details from a saved snapshot.

GET endpoints
  Public. No token required.

POST /api/jobs/:id/apply
  Requires Authorization: Bearer <candidate-access-token>
  Candidates can upload a new CV with form-data field "CV".
  If no CV is uploaded, the candidate profile CV is used.
  If neither exists, the API returns a validation error.

GET /api/jobs/applied/me
  Requires Authorization: Bearer <candidate-access-token>
  Returns all applications submitted by the logged-in candidate with job details.

GET /api/jobs/applications/:id
  Requires Authorization: Bearer <candidate-access-token>
  Returns one application by application ID for the logged-in candidate.

GET /api/jobs/:id/applications
  Requires Authorization: Bearer <hr-access-token>
  Returns all applications for a job only if the logged-in HR created that job.

GET /api/jobs/hr/my-jobs/applications
  Requires Authorization: Bearer <hr-access-token>
  Returns all jobs created by the logged-in HR with each job's applications.

GET /api/jobs/:id/applications/top-analysis
  Requires Authorization: Bearer <hr-access-token>
  Returns AI strengths/weaknesses for the top 3 matched applications.

GET /api/jobs/:jobId/applications/:applicationId/analysis
  The HR must be the creator of that job.



POST /api/jobs/applications/:id/retry
  Requires Authorization: Bearer <candidate-access-token>
  Optional form-data field: CV. If omitted, the existing application CV URL is downloaded and parsed again.
```

## AI Matching Flow

When a candidate applies:

```text
CV file/profile CV
  -> stored in Supabase Storage as before
  -> parsed into JSON
  -> resume embedding generated and stored in MongoDB
  -> job embedding loaded/generated from MongoDB
  -> matchScore saved on JobApplication
```

When HR creates/edits a job:

```text
Job is created as DRAFT for 5 minutes
Draft jobs are hidden from public job listings and cannot receive applications
Draft edits mark isEdited=true and editedAt=<date>
After 5 minutes, the job is published as ACTIVE and can receive applications
Published jobs cannot be edited by HR
```

Embedding configuration:

```env
EMBEDDING_PROVIDER=ollama
OLLAMA_EMBED_URL=http://localhost:11434/api/embed
OLLAMA_EMBED_MODEL=nomic-embed-text
JOB_PARSER_PROVIDER=local
GEMINI_TIMEOUT_MS=30000
EMBEDDING_TIMEOUT_MS=30000
```

If using OpenAI embeddings instead:

```env
EMBEDDING_PROVIDER=openai
OPENAI_API_KEY=your_key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
```

## Postman Examples

## Query Features For Get All Jobs

Use these query parameters with:

```http
GET http://localhost:3000/api/jobs
```

| Feature | Query Param | Example |
| --- | --- | --- |
| Filtering | Any job field | `?status=Open&workplace=Remote` |
| Search | `search`, `q`, or `keyword` | `?search=react` |
| Sorting | `sort` | `?sort=-createdAt` |
| Pagination | `page`, `limit` | `?page=1&limit=10` |
| Field limiting | `fields` | `?fields=title,status,location` |

Default pagination:

```text
page=1
limit=10
max limit=50
```

Search fields for jobs:

```text
title, description, requirements, location, skills
```

### Create Job

```http
POST http://localhost:3000/api/jobs
Authorization: Bearer <hr-access-token>
Content-Type: application/json
```

```json
{
  "category": "665fc28a8e7b2a3a11000001",
  "title": "Frontend Developer",
  "description": "Build responsive web interfaces for the hiring platform.",
  "workplace": "Remote",
  "jobType": "Full Time",
  "skills": ["React", "JavaScript", "CSS"],
  "status": "Open",
  "requirements": "2+ years of frontend experience.",
  "location": "Cairo, Egypt",
  "applicationEnd": "2026-08-31"
}
```

### Get All Jobs

```http
GET http://localhost:3000/api/jobs
```

Response:

```json
{
  "jobs": [
    {
      "_id": "665fc28a8e7b2a3a11000002",
      "recruiter": {
        "_id": "665fc28a8e7b2a3a11000003",
        "name": "Acme HR",
        "email": "hr@acme.com",
        "role": "hr",
        "company_logo": "https://example.com/logo.png",
        "profile_image": "https://example.com/avatar.png"
      },
      "category": {
        "_id": "665fc28a8e7b2a3a11000001",
        "name": "Engineering"
      },
      "title": "Frontend Developer",
      "description": "Build responsive web interfaces for the hiring platform.",
      "workplace": "Remote",
      "jobType": "Full Time",
      "skills": ["React", "JavaScript", "CSS"],
      "status": "Open",
      "requirements": "2+ years of frontend experience.",
      "location": "Cairo, Egypt",
      "applicationEnd": "2026-08-31T00:00:00.000Z",
      "createdAt": "2026-06-24T10:00:00.000Z",
      "updatedAt": "2026-06-24T10:00:00.000Z"
    }
  ]
}
```

### Get Jobs With Filtering

Filter by any job field that exists in the job schema.

```http
GET http://localhost:3000/api/jobs?status=Open
```

```http
GET http://localhost:3000/api/jobs?workplace=Remote&jobType=Full Time
```

```http
GET http://localhost:3000/api/jobs?location=Cairo, Egypt
```

Supported common filter fields:

```text
category
recruiter
title
workplace
jobType
status
location
applicationEnd
createdAt
updatedAt
```

Advanced comparison filters are supported:

```http
GET http://localhost:3000/api/jobs?applicationEnd[gte]=2026-08-01
```

```http
GET http://localhost:3000/api/jobs?createdAt[gte]=2026-06-01&createdAt[lte]=2026-06-30
```

Supported comparison operators:

```text
gte, gt, lte, lt, in, nin, ne
```

### Search Jobs

Search is case-insensitive and regex-safe.

```http
GET http://localhost:3000/api/jobs?search=react
```

Alternative search parameter names:

```http
GET http://localhost:3000/api/jobs?q=react
```

```http
GET http://localhost:3000/api/jobs?keyword=react
```

Search checks these fields:

```text
title
description
requirements
location
skills
```

### Sort Jobs

Sort ascending:

```http
GET http://localhost:3000/api/jobs?sort=title
```

Sort descending:

```http
GET http://localhost:3000/api/jobs?sort=-createdAt
```

Sort by multiple fields:

```http
GET http://localhost:3000/api/jobs?sort=status,-createdAt
```

Default sort when no `sort` query is sent:

```text
-createdAt
```

### Paginate Jobs

```http
GET http://localhost:3000/api/jobs?page=1&limit=10
```

```http
GET http://localhost:3000/api/jobs?page=2&limit=5
```

If the frontend sends a large limit, the backend caps it at `50`:

```http
GET http://localhost:3000/api/jobs?limit=999
```

### Limit Returned Fields

Return only selected job fields:

```http
GET http://localhost:3000/api/jobs?fields=title,status,location
```

Return title, description, status, and application deadline:

```http
GET http://localhost:3000/api/jobs?fields=title,description,status,applicationEnd
```

### Combined Frontend Example

This example gets open remote jobs, searches for `react`, sorts newest first, returns page 1 with 5 results, and limits selected fields:

```http
GET http://localhost:3000/api/jobs?status=Open&workplace=Remote&search=react&sort=-createdAt&page=1&limit=5&fields=title,description,status,location,applicationEnd
```

### Get Job By ID

```http
GET http://localhost:3000/api/jobs/665fc28a8e7b2a3a11000002
```

### Get Jobs By Category Name

Category matching is case-insensitive.

```http
GET http://localhost:3000/api/jobs/category/engineering
```

### Get My Applied Jobs

```http
GET http://localhost:3000/api/jobs/applied/me
Authorization: Bearer <candidate-access-token>
```

Response:

```json
{
  "applications": [
    {
      "_id": "665fc28a8e7b2a3a11000004",
      "job": {
        "_id": "665fc28a8e7b2a3a11000002",
        "title": "Frontend Developer",
        "status": "Open",
        "recruiter": {
          "_id": "665fc28a8e7b2a3a11000003",
          "name": "Acme HR",
          "email": "hr@acme.com",
          "role": "hr"
        },
        "category": {
          "_id": "665fc28a8e7b2a3a11000001",
          "name": "Engineering"
        }
      },
      "CV": "https://example.com/cv.pdf",
      "status": "Pending",
      "createdAt": "2026-06-26T10:00:00.000Z",
      "updatedAt": "2026-06-26T10:00:00.000Z"
    }
  ]
}
```

### Get My Application By ID

Use the job application `_id`, not the job `_id`.

```http
GET http://localhost:3000/api/jobs/applications/665fc28a8e7b2a3a11000004
Authorization: Bearer <candidate-access-token>
```

Response:

```json
{
  "application": {
    "_id": "665fc28a8e7b2a3a11000004",
    "job": {
      "_id": "665fc28a8e7b2a3a11000002",
      "title": "Frontend Developer",
      "description": "Build responsive web interfaces for the hiring platform.",
      "workplace": "Remote",
      "jobType": "Full Time",
      "skills": ["React", "JavaScript", "CSS"],
      "status": "Open",
      "recruiter": {
        "_id": "665fc28a8e7b2a3a11000003",
        "name": "Acme HR",
        "email": "hr@acme.com",
        "role": "hr"
      },
      "category": {
        "_id": "665fc28a8e7b2a3a11000001",
        "name": "Engineering"
      }
    },
    "candidate": {
      "_id": "665fc28a8e7b2a3a11000005",
      "name": "Candidate User",
      "email": "candidate@example.com",
      "role": "candidate"
    },
    "CV": "https://example.com/cv.pdf",
    "status": "Pending",
    "createdAt": "2026-06-26T10:00:00.000Z",
    "updatedAt": "2026-06-26T10:00:00.000Z"
  }
}
```

### Retry Failed Application Parsing/Matching

Use this if Gemini or embedding generation failed after the application was created.

Retry using the already stored application CV:

```http
POST http://localhost:3000/api/jobs/applications/665fc28a8e7b2a3a11000004/retry
Authorization: Bearer <candidate-access-token>
```

Retry with a new CV upload:

```http
POST http://localhost:3000/api/jobs/applications/665fc28a8e7b2a3a11000004/retry
Authorization: Bearer <candidate-access-token>
Content-Type: multipart/form-data
```

```text
CV: selected-file.pdf
```

You can also call `POST /api/jobs/:id/apply` again after a failed application. The backend will retry instead of returning duplicate-application error.

### Get Applications For My Job

Use the job `_id`. Only the HR who created the job can access this endpoint.

```http
GET http://localhost:3000/api/jobs/665fc28a8e7b2a3a11000002/applications
Authorization: Bearer <same-creator-hr-access-token>
```

Response:

```json
{
  "job": {
    "_id": "665fc28a8e7b2a3a11000002",
    "title": "Frontend Developer",
    "status": "Open",
    "recruiter": {
      "_id": "665fc28a8e7b2a3a11000003",
      "name": "Acme HR",
      "email": "hr@acme.com",
      "role": "hr"
    },
    "category": {
      "_id": "665fc28a8e7b2a3a11000001",
      "name": "Engineering"
    }
  },
  "total": 1,
  "applications": [
    {
      "_id": "665fc28a8e7b2a3a11000004",
      "candidate": {
        "_id": "665fc28a8e7b2a3a11000005",
        "name": "Candidate User",
        "email": "candidate@example.com",
        "role": "candidate",
        "CV": "https://example.com/profile-cv.pdf"
      },
      "CV": "https://example.com/application-cv.pdf",
      "status": "Pending",
      "matchScore": 88.73,
      "matchingStatus": "completed",
      "matchedAgainstJobVersion": 2,
      "createdAt": "2026-06-26T10:00:00.000Z",
      "updatedAt": "2026-06-26T10:00:00.000Z"
    }
  ]
}
```

### Get My Jobs With Applications

Returns every job created by the logged-in HR, with applications grouped under each job.

```http
GET http://localhost:3000/api/jobs/hr/my-jobs/applications
Authorization: Bearer <hr-access-token>
```

Response:

```json
{
  "totalJobs": 1,
  "totalApplications": 1,
  "jobs": [
    {
      "_id": "665fc28a8e7b2a3a11000002",
      "title": "Frontend Developer",
      "status": "Open",
      "recruiter": {
        "_id": "665fc28a8e7b2a3a11000003",
        "name": "Acme HR",
        "email": "hr@acme.com",
        "role": "hr"
      },
      "category": {
        "_id": "665fc28a8e7b2a3a11000001",
        "name": "Engineering"
      },
      "applicationsCount": 1,
      "applications": [
        {
          "_id": "665fc28a8e7b2a3a11000004",
          "candidate": {
            "_id": "665fc28a8e7b2a3a11000005",
            "name": "Candidate User",
            "email": "candidate@example.com",
            "role": "candidate",
            "CV": "https://example.com/profile-cv.pdf"
          },
          "CV": "https://example.com/application-cv.pdf",
          "status": "Pending",
          "matchScore": 88.73,
          "matchingStatus": "completed",
          "matchedAgainstJobVersion": 2,
          "createdAt": "2026-06-26T10:00:00.000Z",
          "updatedAt": "2026-06-26T10:00:00.000Z"
        }
      ]
    }
  ]
}
```

### Analyze Top 3 Candidates

```http
GET http://localhost:3000/api/jobs/665fc28a8e7b2a3a11000002/applications/top-analysis
Authorization: Bearer <same-creator-hr-access-token>
```

Response:

```json
{
  "job": "665fc28a8e7b2a3a11000002",
  "total": 3,
  "applications": [
    {
      "_id": "665fc28a8e7b2a3a11000004",
      "matchScore": 88.73,
      "aiEvaluation": {
        "strengths": ["Strong React experience"],
        "weaknesses": ["Limited backend exposure"],
        "summary": "Good frontend fit for this role.",
        "recommendation": "Shortlist for screening.",
        "generatedAt": "2026-06-29T10:00:00.000Z"
      }
    }
  ]
}
```

### Analyze One Application

Use the job ID and the job application ID. This verifies that the application belongs to that job and that the logged-in HR owns the job.

```http
GET http://localhost:3000/api/jobs/665fc28a8e7b2a3a11000002/applications/665fc28a8e7b2a3a11000004/analysis
Authorization: Bearer <same-creator-hr-access-token>
```

Response:

```json
{
  "job": {
    "_id": "665fc28a8e7b2a3a11000002",
    "title": "Frontend Developer"
  },
  "application": {
    "_id": "665fc28a8e7b2a3a11000004",
    "matchScore": 88.73,
    "aiEvaluation": {
      "strengths": ["Strong React experience"],
      "weaknesses": ["Limited backend exposure"],
      "summary": "Good frontend fit for this role.",
      "recommendation": "Shortlist for screening.",
      "generatedAt": "2026-06-29T10:00:00.000Z"
    }
  }
}
```

### Update Job

```http
PATCH http://localhost:3000/api/jobs/665fc28a8e7b2a3a11000002
Authorization: Bearer <same-creator-hr-access-token>
Content-Type: application/json
```

```json
{
  "status": "Closed",
  "applicationEnd": "2026-07-15"
}
```

### Delete Job

```http
DELETE http://localhost:3000/api/jobs/665fc28a8e7b2a3a11000002
Authorization: Bearer <same-creator-hr-access-token>
```

Admin can also delete a job:

```http
DELETE http://localhost:3000/api/jobs/665fc28a8e7b2a3a11000002
Authorization: Bearer <admin-access-token>
```

Deleting a job does not delete its applications. Related applications are kept, their status becomes `Job has been deleted`, and candidate application responses still include the deleted job details.

### Apply To Job With New CV

```http
POST http://localhost:3000/api/jobs/665fc28a8e7b2a3a11000002/apply
Authorization: Bearer <candidate-access-token>
Content-Type: multipart/form-data
```

```text
CV: selected-file.pdf
```

### Apply To Job With Profile CV

Send the same request without a body. The API uses the candidate's existing `CV` URL from their profile.

```http
POST http://localhost:3000/api/jobs/665fc28a8e7b2a3a11000002/apply
Authorization: Bearer <candidate-access-token>
```

## Valid Enum Values

```text
workplace: Onsite, Hybrid, Remote
jobType: Intern, Full Time, Part Time
status: Open, Closed, Drafted
application status: Pending, Reviewed, Accepted, Rejected, Deleted, Job has been deleted
```
