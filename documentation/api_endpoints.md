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

| Field            | Type   | Required | Description              | Example              |
|------------------|--------|----------|--------------------------|----------------------|
| email            | String | Yes      | User's email address     | jane.doe@example.com |
| password         | String | Yes      | Account password         | securepassword123    |
| confirm_password | String | Yes      | Must match password      | securepassword123    |
| first_name       | String | Yes      | First name of the user   | Jane                 |
| last_name        | String | Yes      | Last name of the user    | Doe                  |
| phone            | String | No       | Phone number             | 9876543210           |

**Example Request**

```json
POST https://rms1-1-suhq.onrender.com/api/auth/register/
Content-Type: application/json

{
  "email": "jane.doe@example.com",
  "password": "securepassword123",
  "confirm_password": "securepassword123",
  "first_name": "Jane",
  "last_name": "Doe",
  "phone": "9876543210"
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
    "phone": "9876543210",
    "role": "candidate",
    "full_name": "Jane Doe"
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

**Error Response (400 Bad Request)**

```json
{
  "error": "Token is blacklisted"
}
```

________________________________________

### 1.5 Get Current User Profile

Returns the profile details of the currently logged-in user. For candidates, includes the full `profile` object with resume, skills, qualifications, etc.

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
  "phone": "9876543210",
  "role": "admin",
  "full_name": "HR Admin"
}
```

**Response (200 OK — Candidate User)**

```json
{
  "id": 15,
  "email": "jane.doe@example.com",
  "first_name": "Jane",
  "last_name": "Doe",
  "phone": "1234567890",
  "role": "candidate",
  "full_name": "Jane Doe",
  "profile": {
    "id": 10,
    "user": {
      "id": 15,
      "email": "jane.doe@example.com",
      "first_name": "Jane",
      "last_name": "Doe",
      "phone": "1234567890",
      "role": "candidate",
      "full_name": "Jane Doe"
    },
    "current_location": "Guwahati, Assam",
    "educational_qualification": "B.Tech Computer Science",
    "degree_name": "Bachelor of Technology",
    "professional_qualification": "MBA",
    "professional_degree_name": "Master of Business Administration",
    "extracurricular_qualification": "",
    "extracurricular_degree_name": "",
    "years_of_experience": "2-4",
    "roles_interested": ["Music Teacher", "Arts Teacher"],
    "skills": ["Communication", "Music Theory", "Piano"],
    "salary_expectation": "45,000",
    "linkedin_profile": "https://linkedin.com/in/janedoe",
    "portfolio_link": "",
    "resume": "/media/resumes/2026/06/resume_jane.pdf",
    "created_at": "2026-06-15T10:30:00+05:30",
    "updated_at": "2026-06-30T14:22:00+05:30"
  }
}
```

> **Note:** If the candidate has not created a profile yet, the `profile` field will be `null`.

________________________________________

### 1.6 Update Current User Profile

Update user details and candidate profile information. Supports `multipart/form-data` for resume file upload.

**Endpoint**

```
PUT /auth/me/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/auth/me/
```

**Auth Required**: JWT Bearer Token

**Request Body (JSON or multipart/form-data)**

| Field      | Type   | Required | Description               | Example                        |
|------------|--------|----------|---------------------------|--------------------------------|
| first_name | String | No       | Updated first name        | Jane Updated                   |
| last_name  | String | No       | Updated last name         | Doe                            |
| phone      | String | No       | Updated phone number      | 9998887776                     |
| profile    | Object | No       | Nested candidate profile  | See example below              |

**Profile Object Fields (all optional)**

| Field                           | Type   | Description                        |
|---------------------------------|--------|------------------------------------|
| current_location                | String | Current city/location              |
| educational_qualification       | String | Education level                    |
| degree_name                     | String | Degree name                        |
| professional_qualification      | String | Professional qualification         |
| professional_degree_name        | String | Professional degree name           |
| extracurricular_qualification   | String | Extracurricular qualification      |
| extracurricular_degree_name     | String | Extracurricular degree name        |
| years_of_experience             | String | 0-1, 1-2, 2-4, 3-5, 5-8, 8+      |
| roles_interested                | Array  | List of role names                 |
| skills                          | Array  | List of skills                     |
| salary_expectation              | String | Expected salary                    |
| linkedin_profile                | URL    | LinkedIn URL                       |
| portfolio_link                  | URL    | Portfolio URL                      |
| resume                          | File   | Resume file (pdf, doc, docx)       |

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
    "skills": ["Communication", "Guitar", "Piano"],
    "years_of_experience": "3-5"
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
  "phone": "9998887776",
  "role": "candidate",
  "full_name": "Jane Updated Doe"
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

**Error Response (400 Bad Request)**

```json
{
  "error": "Old password is incorrect."
}
```

---

## 💼 2. Dashboard & Job Management

---

### 2.1 Get Dashboard Statistics

Returns aggregated statistics for the HR admin dashboard. Response is cached for 5 minutes.

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

**Response (200 OK)**

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

### 2.2 Get Job Categories

Returns all available job categories. Read-only for non-admin users.

**Endpoint**

```
GET /job-categories/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/job-categories/
```

**Auth Required**: Authenticated User (read), Admin User (write)

**Example Request**

```
GET https://rms1-1-suhq.onrender.com/api/job-categories/
Authorization: Bearer <access_token>
```

**Response (200 OK)**

```json
[
  {
    "id": 1,
    "name": "Academic Positions",
    "description": "Teaching and academic faculty roles",
    "created_at": "2026-06-01T10:00:00+05:30",
    "updated_at": "2026-06-01T10:00:00+05:30"
  },
  {
    "id": 2,
    "name": "Administrative Positions",
    "description": "Office and administrative roles",
    "created_at": "2026-06-01T10:00:00+05:30",
    "updated_at": "2026-06-01T10:00:00+05:30"
  },
  {
    "id": 3,
    "name": "Support Staff",
    "description": "Non-teaching support staff roles",
    "created_at": "2026-06-01T10:00:00+05:30",
    "updated_at": "2026-06-01T10:00:00+05:30"
  }
]
```

________________________________________

### 2.3 Create a Job Category

**Endpoint**

```
POST /job-categories/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/job-categories/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Request Body (JSON)**

| Field       | Type   | Required | Description           | Example                          |
|-------------|--------|----------|-----------------------|----------------------------------|
| name        | String | Yes      | Category name (unique)| Sports & Physical Education      |
| description | String | No       | Category description  | Sports coaching and PE roles     |

**Example Request**

```json
POST https://rms1-1-suhq.onrender.com/api/job-categories/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Sports & Physical Education",
  "description": "Sports coaching and PE roles"
}
```

**Response (201 Created)**

```json
{
  "id": 4,
  "name": "Sports & Physical Education",
  "description": "Sports coaching and PE roles",
  "created_at": "2026-07-07T10:00:00+05:30",
  "updated_at": "2026-07-07T10:00:00+05:30"
}
```

________________________________________

### 2.4 Get All Existing Roles

Returns all organizational roles. Supports filtering and searching. Response is cached for 15 minutes.

**Endpoint**

```
GET /roles/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/roles/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Query Parameters**

| Parameter  | Type   | Required | Description                | Example     |
|------------|--------|----------|----------------------------|-------------|
| department | String | No       | Filter by department       | Science     |
| status     | String | No       | Filter by status           | Active      |
| type       | String | No       | Filter by employment type  | Full-time   |
| search     | String | No       | Search role, dept, role_id | Mathematics |
| ordering   | String | No       | Order by field             | department  |

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
    "role_id": "ROL-2026-0001",
    "department": "Science",
    "role": "Mathematics Teacher",
    "type": "Full-time",
    "headcount": 3,
    "filled": 2,
    "status": "Active",
    "experience": "3-5 yrs",
    "salary_range": "₹40K–₹60K",
    "created_at": "2026-06-01T10:00:00+05:30",
    "updated_at": "2026-06-15T12:00:00+05:30",
    "vacancies": 1
  },
  {
    "id": 2,
    "role_id": "ROL-2026-0002",
    "department": "Administration",
    "role": "Office Coordinator",
    "type": "Full-time",
    "headcount": 2,
    "filled": 2,
    "status": "Active",
    "experience": "2-4 yrs",
    "salary_range": "₹25K–₹35K",
    "created_at": "2026-06-01T10:00:00+05:30",
    "updated_at": "2026-06-15T12:00:00+05:30",
    "vacancies": 0
  }
]
```

________________________________________

### 2.5 Create a New Existing Role

**Endpoint**

```
POST /roles/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/roles/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Request Body (JSON)**

| Field        | Type    | Required | Description                  | Example              |
|--------------|---------|----------|------------------------------|----------------------|
| department   | String  | Yes      | Department name              | Science              |
| role         | String  | Yes      | Role title                   | Physics Teacher      |
| type         | String  | No       | Full-time, Part-time, Contract, Internship | Full-time |
| headcount    | Integer | No       | Total positions (default 1)  | 3                    |
| filled       | Integer | No       | Filled positions (default 0) | 1                    |
| status       | String  | No       | Active or Inactive           | Active               |
| experience   | String  | No       | Required experience          | 2-4 yrs              |
| salary_range | String  | No       | Salary range                 | ₹35K–₹50K           |

**Example Request**

```json
POST https://rms1-1-suhq.onrender.com/api/roles/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "department": "Science",
  "role": "Physics Teacher",
  "type": "Full-time",
  "headcount": 3,
  "filled": 1,
  "experience": "2-4 yrs",
  "salary_range": "₹35K–₹50K"
}
```

**Response (201 Created)**

```json
{
  "id": 3,
  "role_id": "ROL-2026-0003",
  "department": "Science",
  "role": "Physics Teacher",
  "type": "Full-time",
  "headcount": 3,
  "filled": 1,
  "status": "Active",
  "experience": "2-4 yrs",
  "salary_range": "₹35K–₹50K",
  "created_at": "2026-07-07T10:00:00+05:30",
  "updated_at": "2026-07-07T10:00:00+05:30",
  "vacancies": 2
}
```

