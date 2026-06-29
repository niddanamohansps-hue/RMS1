# South Point School Recruitment System (RMS) — API Reference

This document provides detailed API specifications, sample JSON request payloads, and response outputs for all endpoints in the Django backend.

---

## 🔐 1. Authentication & Profile Endpoints

All endpoints have a `/api/` prefix.

### POST `/api/auth/register/`
* **Description**: Register a new user (Candidate role).
* **Auth Required**: None (Public)
* **Request Body**:
```json
{
  "email": "jane.doe@example.com",
  "password": "securepassword123",
  "first_name": "Jane",
  "last_name": "Doe"
}
```
* **Response (201 Created)**:
```json
{
  "message": "Registration successful.",
  "user": {
    "id": 15,
    "email": "jane.doe@example.com",
    "first_name": "Jane",
    "last_name": "Jane",
    "role": "candidate",
    "phone": ""
  },
  "tokens": {
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST `/api/auth/login/`
* **Description**: Authenticate using email and password to receive access and refresh JWT tokens.
* **Auth Required**: None (Public)
* **Request Body**:
```json
{
  "email": "admin@school.com",
  "password": "adminpassword"
}
```
* **Response (200 OK)**:
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST `/api/auth/token/refresh/`
* **Description**: Obtain a new access token using a valid refresh token.
* **Auth Required**: None (Public)
* **Request Body**:
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
* **Response (200 OK)**:
```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST `/api/auth/logout/`
* **Description**: Blacklist a refresh token to logout user.
* **Auth Required**: JWT Bearer Token
* **Request Body**:
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
* **Response (200 OK)**:
```json
{
  "message": "Logged out successfully."
}
```

### GET `/api/auth/me/`
* **Description**: Get current logged-in user profile detail.
* **Auth Required**: JWT Bearer Token
* **Response (200 OK - Admin)**:
```json
{
  "id": 1,
  "email": "admin@school.com",
  "first_name": "Admin",
  "last_name": "User",
  "role": "admin",
  "phone": "9876543210"
}
```
* **Response (200 OK - Candidate)**:
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

### PUT `/api/auth/me/`
* **Description**: Update user details and profile.
* **Auth Required**: JWT Bearer Token
* **Request Body**:
```json
{
  "first_name": "Jane Update",
  "phone": "9998887776",
  "profile": {
    "current_location": "Shillong",
    "skills": ["Communication", "Guitar", "Piano"]
  }
}
```
* **Response (200 OK)**:
```json
{
  "id": 15,
  "email": "jane.doe@example.com",
  "first_name": "Jane Update",
  "last_name": "Doe",
  "role": "candidate",
  "phone": "9998887776"
}
```

---

## 💼 2. Jobs & Dashboard Endpoints

### GET `/api/dashboard/stats/`
* **Description**: Retrieves aggregated stats for the HR dashboard.
* **Auth Required**: Admin User
* **Response (200 OK - Cached)**:
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

### GET `/api/jobs/job-postings/public/`
* **Description**: Returns all currently published job listings for candidates. Supports filtering by `category` and search query `q`.
* **Auth Required**: None (Public)
* **Response (200 OK - Cached)**:
```json
[
  {
    "id": 1,
    "posting_id": "JP-001",
    "role": "High School Math Teacher",
    "department": "Science",
    "type": "Full-time",
    "category": "Teacher",
    "location": "Guwahati, Assam",
    "description": "We are looking for an experienced Mathematics teacher...",
    "qualifications": ["B.Ed", "M.Sc Mathematics"],
    "experience": "2-4 years",
    "salary_range": "35k - 45k",
    "deadline": "2026-07-15",
    "expiry_date": "2026-07-15",
    "status": "Published"
  }
]
```

### GET `/api/jobs/job-postings/`
* **Description**: Returns all postings for admin management.
* **Auth Required**: Admin User
* **Response (200 OK)**:
```json
[
  {
    "id": 1,
    "posting_id": "JP-001",
    "role": "High School Math Teacher",
    "department": "Science",
    "type": "Full-time",
    "category": "Teacher",
    "location": "Guwahati, Assam",
    "status": "Published",
    "application_count": 8,
    "expiry_date": "2026-07-15"
  },
  {
    "id": 2,
    "posting_id": "JP-002",
    "role": "History Teacher",
    "department": "Arts",
    "type": "Part-time",
    "category": "Teacher",
    "location": "Guwahati, Assam",
    "status": "Unpublished",
    "application_count": 0,
    "expiry_date": null
  }
]
```

