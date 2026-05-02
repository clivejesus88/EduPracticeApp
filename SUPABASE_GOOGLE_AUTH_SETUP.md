# Supabase Google Auth Setup

This guide enables Google authentication for the `client-ui` app.

## 1) Prerequisites

- A Supabase project.
- A Google Cloud project with OAuth credentials.
- Local app running at `http://localhost:5173` (or your configured Vite port).

## 2) Configure Google OAuth in Google Cloud

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Go to **APIs & Services** -> **Credentials**.
3. Click **Create Credentials** -> **OAuth client ID**.
4. Choose **Web application**.
5. Add Authorized JavaScript origins:
   - `http://localhost:5173`
   - Your production frontend URL (if any), for example `https://yourdomain.com`
6. Add Authorized redirect URIs:
   - `https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`
7. Copy the generated **Client ID** and **Client Secret**.

## 3) Configure Google Provider in Supabase

1. Open Supabase Dashboard.
2. Go to **Authentication** -> **Providers** -> **Google**.
3. Enable Google provider.
4. Paste your Google **Client ID** and **Client Secret**.
5. Save.

## 4) Configure Redirect URLs in Supabase

Open **Authentication** -> **URL Configuration** and set:

- **Site URL**
  - Local: `http://localhost:5173`
  - Production: your production frontend URL

- **Redirect URLs** (add each one)
  - `http://localhost:5173/dashboard`
  - `http://localhost:5173/login`
  - Production equivalents, for example:
    - `https://yourdomain.com/dashboard`
    - `https://yourdomain.com/login`

The app currently requests OAuth redirect to:

- `${window.location.origin}/dashboard`

## 5) Local Environment Variables

Create `client-ui/.env.local`:

```bash
VITE_SUPABASE_URL=https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co
VITE_SUPABASE_ANON_KEY=<YOUR_SUPABASE_ANON_PUBLIC_KEY>
```

Then restart Vite:

```bash
cd client-ui
npm run dev
```

## 6) Database Table (Profiles) - Recommended

If you use `UserContext` profile sync, create a `profiles` table:

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  first_name text,
  last_name text,
  school_name text,
  exam_level text,
  avatar_url text,
  daily_goal integer default 50,
  notifications boolean default true,
  two_factor boolean default false,
  created_at timestamptz default now()
);
```

Optional basic RLS:

```sql
alter table public.profiles enable row level security;

create policy "Users can read own profile"
on public.profiles
for select
using (auth.uid() = id);

create policy "Users can insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id);
```

## 7) How to Test

1. Start app and open `/login`.
2. Click **Continue with Google**.
3. Complete Google consent screen.
4. Confirm you return to `/dashboard`.
5. Confirm session persists after refresh.

## 8) Troubleshooting

- **`redirect_uri_mismatch`**  
  The callback URI in Google Cloud does not exactly match Supabase callback URL.

- **Redirect blocked in Supabase**  
  Add the exact frontend redirect URL to Supabase **Redirect URLs**.

- **Google button returns to login with error**  
  Check browser console and Supabase auth logs; verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

- **User data missing in profile UI**  
  Ensure `profiles` table exists and RLS policies allow own-row reads/writes.
