# RMS Django Backend — Setup & API Reference
## South Point School — Recruitment Management System

---

## 📁 Project Structure Created

```
rms_backend/
├── manage.py
├── requirements.txt
├── .env.example                   ← copy to .env and fill in
├── rms_backend/
│   ├── settings.py                ← PostgreSQL, JWT, CORS, security
│   ├── urls.py                    ← root URL conf
│   └── wsgi.py
└── recruitment/
    ├── models.py                  ← 14 models (User → Onboarding)
    ├── serializers.py             ← DRF serializers with validation
    ├── views.py                   ← ViewSets + auth + dashboard stats
    ├── urls.py                    ← all API routes
    ├── permissions.py             ← IsHRAdmin, IsCandidate, IsOwner
    ├── admin.py                   ← Django admin for all models
    ├── apps.py
    └── management/
        └── commands/
            └── seed_data.py       ← loads mock data from frontend
```

---

## 🚀 Step-by-Step Setup

### Step 1 — Create a virtual environment

```powershell
cd d:\MIS\RMS\demo-1\rms_backend
python -m venv venv
venv\Scripts\activate
```

### Step 2 — Install dependencies

```powershell
pip install -r requirements.txt
```

### Step 3 — Create PostgreSQL database

Open `psql` (PostgreSQL shell):

```sql
CREATE DATABASE rms_db;
CREATE USER rms_user WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE rms_db TO rms_user;
ALTER DATABASE rms_db OWNER TO rms_user;

```

### Step 4 — Create your `.env` file

```powershell
copy .env.example .env
```

Edit `.env`:

```ini
SECRET_KEY=your-50-character-random-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=rms_db
DB_USER=rms_user
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432

CORS_ORIGINS=http://localhost:5173,http://localhost:5174,https://admin-dashboard-eto9.onrender.com,https://career-page-ksip.onrender.com

ACCESS_TOKEN_LIFETIME=60
REFRESH_TOKEN_LIFETIME=1440
```

### Step 5 — Run migrations

```powershell
python manage.py makemigrations
python manage.py migrate
```

### Step 6 — Seed the database

```powershell
python manage.py seed_data
```

This loads all mock data (roles, postings, panelists) and creates 3 test users:

| User | Email | Password | Role |
|---|---|---|---|
| HR Admin | `hr@southpoint.edu` | `Admin@123` | admin |
| Panelist | `panelist@southpoint.edu` | `Panel@123` | admin |
| Candidate | `priya.sharma@email.com` | `Priya@123` | candidate |

### Step 7 — Create Django superuser (for /admin panel)

```powershell
python manage.py createsuperuser
```

### Step 8 — Start the server

```powershell
python manage.py runserver
```

API is live at: **http://localhost:8000/api/**
Django Admin: **http://localhost:8000/admin/**

---

## 📡 Full API Endpoint Reference

### 🔐 Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register/` | None | Candidate signup |
| POST | `/api/auth/login/` | None | Get JWT tokens (access + refresh) |
| POST | `/api/auth/token/refresh/` | None | Refresh access token |
| POST | `/api/auth/logout/` | JWT | Blacklist refresh token |
| GET/PUT | `/api/auth/me/` | JWT | View/update own profile |
| POST | `/api/auth/change-password/` | JWT | Change password |

**Login Request:**
```json
POST /api/auth/login/
{ "email": "hr@southpoint.edu", "password": "Admin@123" }
```
**Login Response:**
```json
{ "access": "eyJ...", "refresh": "eyJ..." }
```

---

### 📊 Dashboard

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/dashboard/stats/` | Admin | KPI counts for dashboard cards |

**Response:**
```json
{
  "open_positions": 2,
  "pending_approvals": 3,
  "total_applicants": 47,
  "interviews_scheduled": 5,
  "offers_released": 3,
  "new_joiners": 2,
  "pipeline": { "applied": 30, "shortlisted": 18, "selected": 4, "offered": 3 }
}
```

---

### 🏷️ Existing Roles (Admin → "Existing Roles")

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/roles/` | List all roles |
| POST | `/api/roles/` | Create new role |
| GET | `/api/roles/{id}/` | Get role details |
| PUT/PATCH | `/api/roles/{id}/` | Update role |
| DELETE | `/api/roles/{id}/` | Delete role |
| GET | `/api/roles/departments/` | List unique departments |
| GET | `/api/roles/summary/` | Headcount summary |

---

### 📋 Role Requests (Admin → "Role Requests")

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/role-requests/` | List all |
| POST | `/api/role-requests/` | Create |
| PATCH | `/api/role-requests/{id}/update_status/` | Approve/Reject |

---

### 💼 Job Requests (Admin → "Job Requests")

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/job-requests/` | List all |
| POST | `/api/job-requests/` | Create |
| PATCH | `/api/job-requests/{id}/update_status/` | Approve/Reject |

---