________________________________________

### 2.6 Update an Existing Role

**Endpoint**

```
PUT /roles/{id}/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/roles/3/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Example Request**

```json
PUT https://rms1-1-suhq.onrender.com/api/roles/3/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "department": "Science",
  "role": "Physics Teacher",
  "type": "Full-time",
  "headcount": 4,
  "filled": 2,
  "experience": "3-5 yrs",
  "salary_range": "₹40K–₹55K"
}
```

**Response (200 OK)**

```json
{
  "id": 3,
  "role_id": "ROL-2026-0003",
  "department": "Science",
  "role": "Physics Teacher",
  "type": "Full-time",
  "headcount": 4,
  "filled": 2,
  "status": "Active",
  "experience": "3-5 yrs",
  "salary_range": "₹40K–₹55K",
  "created_at": "2026-07-07T10:00:00+05:30",
  "updated_at": "2026-07-07T12:30:00+05:30",
  "vacancies": 2
}
```

________________________________________

### 2.7 Delete an Existing Role

**Endpoint**

```
DELETE /roles/{id}/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/roles/3/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Response (204 No Content)**: Empty body

________________________________________

### 2.8 Get Departments List

Returns a distinct sorted list of all department names from existing roles.

**Endpoint**

```
GET /roles/departments/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/roles/departments/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Example Request**

```
GET https://rms1-1-suhq.onrender.com/api/roles/departments/
Authorization: Bearer <access_token>
```

**Response (200 OK)**

```json
[
  "Administration",
  "Arts",
  "Commerce",
  "Languages",
  "Science",
  "Sports",
  "Student Welfare"
]
```

________________________________________

### 2.9 Get Roles Summary by Department

Returns headcount and filled counts aggregated by department.

**Endpoint**

```
GET /roles/summary/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/roles/summary/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Example Request**

```
GET https://rms1-1-suhq.onrender.com/api/roles/summary/
Authorization: Bearer <access_token>
```

**Response (200 OK)**

```json
[
  {
    "department": "Science",
    "total_headcount": 5,
    "total_filled": 3
  },
  {
    "department": "Administration",
    "total_headcount": 4,
    "total_filled": 4
  }
]
```

________________________________________

### 2.10 Get Public Job Postings (Career Page)

Returns all currently published job listings for the public career page. Supports filtering and search. Response is cached for 15 minutes.

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
| q         | String | No       | Search keyword in role/department    | Mathematics        |

**Example Requests**

```
GET https://rms1-1-suhq.onrender.com/api/job-postings/public/

GET https://rms1-1-suhq.onrender.com/api/job-postings/public/?category=Academic%20Positions

GET https://rms1-1-suhq.onrender.com/api/job-postings/public/?q=Mathematics
```

**Response (200 OK)**

```json
[
  {
    "id": 1,
    "posting_id": "JP-2026-0001",
    "role": "Senior Mathematics Teacher",
    "department": "Science",
    "type": "Full-time",
    "category": "Academic Positions",
    "location": "Guwahati, Assam",
    "description": "We are looking for an experienced Mathematics teacher to join our secondary school team.",
    "qualifications": ["Master's degree in Mathematics", "B.Ed or equivalent", "Experience in CBSE curriculum"],
    "experience": "3–5 yrs",
    "salary_range": "₹40K–₹60K",
    "deadline": "July 15, 2026",
    "expiry_date": null,
    "status": "Published",
    "educational_qualifications": "Master's degree in Mathematics\nB.Ed or equivalent teaching certification",
    "skills_required": "Classroom Management\nAlgebra & Calculus proficiency\nStudent mentoring"
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
    "experience": "2–4 yrs",
    "salary_range": "₹25K–₹35K",
    "deadline": "June 30, 2026",
    "expiry_date": null,
    "status": "Published",
    "educational_qualifications": "Graduate in any discipline",
    "skills_required": "Office administration\nMS Office Suite\nGood communication"
  }
]
```

________________________________________

### 2.11 Get All Job Postings (Admin)

Returns all job postings (published, unpublished, and closed) for admin management. Includes `application_count`.

**Endpoint**

```
GET /job-postings/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/job-postings/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Query Parameters**

| Parameter  | Type   | Required | Description               | Example           |
|------------|--------|----------|---------------------------|-------------------|
| status     | String | No       | Filter by posting status  | Published         |
| channel    | String | No       | Filter by channel         | Career Page       |
| category   | String | No       | Filter by category ID     | 1                 |
| department | String | No       | Filter by department      | Science           |
| search     | String | No       | Search role, dept, ID     | Mathematics       |
| ordering   | String | No       | Order by field            | -created_at       |

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
    "department": "Science",
    "type": "Full-time",
    "category": "Academic Positions",
    "location": "Guwahati, Assam",
    "description": "We are looking for an experienced Mathematics teacher.",
    "qualifications": ["Master's degree in Mathematics", "B.Ed or equivalent"],
    "experience": "3–5 yrs",
    "salary_range": "₹40K–₹60K",
    "qualification": "",
    "educational_qualifications": "Master's degree in Mathematics\nB.Ed or equivalent",
    "skills_required": "Classroom Management\nAlgebra & Calculus proficiency",
    "channel": "Career Page",
    "status": "Published",
    "posted_date": "2026-06-20",
    "expiry_date": null,
    "deadline": "July 15, 2026",
    "job_request": 1,
    "created_at": "2026-06-20T10:00:00+05:30",
    "updated_at": "2026-06-25T14:00:00+05:30",
    "application_count": 8
  }
]
```

________________________________________

### 2.12 Get a Single Job Posting

**Endpoint**

```
GET /job-postings/{id}/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/job-postings/1/
```

**Auth Required**: Admin User (JWT Bearer Token) for full details; Candidates see public fields only.

**Response (200 OK — Admin)**

```json
{
  "id": 1,
  "posting_id": "JP-2026-0001",
  "role": "Senior Mathematics Teacher",
  "department": "Science",
  "type": "Full-time",
  "category": "Academic Positions",
  "location": "Guwahati, Assam",
  "description": "We are looking for an experienced Mathematics teacher.",
  "qualifications": ["Master's degree in Mathematics", "B.Ed or equivalent"],
  "experience": "3–5 yrs",
  "salary_range": "₹40K–₹60K",
  "qualification": "",
  "educational_qualifications": "Master's degree in Mathematics\nB.Ed or equivalent",
  "skills_required": "Classroom Management\nAlgebra & Calculus proficiency",
  "channel": "Career Page",
  "status": "Published",
  "posted_date": "2026-06-20",
  "expiry_date": null,
  "deadline": "July 15, 2026",
  "job_request": 1,
  "created_at": "2026-06-20T10:00:00+05:30",
  "updated_at": "2026-06-25T14:00:00+05:30",
  "application_count": 8
}
```

________________________________________

### 2.13 Create New Job Posting

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

| Field                      | Type   | Required | Description                        | Example                    |
|----------------------------|--------|----------|------------------------------------|----------------------------|
| role                       | String | Yes      | Job role title                     | Physics Teacher            |
| department                 | String | No       | Department name                    | Science                    |
| type                       | String | No       | Employment type (default Full-time)| Full-time                  |
| category                   | String | No       | Job category name (slug)           | Academic Positions         |
| location                   | String | No       | Job location                       | Guwahati, Assam            |
| description                | String | No       | Detailed job description           | Physics Teacher wanted...  |
| qualifications             | Array  | No       | List of required qualifications    | ["B.Ed", "M.Sc Physics"]   |
| experience                 | String | No       | Experience requirement             | 2+ years                   |
| salary_range               | String | No       | Salary range                       | ₹40K–₹50K                 |
| qualification              | String | No       | Qualification summary              | M.Sc Physics               |
| educational_qualifications | String | No       | Detailed education requirements    | M.Sc Physics, B.Ed         |
| skills_required            | String | No       | Required skills                    | Lab skills, Teaching       |
| channel                    | String | No       | External, Internal, Career Page    | Career Page                |
| status                     | String | No       | Unpublished, Published, Closed     | Unpublished                |
| posted_date                | Date   | No       | Publish date (YYYY-MM-DD)          | 2026-07-01                 |
| expiry_date                | Date   | No       | Expiry date (YYYY-MM-DD)          | 2026-08-30                 |
| deadline                   | String | No       | Human-readable deadline            | August 30, 2026            |
| job_request                | Integer| No       | Linked JobRequest ID               | 5                          |

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
  "channel": "Career Page",
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
  "qualification": "",
  "educational_qualifications": "",
  "skills_required": "",
  "channel": "Career Page",
  "status": "Unpublished",
  "posted_date": null,
  "expiry_date": "2026-08-30",
  "deadline": "",
  "job_request": null,
  "created_at": "2026-07-07T10:00:00+05:30",
  "updated_at": "2026-07-07T10:00:00+05:30",
  "application_count": 0
}
```

________________________________________

### 2.14 Update a Job Posting

**Endpoint**

```
PUT /job-postings/{id}/
```  
```
PATCH /job-postings/{id}/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/job-postings/3/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Example Request**

```json
PATCH https://rms1-1-suhq.onrender.com/api/job-postings/3/
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
  "department": "Science",
  "type": "Full-time",
  "category": "Academic Positions",
  "location": "Guwahati, Assam",
  "description": "Physics Teacher wanted for secondary grades.",
  "qualifications": ["B.Ed", "M.Sc Physics"],
  "experience": "3+ years",
  "salary_range": "₹45K–₹55K",
  "qualification": "",
  "educational_qualifications": "",
  "skills_required": "",
  "channel": "Career Page",
  "status": "Unpublished",
  "posted_date": null,
  "expiry_date": "2026-08-30",
  "deadline": "",
  "job_request": null,
  "created_at": "2026-07-07T10:00:00+05:30",
  "updated_at": "2026-07-07T11:00:00+05:30",
  "application_count": 0
}
```

________________________________________

### 2.15 Delete a Job Posting

**Endpoint**

