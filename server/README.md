# CareerPilot AI

Premium AI-powered career guidance platform built with React, Vite, Tailwind CSS, Framer Motion, Express, MongoDB, JWT auth, and Gemini AI.

## Quick Start

```bash
npm run install:all
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000`

## Environment

Copy the example files and fill production values:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

## Deployment

- Frontend: deploy `client` to Vercel.
- Backend: deploy `server` to Render.
- Database: use MongoDB Atlas and set `MONGO_URI`.
- AI: set `GEMINI_API_KEY`.

The backend includes graceful demo fallbacks when MongoDB or Gemini are not configured, so the portfolio experience remains usable during local demos.

## Authentication

Authentication is real API-based auth. The frontend no longer creates fake demo sessions if the backend is down.

When `MONGO_URI` is configured, users are stored in MongoDB with bcrypt-hashed passwords. When MongoDB is not configured, the backend uses a local encrypted development store at `server/data/users.json` so signup/login still works on your machine.

Admin access is limited by `ADMIN_EMAIL`.

Default local admin:

```txt
Email: rohit@example.com
Password: Admin12345
```

Create that account from Signup, or change `ADMIN_EMAIL` in `server/.env` before signing up.