### ✅ Approval Requests (Admin → "Approve Request")

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/approvals/` | List all approvals |
| POST | `/api/approvals/{id}/action/` | Approve / Reject / Send Back |

**Action Request:**
```json
POST /api/approvals/1/action/
{
  "action": "Approve",
  "acted_by": "Principal",
  "note": "Approved for next semester"
}
```

---

### 📢 Job Postings (Admin + Career Page)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/job-postings/public/` | None | Public job board (career page) |
| GET | `/api/job-postings/` | Admin | All postings |
| POST | `/api/job-postings/` | Admin | Create posting |
| PATCH | `/api/job-postings/{id}/` | Admin | Update posting |
| POST | `/api/job-postings/{id}/publish/` | Admin | Publish |
| POST | `/api/job-postings/{id}/unpublish/` | Admin | Unpublish |

**Career page query params:**
```
GET /api/job-postings/public/?category=Academic+Positions&q=math
```

---

### 📝 Applications (Admin → "Applications" + Career Page)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/applications/` | JWT | Admin: all; Candidate: own |
| POST | `/api/applications/` | Candidate | Submit job application |
| GET | `/api/applications/mine/` | Candidate | Own applications dashboard |
| PATCH | `/api/applications/{id}/update_status/` | Admin | Change status + notify |

**Apply for a job:**
```json
POST /api/applications/
{
  "posting": 1,
  "cover_letter": "I am passionate about mathematics...",
  "notice_period": "30 days",
  "has_referral": false
}
```

---

### 🌐 General Applications (Career Page → "Submit Profile")

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/general-applications/` | Candidate | Submit general profile |
| GET | `/api/general-applications/mine/` | Candidate | Own general applications |
| GET | `/api/general-applications/` | Admin | View talent pool |

---

### 👥 Panelists (Admin → "Panelist")

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/panelists/` | List active panelists |
| POST | `/api/panelists/` | Add panelist |
| PUT/PATCH | `/api/panelists/{id}/` | Update |
| DELETE | `/api/panelists/{id}/` | Soft-delete |

---

### 🗓️ Interviews (Admin → "Interview Panel" + Career Page)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/interviews/` | JWT | All (admin) / own (candidate) |
| POST | `/api/interviews/` | Admin | Schedule interview |
| PATCH | `/api/interviews/{id}/` | Admin | Update details |
| PATCH | `/api/interviews/{id}/score/` | JWT | Submit score + recommendation |
| GET | `/api/interviews/upcoming/` | JWT | Upcoming interviews |

**Schedule interview:**
```json
POST /api/interviews/
{
  "application": 1,
  "candidate_name": "Priya Sharma",
  "role": "Mathematics Teacher",
  "date": "2026-07-10",
  "time": "10:00:00",
  "panel": [1, 2],
  "mode": "Online",
  "meeting_link": "https://meet.google.com/abc-xyz",
  "round": 1
}
```

---

### 📨 Offers (Admin → "Offer Management" + Career Page)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/offers/` | JWT | All (admin) / own (candidate) |
| POST | `/api/offers/` | Admin | Create offer |
| PATCH | `/api/offers/{id}/` | Admin | Update CTC, dates, status |
| POST | `/api/offers/{id}/accept/` | Candidate | Accept offer → triggers onboarding |
| POST | `/api/offers/{id}/decline/` | Candidate | Decline offer |

---

### 🎓 Onboarding (Admin → "Onboarding")

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/onboarding/` | JWT | All (admin) / own (candidate) |
| PATCH | `/api/onboarding/{id}/tasks/` | Admin | Update checklist tasks |

**Update tasks:**
```json
PATCH /api/onboarding/1/tasks/
{
  "task_profile": true,
  "task_offer": true,
  "task_docs_upload": true
}
```

---

### 🔔 Notifications (Career Page → Candidate Dashboard)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/notifications/` | Own notifications |
| PATCH | `/api/notifications/{id}/mark_read/` | Mark one read |
| PATCH | `/api/notifications/mark_all_read/` | Mark all read |

---

## 🔗 Connecting Frontends

### Admin Dashboard — Replace localStorage

```typescript
// services/api.ts
const BASE = 'http://localhost:8000/api';
const token = () => localStorage.getItem('access_token');

export const api = {
  get:   (url: string) => fetch(`${BASE}${url}`, { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.json()),
  post:  (url: string, body: any) => fetch(`${BASE}${url}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify(body) }).then(r => r.json()),
  patch: (url: string, body: any) => fetch(`${BASE}${url}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` }, body: JSON.stringify(body) }).then(r => r.json()),
};

// Example: replace hardcoded APPROVALS with:
const [approvalRequests, setApprovalRequests] = useState([]);
useEffect(() => { api.get('/approvals/').then(setApprovalRequests); }, []);
```

### Career Page — Auth + Job Listings

```typescript
// Login
const res = await fetch('http://localhost:8000/api/auth/login/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
const { access, refresh } = await res.json();
localStorage.setItem('access_token', access);

// Public job board (no auth needed)
const jobs = await fetch('http://localhost:8000/api/job-postings/public/').then(r => r.json());
```

---

> [!TIP]
> Use the Django admin at `/admin/` to manually add/edit data while developing. Login with the superuser you created.

> [!IMPORTANT]
> When deploying to Render/Railway: set all `.env` variables as Environment Variables in the platform dashboard. Set `DEBUG=False` and update `ALLOWED_HOSTS` to your production domain.

> [!NOTE]
> The career page already pings `https://career-page-ksip.onrender.com`. You can deploy this Django backend as a new Render Web Service (Python), add a Render PostgreSQL database, and point `DB_*` env vars to it.