### POST `/api/jobs/job-postings/`
* **Description**: Create a new job posting.
* **Auth Required**: Admin User
* **Request Body**:
```json
{
  "role": "Physics Teacher",
  "department": "Science",
  "type": "Full-time",
  "category": "Teacher",
  "location": "Guwahati, Assam",
  "description": "Physics Teacher wanted for secondary grades.",
  "qualifications": ["B.Ed", "M.Sc Physics"],
  "experience": "2+ years",
  "salary_range": "40k - 50k",
  "channel": "External",
  "status": "Unpublished",
  "expiry_date": "2026-08-30"
}
```
* **Response (201 Created)**:
```json
{
  "id": 3,
  "posting_id": "JP-003",
  "role": "Physics Teacher",
  "department": "Science",
  "type": "Full-time",
  "category": "Teacher",
  "location": "Guwahati, Assam",
  "description": "Physics Teacher wanted for secondary grades.",
  "qualifications": ["B.Ed", "M.Sc Physics"],
  "experience": "2+ years",
  "salary_range": "40k - 50k",
  "channel": "External",
  "status": "Unpublished",
  "posted_date": null,
  "expiry_date": "2026-08-30",
  "application_count": 0
}
```

### POST `/api/jobs/job-postings/{id}/publish/`
* **Description**: Change status of posting to Published.
* **Auth Required**: Admin User
* **Response (200 OK)**:
```json
{
  "id": 3,
  "posting_id": "JP-003",
  "role": "Physics Teacher",
  "status": "Published",
  "posted_date": "2026-06-29"
}
```

### PUT `/api/jobs/job-postings/{id}/`
* **Description**: Update a job posting.
* **Auth Required**: Admin User
* **Request Body**:
```json
{
  "salary_range": "45k - 55k",
  "experience": "3+ years"
}
```
* **Response (200 OK)**:
```json
{
  "id": 3,
  "posting_id": "JP-003",
  "role": "Physics Teacher",
  "salary_range": "45k - 55k",
  "experience": "3+ years",
  "status": "Published"
}
```

### DELETE `/api/jobs/job-postings/{id}/`
* **Description**: Delete a job posting.
* **Auth Required**: Admin User
* **Response (204 No Content)**: Empty

---

## 📝 3. Role Requests & Approvals

### POST `/api/jobs/role-requests/`
* **Description**: Submit a request for opening a new role headcount.
* **Auth Required**: Admin User
* **Request Body**:
```json
{
  "department": "Arts",
  "role": "Music Teacher",
  "justification": "Increased student enrollment in humanities stream."
}
```
* **Response (201 Created)**:
```json
{
  "id": 4,
  "request_id": "RR-004",
  "department": "Arts",
  "role": "Music Teacher",
  "justification": "Increased student enrollment in humanities stream.",
  "status": "Pending",
  "date": "2026-06-29",
  "created_by_name": "Admin User"
}
```

