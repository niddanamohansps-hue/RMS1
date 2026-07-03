# API for Recruitment Management System (RMS)

## Base URL

```
https://rms1-1-suhq.onrender.com/api/
```

---

## 🔐 1. Authentication & Profile

---

### 1.1 Register New User (Candidate)

Creates a new candidate account and returns JWT tokens.

**Endpoint**

```
POST /auth/register/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/auth/register/
```

**Auth Required**: None (Public)

**Request Body (JSON)**

| Field      | Type   | Required | Description              | Example                  |
|------------|--------|----------|--------------------------|--------------------------|
| email      | String | Yes      | User's email address     | jane.doe@example.com     |
| password   | String | Yes      | Account password         | securepassword123        |
| first_name | String | Yes      | First name of the user   | Jane                     |
| last_name  | String | Yes      | Last name of the user    | Doe                      |

**Example Request**

```json
POST https://rms1-1-suhq.onrender.com/api/auth/register/
Content-Type: application/json

{
  "email": "jane.doe@example.com",
  "password": "securepassword123",
  "first_name": "Jane",
  "last_name": "Doe"
}
```

**Response (201 Created)**

```json
{
  "message": "Registration successful.",
  "user": {
    "id": 15,
    "email": "jane.doe@example.com",
    "first_name": "Jane",
    "last_name": "Doe",
    "role": "candidate",
    "phone": ""
  },
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

________________________________________

### 1.2 Login (Get JWT Tokens)

Authenticate using email and password to receive access and refresh JWT tokens.

**Endpoint**

```
POST /auth/login/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/auth/login/
```

**Auth Required**: None (Public)

**Request Body (JSON)**

| Field    | Type   | Required | Description          | Example              |
|----------|--------|----------|----------------------|----------------------|
| email    | String | Yes      | Registered email     | hr@southpoint.edu    |
| password | String | Yes      | Account password     | Admin@123            |

**Example Request**

```json
POST https://rms1-1-suhq.onrender.com/api/auth/login/
Content-Type: application/json

{
  "email": "hr@southpoint.edu",
  "password": "Admin@123"
}
```

**Response (200 OK)**

```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

________________________________________

### 1.3 Refresh Access Token

Obtain a new access token using a valid refresh token.

**Endpoint**

```
POST /auth/token/refresh/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/auth/token/refresh/
```

**Auth Required**: None (Public)

**Request Body (JSON)**

| Field   | Type   | Required | Description                | Example                                      |
|---------|--------|----------|----------------------------|----------------------------------------------|
| refresh | String | Yes      | Valid JWT refresh token     | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...     |

**Example Request**

```json
POST https://rms1-1-suhq.onrender.com/api/auth/token/refresh/
Content-Type: application/json

{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK)**

```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

________________________________________

### 1.4 Logout (Blacklist Refresh Token)

Blacklist a refresh token to invalidate the user session.

**Endpoint**

```
POST /auth/logout/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/auth/logout/
```

**Auth Required**: JWT Bearer Token

**Request Header**

```
Authorization: Bearer <access_token>
```

**Request Body (JSON)**

| Field   | Type   | Required | Description                | Example                                      |
|---------|--------|----------|----------------------------|----------------------------------------------|
| refresh | String | Yes      | Refresh token to blacklist | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...     |

**Example Request**

```json
POST https://rms1-1-suhq.onrender.com/api/auth/logout/
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK)**

```json
{
  "message": "Logged out successfully."
}
```

________________________________________

### 1.5 Get Current User Profile

Returns the profile details of the currently logged-in user.

**Endpoint**

```
GET /auth/me/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/auth/me/
```

**Auth Required**: JWT Bearer Token

**Example Request**

```
GET https://rms1-1-suhq.onrender.com/api/auth/me/
Authorization: Bearer <access_token>
```

**Response (200 OK — Admin User)**

```json
{
  "id": 1,
  "email": "hr@southpoint.edu",
  "first_name": "HR",
  "last_name": "Admin",
  "role": "admin",
  "phone": "9876543210"
}
```

**Response (200 OK — Candidate User)**

```json
{
  "id": 15,
  "email": "jane.doe@example.com",
  "first_name": "Jane",
  "last_name": "Doe",
  "role": "candidate",
  "phone": "1234567890",
  "profile": {
    "current_location": "Guwahati, Assam",
    "educational_qualification": "B.Tech Computer Science",
    "degree_name": "Bachelor of Technology",
    "years_of_experience": "2-4",
    "preferred_role": "Music Teacher",
    "skills": ["Communication", "Music Theory"],
    "salary_expectation": "45,000",
    "linkedin_profile": "https://linkedin.com/in/janedoe",
    "portfolio_link": "",
    "resume": "/media/resumes/2026/06/resume_jane.pdf"
  }
}
```

________________________________________

### 1.6 Update Current User Profile

Update user details and candidate profile information.

**Endpoint**

```
PUT /auth/me/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/auth/me/
```

**Auth Required**: JWT Bearer Token

**Request Body (JSON)**

| Field      | Type   | Required | Description               | Example                        |
|------------|--------|----------|---------------------------|--------------------------------|
| first_name | String | No       | Updated first name        | Jane Updated                   |
| phone      | String | No       | Updated phone number      | 9998887776                     |
| profile    | Object | No       | Nested candidate profile  | See example below              |

**Example Request**

```json
PUT https://rms1-1-suhq.onrender.com/api/auth/me/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "first_name": "Jane Updated",
  "phone": "9998887776",
  "profile": {
    "current_location": "Shillong",
    "skills": ["Communication", "Guitar", "Piano"]
  }
}
```

**Response (200 OK)**

```json
{
  "id": 15,
  "email": "jane.doe@example.com",
  "first_name": "Jane Updated",
  "last_name": "Doe",
  "role": "candidate",
  "phone": "9998887776"
}
```

________________________________________

### 1.7 Change Password

Change the password for the currently logged-in user.

**Endpoint**

```
POST /auth/change-password/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/auth/change-password/
```

**Auth Required**: JWT Bearer Token

**Request Body (JSON)**

| Field        | Type   | Required | Description          | Example          |
|--------------|--------|----------|----------------------|------------------|
| old_password | String | Yes      | Current password     | Admin@123        |
| new_password | String | Yes      | New password         | NewAdmin@456     |

**Example Request**

```json
POST https://rms1-1-suhq.onrender.com/api/auth/change-password/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "old_password": "Admin@123",
  "new_password": "NewAdmin@456"
}
```

**Response (200 OK)**

```json
{
  "message": "Password changed successfully."
}
```

---

## 💼 2. Dashboard & Job Management

---

### 2.1 Get Dashboard Statistics

Returns aggregated statistics for the HR admin dashboard. Response is cached for performance.

**Endpoint**

```
GET /dashboard/stats/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/dashboard/stats/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Example Request**

