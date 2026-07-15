# Google OAuth 2.0 Setup Guide — CareerPilot AI

## Prerequisites

- A Google account
- Server running on `http://localhost:5000`
- Client running on `http://localhost:5173`

---

## Step 1 — Create a Google Cloud Project

1. Go to **[console.cloud.google.com](https://console.cloud.google.com)**
2. Click the project dropdown (top-left, next to "Google Cloud")
3. Click **New Project**
4. Project name: `CareerPilot AI`
5. Click **Create** and wait for it to activate
6. Make sure the new project is selected in the dropdown

---

## Step 2 — Enable Required APIs

1. Left sidebar → **APIs & Services** → **Library**
2. Search for **"Google+ API"** or **"Google People API"** → Enable it
   *(This is needed for profile/photo access)*

---

## Step 3 — Configure the OAuth Consent Screen

> **This is the most common source of "Access blocked" errors.**

1. Left sidebar → **APIs & Services** → **OAuth consent screen**
2. User Type: **External** → **Create**
3. Fill in the required fields:
   - **App name**: `CareerPilot AI`
   - **User support email**: your Gmail address
   - **Developer contact information**: your Gmail address
4. Click **Save and Continue**
5. On the **Scopes** screen → click **Save and Continue** (no extra scopes needed)
6. On the **Test Users** screen:
   - Click **+ Add Users**
   - Add **your Gmail address** (and any other emails you want to test with)
   - Click **Add** → **Save and Continue**
   > ⚠️ While your app is in **Testing** mode, ONLY emails in this list can use Google Sign-In.
   > Everyone else gets "Access blocked: CareerPilot AI has not completed the Google verification process."
7. Click **Back to Dashboard**

---

## Step 4 — Create OAuth 2.0 Credentials

1. Left sidebar → **APIs & Services** → **Credentials**
2. Click **+ Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `CareerPilot AI Dev`
5. Under **Authorized JavaScript origins** (optional but recommended):
   ```
   http://localhost:5173
   ```
6. Under **Authorized redirect URIs** — click **+ Add URI**:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
   > ⚠️ This must match **exactly** what you set in `GOOGLE_CALLBACK_URL` in `.env`
7. Click **Create**
8. A dialog appears with your credentials — **copy both values now**:
   - **Client ID** (looks like: `123456789-abc123xyz.apps.googleusercontent.com`)
   - **Client Secret** (looks like: `GOCSPX-AbCdEfGhIjKlMnOpQr`)

---

## Step 5 — Add Credentials to server/.env

Open `server/.env` and replace the placeholder values:

```env
GOOGLE_CLIENT_ID=123456789-abc123xyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-AbCdEfGhIjKlMnOpQr
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

> ❗ Never commit `.env` to Git. It's in `.gitignore`.

---

## Step 6 — Restart the Server

```bash
cd server
npm run dev
```

When Google is configured correctly, you'll see:
```
[Passport] ✅ Google OAuth configured → callback: http://localhost:5000/api/auth/google/callback
```

When credentials are missing, you'll see:
```
[Passport] ⚠️  Google OAuth NOT configured.
            Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to server/.env
```

---

## Step 7 — Test It

1. Open `http://localhost:5173/login`
2. Click **Continue with Google**
3. Google's consent screen should appear showing **CareerPilot AI**
4. Sign in with your Test User email
5. You should be redirected to `/dashboard` ✅

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `Google Sign-In is not configured on this server` | Missing/placeholder credentials in `.env` | Add real `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` |
| `Access blocked: Authorization Error` | Client ID doesn't match any Google project | Paste the Client ID from the Credentials page in Google Cloud |
| `Access blocked: CareerPilot AI has not completed the Google verification process` | App is in Testing mode; your email isn't a Test User | Add your email to the Test Users list in OAuth consent screen |
| `redirect_uri_mismatch` | Authorized redirect URI in Google Cloud doesn't match your `GOOGLE_CALLBACK_URL` | Make sure both say `http://localhost:5000/api/auth/google/callback` |
| `invalid_client` | Client Secret is wrong or expired | Regenerate the secret in Google Cloud Credentials |
| `Error 400: redirect_uri_mismatch` | You have a trailing slash or typo | Remove trailing slash from both the env var and Google Cloud |

---

## Production Setup

When deploying to production:

1. In **Credentials**, edit your OAuth client and add:
   ```
   https://yourdomain.com/api/auth/google/callback
   ```
2. Update your production `.env`:
   ```env
   SERVER_URL=https://yourdomain.com
   CLIENT_URL=https://yourdomain.com
   GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
   ```
3. In the **OAuth consent screen** → click **Publish App** to allow all Google users (not just Test Users)
4. If your app is published for general use, you may need to go through Google's app verification process
