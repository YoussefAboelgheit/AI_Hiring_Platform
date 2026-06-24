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