```
DELETE /job-postings/{id}/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/job-postings/3/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Response (204 No Content)**: Empty body

________________________________________

### 2.16 Publish a Job Posting

Change the status of a posting to Published. Auto-sets `posted_date` to today if not already set.

**Endpoint**

```
POST /job-postings/{id}/publish/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/job-postings/3/publish/
```

**Auth Required**: Admin User (JWT Bearer Token)

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
  "department": "Science",
  "type": "Full-time",
  "category": "Academic Positions",
  "location": "Guwahati, Assam",
  "description": "Physics Teacher wanted for secondary grades.",
  "qualifications": ["B.Ed", "M.Sc Physics"],
  "experience": "3+ years",
  "salary_range": "₹45K–₹55K",
  "qualification": "",
  "educational_qualifications": "",
  "skills_required": "",
  "channel": "Career Page",
  "status": "Published",
  "posted_date": "2026-07-07",
  "expiry_date": "2026-08-30",
  "deadline": "",
  "job_request": null,
  "created_at": "2026-07-07T10:00:00+05:30",
  "updated_at": "2026-07-07T12:00:00+05:30",
  "application_count": 0
}
```

________________________________________

### 2.17 Unpublish a Job Posting

Change the status of a posting back to Unpublished.

**Endpoint**

```
POST /job-postings/{id}/unpublish/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/job-postings/3/unpublish/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Example Request**

```
POST https://rms1-1-suhq.onrender.com/api/job-postings/3/unpublish/
Authorization: Bearer <access_token>
```

**Response (200 OK)**

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
  "experience": "3+ years",
  "salary_range": "₹45K–₹55K",
  "qualification": "",
  "educational_qualifications": "",
  "skills_required": "",
  "channel": "Career Page",
  "status": "Unpublished",
  "posted_date": "2026-07-07",
  "expiry_date": "2026-08-30",
  "deadline": "",
  "job_request": null,
  "created_at": "2026-07-07T10:00:00+05:30",
  "updated_at": "2026-07-07T13:00:00+05:30",
  "application_count": 0
}
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
| justification | String | No       | Business justification           | Increased student enrollment...      |
| salary_range  | String | No       | Expected salary range            | ₹30K–₹45K                           |
| experience    | String | No       | Experience requirement           | 2-4 yrs                             |
| submitted_by  | String | No       | Submitter name                   | HR Admin                             |

**Example Request**

```json
POST https://rms1-1-suhq.onrender.com/api/role-requests/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "department": "Arts",
  "role": "Music Teacher",
  "justification": "Increased student enrollment in humanities stream.",
  "salary_range": "₹30K–₹45K",
  "experience": "2-4 yrs"
}
```

**Response (201 Created)**

```json
{
  "id": 4,
  "created_by_name": "HR Admin",
  "history": [
    {
      "act": "Submitted",
      "by": "HR Admin",
      "date": "2026-07-07",
      "note": ""
    }
  ],
  "request_id": "RR-2026-0004",
  "department": "Arts",
  "role": "Music Teacher",
  "justification": "Increased student enrollment in humanities stream.",
  "salary_range": "₹30K–₹45K",
  "experience": "2-4 yrs",
  "status": "Pending",
  "submitted_by": "",
  "date": "2026-07-07",
  "reviewed_at": null,
  "reviewer_note": "",
  "created_by": 1
}
```

> **Note:** This automatically creates a corresponding entry in `/api/approvals/` with `type: "Role Request"` and `status: "Pending"`.

________________________________________

### 3.2 Get All Role Requests

Returns all role requests. Supports filtering by `status` and `department`. Response is cached for 15 minutes.

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

| Parameter  | Type   | Required | Description              | Allowed Values                              | Example  |
|------------|--------|----------|--------------------------|---------------------------------------------|----------|
| status     | String | No       | Filter by request status | Pending, Approved, Rejected, Sent Back, Cancelled | Pending  |
| department | String | No       | Filter by department     |                                             | Arts     |

**Example Request**

```
GET https://rms1-1-suhq.onrender.com/api/role-requests/
Authorization: Bearer <access_token>
```

**Response (200 OK)**

```json
[
  {
    "id": 4,
    "created_by_name": "HR Admin",
    "history": [
      {
        "act": "Submitted",
        "by": "HR Admin",
        "date": "2026-07-07",
        "note": ""
      }
    ],
    "request_id": "RR-2026-0004",
    "department": "Arts",
    "role": "Music Teacher",
    "justification": "Increased student enrollment in humanities stream.",
    "salary_range": "₹30K–₹45K",
    "experience": "2-4 yrs",
    "status": "Pending",
    "submitted_by": "",
    "date": "2026-07-07",
    "reviewed_at": null,
    "reviewer_note": "",
    "created_by": 1
  }
]
```

________________________________________

### 3.3 Update Role Request Status

Update the status and reviewer note for a specific role request.

**Endpoint**

```
PATCH /role-requests/{id}/update_status/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/role-requests/4/update_status/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Request Body (JSON)**

| Field         | Type   | Required | Description             | Allowed Values                              |
|---------------|--------|----------|-------------------------|---------------------------------------------|
| status        | String | No       | New status              | Pending, Approved, Rejected, Sent Back, Cancelled |
| reviewer_note | String | No       | Reviewer comment        |                                             |

**Example Request**

```json
PATCH https://rms1-1-suhq.onrender.com/api/role-requests/4/update_status/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "Approved",
  "reviewer_note": "Approved for next academic year."
}
```

**Response (200 OK)**

```json
{
  "status": "Approved",
  "reviewer_note": "Approved for next academic year."
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
| department                 | String  | No       | Department name                      | Science                         |
| vacancies                  | Integer | No       | Number of vacancies (default 1)      | 2                               |
| experience                 | String  | No       | Experience requirement               | 3+ years                        |
| salary_range               | String  | No       | Salary range                         | ₹40K–₹50K                      |
| type                       | String  | No       | Employment type (default Full-time)  | Full-time                       |
| location                   | String  | No       | Job location                         | Guwahati, Assam                 |
| category                   | String  | No       | Job category name (slug)             | Academic Positions              |
| description                | String  | No       | Job description                      | Detailed description text...    |
| justification              | String  | No       | Justification note                   | Needed due to workload...       |
| educational_qualifications | String  | No       | Required educational qualification   | M.Sc Physics, B.Ed              |
| skills_required            | String  | No       | Required skills                      | Classroom Management, Physics   |
| submitted_by               | String  | No       | Submitter name                       | HR Admin                        |

**Example Request**

```json
POST https://rms1-1-suhq.onrender.com/api/job-requests/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "category": "Academic Positions",
  "department": "Science",
  "role": "Physics Teacher",
  "vacancies": 2,
  "experience": "3+ years",
  "salary_range": "₹40K–₹50K",
  "type": "Full-time",
  "description": "Looking for qualified physics teachers for senior secondary classes.",
  "justification": "Current workload requires additional staff.",
  "location": "Guwahati, Assam",
  "educational_qualifications": "M.Sc Physics, B.Ed",
  "skills_required": "Lab Management, Physics curriculum"
}
```

**Response (201 Created)**

```json
{
  "id": 6,
  "history": [
    {
      "act": "Submitted",
      "by": "HR Admin",
      "date": "2026-07-07",
      "note": ""
    }
  ],
  "category": "Academic Positions",
  "request_id": "JR-2026-0006",
  "department": "Science",
  "role": "Physics Teacher",
  "vacancies": 2,
  "experience": "3+ years",
  "salary_range": "₹40K–₹50K",
  "type": "Full-time",
  "description": "Looking for qualified physics teachers for senior secondary classes.",
  "justification": "Current workload requires additional staff.",
  "location": "Guwahati, Assam",
  "educational_qualifications": "M.Sc Physics, B.Ed",
  "skills_required": "Lab Management, Physics curriculum",
  "status": "Pending",
  "submitted_by": "",
  "created_at": "2026-07-07T10:00:00+05:30",
  "updated_at": "2026-07-07T10:00:00+05:30",
  "created_by": 1
}
```

> **Note:** This automatically creates a corresponding entry in `/api/approvals/` with `type: "Job Request"` and `status: "Pending"`.

________________________________________

### 3.5 Get All Job Requests

Returns all job requests. Supports filtering by `status` and `type`. Response is cached for 15 minutes.

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

| Parameter | Type   | Required | Description              | Allowed Values                              | Example    |
|-----------|--------|----------|--------------------------|---------------------------------------------|------------|
| status    | String | No       | Filter by request status | Pending, Approved, Rejected, Sent Back, Cancelled | Pending    |
| type      | String | No       | Filter by employment type|                                             | Full-time  |

**Example Request**

```
GET https://rms1-1-suhq.onrender.com/api/job-requests/
Authorization: Bearer <access_token>
```

**Response (200 OK)**

```json
[
  {
    "id": 6,
    "history": [
      {
        "act": "Submitted",
        "by": "HR Admin",
        "date": "2026-07-07",
        "note": ""
      },
      {
        "act": "Approve",
        "by": "Principal",
        "date": "2026-07-07",
        "note": "Approved for next term."
      }
    ],
    "category": "Academic Positions",
    "request_id": "JR-2026-0006",
    "department": "Science",
    "role": "Physics Teacher",
    "vacancies": 2,
    "experience": "3+ years",
    "salary_range": "₹40K–₹50K",
    "type": "Full-time",
    "description": "Looking for qualified physics teachers for senior secondary classes.",
    "justification": "Current workload requires additional staff.",
    "location": "Guwahati, Assam",
    "educational_qualifications": "M.Sc Physics, B.Ed",
    "skills_required": "Lab Management, Physics curriculum",
    "status": "Approved",
    "submitted_by": "",
    "created_at": "2026-07-07T10:00:00+05:30",
    "updated_at": "2026-07-07T12:00:00+05:30",
    "created_by": 1
  }
]
```

________________________________________

### 3.6 Update Job Request Status

**Endpoint**

```
PATCH /job-requests/{id}/update_status/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/job-requests/6/update_status/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Request Body (JSON)**

| Field  | Type   | Required | Description | Allowed Values                |
|--------|--------|----------|-------------|-------------------------------|
| status | String | Yes      | New status  | Pending, Approved, Rejected   |

