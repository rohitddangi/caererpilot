# CareerPilot AI — Server Environment Setup Guide

This guide walks you through filling in the required values in `server/.env`.

## Step 1 — Generate JWT Secrets

Run these two commands in your terminal (PowerShell or CMD). Use the **first** output for `JWT_SECRET` and the **second** (different) output for `JWT_REFRESH_SECRET`:

```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Paste the results into `server/.env`:
```env
JWT_SECRET=<paste first output here>
JWT_REFRESH_SECRET=<paste second (different) output here>
```

> ⚠️ **Never share these secrets or commit them to Git.**

---

## Step 2 — Connect to MongoDB Atlas (Optional)

If you want to use a real database instead of the local JSON fallback:

1. Log in at https://cloud.mongodb.com
2. Select your cluster → **Connect** → **Drivers**
3. Copy the connection string and replace `<username>`, `<password>`, and `<dbname>`

```env
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASS@YOUR_CLUSTER.mongodb.net/careerpilot?retryWrites=true&w=majority
```

> If `MONGO_URI` is left as a placeholder, the server automatically falls back to a local JSON file (`server/data/users.json`). Auth still works in this mode.

---

## Step 3 — Configure Google OAuth (Optional)

Follow the Google Cloud Console steps in the comments inside `server/.env`:

```env
GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-client-secret>
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

If these are left as placeholders, Google Sign-In shows a user-friendly error and falls back gracefully.

---

## Step 4 — Email Configuration (Optional)

Leave blank in development — the server creates a free **Ethereal** test account and prints email preview links to the console. No real emails are sent.

```env
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
```

For production, use Gmail App Password or Resend.com (see comments in `.env`).

---

## Step 5 — Set Admin Email

The first account to register with this email automatically gets the `admin` role:

```env
ADMIN_EMAIL=your-email@gmail.com
```

---

## Step 6 — Add Your Gemini API Key

Required for AI features (roadmap generation, skill gap analysis, etc.):

```env
GEMINI_API_KEY=<your-gemini-api-key>
```

Get your key at: https://makersuite.google.com/app/apikey

---

## Running the App

```powershell
# Terminal 1 — Start the backend
cd "CareerPilot AI/server"
npm run dev

# Terminal 2 — Start the frontend
cd "CareerPilot AI/client"
npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:5000/api/health