```
GET https://rms1-1-suhq.onrender.com/api/dashboard/stats/
Authorization: Bearer <access_token>
```

**Response (200 OK — Cached)**

```json
{
  "open_positions": 8,
  "pending_approvals": 2,
  "total_applicants": 45,
  "interviews_scheduled": 6,
  "offers_released": 4,
  "new_joiners": 2,
  "offer_acceptance_rate": "75.0%",
  "total_roles": 12,
  "active_roles": 10,
  "pipeline": {
    "applied": 18,
    "shortlisted": 12,
    "selected": 5,
    "offered": 4
  }
}
```

________________________________________

### 2.2 Get Public Job Postings (Career Page)

Returns all currently published job listings for the public career page. Supports filtering and search.

**Endpoint**

```
GET /job-postings/public/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/job-postings/public/
```

**Auth Required**: None (Public)

**Query Parameters**

| Parameter | Type   | Required | Description                          | Example            |
|-----------|--------|----------|--------------------------------------|--------------------|
| category  | String | No       | Filter by job category name          | Academic Positions |
| q         | String | No       | Search keyword in role/description   | Mathematics        |

**Example Requests**

```
GET https://rms1-1-suhq.onrender.com/api/job-postings/public/

GET https://rms1-1-suhq.onrender.com/api/job-postings/public/?category=Academic%20Positions

GET https://rms1-1-suhq.onrender.com/api/job-postings/public/?q=Mathematics
```

**Response (200 OK — Cached)**

```json
[
  {
    "id": 1,
    "posting_id": "JP-2026-0001",
    "role": "Senior Mathematics Teacher",
    "department": "Academic Department",
    "type": "Full-time",
    "category": "Academic Positions",
    "location": "Guwahati, Assam",
    "description": "We are looking for an experienced Mathematics teacher to join our secondary school team.",
    "qualifications": ["Master's degree in Mathematics", "B.Ed or equivalent", "Experience in CBSE curriculum"],
    "educational_qualifications": "Master's degree in Mathematics\nB.Ed or equivalent teaching certification",
    "skills_required": "Classroom Management\nAlgebra & Calculus proficiency\nStudent mentoring",
    "experience": "3–5 yrs",
    "salary_range": "₹40K–₹60K",
    "deadline": "July 15, 2026",
    "expiry_date": null,
    "status": "Published"
  },
  {
    "id": 2,
    "posting_id": "JP-2026-0002",
    "role": "Office Coordinator",
    "department": "Administration",
    "type": "Full-time",
    "category": "Administrative Positions",
    "location": "Guwahati, Assam",
    "description": "Manage day-to-day office operations and coordinate communications.",
    "qualifications": ["Graduate", "Proficiency in MS Office", "Strong communication skills"],
    "educational_qualifications": "Graduate in any discipline",
    "skills_required": "Office administration\nMS Office Suite\nGood communication",
    "experience": "2–4 yrs",
    "salary_range": "₹25K–₹35K",
    "deadline": "June 30, 2026",
    "expiry_date": null,
    "status": "Published"
  }
]
```

________________________________________

### 2.3 Get All Job Postings (Admin)

Returns all job postings (published and unpublished) for admin management.

**Endpoint**

```
GET /job-postings/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/job-postings/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Example Request**

```
GET https://rms1-1-suhq.onrender.com/api/job-postings/
Authorization: Bearer <access_token>
```

**Response (200 OK)**

```json
[
  {
    "id": 1,
    "posting_id": "JP-2026-0001",
    "role": "Senior Mathematics Teacher",
    "department": "Academic Department",
    "type": "Full-time",
    "category": "Academic Positions",
    "location": "Guwahati, Assam",
    "status": "Published",
    "application_count": 8,
    "expiry_date": null
  }
]
```

________________________________________

### 2.4 Create New Job Posting

Create a new job posting (defaults to Unpublished status).

**Endpoint**

```
POST /job-postings/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/job-postings/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Request Body (JSON)**