**Example Request**

```json
PATCH https://rms1-1-suhq.onrender.com/api/job-requests/6/update_status/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "Approved"
}
```

**Response (200 OK)**

Returns the full `JobRequestSerializer` output (same as GET single job request).

________________________________________

### 3.7 Get All Approval Requests

Returns all approval requests. Auto-created whenever a Role Request or Job Request is submitted. Supports filtering by `status` and `type`. Response is cached for 15 minutes.

**Endpoint**

```
GET /approvals/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/approvals/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Query Parameters**

| Parameter | Type   | Required | Description                | Allowed Values                           | Example        |
|-----------|--------|----------|----------------------------|------------------------------------------|----------------|
| status    | String | No       | Filter by approval status  | Pending, Approved, Rejected, Sent Back   | Pending        |
| type      | String | No       | Filter by request type     | Role Request, Job Request                | Role Request   |

**Example Request**

```
GET https://rms1-1-suhq.onrender.com/api/approvals/
Authorization: Bearer <access_token>
```

**Response (200 OK)**

```json
[
  {
    "id": 1,
    "history": [],
    "department": "Arts",
    "justification": "Increased student enrollment in humanities stream.",
    "vacancies": null,
    "experience": "2-4 yrs",
    "salary_range": "₹30K–₹45K",
    "employment_type": "",
    "source_request_id": "RR-2026-0004",
    "source_db_id": 4,
    "description": "",
    "location": "",
    "category": "",
    "educational_qualifications": "",
    "skills_required": "",
    "request_id": "RR-2026-0004",
    "type": "Role Request",
    "title": "Music Teacher",
    "submitted_by": "HR Admin",
    "date": "2026-07-07",
    "status": "Pending",
    "job_request": null,
    "role_request": 4
  },
  {
    "id": 2,
    "history": [],
    "department": "Science",
    "justification": "Current workload requires additional staff.",
    "vacancies": 2,
    "experience": "3+ years",
    "salary_range": "₹40K–₹50K",
    "employment_type": "Full-time",
    "source_request_id": "JR-2026-0006",
    "source_db_id": 6,
    "description": "Looking for qualified physics teachers for senior secondary classes.",
    "location": "Guwahati, Assam",
    "category": "Academic Positions",
    "educational_qualifications": "M.Sc Physics, B.Ed",
    "skills_required": "Lab Management, Physics curriculum",
    "request_id": "JR-2026-0006",
    "type": "Job Request",
    "title": "Physics Teacher",
    "submitted_by": "HR Admin",
    "date": "2026-07-07",
    "status": "Pending",
    "job_request": 6,
    "role_request": null
  }
]
```

________________________________________

### 3.8 Take Action on Approval Request

Approve, reject, or send back a pending role or job request. Optionally modify the underlying request fields at the same time.

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

| Field                      | Type    | Required | Description                                 | Allowed Values                    | Example                          |
|----------------------------|---------|----------|---------------------------------------------|-----------------------------------|----------------------------------|
| action                     | String  | Yes      | Action to take                              | Approve, Reject, Send Back        | Approve                          |
| note                       | String  | No       | Optional note/comment                       |                                   | Approved for headcount increase. |
| acted_by                   | String  | No       | Name of person taking the action            |                                   | Principal                        |
| department                 | String  | No       | Override department                         |                                   | Science                          |
| role                       | String  | No       | Override role title                         |                                   | Senior Physics Teacher           |
| salary_range               | String  | No       | Override salary range                       |                                   | ₹50K–₹60K                       |
| experience                 | String  | No       | Override experience                         |                                   | 5+ years                         |
| location                   | String  | No       | Override location (Job Requests only)       |                                   | Guwahati, Assam                  |
| category                   | String  | No       | Override category name (Job Requests only)  |                                   | Academic Positions               |
| vacancies                  | Integer | No       | Override vacancies (Job Requests only)      |                                   | 3                                |
| employment_type            | String  | No       | Override type (Job Requests only)           |                                   | Part-time                        |
| description                | String  | No       | Override description (Job Requests only)    |                                   | Updated description...           |
| educational_qualifications | String  | No       | Override qualifications (Job Requests only) |                                   | M.Sc, B.Ed                       |
| skills_required            | String  | No       | Override skills (Job Requests only)         |                                   | Lab Management                   |

**Example Request**

```json
POST https://rms1-1-suhq.onrender.com/api/approvals/2/action/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "action": "Approve",
  "note": "Approved for recruitment in the next term.",
  "acted_by": "Principal"
}
```

**Response (200 OK)**

```json
{
  "id": 2,
  "history": [
    {
      "id": 1,
      "action": "Approve",
      "acted_by": "Principal",
      "date": "2026-07-07",
      "note": "Approved for recruitment in the next term.",
      "approval": 2
    }
  ],
  "department": "Science",
  "justification": "Current workload requires additional staff.",
  "vacancies": 2,
  "experience": "3+ years",
  "salary_range": "₹40K–₹50K",
  "employment_type": "Full-time",
  "source_request_id": "JR-2026-0006",
  "source_db_id": 6,
  "description": "Looking for qualified physics teachers for senior secondary classes.",
  "location": "Guwahati, Assam",
  "category": "Academic Positions",
  "educational_qualifications": "M.Sc Physics, B.Ed",
  "skills_required": "Lab Management, Physics curriculum",
  "request_id": "JR-2026-0006",
  "type": "Job Request",
  "title": "Physics Teacher",
  "submitted_by": "HR Admin",
  "date": "2026-07-07",
  "status": "Approved",
  "job_request": 6,
  "role_request": null
}
```

> **Side-effects on Approve:**
> - **Job Request**: The linked `JobRequest.status` is set to `"Approved"` and a new `JobPosting` is auto-created with status `"Unpublished"`.
> - **Role Request**: The linked `RoleRequest.status` is set to `"Approved"`.
>
> **Side-effects on Reject / Send Back:**
> - The linked request's status is updated to `"Rejected"` or `"Sent Back"` accordingly.

---

## 📂 4. Applications

---

### 4.1 Submit Job Application (Candidate)

Submit a job application for a specific published posting. Experience and qualification are auto-populated from the candidate's profile if not provided.

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

| Field           | Type    | Required | Description                       | Example                                  |
|-----------------|---------|----------|-----------------------------------|------------------------------------------|
| posting         | Integer | Yes      | Job Posting ID to apply for       | 1                                        |
| experience      | String  | No       | Candidate's experience summary    | 3 years                                  |
| qualification   | String  | No       | Candidate's qualifications        | M.Sc Math, B.Ed                          |
| cover_letter    | String  | No       | Optional cover letter text        | I would like to apply for the math role. |
| notice_period   | String  | No       | Current notice period             | 30 days                                  |
| has_referral    | Boolean | No       | Whether candidate has a referral  | false                                    |
| referral_emp_id | String  | No       | Referral employee ID              | EMP-001                                  |
| referred_by     | String  | No       | Name of referrer                  | John Smith                               |

**Example Request**

```json
POST https://rms1-1-suhq.onrender.com/api/applications/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "posting": 1,
  "cover_letter": "I would like to apply for the math teacher role.",
  "notice_period": "30 days",
  "has_referral": false
}
```

**Response (201 Created)**

```json
{
  "id": 12,
  "candidate_name": "Jane Doe",
  "candidate_email": "jane.doe@example.com",
  "candidate_phone": "9876543210",
  "posting_title": "Senior Mathematics Teacher",
  "resume": "https://rms1-1-suhq.onrender.com/media/resumes/2026/06/resume_jane.pdf",
  "posting_id": "JP-2026-0001",
  "location": "Guwahati, Assam",
  "skills": ["Communication", "Music Theory"],
  "salary": "45,000",
  "educational_qualification": "B.Tech Computer Science (Bachelor of Technology)",
  "professional_qualification": "MBA (Master of Business Administration)",
  "extracurricular_qualification": "",
  "app_id": "JAPP-2026-0012",
  "role": "Senior Mathematics Teacher",
  "experience": "2-4",
  "qualification": "B.Tech Computer Science (Bachelor of Technology)",
  "cover_letter": "I would like to apply for the math teacher role.",
  "notice_period": "30 days",
  "has_referral": false,
  "referral_emp_id": "",
  "referred_by": "",
  "applied_date": "2026-07-07",
  "status": "Applied",
  "admin_note": "",
  "updated_at": "2026-07-07T10:00:00+05:30",
  "candidate": 15,
  "posting": 1
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

**Auth Required**: Authenticated User (JWT Bearer Token)

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
    "candidate_name": "Jane Doe",
    "candidate_email": "jane.doe@example.com",
    "candidate_phone": "9876543210",
    "posting_title": "Senior Mathematics Teacher",
    "resume": "https://rms1-1-suhq.onrender.com/media/resumes/2026/06/resume_jane.pdf",
    "posting_id": "JP-2026-0001",
    "location": "Guwahati, Assam",
    "skills": ["Communication", "Music Theory"],
    "salary": "45,000",
    "educational_qualification": "B.Tech Computer Science (Bachelor of Technology)",
    "professional_qualification": "MBA (Master of Business Administration)",
    "extracurricular_qualification": "",
    "app_id": "JAPP-2026-0012",
    "role": "Senior Mathematics Teacher",
    "experience": "2-4",
    "qualification": "B.Tech Computer Science (Bachelor of Technology)",
    "cover_letter": "I would like to apply for the math teacher role.",
    "notice_period": "30 days",
    "has_referral": false,
    "referral_emp_id": "",
    "referred_by": "",
    "applied_date": "2026-07-07",
    "status": "Applied",
    "admin_note": "",
    "updated_at": "2026-07-07T10:00:00+05:30",
    "candidate": 15,
    "posting": 1
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
    "candidate_name": "Jane Doe",
    "candidate_email": "jane.doe@example.com",
    "candidate_phone": "9876543210",
    "posting_title": "Senior Mathematics Teacher",
    "resume": "https://rms1-1-suhq.onrender.com/media/resumes/2026/06/resume_jane.pdf",
    "posting_id": "JP-2026-0001",
    "location": "Guwahati, Assam",
    "skills": ["Communication", "Music Theory"],
    "salary": "45,000",
    "educational_qualification": "B.Tech Computer Science (Bachelor of Technology)",
    "professional_qualification": "MBA (Master of Business Administration)",
    "extracurricular_qualification": "",
    "app_id": "JAPP-2026-0012",
    "role": "Senior Mathematics Teacher",
    "experience": "2-4",
    "qualification": "B.Tech Computer Science (Bachelor of Technology)",
    "cover_letter": "I would like to apply for the math teacher role.",
    "notice_period": "30 days",
    "has_referral": false,
    "referral_emp_id": "",
    "referred_by": "",
    "applied_date": "2026-07-07",
    "status": "Applied",
    "admin_note": "",
    "updated_at": "2026-07-07T10:00:00+05:30",
    "candidate": 15,
    "posting": 1
  }
]
```

________________________________________

### 4.4 Get a Single Application

**Endpoint**

```
GET /applications/{id}/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/applications/12/
```

**Auth Required**: Authenticated User (JWT Bearer Token)

**Response (200 OK)**

Same structure as the single object in the list above.

________________________________________

### 4.5 Update Application Status (Admin)

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

| Field      | Type   | Required | Description                     | Allowed Values                                                          | Example                          |
|------------|--------|----------|---------------------------------|-------------------------------------------------------------------------|----------------------------------|
| status     | String | No       | New application status          | Applied, Shortlisted, Selected, Rejected, Offer Sent, Offer Accepted, Withdrawn | Shortlisted                      |
| admin_note | String | No       | Internal note visible to admins |                                                                         | Strong experience in algebra.    |

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
  "candidate_name": "Jane Doe",
  "candidate_email": "jane.doe@example.com",
  "candidate_phone": "9876543210",
  "posting_title": "Senior Mathematics Teacher",
  "resume": "https://rms1-1-suhq.onrender.com/media/resumes/2026/06/resume_jane.pdf",
  "posting_id": "JP-2026-0001",
  "location": "Guwahati, Assam",
  "skills": ["Communication", "Music Theory"],
  "salary": "45,000",
  "educational_qualification": "B.Tech Computer Science (Bachelor of Technology)",
  "professional_qualification": "MBA (Master of Business Administration)",
  "extracurricular_qualification": "",
  "app_id": "JAPP-2026-0012",
  "role": "Senior Mathematics Teacher",
  "experience": "2-4",
  "qualification": "B.Tech Computer Science (Bachelor of Technology)",
  "cover_letter": "I would like to apply for the math teacher role.",
  "notice_period": "30 days",
  "has_referral": false,
  "referral_emp_id": "",
  "referred_by": "",
  "applied_date": "2026-07-07",
  "status": "Shortlisted",
  "admin_note": "Strong experience in algebra.",
  "updated_at": "2026-07-07T11:00:00+05:30",
  "candidate": 15,
  "posting": 1
}
```