### POST `/api/jobs/approvals/{id}/action/`
* **Description**: Approve, reject, or send back a pending role or job request.
* **Auth Required**: Admin User
* **Request Body**:
```json
{
  "action": "Approve",
  "note": "Approved for headcount increase.",
  "acted_by": "Principal"
}
```
* **Response (200 OK)**:
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
      "date": "2026-06-29",
      "note": "Approved for headcount increase."
    }
  ]
}
```

---

## 📂 4. Applications Endpoints

### POST `/api/applications/applications/`
* **Description**: Submit job application for a specific posting.
* **Auth Required**: Candidate User
* **Request Body**:
```json
{
  "posting": 1,
  "experience": "3 years",
  "qualification": "M.Sc Math, B.Ed",
  "cover_letter": "I would like to apply for the math role.",
  "notice_period": "30 days",
  "has_referral": false
}
```
* **Response (201 Created)**:
```json
{
  "id": 12,
  "app_id": "JAPP-012",
  "role": "High School Math Teacher",
  "posting": 1,
  "status": "Applied",
  "applied_date": "2026-06-29",
  "candidate_name": "Jane Doe"
}
```

### GET `/api/applications/applications/mine/`
* **Description**: Fetch all applications submitted by the logged-in candidate.
* **Auth Required**: Candidate User
* **Response (200 OK)**:
```json
[
  {
    "id": 12,
    "app_id": "JAPP-012",
    "role": "High School Math Teacher",
    "posting": 1,
    "posting_title": "High School Math Teacher",
    "status": "Applied",
    "applied_date": "2026-06-29"
  }
]
```

### PATCH `/api/applications/applications/{id}/update_status/`
* **Description**: Update application status (triggers async Celery background notification).
* **Auth Required**: Admin User
* **Request Body**:
```json
{
  "status": "Shortlisted",
  "admin_note": "Strong experience in algebra."
}
```
* **Response (200 OK)**:
```json
{
  "id": 12,
  "app_id": "JAPP-012",
  "status": "Shortlisted",
  "admin_note": "Strong experience in algebra."
}
```

---

## 📅 5. Interview Scheduling Endpoints

### POST `/api/interviews/interviews/`
* **Description**: Schedule an interview.
* **Auth Required**: Admin User
* **Request Body**:
```json
{
  "application": 12,
  "candidate_name": "Jane Doe",
  "role": "High School Math Teacher",
  "date": "2026-07-05",
  "time": "14:00:00",
  "mode": "Online",
  "meeting_link": "https://meet.google.com/abc-defg-hij",
  "round": 1,
  "panel": [1, 2]
}
```
* **Response (201 Created)**:
```json
{
  "id": 6,
  "interview_id": "INT-006",
  "candidate_name": "Jane Doe",
  "role": "High School Math Teacher",
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
      "email": "suresh@school.com",
      "department": "Science"
    },
    {
      "id": 2,
      "name": "Prof. Anil Baruah",
      "email": "anil@school.com",
      "department": "Science"
    }
  ]
}
```

### PATCH `/api/interviews/interviews/{id}/score/`
* **Description**: Submit scores and feedback for the interview (triggers async Celery background notification).
* **Auth Required**: Admin/Panelist User
* **Request Body**:
```json
{
  "score": 85,
  "recommendation": "Selected",
  "feedback": "Strong communication and subject matter skills.",
  "status": "Completed"
}
```
* **Response (200 OK)**:
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

### POST `/api/onboarding/offers/`
* **Description**: Issue a new offer.
* **Auth Required**: Admin User
* **Request Body**:
```json
{
  "candidate": 15,
  "candidate_name": "Jane Doe",
  "role": "High School Math Teacher",
  "ctc": "45,000 INR",
  "issued_date": "2026-06-29",
  "expiry_date": "2026-07-05",
  "joining_date": "2026-07-20",
  "status": "Sent"
}
```
* **Response (201 Created)**:
```json
{
  "id": 4,
  "offer_id": "OFR-004",
  "candidate_name": "Jane Doe",
  "role": "High School Math Teacher",
  "ctc": "45,000 INR",
  "status": "Sent",
  "joining_date": "2026-07-20"
}
```

### POST `/api/onboarding/offers/{id}/accept/`
* **Description**: Candidate accepts the offer (initiates onboarding and queues notifications in Celery).
* **Auth Required**: Candidate User
* **Response (200 OK)**:
```json
{
  "id": 4,
  "offer_id": "OFR-004",
  "status": "Accepted",
  "candidate_name": "Jane Doe"
}
```

---

## 🔔 7. Notifications Endpoints

### GET `/api/notifications/`
* **Description**: Retrieve active notifications for the logged-in user.
* **Auth Required**: Authenticated User
* **Response (200 OK)**:
```json
[
  {
    "id": 102,
    "type": "offer_accepted",
    "title": "Offer Accepted",
    "message": "You have accepted the offer for High School Math Teacher. Onboarding has been initiated.",
    "is_read": false,
    "created_at": "2026-06-29T22:45:12+05:30"
  }
]
```

### PATCH `/api/notifications/{id}/mark_read/`
* **Description**: Mark a single notification as read.
* **Auth Required**: Authenticated User
* **Response (200 OK)**:
```json
{
  "id": 102,
  "is_read": true
}
```

### PATCH `/api/notifications/mark_all_read/`
* **Description**: Mark all notifications for the current user as read.
* **Auth Required**: Authenticated User
* **Response (200 OK)**:
```json
{
  "message": "All notifications marked as read."
}
```
