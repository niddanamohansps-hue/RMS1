# API Integration Documentation

This document outlines the REST API endpoints provided by the Django backend and how they are consumed by the two distinct frontend applications: **Admin Dashboard** and **Career Page**.

## Table of Contents
1. [Authentication & User Management](#1-authentication--user-management)
2. [Admin Dashboard Integrations](#2-admin-dashboard-integrations)
3. [Career Page Integrations](#3-career-page-integrations)

---

## 1. Authentication & User Management

Both frontends use JSON Web Tokens (JWT) for authentication. The endpoints belong to the `users` app.

| Endpoint | Method | Description | Used By |
|---|---|---|---|
| `/api/auth/register/` | POST | Register a new user (Candidate) | Career Page |
| `/api/auth/login/` | POST | Authenticate & get JWT tokens | Both |
| `/api/auth/token/refresh/` | POST | Refresh JWT access token | Both |
| `/api/auth/logout/` | POST | Logout user (blacklist token) | Both |
| `/api/auth/me/` | GET | Get current authenticated user profile | Both |
| `/api/auth/change-password/` | POST | Change user password | Both |

> **Note:** The Admin Dashboard restricts login to users with `role="admin"`, while the Career Page primarily serves `role="candidate"`.

---

## 2. Admin Dashboard Integrations

The Admin Dashboard is the internal portal for HR and Admin staff. It consumes endpoints designed for full CRUD operations and workflow management. All requests require an `Authorization: Bearer <token>` header belonging to an admin user.

### Jobs & Organization Mapping
Base URL: `/api/jobs/`

| Endpoint | Methods | Description |
|---|---|---|
| `/job-categories/` | GET, POST, PUT, DELETE | Manage job categories |
| `/roles/` | GET, POST, PUT, DELETE | Manage existing roles and master headcount |
| `/role-requests/` | GET, POST, PUT, DELETE | Process internal role creation requests |
| `/job-requests/` | GET, POST, PUT, DELETE | Process requests to open new job postings |
| `/approvals/` | GET, POST, PUT | HR approval workflows for requests |
| `/job-postings/` | GET, POST, PUT, DELETE | Create and manage public job postings |
| `/dashboard/stats/`| GET | Aggregated statistics for the admin dashboard home |

### Applications Management
Base URL: `/api/applications/`

| Endpoint | Methods | Description |
|---|---|---|
| `/applications/` | GET, PUT | View and update statuses of job applications |
| `/general-applications/`| GET, PUT | View general talent pool applications |

### Interviews & Scheduling
Base URL: `/api/interviews/`

| Endpoint | Methods | Description |
|---|---|---|
| `/panelists/` | GET, POST, PUT, DELETE | Manage internal interview panelists |
| `/interviews/` | GET, POST, PUT, DELETE | Schedule, update, and review interviews |

### Offers & Onboarding
Base URL: `/api/onboarding/`

| Endpoint | Methods | Description |
|---|---|---|
| `/offers/` | GET, POST, PUT, DELETE | Generate and send offer letters |
| `/onboarding/` | GET, PUT | Track and verify candidate onboarding tasks |

---

## 3. Career Page Integrations

The Career Page is the external portal for job seekers. Endpoints consumed here are heavily scoped down to the logged-in user or are entirely public. 

### Public Endpoints
No authentication required.

| Endpoint | Methods | Description |
|---|---|---|
| `/api/jobs/job-postings/` | GET | List published, active job postings |
| `/api/jobs/job-postings/{id}/`| GET | Get details for a specific job posting |

### Candidate Actions
Requires candidate authentication (`Authorization: Bearer <token>`). Endpoints automatically scope to the authenticated user's ID.

| Endpoint | Methods | Description |
|---|---|---|
| `/api/applications/applications/` | POST | Apply for a specific job posting |
| `/api/applications/applications/` | GET | View the status of the candidate's own applications |
| `/api/applications/general-applications/` | POST | Submit a general application profile |
| `/api/interviews/interviews/` | GET | View candidate's own scheduled interviews |
| `/api/onboarding/offers/` | GET, PUT | View own offer letters, accept or reject |
| `/api/onboarding/onboarding/` | GET, PUT | Update own onboarding tasks (upload docs, profile) |
| `/api/notifications/notifications/` | GET, PUT | Retrieve and mark notifications as read |

## Architecture Flow
1. **Frontend Request:** The React apps (using `axios` or `fetch`) send requests to the Django REST framework endpoints.
2. **Auth Header:** Requests must include `Authorization: Bearer <access_token>`.
3. **Backend Processing:** Django routers map the URL to the corresponding `ViewSet` or `APIView`.
4. **Response:** Data is serialized and returned as JSON, which the frontend states then consume and render.
