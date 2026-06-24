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
PATCH  /api/jobs/:id
DELETE /api/jobs/:id
```

## Authorization Rules

```text
POST /api/jobs
  Requires Authorization: Bearer <hr-access-token>
  Only users with role "hr" can create jobs.

PATCH /api/jobs/:id
DELETE /api/jobs/:id
  Requires Authorization: Bearer <hr-access-token>
  Only the HR user stored in job.recruiter can update or delete the job.

GET endpoints
  Public. No token required.
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

## Valid Enum Values

```text
workplace: Onsite, Hybrid, Remote
jobType: Intern, Full Time, Part Time
status: Open, Closed, Drafted
```