> **Note:** Changing the `status` triggers a background notification to the candidate via Celery.

________________________________________

### 4.6 Submit General Application (Candidate)

Submit a general application not tied to any specific job posting (talent pool). Only one general application per candidate is allowed.

**Endpoint**

```
POST /general-applications/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/general-applications/
```

**Auth Required**: Candidate User (JWT Bearer Token)

**Request Body (JSON)**

| Field          | Type   | Required | Description              | Example              |
|----------------|--------|----------|--------------------------|----------------------|
| preferred_role | String | No       | Preferred role/position  | English Teacher      |
| experience     | String | No       | Experience summary       | 5 years              |
| qualification  | String | No       | Qualification summary    | M.A. English, B.Ed   |

**Example Request**

```json
POST https://rms1-1-suhq.onrender.com/api/general-applications/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "preferred_role": "English Teacher",
  "experience": "5 years",
  "qualification": "M.A. English, B.Ed"
}
```

**Response (201 Created)**

```json
{
  "id": 5,
  "candidate_name": "Jane Doe",
  "candidate_email": "jane.doe@example.com",
  "candidate_phone": "9876543210",
  "resume": "https://rms1-1-suhq.onrender.com/media/resumes/2026/06/resume_jane.pdf",
  "location": "Guwahati, Assam",
  "skills": ["Communication", "Music Theory"],
  "salary": "45,000",
  "educational_qualification": "M.A. English, B.Ed",
  "professional_qualification": "MBA (Master of Business Administration)",
  "extracurricular_qualification": "",
  "app_id": "GAPP-2026-0005",
  "preferred_role": "English Teacher",
  "experience": "5 years",
  "qualification": "M.A. English, B.Ed",
  "applied_date": "2026-07-07",
  "status": "Applied",
  "admin_note": "",
  "candidate": 15
}
```

________________________________________

### 4.7 Get My General Applications (Candidate)

**Endpoint**

```
GET /general-applications/mine/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/general-applications/mine/
```

**Auth Required**: Authenticated User (JWT Bearer Token)

**Response (200 OK)**

```json
[
  {
    "id": 5,
    "candidate_name": "Jane Doe",
    "candidate_email": "jane.doe@example.com",
    "candidate_phone": "9876543210",
    "resume": "https://rms1-1-suhq.onrender.com/media/resumes/2026/06/resume_jane.pdf",
    "location": "Guwahati, Assam",
    "skills": ["Communication", "Music Theory"],
    "salary": "45,000",
    "educational_qualification": "M.A. English, B.Ed",
    "professional_qualification": "MBA (Master of Business Administration)",
    "extracurricular_qualification": "",
    "app_id": "GAPP-2026-0005",
    "preferred_role": "English Teacher",
    "experience": "5 years",
    "qualification": "M.A. English, B.Ed",
    "applied_date": "2026-07-07",
    "status": "Applied",
    "admin_note": "",
    "candidate": 15
  }
]
```

________________________________________

### 4.8 Get All General Applications (Admin)

**Endpoint**

```
GET /general-applications/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/general-applications/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Response (200 OK)**

Same structure as 4.7, returns all general applications from all candidates.

---

## 📅 5. Interview Scheduling

---

### 5.1 Get All Panelists

Returns a list of all active interview panelists.

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
    "phone": "9876543001",
    "department": "Science",
    "is_active": true,
    "created_at": "2026-06-01T10:00:00+05:30"
  },
  {
    "id": 2,
    "name": "Prof. Anil Baruah",
    "email": "anil@southpoint.edu",
    "phone": "9876543002",
    "department": "Science",
    "is_active": true,
    "created_at": "2026-06-01T10:00:00+05:30"
  }
]
```

________________________________________

### 5.2 Create a Panelist

**Endpoint**

```
POST /panelists/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/panelists/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Request Body (JSON)**

| Field      | Type    | Required | Description             | Example                    |
|------------|---------|----------|-------------------------|----------------------------|
| name       | String  | Yes      | Panelist full name      | Dr. Meena Devi             |
| email      | String  | Yes      | Panelist email (unique) | meena@southpoint.edu       |
| phone      | String  | No       | Phone number            | 9876543003                 |
| department | String  | No       | Department              | Arts                       |

**Example Request**

```json
POST https://rms1-1-suhq.onrender.com/api/panelists/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "Dr. Meena Devi",
  "email": "meena@southpoint.edu",
  "phone": "9876543003",
  "department": "Arts"
}
```

**Response (201 Created)**

```json
{
  "id": 3,
  "name": "Dr. Meena Devi",
  "email": "meena@southpoint.edu",
  "phone": "9876543003",
  "department": "Arts",
  "is_active": true,
  "created_at": "2026-07-07T10:00:00+05:30"
}
```

> **Note:** Creating a panelist automatically creates/updates a corresponding User account with `role: "admin"` and default password `Panel@123`.

________________________________________

### 5.3 Update a Panelist

**Endpoint**

```
PUT /panelists/{id}/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/panelists/3/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Response (200 OK)**

Same structure as the create response.

________________________________________

### 5.4 Delete a Panelist (Soft Delete)

Marks the panelist as inactive instead of actually deleting.

**Endpoint**

