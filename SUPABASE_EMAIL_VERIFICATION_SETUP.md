# Supabase Email Verification Setup

This guide enables and validates email verification for the `client-ui` app using Supabase Auth.

## 1) Enable Email Provider and Confirmation

1. Open Supabase Dashboard.
2. Go to **Authentication** -> **Providers** -> **Email**.
3. Ensure **Email provider** is enabled.
4. Enable **Confirm email** (email verification required before login).
5. Save changes.

## 2) Configure Auth URLs

Open **Authentication** -> **URL Configuration**:

- **Site URL**
  - Local: `http://localhost:5173`
  - Production: `https://yourdomain.com`

- **Redirect URLs** (add all required)
  - `http://localhost:5173/verify-email`
  - `http://localhost:5173/reset-password`
  - `http://localhost:5173/login`
  - Production equivalents, for example:
    - `https://yourdomain.com/verify-email`
    - `https://yourdomain.com/reset-password`
    - `https://yourdomain.com/login`

The app uses:

- Signup verification redirect: `${window.location.origin}/verify-email`
- Reset password redirect: `${window.location.origin}/reset-password`

## 3) Configure Email Templates (Recommended)

Go to **Authentication** -> **Email Templates**:

- **Confirm signup**:
  - Keep the confirmation link placeholder supplied by Supabase
  - Ensure the template sends users through Supabase callback flow
- **Reset password**:
  - Keep recovery link placeholders intact

Do not remove required token placeholders from templates.

## 4) App Environment Variables

Create `client-ui/.env.local`:

```bash
VITE_SUPABASE_URL=https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co
VITE_SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_PUBLIC_KEY>
```

Restart app:

```bash
cd client-ui
npm run dev
```

## 5) Current App Flow

- Signup (`/signup`):
  - Creates user with `supabase.auth.signUp(...)`
  - Sends verification email with `emailRedirectTo=/verify-email`
  - Shows "check your inbox" state and supports resend email
- Verify page (`/verify-email`):
  - Reads auth session after callback
  - If verified and signed in, redirects to dashboard
- Login (`/login`):
  - If user not confirmed, shows a friendly "Please verify your email" message

## 6) Test Checklist

1. Register with a fresh email in `/signup`.
2. Confirm signup screen appears.
3. Receive email and click verification link.
4. Confirm app lands on `/verify-email` then redirects to `/dashboard`.
5. Log out and log back in with same user.
6. Try login with unverified account and verify you get the expected error message.

## 7) Troubleshooting

- **No verification email received**
  - Check spam/junk
  - Verify Email provider is enabled
  - Confirm project email sending is configured

- **Redirect blocked / invalid redirect URL**
  - Add exact URL in Supabase Redirect URLs (including protocol and path)

- **`Email not confirmed` on login even after clicking**
  - Ensure confirmation link is the latest one
  - Check `confirm email` setting and template placeholders
  - Verify callback reaches your app with correct Site URL/Redirect URLs

- **Verification page says pending**
  - Session may be expired or callback not completed
  - Reopen newest verification link or resend from signup page