| Field          | Type     | Required | Description                        | Example                    |
|----------------|----------|----------|------------------------------------|----------------------------|
| role           | String   | Yes      | Job role title                     | Physics Teacher            |
| department     | String   | Yes      | Department name                    | Science                    |
| type           | String   | Yes      | Employment type                    | Full-time, Part-time       |
| category       | String   | Yes      | Job category                       | Academic Positions         |
| location       | String   | Yes      | Job location                       | Guwahati, Assam            |
| description    | String   | Yes      | Detailed job description           | Physics Teacher wanted...  |
| qualifications | Array    | Yes      | List of required qualifications    | ["B.Ed", "M.Sc Physics"]   |
| experience     | String   | Yes      | Experience requirement             | 2+ years                   |
| salary_range   | String   | Yes      | Salary range                       | ₹40K–₹50K                 |
| channel        | String   | No       | Recruitment channel                | External, Internal         |
| status         | String   | No       | Initial posting status             | Unpublished (default)      |
| expiry_date    | String   | No       | Date the posting expires (ISO)     | 2026-08-30                 |

**Example Request**

```json
POST https://rms1-1-suhq.onrender.com/api/job-postings/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "role": "Physics Teacher",
  "department": "Science",
  "type": "Full-time",
  "category": "Academic Positions",
  "location": "Guwahati, Assam",
  "description": "Physics Teacher wanted for secondary grades.",
  "qualifications": ["B.Ed", "M.Sc Physics"],
  "experience": "2+ years",
  "salary_range": "₹40K–₹50K",
  "channel": "External",
  "status": "Unpublished",
  "expiry_date": "2026-08-30"
}
```

**Response (201 Created)**

```json
{
  "id": 3,
  "posting_id": "JP-2026-0003",
  "role": "Physics Teacher",
  "department": "Science",
  "type": "Full-time",
  "category": "Academic Positions",
  "location": "Guwahati, Assam",
  "description": "Physics Teacher wanted for secondary grades.",
  "qualifications": ["B.Ed", "M.Sc Physics"],
  "experience": "2+ years",
  "salary_range": "₹40K–₹50K",
  "channel": "External",
  "status": "Unpublished",
  "posted_date": null,
  "expiry_date": "2026-08-30",
  "application_count": 0
}
```

________________________________________

### 2.5 Publish a Job Posting

Change the status of a posting to Published (makes it visible on the career page).

**Endpoint**

```
POST /job-postings/{id}/publish/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/job-postings/3/publish/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Path Parameters**

| Parameter | Type    | Required | Description          | Example |
|-----------|---------|----------|----------------------|---------|
| id        | Integer | Yes      | Job Posting ID       | 3       |

**Example Request**

```
POST https://rms1-1-suhq.onrender.com/api/job-postings/3/publish/
Authorization: Bearer <access_token>
```

**Response (200 OK)**

```json
{
  "id": 3,
  "posting_id": "JP-2026-0003",
  "role": "Physics Teacher",
  "status": "Published",
  "posted_date": "2026-06-30"
}
```

________________________________________

### 2.6 Update a Job Posting

Update specific fields of an existing job posting.

**Endpoint**

```
PUT /job-postings/{id}/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/job-postings/3/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Example Request**

```json
PUT https://rms1-1-suhq.onrender.com/api/job-postings/3/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "salary_range": "₹45K–₹55K",
  "experience": "3+ years"
}
```

**Response (200 OK)**

```json
{
  "id": 3,
  "posting_id": "JP-2026-0003",
  "role": "Physics Teacher",
  "salary_range": "₹45K–₹55K",
  "experience": "3+ years",
  "status": "Published"
}
```

________________________________________

### 2.7 Delete a Job Posting

Permanently delete a job posting.

**Endpoint**

```
DELETE /job-postings/{id}/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/job-postings/3/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Example Request**

```
DELETE https://rms1-1-suhq.onrender.com/api/job-postings/3/
Authorization: Bearer <access_token>
```

**Response (204 No Content)**: Empty body

________________________________________

### 2.8 Get Job Categories

Returns all available job categories (e.g., Academic, Administrative, Support Staff).

**Endpoint**

```
GET /job-categories/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/job-categories/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Example Request**

```
GET https://rms1-1-suhq.onrender.com/api/job-categories/
Authorization: Bearer <access_token>
```

**Response (200 OK)**

```json
[
  { "id": 1, "name": "Academic Positions" },
  { "id": 2, "name": "Administrative Positions" },
  { "id": 3, "name": "Support Staff" }
]
```

________________________________________

### 2.9 Get Existing Roles

Returns all organizational roles seeded in the system.

**Endpoint**

```
GET /roles/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/roles/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Example Request**

```
GET https://rms1-1-suhq.onrender.com/api/roles/
Authorization: Bearer <access_token>
```

**Response (200 OK)**

```json
[
  {
    "id": 1,
    "title": "Principal",
    "department": "Management",
    "headcount": 1,
    "filled": 1,
    "status": "Active"
  },
  {
    "id": 2,
    "title": "Mathematics Teacher",
    "department": "Academic Department",
    "headcount": 3,
    "filled": 2,
    "status": "Active"
  }
]
```

---

## 📋 3. Role Requests & Approvals

---

### 3.1 Submit a Role Request

Submit a request for opening a new role headcount. **An ApprovalRequest is automatically created** so the request immediately appears in the `/api/approvals/` list for review.

**Endpoint**

```
POST /role-requests/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/role-requests/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Request Body (JSON)**