```
DELETE /panelists/{id}/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/panelists/3/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Response (204 No Content)**: Empty body

________________________________________

### 5.5 Schedule an Interview

Schedule an interview for a shortlisted candidate. Triggers an automatic email notification on creation.

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

| Field          | Type    | Required | Description                        | Example                                    |
|----------------|---------|----------|------------------------------------|--------------------------------------------|
| application    | Integer | No       | Application ID (nullable)          | 12                                         |
| candidate_name | String  | Yes      | Name of the candidate              | Jane Doe                                   |
| role           | String  | Yes      | Role being interviewed for         | Senior Mathematics Teacher                 |
| date           | String  | No       | Interview date (YYYY-MM-DD) (nullable/optional) | 2026-07-10                                 |
| time           | String  | No       | Interview time (HH:MM:SS) (nullable/optional)   | 14:00:00                                   |
| mode           | String  | No       | Online or Offline (default Online)              | Online                                     |
| meeting_link   | String  | No       | Meeting link (for online mode)                  | https://meet.google.com/abc-defg-hij       |
| round          | Integer | No       | Interview round number (default 1)              | 1                                          |
| panel          | Array   | No       | List of panelist IDs (optional on write)        | [1, 2]                                     |

**Example Request**

```json
POST https://rms1-1-suhq.onrender.com/api/interviews/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "application": 12,
  "candidate_name": "Jane Doe",
  "role": "Senior Mathematics Teacher",
  "date": "2026-07-10",
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
  "panel_details": [
    {
      "id": 1,
      "name": "Dr. Suresh Kumar",
      "email": "suresh@southpoint.edu",
      "phone": "9876543001",
      "department": "Science",
      "is_active": true,
      "created_at": "2026-06-01T10:00:00+05:30"
    },
    {
      "id": 2,
      "name": "Prof. Anil Baruah",
      "email": "anil@southpoint.edu",
      "phone": "9876543002",
      "department": "Science",
      "is_active": true,
      "created_at": "2026-06-01T10:00:00+05:30"
    }
  ],
  "interview_id": "INT-2026-0006",
  "candidate_name": "Jane Doe",
  "role": "Senior Mathematics Teacher",
  "date": "2026-07-10",
  "time": "14:00:00",
  "score": null,
  "recommendation": "",
  "feedback": "",
  "status": "Scheduled",
  "mode": "Online",
  "meeting_link": "https://meet.google.com/abc-defg-hij",
  "round": 1,
  "reminder_sent_at": null,
  "created_at": "2026-07-07T10:00:00+05:30",
  "updated_at": "2026-07-07T10:00:00+05:30",
  "application": 12
}
```

________________________________________

### 5.6 Get All Interviews

Returns all interviews. Candidates see only their own interviews.

**Endpoint**

```
GET /interviews/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/interviews/
```

**Auth Required**: Authenticated User (JWT Bearer Token)

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
    "panel_details": [
      {
        "id": 1,
        "name": "Dr. Suresh Kumar",
        "email": "suresh@southpoint.edu",
        "phone": "9876543001",
        "department": "Science",
        "is_active": true,
        "created_at": "2026-06-01T10:00:00+05:30"
      },
      {
        "id": 2,
        "name": "Prof. Anil Baruah",
        "email": "anil@southpoint.edu",
        "phone": "9876543002",
        "department": "Science",
        "is_active": true,
        "created_at": "2026-06-01T10:00:00+05:30"
      }
    ],
    "interview_id": "INT-2026-0006",
    "candidate_name": "Jane Doe",
    "role": "Senior Mathematics Teacher",
    "date": "2026-07-10",
    "time": "14:00:00",
    "score": null,
    "recommendation": "",
    "feedback": "",
    "status": "Scheduled",
    "mode": "Online",
    "meeting_link": "https://meet.google.com/abc-defg-hij",
    "round": 1,
    "reminder_sent_at": null,
    "created_at": "2026-07-07T10:00:00+05:30",
    "updated_at": "2026-07-07T10:00:00+05:30",
    "application": 12
  }
]
```

________________________________________

### 5.7 Get a Single Interview

**Endpoint**

```
GET /interviews/{id}/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/interviews/6/
```

**Auth Required**: Authenticated User (JWT Bearer Token)

**Response (200 OK)**

Same structure as the single object in the list above.

________________________________________

### 5.8 Update an Interview

**Endpoint**

```
PUT /interviews/{id}/
```  
```
PATCH /interviews/{id}/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/interviews/6/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Example Request**

```json
PATCH https://rms1-1-suhq.onrender.com/api/interviews/6/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "date": "2026-07-12",
  "time": "10:00:00",
  "status": "Rescheduled",
  "panel": [1, 2, 3]
}
```

**Response (200 OK)**

Same structure as the create response with updated fields.

> **Note:** If scheduling fields (`date`, `time`, `mode`, `meeting_link`, `round`, `panel`) change, an email notification is automatically sent to the candidate and panelists.

________________________________________

### 5.9 Submit Interview Score & Feedback

Submit scores and feedback for a completed interview. Triggers an automatic notification to the candidate.

**Endpoint**

```
PATCH /interviews/{id}/score/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/interviews/6/score/
```

**Auth Required**: Authenticated User (JWT Bearer Token)

**Path Parameters**

| Parameter | Type    | Required | Description      | Example |
|-----------|---------|----------|------------------|---------|
| id        | Integer | Yes      | Interview ID     | 6       |

**Request Body (JSON)**

| Field          | Type    | Required | Description                   | Allowed Values                                                                    | Example                                        |
|----------------|---------|----------|-------------------------------|-----------------------------------------------------------------------------------|------------------------------------------------|
| score          | Integer | No       | Interview score (0–100)       | 0 to 100                                                                         | 85                                             |
| recommendation | String  | No       | Panelist recommendation       | Selected, Rejected, On Hold, Next Round, Strong Hire, Hire, Hold, Reject, Pending | Selected                                       |
| feedback       | String  | No       | Detailed feedback text        |                                                                                   | Strong communication and subject matter skills.|
| status         | String  | No       | Updated interview status      | Scheduled, Completed, Cancelled, Rescheduled                                      | Completed                                      |

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
  "panel_details": [
    {
      "id": 1,
      "name": "Dr. Suresh Kumar",
      "email": "suresh@southpoint.edu",
      "phone": "9876543001",
      "department": "Science",
      "is_active": true,
      "created_at": "2026-06-01T10:00:00+05:30"
    },
    {
      "id": 2,
      "name": "Prof. Anil Baruah",
      "email": "anil@southpoint.edu",
      "phone": "9876543002",
      "department": "Science",
      "is_active": true,
      "created_at": "2026-06-01T10:00:00+05:30"
    }
  ],
  "interview_id": "INT-2026-0006",
  "candidate_name": "Jane Doe",
  "role": "Senior Mathematics Teacher",
  "date": "2026-07-10",
  "time": "14:00:00",
  "score": 85,
  "recommendation": "Selected",
  "feedback": "Strong communication and subject matter skills.",
  "status": "Completed",
  "mode": "Online",
  "meeting_link": "https://meet.google.com/abc-defg-hij",
  "round": 1,
  "reminder_sent_at": null,
  "created_at": "2026-07-07T10:00:00+05:30",
  "updated_at": "2026-07-07T15:00:00+05:30",
  "application": 12
}
```

________________________________________

### 5.10 Send Interview Reminder

Send an email reminder for an upcoming interview to the candidate and panelists.

**Endpoint**

```
POST /interviews/{id}/remind/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/interviews/6/remind/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Example Request**

```
POST https://rms1-1-suhq.onrender.com/api/interviews/6/remind/
Authorization: Bearer <access_token>
```

**Response (200 OK)**

```json
{
  "id": 6,
  "panel_details": [
    {
      "id": 1,
      "name": "Dr. Suresh Kumar",
      "email": "suresh@southpoint.edu",
      "phone": "9876543001",
      "department": "Science",
      "is_active": true,
      "created_at": "2026-06-01T10:00:00+05:30"
    }
  ],
  "interview_id": "INT-2026-0006",
  "candidate_name": "Jane Doe",
  "role": "Senior Mathematics Teacher",
  "date": "2026-07-10",
  "time": "14:00:00",
  "score": null,
  "recommendation": "",
  "feedback": "",
  "status": "Scheduled",
  "mode": "Online",
  "meeting_link": "https://meet.google.com/abc-defg-hij",
  "round": 1,
  "reminder_sent_at": "2026-07-07T10:30:00+05:30",
  "created_at": "2026-07-07T10:00:00+05:30",
  "updated_at": "2026-07-07T10:30:00+05:30",
  "application": 12
}
```

________________________________________

### 5.11 Get Upcoming Interviews

Returns all upcoming scheduled interviews (date ≥ today). Candidates see only their own; admins see all.

**Endpoint**

```
GET /interviews/upcoming/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/interviews/upcoming/
```

**Auth Required**: Authenticated User (JWT Bearer Token)

**Example Request**

```
GET https://rms1-1-suhq.onrender.com/api/interviews/upcoming/
Authorization: Bearer <access_token>
```

**Response (200 OK)**

```json
[
  {
    "id": 6,
    "panel_details": [
      {
        "id": 1,
        "name": "Dr. Suresh Kumar",
        "email": "suresh@southpoint.edu",
        "phone": "9876543001",
        "department": "Science",
        "is_active": true,
        "created_at": "2026-06-01T10:00:00+05:30"
      }
    ],
    "interview_id": "INT-2026-0006",
    "candidate_name": "Jane Doe",
    "role": "Senior Mathematics Teacher",
    "date": "2026-07-10",
    "time": "14:00:00",
    "score": null,
    "recommendation": "",
    "feedback": "",
    "status": "Scheduled",
    "mode": "Online",
    "meeting_link": "https://meet.google.com/abc-defg-hij",
    "round": 1,
    "reminder_sent_at": null,
    "created_at": "2026-07-07T10:00:00+05:30",
    "updated_at": "2026-07-07T10:00:00+05:30",
    "application": 12
  }
]
```

---

## ✉️ 6. Offers & Onboarding

---

### 6.1 Issue a New Offer

Create and optionally send an offer letter to a selected candidate. If status is `"Sent"`, an email notification is automatically dispatched.

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
| candidate      | Integer | No       | Candidate User ID (auto-matched) | 15                           |
| candidate_name | String  | Yes      | Candidate full name              | Jane Doe                     |
| role           | String  | Yes      | Role being offered               | Senior Mathematics Teacher   |
| ctc            | String  | No       | Cost to company / salary offered | ₹45,000 INR                  |
| issued_date    | Date    | No       | Date offer was issued (ISO)      | 2026-07-07                   |
| expiry_date    | Date    | No       | Date offer expires (ISO)         | 2026-07-15                   |
| joining_date   | Date    | No       | Expected joining date (ISO)      | 2026-07-25                   |
| status         | String  | No       | Draft, Sent, Accepted, Rejected, Expired | Sent                  |
| offer_letter   | File    | No       | Offer letter file upload         |                              |

> **Note:** If `candidate` is not provided but `candidate_name` is, the system auto-matches the candidate from JobApplication, GeneralApplication, or User records.

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
  "issued_date": "2026-07-07",
  "expiry_date": "2026-07-15",
  "joining_date": "2026-07-25",
  "status": "Sent"
}
```

**Response (201 Created)**

```json
{
  "id": 4,
  "department": "Science",
  "offer_id": "OFR-2026-0004",
  "candidate": 15,
  "candidate_name": "Jane Doe",
  "role": "Senior Mathematics Teacher",
  "ctc": "₹45,000 INR",
  "issued_date": "2026-07-07",
  "expiry_date": "2026-07-15",
  "joining_date": "2026-07-25",
  "status": "Sent",
  "offer_letter": null,
  "created_at": "2026-07-07T10:00:00+05:30",
  "updated_at": "2026-07-07T10:00:00+05:30"
}
```

