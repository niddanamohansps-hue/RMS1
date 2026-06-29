# Database Schema Documentation

This document outlines the core database schema used by the Recruitment Management System (RMS) backend. The schema for each module is represented in JSON format below.

---

## 1. Users Database Schema
Extends Django's built-in User model. Includes profiles for candidates linked via a 1-to-1 relationship.

```json
{
  "Users_App": {
    "User": {
      "description": "Email is used as the unique identifier for authentication.",
      "fields": {
        "id": { "type": "Primary Key", "attributes": "Auto-increment" },
        "email": { "type": "String(254)", "attributes": "Unique, Required" },
        "password": { "type": "String(128)", "attributes": "Required" },
        "first_name": { "type": "String(150)", "attributes": "Required" },
        "last_name": { "type": "String(150)", "attributes": "Required" },
        "role": { "type": "String(20)", "attributes": "Default: 'candidate', Choices: ['admin', 'candidate']" },
        "phone": { "type": "String(20)", "attributes": "Blank" }
      }
    },
    "CandidateProfile": {
      "description": "Extended profile for candidates.",
      "fields": {
        "id": { "type": "Primary Key", "attributes": "Auto-increment" },
        "user_id": { "type": "Foreign Key", "attributes": "1-to-1 (users)" },
        "current_location": { "type": "String(200)", "attributes": "Blank" },
        "educational_qualification": { "type": "String(200)", "attributes": "Blank" },
        "years_of_experience": { "type": "String(20)", "attributes": "Choices" },
        "skills": { "type": "JSONField", "attributes": "Default: []" },
        "resume": { "type": "FileField", "attributes": "Blank" },
        "created_at": { "type": "DateTime", "attributes": "Auto-managed" },
        "updated_at": { "type": "DateTime", "attributes": "Auto-managed" }
      }
    }
  }
}
```

---

## 2. Jobs Database Schema
Handles organizational roles, categorizations, internal requests, and public job postings.

```json
{
  "Jobs_App": {
    "JobCategory": {
      "description": "Categories for grouping jobs.",
      "fields": {
        "id": { "type": "Primary Key", "attributes": "Auto-increment" },
        "name": { "type": "String(100)", "attributes": "Unique" },
        "description": { "type": "Text", "attributes": "Blank" }
      }
    },
    "ExistingRole": {
      "description": "Master list of organizational roles and current headcount.",
      "fields": {
        "role_id": { "type": "String(30)", "attributes": "Unique" },
        "department": { "type": "String(100)", "attributes": "Choices" },
        "role": { "type": "String(200)", "attributes": "Required" },
        "headcount": { "type": "Integer", "attributes": "Default: 1" },
        "filled": { "type": "Integer", "attributes": "Default: 0" },
        "status": { "type": "String(20)", "attributes": "Default: 'Active'" }
      }
    },
    "JobPosting": {
      "description": "Public-facing job advertisements.",
      "fields": {
        "posting_id": { "type": "String(30)", "attributes": "Unique" },
        "role": { "type": "String(200)", "attributes": "Required" },
        "category_id": { "type": "Foreign Key", "attributes": "To job_categories" },
        "status": { "type": "String(20)", "attributes": "Default: 'Unpublished'" },
        "channel": { "type": "String(20)", "attributes": "Default: 'External'" },
        "deadline": { "type": "String(100)", "attributes": "Blank" },
        "job_request_id": { "type": "Foreign Key", "attributes": "To job_requests" }
      }
    }
  }
}
```

---

## 3. Applications Database Schema
Manages candidate applications for specific jobs as well as general talent pool submissions.

```json
{
  "Applications_App": {
    "JobApplication": {
      "description": "Tracks applications applied against specific job postings.",
      "fields": {
        "app_id": { "type": "String(30)", "attributes": "Unique" },
        "candidate_id": { "type": "Foreign Key", "attributes": "To users" },
        "posting_id": { "type": "Foreign Key", "attributes": "To job_postings" },
        "status": { "type": "String(20)", "attributes": "Default: 'Applied'" },
        "has_referral": { "type": "Boolean", "attributes": "Default: False" },
        "applied_date": { "type": "Date", "attributes": "Auto-add" }
      }
    },
    "GeneralApplication": {
      "description": "For general talent pool applications without a specific job posting.",
      "fields": {
        "app_id": { "type": "String(30)", "attributes": "Unique" },
        "candidate_id": { "type": "Foreign Key", "attributes": "To users" },
        "status": { "type": "String(20)", "attributes": "Default: 'Applied'" }
      }
    }
  }
}
```

---

## 4. Interviews Database Schema
Maintains internal panelists and interview scheduling details against applications.

```json
{
  "Interviews_App": {
    "Interview": {
      "description": "Scheduled interviews linked to applications.",
      "fields": {
        "interview_id": { "type": "String(30)", "attributes": "Unique" },
        "application_id": { "type": "Foreign Key", "attributes": "To job_applications" },
        "date": { "type": "Date", "attributes": "Required" },
        "time": { "type": "Time", "attributes": "Required" },
        "status": { "type": "String(20)", "attributes": "Default: 'Scheduled'" },
        "recommendation": { "type": "String(20)", "attributes": "Blank" }
      }
    },
    "Panelist": {
      "description": "Company employees who conduct interviews.",
      "fields": {
        "id": { "type": "Primary Key", "attributes": "Auto-increment" },
        "name": { "type": "String(200)", "attributes": "Required" },
        "email": { "type": "String(254)", "attributes": "Unique" }
      }
    }
  }
}
```

---

## 5. Onboarding Database Schema
Handles generated offers, status tracking, and onboarding action items.

```json
{
  "Onboarding_App": {
    "Offer": {
      "description": "Generated offer letters for selected candidates.",
      "fields": {
        "offer_id": { "type": "String(30)", "attributes": "Unique" },
        "candidate_id": { "type": "Foreign Key", "attributes": "To users" },
        "status": { "type": "String(20)", "attributes": "Default: 'Draft'" },
        "ctc": { "type": "String(100)", "attributes": "Blank" },
        "offer_letter": { "type": "FileField", "attributes": "Blank" }
      }
    },
    "OnboardingRecord": {
      "description": "Tracking post-acceptance onboarding tasks.",
      "fields": {
        "record_id": { "type": "String(30)", "attributes": "Unique" },
        "offer_id": { "type": "Foreign Key", "attributes": "1-to-1 to offers" },
        "status": { "type": "String(30)", "attributes": "Default: 'Docs Pending'" },
        "task_flags": { "type": "Boolean", "attributes": "Tracks individual onboarding tasks" }
      }
    }
  }
}
```

---

## 6. Notifications Database Schema
Records system-generated alerts dynamically delivered to various recipients.

```json
{
  "Notifications_App": {
    "Notification": {
      "description": "In-app alerts for users and admins.",
      "fields": {
        "id": { "type": "Primary Key", "attributes": "Auto-increment" },
        "recipient_id": { "type": "Foreign Key", "attributes": "To users" },
        "type": { "type": "String(30)", "attributes": "Choices" },
        "message": { "type": "Text", "attributes": "Required" },
        "is_read": { "type": "Boolean", "attributes": "Default: False" }
      }
    }
  }
}
```