| Field         | Type   | Required | Description                      | Example                              |
|---------------|--------|----------|----------------------------------|--------------------------------------|
| department    | String | Yes      | Target department                | Arts                                 |
| role          | String | Yes      | Role title being requested       | Music Teacher                        |
| justification | String | Yes      | Business justification           | Increased student enrollment...      |

**Example Request**

```json
POST https://rms1-1-suhq.onrender.com/api/role-requests/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "department": "Arts",
  "role": "Music Teacher",
  "justification": "Increased student enrollment in humanities stream."
}
```

**Response (201 Created)**

```json
{
  "id": 4,
  "request_id": "RR-2026-0004",
  "department": "Arts",
  "role": "Music Teacher",
  "justification": "Increased student enrollment in humanities stream.",
  "status": "Pending",
  "date": "2026-06-30",
  "created_by_name": "HR Admin"
}
```

> **Note:** This automatically creates a corresponding entry in `/api/approvals/` with `type: "Role Request"` and `status: "Pending"`.

________________________________________

### 3.2 Get All Approval Requests

Returns all approval requests. These are auto-created whenever a Role Request or Job Request is submitted. Supports filtering by `status` and `type`.

**Endpoint**

```
GET /approvals/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/approvals/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Example Request**

```
GET https://rms1-1-suhq.onrender.com/api/approvals/
Authorization: Bearer <access_token>
```

**Query Parameters**

| Parameter | Type   | Required | Description                          | Allowed Values                       | Example        |
|-----------|--------|----------|--------------------------------------|--------------------------------------|----------------|
| status    | String | No       | Filter by approval status            | Pending, Approved, Rejected, Sent Back | Pending        |
| type      | String | No       | Filter by request type               | Role Request, Job Request            | Role Request   |

**Example Requests**

```
GET https://rms1-1-suhq.onrender.com/api/approvals/

GET https://rms1-1-suhq.onrender.com/api/approvals/?status=Pending

GET https://rms1-1-suhq.onrender.com/api/approvals/?type=Role%20Request
```

**Response (200 OK)**

```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "request_id": "RR-2026-0004",
      "type": "Role Request",
      "title": "Music Teacher",
      "department": "Arts",
      "submitted_by": "HR Admin",
      "status": "Pending",
      "date": "2026-06-30",
      "job_request": null,
      "role_request": 4,
      "history": []
    },
    {
      "id": 2,
      "request_id": "JR-2026-0001",
      "type": "Job Request",
      "title": "Physics Teacher",
      "department": "",
      "submitted_by": "HR Admin",
      "status": "Pending",
      "date": "2026-06-30",
      "job_request": 1,
      "role_request": null,
      "history": []
    }
  ]
}
```

________________________________________

### 3.3 Take Action on Approval Request

Approve, reject, or send back a pending role or job request.

**Endpoint**

```
POST /approvals/{id}/action/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/approvals/2/action/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Path Parameters**

| Parameter | Type    | Required | Description            | Example |
|-----------|---------|----------|------------------------|---------|
| id        | Integer | Yes      | Approval Request ID    | 2       |

**Request Body (JSON)**

| Field    | Type   | Required | Description                                 | Allowed Values                    | Example                          |
|----------|--------|----------|---------------------------------------------|-----------------------------------|----------------------------------|
| action   | String | Yes      | Action to take                              | Approve, Reject, Send Back        | Approve                          |
| note     | String | No       | Optional note/comment                       |                                   | Approved for headcount increase. |
| acted_by | String | No       | Name of person taking the action            |                                   | Principal                        |

**Example Request**

```json
POST https://rms1-1-suhq.onrender.com/api/approvals/2/action/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "action": "Approve",
  "note": "Approved for headcount increase.",
  "acted_by": "Principal"
}
```

**Response (200 OK)**

```json
{
  "id": 2,
  "request_id": "RR-004",
  "type": "Role Request",
  "title": "Music Teacher",
  "status": "Approved",
  "history": [
    {
      "id": 10,
      "action": "Approve",
      "acted_by": "Principal",
      "date": "2026-06-30",
      "note": "Approved for headcount increase."
    }
  ]
}
```

________________________________________

### 3.4 Submit a Job Request

Submit a request to create a new job vacancy. **An ApprovalRequest is automatically created** so the request immediately appears in the `/api/approvals/` list for review.

**Endpoint**

