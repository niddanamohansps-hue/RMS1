# Django Backend API Deployment Guide

This guide walks you through deploying the `rms_backend` API as a production-ready web service on **Render** (or similar platforms like Railway/Heroku) with a **PostgreSQL** database.

---

## 🛠️ Step 1: Add a Build Script

To ensure dependencies are installed, static files are compiled (for the Django Admin panel), and database migrations are automatically applied on every deployment, create a `build.sh` script in the root of the `rms_backend` directory.

### 1. Create [build.sh](file:///c:/Users/Mohan/Desktop/demo/mohan/rms_backend/build.sh)
Write the following contents:
```bash
#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Collect static files (for Django admin)
python manage.py collectstatic --no-input
```

### 2. Make the script executable (Mac/Linux users, or run via git bash/wsl):
```bash
chmod +x build.sh
```

---

## 📦 Step 2: Set up a PostgreSQL Database on Render

1. Log in to your **[Render Dashboard](https://dashboard.render.com/)**.
2. Click **New** -> **PostgreSQL**.
3. Fill in the database details:
   - **Name**: `rms-db`
   - **Database**: `rms_db`
   - **User**: `rms_user`
4. Choose the **Free** instance type (or standard).
5. Click **Create Database**.
6. Once the database is created, find and copy the **Internal Database URL** or connection details (Host, Database Name, User, Password, Port).

---

## 🚀 Step 3: Deploy the Backend Web Service on Render

1. From the Render Dashboard, click **New** -> **Web Service**.
2. Connect your Git Repository containing the workspace.
3. Configure the Web Service settings:
   - **Name**: `rms-backend`
   - **Root Directory**: `rms_backend` (Crucial! This tells Render that the Django project is in the `rms_backend` subdirectory of the workspace)
   - **Runtime**: `Python`
   - **Build Command**: `./build.sh`
   - **Start Command**: `gunicorn rms_backend.wsgi:application`
   - **Instance Type**: `Free` (or standard)
4. Click **Advanced** to add Environment Variables.

---

## ⚙️ Step 4: Add Environment Variables

In the **Environment Variables** section of your Render Web Service dashboard, add the following variables (matching the keys in the `.env` file):

| Environment Variable | Recommended Production Value |
|---|---|
| `SECRET_KEY` | *A random 50-character string (e.g. `django-insecure-...` or generated)* |
| `DEBUG` | `False` |
| `ALLOWED_HOSTS` | `rms-backend.onrender.com` *(Replace with your actual Render URL)* |
| `DB_NAME` | `rms_db` |
| `DB_USER` | `rms_user` |
| `DB_PASSWORD` | *(Your Render PostgreSQL Password)* |
| `DB_HOST` | *(Your Render PostgreSQL Internal Host)* |
| `DB_PORT` | `5432` |
| `CORS_ORIGINS` | `http://localhost:5173,https://your-career-page.onrender.com` *(Comma-separated URLs of your deployed frontends)* |

*Note: You can easily copy these values from the Render PostgreSQL connection info page.*

---

## 🔄 Step 5: Final Deploy & Verify

1. Click **Create Web Service**. Render will pull the code, execute `./build.sh` (installing requirements, running migrations), and spin up the server via Gunicorn.
2. Once the deploy completes successfully and is marked **Live**, verify the endpoints:
   - Go to `https://<your-service-name>.onrender.com/admin/` to verify the Django Admin dashboard loads.
   - Go to `https://<your-service-name>.onrender.com/api/job-postings/public/` in the browser to verify it returns the active job list successfully!

---

## 🔗 Step 6: Link Frontend Apps to the Deployed API

Once the backend is live, update the API Base URL in your frontend applications to point to your new production URL:
```typescript
// Replace:
const BASE = 'http://localhost:8000/api';

// With:
const BASE = 'https://rms-backend.onrender.com/api';
```
This connects the frontend dashboards and career portals to the cloud database!