> **Note:** The `department` field is computed at read time by looking up the role in ExistingRole or JobPosting models.

________________________________________

### 6.2 Get All Offers

Returns all offers. Candidates see only their own offers.

**Endpoint**

```
GET /offers/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/offers/
```

**Auth Required**: Authenticated User (JWT Bearer Token)

**Example Request**

```
GET https://rms1-1-suhq.onrender.com/api/offers/
Authorization: Bearer <access_token>
```

**Response (200 OK)**

```json
[
  {
    "id": 4,
    "department": "Science",
    "offer_id": "OFR-2026-0004",
    "candidate": 15,
    "candidate_name": "Jane Doe",
    "role": "Senior Mathematics Teacher",
    "ctc": "₹45,000 INR",
    "issued_date": "2026-07-07",
    "expiry_date": "2026-07-15",
    "joining_date": "2026-07-25",
    "status": "Sent",
    "offer_letter": null,
    "created_at": "2026-07-07T10:00:00+05:30",
    "updated_at": "2026-07-07T10:00:00+05:30"
  }
]
```

________________________________________

### 6.3 Get a Single Offer

**Endpoint**

```
GET /offers/{id}/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/offers/4/
```

**Auth Required**: Authenticated User (JWT Bearer Token)

**Response (200 OK)**

Same structure as the single object in the list above.

________________________________________

### 6.4 Update an Offer

**Endpoint**

```
PUT /offers/{id}/
```  
```
PATCH /offers/{id}/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/offers/4/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Example Request**

```json
PATCH https://rms1-1-suhq.onrender.com/api/offers/4/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "ctc": "₹48,000 INR",
  "status": "Sent"
}
```

**Response (200 OK)**

```json
{
  "id": 4,
  "department": "Science",
  "offer_id": "OFR-2026-0004",
  "candidate": 15,
  "candidate_name": "Jane Doe",
  "role": "Senior Mathematics Teacher",
  "ctc": "₹48,000 INR",
  "issued_date": "2026-07-07",
  "expiry_date": "2026-07-15",
  "joining_date": "2026-07-25",
  "status": "Sent",
  "offer_letter": null,
  "created_at": "2026-07-07T10:00:00+05:30",
  "updated_at": "2026-07-07T11:00:00+05:30"
}
```

> **Note:** If status transitions to `"Sent"`, an offer email and in-app notification are automatically triggered.

________________________________________

### 6.5 Accept an Offer (Candidate)

Candidate accepts the offer. This automatically creates an OnboardingRecord and queues a notification.

**Endpoint**

```
POST /offers/{id}/accept/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/offers/4/accept/
```

**Auth Required**: Authenticated User (JWT Bearer Token) — must be the offer's candidate or an admin

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
  "department": "Science",
  "offer_id": "OFR-2026-0004",
  "candidate": 15,
  "candidate_name": "Jane Doe",
  "role": "Senior Mathematics Teacher",
  "ctc": "₹48,000 INR",
  "issued_date": "2026-07-07",
  "expiry_date": "2026-07-15",
  "joining_date": "2026-07-25",
  "status": "Accepted",
  "offer_letter": null,
  "created_at": "2026-07-07T10:00:00+05:30",
  "updated_at": "2026-07-07T15:00:00+05:30"
}
```

> **Side-effects:** An `OnboardingRecord` is auto-created with status `"Documents Pending"` and all tasks set to `false`.

________________________________________

### 6.6 Decline an Offer (Candidate)

Candidate declines the offer.

**Endpoint**

```
POST /offers/{id}/decline/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/offers/4/decline/
```

**Auth Required**: Authenticated User (JWT Bearer Token) — must be the offer's candidate or an admin

**Example Request**

```
POST https://rms1-1-suhq.onrender.com/api/offers/4/decline/
Authorization: Bearer <access_token>
```

**Response (200 OK)**

```json
{
  "id": 4,
  "department": "Science",
  "offer_id": "OFR-2026-0004",
  "candidate": 15,
  "candidate_name": "Jane Doe",
  "role": "Senior Mathematics Teacher",
  "ctc": "₹48,000 INR",
  "issued_date": "2026-07-07",
  "expiry_date": "2026-07-15",
  "joining_date": "2026-07-25",
  "status": "Rejected",
  "offer_letter": null,
  "created_at": "2026-07-07T10:00:00+05:30",
  "updated_at": "2026-07-07T15:00:00+05:30"
}
```

________________________________________

### 6.7 Delete an Offer

**Endpoint**

```
DELETE /offers/{id}/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/offers/4/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Response (204 No Content)**: Empty body

________________________________________

### 6.8 Get All Onboarding Records

Returns all onboarding records. Candidates see only their own records.

**Endpoint**

```
GET /onboarding/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/onboarding/
```

**Auth Required**: Authenticated User (JWT Bearer Token)

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
    "completion_percentage": 17,
    "record_id": "ONB-2026-0001",
    "employee_name": "Jane Doe",
    "role": "Senior Mathematics Teacher",
    "joining_date": "2026-07-25",
    "employee_id": "",
    "status": "Documents Pending",
    "task_profile": true,
    "task_offer": false,
    "task_docs_upload": false,
    "task_docs_verify": false,
    "task_bgc": false,
    "task_checkin": false,
    "created_at": "2026-07-07T15:00:00+05:30",
    "updated_at": "2026-07-07T15:00:00+05:30",
    "offer": 4,
    "candidate": 15
  }
]
```

________________________________________

### 6.9 Get a Single Onboarding Record

**Endpoint**

```
GET /onboarding/{id}/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/onboarding/1/
```

**Auth Required**: Authenticated User (JWT Bearer Token)

**Response (200 OK)**

Same structure as the single object in the list above.

________________________________________

### 6.10 Create an Onboarding Record

**Endpoint**

```
POST /onboarding/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/onboarding/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Request Body (JSON)**

| Field         | Type    | Required | Description              | Example                     |
|---------------|---------|----------|--------------------------|-----------------------------|
| employee_name | String  | Yes      | Employee full name       | Jane Doe                    |
| role          | String  | Yes      | Role title               | Senior Mathematics Teacher  |
| joining_date  | Date    | No       | Joining date (ISO)       | 2026-07-25                  |
| employee_id   | String  | No       | Employee ID              | EMP-2026-001                |
| status        | String  | No       | Documents Pending, In Progress, Completed | Documents Pending |
| offer         | Integer | No       | Linked Offer ID          | 4                           |
| candidate     | Integer | No       | Linked User ID           | 15                          |

**Example Request**

```json
POST https://rms1-1-suhq.onrender.com/api/onboarding/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "employee_name": "Jane Doe",
  "role": "Senior Mathematics Teacher",
  "joining_date": "2026-07-25",
  "offer": 4,
  "candidate": 15
}
```

**Response (201 Created)**

```json
{
  "id": 1,
  "completion_percentage": 0,
  "record_id": "ONB-2026-0001",
  "employee_name": "Jane Doe",
  "role": "Senior Mathematics Teacher",
  "joining_date": "2026-07-25",
  "employee_id": "",
  "status": "Documents Pending",
  "task_profile": false,
  "task_offer": false,
  "task_docs_upload": false,
  "task_docs_verify": false,
  "task_bgc": false,
  "task_checkin": false,
  "created_at": "2026-07-07T15:00:00+05:30",
  "updated_at": "2026-07-07T15:00:00+05:30",
  "offer": 4,
  "candidate": 15
}
```

________________________________________

### 6.11 Update Onboarding Tasks

Update individual onboarding task checkboxes. If all 6 tasks are completed (100%), the record status is auto-set to `"Completed"`.

**Endpoint**

```
PATCH /onboarding/{id}/tasks/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/onboarding/1/tasks/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Request Body (JSON)**

| Field            | Type    | Required | Description                | Example |
|------------------|---------|----------|----------------------------|---------|
| task_profile     | Boolean | No       | Profile Completed          | true    |
| task_offer       | Boolean | No       | Offer Accepted             | true    |
| task_docs_upload | Boolean | No       | Documents Uploaded         | true    |
| task_docs_verify | Boolean | No       | Documents Verified         | false   |
| task_bgc         | Boolean | No       | Background Check           | false   |
| task_checkin     | Boolean | No       | Day-1 Check-in             | false   |
| status           | String  | No       | Manual status override     | In Progress |

**Example Request**

```json
PATCH https://rms1-1-suhq.onrender.com/api/onboarding/1/tasks/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "task_profile": true,
  "task_offer": true,
  "task_docs_upload": true,
  "task_docs_verify": true,
  "task_bgc": true,
  "task_checkin": true
}
```

**Response (200 OK)**

```json
{
  "id": 1,
  "completion_percentage": 100,
  "record_id": "ONB-2026-0001",
  "employee_name": "Jane Doe",
  "role": "Senior Mathematics Teacher",
  "joining_date": "2026-07-25",
  "employee_id": "",
  "status": "Completed",
  "task_profile": true,
  "task_offer": true,
  "task_docs_upload": true,
  "task_docs_verify": true,
  "task_bgc": true,
  "task_checkin": true,
  "created_at": "2026-07-07T15:00:00+05:30",
  "updated_at": "2026-07-07T16:00:00+05:30",
  "offer": 4,
  "candidate": 15
}
```

________________________________________

### 6.12 Update an Onboarding Record

**Endpoint**

```
PUT /onboarding/{id}/
```  
```
PATCH /onboarding/{id}/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/onboarding/1/
```

**Auth Required**: Authenticated User (JWT Bearer Token)

**Example Request**

```json
PATCH https://rms1-1-suhq.onrender.com/api/onboarding/1/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "employee_id": "EMP-2026-001",
  "status": "In Progress"
}
```

**Response (200 OK)**

Same structure as the single onboarding record with updated fields.

________________________________________

### 6.13 Delete an Onboarding Record

**Endpoint**

```
DELETE /onboarding/{id}/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/onboarding/1/
```

**Auth Required**: Admin User (JWT Bearer Token)

**Response (204 No Content)**: Empty body

---

## 🔔 7. Notifications

---

### 7.1 Get My Notifications