```
POST /job-requests/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/job-requests/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Request Body (JSON)**

| Field                      | Type    | Required | Description                          | Example                         |
|----------------------------|---------|----------|--------------------------------------|---------------------------------|
| role                       | String  | Yes      | Job role title                       | Physics Teacher                 |
| department                 | String  | Yes      | Department name                      | Science                         |
| vacancies                  | Integer | No       | Number of vacancies (default 1)      | 2                               |
| experience                 | String  | No       | Experience requirement               | 3+ years                        |
| salary_range               | String  | No       | Salary range                         | ₹40K–₹50K                       |
| type                       | String  | No       | Employment type (default Full-time)  | Full-time, Part-time            |
| location                   | String  | No       | Job location                         | Guwahati, Assam                 |
| category                   | String  | No       | Job category                         | Academic Positions              |
| description                | String  | No       | Job description                      | Detailed description text...    |
| justification              | String  | No       | Justification note                   | Needed due to workload...       |
| educational_qualifications | String  | No       | Required educational qualification   | M.Sc Physics, B.Ed              |
| skills_required            | String  | No       | Required skills (comma-separated)    | Classroom Management, Physics   |

**Example Request**

```json
POST https://rms1-1-suhq.onrender.com/api/job-requests/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "category": "Academic Positions",
  "department": "IT DEP",
  "role": "Dev1",
  "vacancies": 6,
  "experience": "2-3",
  "salary_range": "1000-2000",
  "type": "Full-time",
  "description": "evwmlm;lrvfm;m;d\nsvndlkm;das'\ndclm/\nelkncnlk;",
  "justification": "ok sir",
  "location": "Guwahati",
  "educational_qualifications": "",
  "skills_required": "Data Analysis, IT Support"
}
```

**Response (201 Created)**

```json
{
  "id": 6,
  "category": "Academic Positions",
  "request_id": "JR-2026-0006",
  "department": "IT DEP",
  "role": "Dev1",
  "vacancies": 6,
  "experience": "2-3",
  "salary_range": "1000-2000",
  "type": "Full-time",
  "description": "evwmlm;lrvfm;m;d\nsvndlkm;das'\ndclm/\nelkncnlk;",
  "justification": "ok sir",
  "location": "Guwahati",
  "educational_qualifications": "",
  "skills_required": "Data Analysis, IT Support",
  "status": "Approved",
  "submitted_by": "HR Admin",
  "created_at": "2026-07-03T13:18:14.685459+05:30",
  "updated_at": "2026-07-03T13:39:50.658280+05:30",
  "created_by": 1
}
```

> **Note:** This automatically creates a corresponding entry in `/api/approvals/` with `type: "Job Request"` and `status: "Pending"`.

________________________________________

### 3.5 Get All Role Requests

Returns all role requests. Supports filtering by `status` and `department`.

**Endpoint**

```
GET /role-requests/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/role-requests/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Query Parameters**

| Parameter  | Type   | Required | Description              | Allowed Values                | Example  |
|------------|--------|----------|--------------------------|-------------------------------|----------|
| status     | String | No       | Filter by request status | Pending, Approved, Rejected   | Pending  |
| department | String | No       | Filter by department     |                               | Arts     |

**Example Request**

```
GET https://rms1-1-suhq.onrender.com/api/role-requests/
Authorization: Bearer <access_token>
```

**Response (200 OK)**

```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 4,
      "created_by_name": "HR Admin",
      "request_id": "RR-2026-0004",
      "department": "Arts",
      "role": "Music Teacher",
      "justification": "Increased student enrollment in humanities stream.",
      "status": "Pending",
      "submitted_by": "",
      "date": "2026-06-30",
      "reviewed_at": null,
      "reviewer_note": "",
      "created_by": 1
    }
  ]
}
```

________________________________________

### 3.6 Get All Job Requests

Returns all job requests. Supports filtering by `status` and `type`.

**Endpoint**

```
GET /job-requests/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/job-requests/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Query Parameters**

| Parameter | Type   | Required | Description              | Allowed Values                | Example    |
|-----------|--------|----------|--------------------------|-------------------------------|------------|
| status    | String | No       | Filter by request status | Pending, Approved, Rejected   | Pending    |
| type      | String | No       | Filter by employment type|                               | Full-time  |

**Example Request**

```
GET https://rms1-1-suhq.onrender.com/api/job-requests/
Authorization: Bearer <access_token>
```

**Response (200 OK)**

```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 6,
      "category": "Academic Positions",
      "request_id": "JR-2026-0006",
      "department": "IT DEP",
      "role": "Dev1",
      "vacancies": 6,
      "experience": "2-3",
      "salary_range": "1000-2000",
      "type": "Full-time",
      "description": "evwmlm;lrvfm;m;d\nsvndlkm;das'\ndclm/\nelkncnlk;",
      "justification": "ok sir",
      "location": "Guwahati",
      "educational_qualifications": "",
      "skills_required": "Data Analysis, IT Support",
      "status": "Approved",
      "submitted_by": "HR Admin",
      "created_at": "2026-07-03T13:18:14.685459+05:30",
      "updated_at": "2026-07-03T13:39:50.658280+05:30",
      "created_by": 1
    }
  ]
}
```

---

## 📂 4. Applications

---

### 4.1 Submit Job Application (Candidate)

Submit a job application for a specific published posting.

**Endpoint**

```
POST /applications/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/applications/
```

**Auth Required**: Candidate User (JWT Bearer Token)

**Request Body (JSON)**

| Field         | Type    | Required | Description                       | Example                                  |
|---------------|---------|----------|-----------------------------------|------------------------------------------|
| posting       | Integer | Yes      | Job Posting ID to apply for       | 1                                        |
| experience    | String  | Yes      | Candidate's experience summary    | 3 years                                  |
| qualification | String  | Yes      | Candidate's qualifications        | M.Sc Math, B.Ed                          |
| cover_letter  | String  | No       | Optional cover letter text        | I would like to apply for the math role. |
| notice_period | String  | No       | Current notice period             | 30 days                                  |
| has_referral  | Boolean | No       | Whether candidate has a referral  | false                                    |

**Example Request**

```json
POST https://rms1-1-suhq.onrender.com/api/applications/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "posting": 1,
  "experience": "3 years",
  "qualification": "M.Sc Math, B.Ed",
  "cover_letter": "I would like to apply for the math role.",
  "notice_period": "30 days",
  "has_referral": false
}
```

**Response (201 Created)**

```json
{
  "id": 12,
  "app_id": "JAPP-012",
  "role": "Senior Mathematics Teacher",
  "posting": 1,
  "status": "Applied",
  "applied_date": "2026-06-30",
  "candidate_name": "Jane Doe"
}
```

________________________________________

### 4.2 Get My Applications (Candidate)

Fetch all applications submitted by the currently logged-in candidate.

**Endpoint**

```
GET /applications/mine/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/applications/mine/
```

**Auth Required**: Candidate User (JWT Bearer Token)

**Example Request**

```
GET https://rms1-1-suhq.onrender.com/api/applications/mine/
Authorization: Bearer <access_token>
```

**Response (200 OK)**

```json
[
  {
    "id": 12,
    "app_id": "JAPP-012",
    "role": "Senior Mathematics Teacher",
    "posting": 1,
    "posting_title": "Senior Mathematics Teacher",
    "status": "Applied",
    "applied_date": "2026-06-30"
  }
]
```

________________________________________

### 4.3 Get All Applications (Admin)

Returns all job applications across all postings for admin management.

**Endpoint**

```
GET /applications/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/applications/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Example Request**

