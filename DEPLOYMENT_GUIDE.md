# Spendo — Deployment Guide (Vercel Only)

**Everything is free, no expiry.**

| Piece | Platform | Cost |
|---|---|---|
| Frontend (React/Vite) | Vercel project 1 | Free |
| Backend (Express) | Vercel project 2 | Free |
| Database (PostgreSQL) | Vercel Postgres (Neon) | Free |

---

## Step 1 — Push to GitHub

```bash
git add .
git commit -m "ready for deployment"
git push
```

---

## Step 2 — Deploy the Backend on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. On the configuration screen:
   - **Root Directory** → `backend`
   - **Framework Preset** → Other
   - Leave build command empty
4. Click **Deploy**

### 2a — Add a Postgres Database

1. In your **backend project** on Vercel → go to the **Storage** tab
2. Click **Create Database** → choose **Postgres**
3. Name it anything (e.g. `spendo-db`) → click **Create**
4. Vercel automatically adds `POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, etc. to your backend project — nothing to configure

### 2b — Add environment variables to the backend

Go to your backend Vercel project → **Settings** → **Environment Variables** → add:

| Name | Value |
|---|---|
| `JWT_SECRET` | A long random string — type anything like `spendo_super_secret_2026_xyz` |
| `FRONTEND_URL` | Leave blank for now — you'll fill this after Step 3 |

Click **Redeploy** after adding variables.

### 2c — Get your backend URL

Go to your backend project on Vercel → **Deployments** → copy the production URL.
It looks like: `https://spendo-backend.vercel.app`

---

## Step 3 — Deploy the Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import the **same** GitHub repo again
3. On the configuration screen:
   - **Root Directory** → `frontend`
   - **Framework Preset** → Vite (auto-detected)
4. Under **Environment Variables**, add:

   | Name | Value |
   |---|---|
   | `VITE_API_URL` | `https://YOUR-BACKEND-URL.vercel.app/api` |

5. Click **Deploy**
6. Copy your frontend URL — it looks like `https://spendo.vercel.app`

### 3a — Update CORS on the backend

Go back to your **backend** Vercel project → **Settings** → **Environment Variables** → set:

```
FRONTEND_URL = https://spendo.vercel.app
```

Then go to **Deployments** → click the three dots on the latest deployment → **Redeploy**.

---

## Step 4 — Import your existing data

Your local `backend/exports/` folder has all your data. Run this from your machine:

```bash
# Install Vercel CLI (one-time)
npm install -g vercel

# Login
vercel login

# Link to your backend project
cd backend
vercel link      # select your backend project when prompted

# Run the import (uses your Vercel Postgres credentials automatically)
vercel env pull .env.local        # downloads the production env vars to a local file
node import-data.js               # runs import using those credentials
```

---

## Step 5 — Verify

1. Open your frontend Vercel URL in a browser
2. Log in with your existing credentials
3. Your dashboard should show all your previous data
4. Test on mobile — the bottom tab bar should appear

---

## Local Development (unchanged)

```bash
# Backend
cd backend
node server.js        # uses local SQLite

# Frontend (separate terminal)
cd frontend
npm run dev           # http://localhost:5173
```

Backend `.env`:
```
JWT_SECRET=any-local-secret
PORT=5000
```

Frontend `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

---

## Updating after go-live

```bash
git add .
git commit -m "your update"
git push
```

Both Vercel projects redeploy automatically.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Blank page on frontend | Check `vercel.json` is in `frontend/` with the rewrite rule |
| CORS error on API calls | Make sure `FRONTEND_URL` on backend matches your Vercel frontend URL exactly (no trailing slash) |
| 500 error on first load | DB schema is created automatically on first request — wait 10s and refresh |
| Login fails after import | Confirm the `Users` table was imported (check Vercel Postgres dashboard) |