Retrieve all notifications for the currently logged-in user. Read-only viewset.

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
    "recipient": 15,
    "type": "offer_accepted",
    "title": "Offer Accepted",
    "message": "You have accepted the offer for Senior Mathematics Teacher. Onboarding has been initiated.",
    "is_read": false,
    "created_at": "2026-07-07T15:45:12+05:30"
  },
  {
    "id": 101,
    "recipient": 15,
    "type": "application_status",
    "title": "Application Update: Senior Mathematics Teacher",
    "message": "Your application for Senior Mathematics Teacher has been updated to 'Shortlisted'.",
    "is_read": true,
    "created_at": "2026-07-07T11:30:00+05:30"
  },
  {
    "id": 100,
    "recipient": 15,
    "type": "interview_scheduled",
    "title": "Interview Update — Senior Mathematics Teacher",
    "message": "Your Round 1 interview status is now 'Completed'.",
    "is_read": true,
    "created_at": "2026-07-07T10:00:00+05:30"
  },
  {
    "id": 99,
    "recipient": 15,
    "type": "offer_received",
    "title": "Offer Letter Issued",
    "message": "You have received an offer letter for the position of Senior Mathematics Teacher. Please review and respond.",
    "is_read": true,
    "created_at": "2026-07-07T09:00:00+05:30"
  },
  {
    "id": 98,
    "recipient": 15,
    "type": "onboarding",
    "title": "Onboarding Started",
    "message": "Your onboarding process has been initiated. Please complete the required tasks.",
    "is_read": false,
    "created_at": "2026-07-06T18:00:00+05:30"
  },
  {
    "id": 97,
    "recipient": 15,
    "type": "general",
    "title": "Welcome to RMS",
    "message": "Welcome to the Recruitment Management System. Please complete your profile.",
    "is_read": true,
    "created_at": "2026-06-15T10:00:00+05:30"
  }
]
```

**Notification Type Values**

| Type                  | Description                 |
|-----------------------|-----------------------------|
| `application_status`  | Application Status Change   |
| `interview_scheduled` | Interview Scheduled         |
| `offer_received`      | Offer Received              |
| `offer_accepted`      | Offer Accepted              |
| `onboarding`          | Onboarding Update           |
| `general`             | General                     |

________________________________________

### 7.2 Get a Single Notification

**Endpoint**

```
GET /notifications/{id}/
```

**Request URL**

```
https://rms1-1-suhq.onrender.com/api/notifications/102/
```

**Auth Required**: Authenticated User (JWT Bearer Token)

**Response (200 OK)**

```json
{
  "id": 102,
  "recipient": 15,
  "type": "offer_accepted",
  "title": "Offer Accepted",
  "message": "You have accepted the offer for Senior Mathematics Teacher. Onboarding has been initiated.",
  "is_read": false,
  "created_at": "2026-07-07T15:45:12+05:30"
}
```

________________________________________

### 7.3 Mark Single Notification as Read

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
  "recipient": 15,
  "type": "offer_accepted",
  "title": "Offer Accepted",
  "message": "You have accepted the offer for Senior Mathematics Teacher. Onboarding has been initiated.",
  "is_read": true,
  "created_at": "2026-07-07T15:45:12+05:30"
}
```

________________________________________

### 7.4 Mark All Notifications as Read

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

## 📊 Endpoint Summary Table

| #    | Method | Endpoint                              | Auth          | Description                           |
|------|--------|---------------------------------------|---------------|---------------------------------------|
| 1.1  | POST   | `/auth/register/`                     | Public        | Register new candidate                |
| 1.2  | POST   | `/auth/login/`                        | Public        | Login and get JWT tokens              |
| 1.3  | POST   | `/auth/token/refresh/`                | Public        | Refresh access token                  |
| 1.4  | POST   | `/auth/logout/`                       | Authenticated | Blacklist refresh token               |
| 1.5  | GET    | `/auth/me/`                           | Authenticated | Get current user profile              |
| 1.6  | PUT    | `/auth/me/`                           | Authenticated | Update current user profile           |
| 1.7  | POST   | `/auth/change-password/`              | Authenticated | Change password                       |
| 2.1  | GET    | `/dashboard/stats/`                   | Admin         | Get dashboard statistics              |
| 2.2  | GET    | `/job-categories/`                    | Authenticated | List job categories                   |
| 2.3  | POST   | `/job-categories/`                    | Admin         | Create job category                   |
| 2.4  | GET    | `/roles/`                             | Admin         | List existing roles                   |
| 2.5  | POST   | `/roles/`                             | Admin         | Create existing role                  |
| 2.6  | PUT    | `/roles/{id}/`                        | Admin         | Update existing role                  |
| 2.7  | DELETE | `/roles/{id}/`                        | Admin         | Delete existing role                  |
| 2.8  | GET    | `/roles/departments/`                 | Admin         | List distinct departments             |
| 2.9  | GET    | `/roles/summary/`                     | Admin         | Roles summary by department           |
| 2.10 | GET    | `/job-postings/public/`               | Public        | List published postings               |
| 2.11 | GET    | `/job-postings/`                      | Admin         | List all postings                     |
| 2.12 | GET    | `/job-postings/{id}/`                 | Admin         | Get single posting                    |
| 2.13 | POST   | `/job-postings/`                      | Admin         | Create job posting                    |
| 2.14 | PUT    | `/job-postings/{id}/`                 | Admin         | Update job posting                    |
| 2.15 | DELETE | `/job-postings/{id}/`                 | Admin         | Delete job posting                    |
| 2.16 | POST   | `/job-postings/{id}/publish/`         | Admin         | Publish a posting                     |
| 2.17 | POST   | `/job-postings/{id}/unpublish/`       | Admin         | Unpublish a posting                   |
| 3.1  | POST   | `/role-requests/`                     | Admin         | Submit role request                   |
| 3.2  | GET    | `/role-requests/`                     | Admin         | List role requests                    |
| 3.3  | PATCH  | `/role-requests/{id}/update_status/`  | Admin         | Update role request status            |
| 3.4  | POST   | `/job-requests/`                      | Admin         | Submit job request                    |
| 3.5  | GET    | `/job-requests/`                      | Admin         | List job requests                     |
| 3.6  | PATCH  | `/job-requests/{id}/update_status/`   | Admin         | Update job request status             |
| 3.7  | GET    | `/approvals/`                         | Admin         | List approval requests                |
| 3.8  | POST   | `/approvals/{id}/action/`             | Admin         | Take action on approval               |
| 4.1  | POST   | `/applications/`                      | Candidate     | Submit job application                |
| 4.2  | GET    | `/applications/mine/`                 | Authenticated | Get my applications                   |
| 4.3  | GET    | `/applications/`                      | Admin         | List all applications                 |
| 4.4  | GET    | `/applications/{id}/`                 | Authenticated | Get single application                |
| 4.5  | PATCH  | `/applications/{id}/update_status/`   | Admin         | Update application status             |
| 4.6  | POST   | `/general-applications/`              | Candidate     | Submit general application            |
| 4.7  | GET    | `/general-applications/mine/`         | Authenticated | Get my general applications           |
| 4.8  | GET    | `/general-applications/`              | Admin         | List all general applications         |
| 5.1  | GET    | `/panelists/`                         | Admin         | List panelists                        |
| 5.2  | POST   | `/panelists/`                         | Admin         | Create panelist                       |
| 5.3  | PUT    | `/panelists/{id}/`                    | Admin         | Update panelist                       |
| 5.4  | DELETE | `/panelists/{id}/`                    | Admin         | Soft-delete panelist                  |
| 5.5  | POST   | `/interviews/`                        | Admin         | Schedule interview                    |
| 5.6  | GET    | `/interviews/`                        | Authenticated | List interviews                       |
| 5.7  | GET    | `/interviews/{id}/`                   | Authenticated | Get single interview                  |
| 5.8  | PUT    | `/interviews/{id}/`                   | Admin         | Update interview                      |
| 5.9  | PATCH  | `/interviews/{id}/score/`             | Authenticated | Submit score & feedback               |
| 5.10 | POST   | `/interviews/{id}/remind/`            | Admin         | Send interview reminder               |
| 5.11 | GET    | `/interviews/upcoming/`               | Authenticated | List upcoming interviews              |
| 6.1  | POST   | `/offers/`                            | Admin         | Issue new offer                       |
| 6.2  | GET    | `/offers/`                            | Authenticated | List offers                           |
| 6.3  | GET    | `/offers/{id}/`                       | Authenticated | Get single offer                      |
| 6.4  | PUT    | `/offers/{id}/`                       | Admin         | Update offer                          |
| 6.5  | POST   | `/offers/{id}/accept/`                | Authenticated | Accept offer                          |
| 6.6  | POST   | `/offers/{id}/decline/`               | Authenticated | Decline offer                         |
| 6.7  | DELETE | `/offers/{id}/`                       | Admin         | Delete offer                          |
| 6.8  | GET    | `/onboarding/`                        | Authenticated | List onboarding records               |
| 6.9  | GET    | `/onboarding/{id}/`                   | Authenticated | Get single onboarding record          |
| 6.10 | POST   | `/onboarding/`                        | Admin         | Create onboarding record              |
| 6.11 | PATCH  | `/onboarding/{id}/tasks/`             | Admin         | Update onboarding tasks               |
| 6.12 | PATCH  | `/onboarding/{id}/`                   | Authenticated | Update onboarding record              |
| 6.13 | DELETE | `/onboarding/{id}/`                   | Admin         | Delete onboarding record              |
| 7.1  | GET    | `/notifications/`                     | Authenticated | List my notifications                 |
| 7.2  | GET    | `/notifications/{id}/`                | Authenticated | Get single notification               |
| 7.3  | PATCH  | `/notifications/{id}/mark_read/`      | Authenticated | Mark notification as read             |
| 7.4  | PATCH  | `/notifications/mark_all_read/`       | Authenticated | Mark all notifications as read        |

---

*Last Updated: July 7, 2026*
*South Point School — Recruitment Management System (RMS) Backend*