```
GET https://rms1-1-suhq.onrender.com/api/applications/
Authorization: Bearer <access_token>
```

**Response (200 OK)**

```json
[
  {
    "id": 12,
    "app_id": "JAPP-012",
    "role": "Senior Mathematics Teacher",
    "posting": 1,
    "candidate_name": "Jane Doe",
    "status": "Applied",
    "applied_date": "2026-06-30"
  }
]
```

________________________________________

### 4.4 Update Application Status (Admin)

Update the status of a specific application (e.g., shortlist, reject, select). Triggers an automatic background notification to the candidate.

**Endpoint**

```
PATCH /applications/{id}/update_status/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/applications/12/update_status/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Path Parameters**

| Parameter | Type    | Required | Description        | Example |
|-----------|---------|----------|--------------------|---------|
| id        | Integer | Yes      | Application ID     | 12      |

**Request Body (JSON)**

| Field      | Type   | Required | Description                                   | Allowed Values                                       | Example                          |
|------------|--------|----------|-----------------------------------------------|------------------------------------------------------|----------------------------------|
| status     | String | Yes      | New application status                        | Applied, Shortlisted, Selected, Rejected, Offered    | Shortlisted                      |
| admin_note | String | No       | Internal note visible to admins               |                                                      | Strong experience in algebra.    |

**Example Request**

```json
PATCH https://rms1-1-suhq.onrender.com/api/applications/12/update_status/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "Shortlisted",
  "admin_note": "Strong experience in algebra."
}
```

**Response (200 OK)**

```json
{
  "id": 12,
  "app_id": "JAPP-012",
  "status": "Shortlisted",
  "admin_note": "Strong experience in algebra."
}
```

________________________________________

### 4.5 Submit General Application (Candidate)

Submit a general application not tied to any specific job posting.

**Endpoint**

```
POST /general-applications/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/general-applications/
```

**Auth Required**: Candidate User (JWT Bearer Token)

**Example Request**

```json
POST https://rms1-1-suhq.onrender.com/api/general-applications/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "experience": "5 years",
  "qualification": "M.A. English, B.Ed",
  "preferred_role": "English Teacher",
  "cover_letter": "I am interested in teaching opportunities."
}
```

**Response (201 Created)**

```json
{
  "id": 5,
  "app_id": "GA-005",
  "candidate_name": "Jane Doe",
  "preferred_role": "English Teacher",
  "status": "Applied",
  "applied_date": "2026-06-30"
}
```

---

## 📅 5. Interview Scheduling

---

### 5.1 Get All Panelists

Returns a list of all available interview panelists.

**Endpoint**

```
GET /panelists/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/panelists/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Example Request**

```
GET https://rms1-1-suhq.onrender.com/api/panelists/
Authorization: Bearer <access_token>
```

**Response (200 OK)**

```json
[
  {
    "id": 1,
    "name": "Dr. Suresh Kumar",
    "email": "suresh@southpoint.edu",
    "department": "Science"
  },
  {
    "id": 2,
    "name": "Prof. Anil Baruah",
    "email": "anil@southpoint.edu",
    "department": "Science"
  }
]
```

________________________________________

### 5.2 Schedule an Interview

Schedule an interview for a shortlisted candidate.

**Endpoint**

```
POST /interviews/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/interviews/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Request Body (JSON)**

| Field          | Type     | Required | Description                        | Example                                    |
|----------------|----------|----------|------------------------------------|--------------------------------------------|
| application    | Integer  | Yes      | Application ID                     | 12                                         |
| candidate_name | String   | Yes      | Name of the candidate              | Jane Doe                                   |
| role           | String   | Yes      | Role being interviewed for         | Senior Mathematics Teacher                 |
| date           | String   | Yes      | Interview date (YYYY-MM-DD)        | 2026-07-05                                 |
| time           | String   | Yes      | Interview time (HH:MM:SS)         | 14:00:00                                   |
| mode           | String   | Yes      | Interview mode                     | Online, Offline                            |
| meeting_link   | String   | No       | Meeting link (for online mode)     | https://meet.google.com/abc-defg-hij       |
| round          | Integer  | Yes      | Interview round number             | 1                                          |
| panel          | Array    | Yes      | List of panelist IDs               | [1, 2]                                     |

**Example Request**

```json
POST https://rms1-1-suhq.onrender.com/api/interviews/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "application": 12,
  "candidate_name": "Jane Doe",
  "role": "Senior Mathematics Teacher",
  "date": "2026-07-05",
  "time": "14:00:00",
  "mode": "Online",
  "meeting_link": "https://meet.google.com/abc-defg-hij",
  "round": 1,
  "panel": [1, 2]
}
```

**Response (201 Created)**

```json
{
  "id": 6,
  "interview_id": "INT-006",
  "candidate_name": "Jane Doe",
  "role": "Senior Mathematics Teacher",
  "date": "2026-07-05",
  "time": "14:00:00",
  "mode": "Online",
  "meeting_link": "https://meet.google.com/abc-defg-hij",
  "status": "Scheduled",
  "round": 1,
  "panel_details": [
    {
      "id": 1,
      "name": "Dr. Suresh Kumar",
      "email": "suresh@southpoint.edu",
      "department": "Science"
    },
    {
      "id": 2,
      "name": "Prof. Anil Baruah",
      "email": "anil@southpoint.edu",
      "department": "Science"
    }
  ]
}
```

________________________________________

### 5.3 Get All Interviews

Returns all scheduled interviews for admin management.

**Endpoint**

```
GET /interviews/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/interviews/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Example Request**

```
GET https://rms1-1-suhq.onrender.com/api/interviews/
Authorization: Bearer <access_token>
```

**Response (200 OK)**

```json
[
  {
    "id": 6,
    "interview_id": "INT-006",
    "candidate_name": "Jane Doe",
    "role": "Senior Mathematics Teacher",
    "date": "2026-07-05",
    "time": "14:00:00",
    "mode": "Online",
    "status": "Scheduled",
    "round": 1
  }
]
```

________________________________________

### 5.4 Submit Interview Score & Feedback

Submit scores and feedback for a completed interview. Triggers an automatic background notification to the candidate.

**Endpoint**

```
PATCH /interviews/{id}/score/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/interviews/6/score/
```

**Auth Required**: Admin/Panelist User (JWT Bearer Token)

**Path Parameters**

| Parameter | Type    | Required | Description      | Example |
|-----------|---------|----------|------------------|---------|
| id        | Integer | Yes      | Interview ID     | 6       |

**Request Body (JSON)**

| Field          | Type    | Required | Description                   | Allowed Values                          | Example                                       |
|----------------|---------|----------|-------------------------------|-----------------------------------------|-----------------------------------------------|
| score          | Integer | Yes      | Interview score (0–100)       | 0 to 100                               | 85                                            |
| recommendation | String  | Yes      | Panelist recommendation       | Selected, Rejected, On Hold             | Selected                                      |
| feedback       | String  | No       | Detailed feedback text        |                                         | Strong communication and subject matter skills.|
| status         | String  | Yes      | Updated interview status      | Completed, No Show, Cancelled           | Completed                                     |

**Example Request**

```json
PATCH https://rms1-1-suhq.onrender.com/api/interviews/6/score/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "score": 85,
  "recommendation": "Selected",
  "feedback": "Strong communication and subject matter skills.",
  "status": "Completed"
}
```

**Response (200 OK)**

```json
{
  "id": 6,
  "score": 85,
  "recommendation": "Selected",
  "feedback": "Strong communication and subject matter skills.",
  "status": "Completed"
}
```

---

## ✉️ 6. Offers & Onboarding

---

### 6.1 Issue a New Offer

Create and send an offer letter to a selected candidate.

**Endpoint**

```
POST /offers/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/offers/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Request Body (JSON)**

| Field          | Type    | Required | Description                      | Example                      |
|----------------|---------|----------|----------------------------------|------------------------------|
| candidate      | Integer | Yes      | Candidate User ID                | 15                           |
| candidate_name | String  | Yes      | Candidate full name              | Jane Doe                     |
| role           | String  | Yes      | Role being offered               | Senior Mathematics Teacher   |
| ctc            | String  | Yes      | Cost to company / salary offered | ₹45,000 INR                  |
| issued_date    | String  | Yes      | Date offer was issued (ISO)      | 2026-06-30                   |
| expiry_date    | String  | Yes      | Date offer expires (ISO)         | 2026-07-05                   |
| joining_date   | String  | Yes      | Expected joining date (ISO)      | 2026-07-20                   |
| status         | String  | No       | Initial offer status             | Sent (default)               |

**Example Request**

```json
POST https://rms1-1-suhq.onrender.com/api/offers/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "candidate": 15,
  "candidate_name": "Jane Doe",
  "role": "Senior Mathematics Teacher",
  "ctc": "₹45,000 INR",
  "issued_date": "2026-06-30",
  "expiry_date": "2026-07-05",
  "joining_date": "2026-07-20",
  "status": "Sent"
}
```

**Response (201 Created)**

```json
{
  "id": 4,
  "offer_id": "OFR-004",
  "candidate_name": "Jane Doe",
  "role": "Senior Mathematics Teacher",
  "ctc": "₹45,000 INR",
  "status": "Sent",
  "joining_date": "2026-07-20"
}
```

________________________________________

### 6.2 Accept an Offer (Candidate)

Candidate accepts the offer. This automatically initiates onboarding and queues a notification.

**Endpoint**

```
POST /offers/{id}/accept/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/offers/4/accept/
```

**Auth Required**: Candidate User (JWT Bearer Token)

**Path Parameters**

| Parameter | Type    | Required | Description  | Example |
|-----------|---------|----------|--------------|---------|
| id        | Integer | Yes      | Offer ID     | 4       |

**Example Request**

```
POST https://rms1-1-suhq.onrender.com/api/offers/4/accept/
Authorization: Bearer <access_token>
```

**Response (200 OK)**

```json
{
  "id": 4,
  "offer_id": "OFR-004",
  "status": "Accepted",
  "candidate_name": "Jane Doe"
}
```

________________________________________

### 6.3 Get All Onboarding Records

Returns all onboarding records for admin management.

**Endpoint**

```
GET /onboarding/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/onboarding/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Example Request**

```
GET https://rms1-1-suhq.onrender.com/api/onboarding/
Authorization: Bearer <access_token>
```

**Response (200 OK)**

```json
[
  {
    "id": 1,
    "candidate_name": "Jane Doe",
    "role": "Senior Mathematics Teacher",
    "joining_date": "2026-07-20",
    "status": "Pending",
    "documents_submitted": false
  }
]
```

---

## 🔔 7. Notifications

---

### 7.1 Get My Notifications

Retrieve all notifications for the currently logged-in user.

**Endpoint**

```
GET /notifications/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/notifications/
```

**Auth Required**: Authenticated User (JWT Bearer Token)

**Example Request**

```
GET https://rms1-1-suhq.onrender.com/api/notifications/
Authorization: Bearer <access_token>
```

**Response (200 OK)**

```json
[
  {
    "id": 102,
    "type": "offer_accepted",
    "title": "Offer Accepted",
    "message": "You have accepted the offer for Senior Mathematics Teacher. Onboarding has been initiated.",
    "is_read": false,
    "created_at": "2026-06-30T22:45:12+05:30"
  },
  {
    "id": 101,
    "type": "status_update",
    "title": "Application Shortlisted",
    "message": "Your application for Senior Mathematics Teacher has been shortlisted.",
    "is_read": true,
    "created_at": "2026-06-30T18:30:00+05:30"
  }
]
```

________________________________________

### 7.2 Mark Single Notification as Read

Mark a specific notification as read.

**Endpoint**

```
PATCH /notifications/{id}/mark_read/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/notifications/102/mark_read/
```

**Auth Required**: Authenticated User (JWT Bearer Token)

**Path Parameters**

| Parameter | Type    | Required | Description        | Example |
|-----------|---------|----------|--------------------|---------|
| id        | Integer | Yes      | Notification ID    | 102     |

**Example Request**

```
PATCH https://rms1-1-suhq.onrender.com/api/notifications/102/mark_read/
Authorization: Bearer <access_token>
```

**Response (200 OK)**

```json
{
  "id": 102,
  "is_read": true
}
```

________________________________________

### 7.3 Mark All Notifications as Read

Mark all notifications for the current user as read.

**Endpoint**

```
PATCH /notifications/mark_all_read/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/notifications/mark_all_read/
```

**Auth Required**: Authenticated User (JWT Bearer Token)

**Example Request**

```
PATCH https://rms1-1-suhq.onrender.com/api/notifications/mark_all_read/
Authorization: Bearer <access_token>
```

**Response (200 OK)**

```json
{
  "message": "All notifications marked as read."
}
```

---

## 🔑 Authentication Notes

All protected endpoints require a JWT Bearer Token in the request header:

```
Authorization: Bearer <access_token>
```

**How to obtain tokens:**
1. Call `POST /api/auth/login/` with valid email and password
2. Use the returned `access` token in the `Authorization` header
3. When the access token expires, call `POST /api/auth/token/refresh/` with the `refresh` token to get a new access token

**Test Credentials (Seeded Data):**

| Role       | Email                       | Password    |
|------------|-----------------------------|-------------|
| HR Admin   | hr@southpoint.edu           | Admin@123   |
| Panelist   | panelist@southpoint.edu     | Panel@123   |
| Candidate  | priya.sharma@email.com      | Priya@123   |

---

## ⚙️ Status Codes Reference

| Code | Meaning               | When                                        |
|------|-----------------------|---------------------------------------------|
| 200  | OK                    | Successful GET, PUT, PATCH requests         |
| 201  | Created               | Successful POST (new resource created)      |
| 204  | No Content            | Successful DELETE (resource removed)        |
| 400  | Bad Request           | Invalid or missing request parameters       |
| 401  | Unauthorized          | Missing or expired JWT token                |
| 403  | Forbidden             | Insufficient permissions (wrong role)       |
| 404  | Not Found             | Resource does not exist                     |
| 429  | Too Many Requests     | Rate limit exceeded                         |
| 500  | Internal Server Error | Unexpected server-side error                |

---

*Last Updated: June 30, 2026*
*South Point School — Recruitment Management System (RMS) Backend*
