# 🚨 Google OAuth Fix - Redirect URI Issue

## Problem
Google OAuth is failing with: *"You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy."*

## Root Cause
The redirect URI `https://uwleuknnerwyvfhxgqbx.supabase.co/auth/v1/callback` is not registered in your Google Cloud Console.

## ⚡ Quick Fix Steps

### Step 1: Add Missing Redirect URI to Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services > Credentials**
3. Find your OAuth 2.0 Client ID for EduPracticeApp
4. Click **Edit** (pencil icon)
5. In **Authorized redirect URIs**, add:
   ```
   https://uwleuknnerwyvfhxgqbx.supabase.co/auth/v1/callback
   ```
6. Click **Save**

### Step 2: Verify Supabase Configuration

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **Authentication > Providers > Google**
3. Ensure the **Authorized Redirect URI** shows:
   ```
   https://uwleuknnerwyvfhxgqbx.supabase.co/auth/v1/callback
   ```

### Step 3: Test the Fix

1. Wait 2-3 minutes for Google's changes to propagate
2. Try signing in with Google again
3. The OAuth flow should now work correctly

## 🔍 Why This Happened

Supabase uses its own callback URI (`https://[PROJECT-ID].supabase.co/auth/v1/callback`) to handle the OAuth response, then redirects to your app's callback (`/auth/callback`). Google requires all possible redirect URIs to be explicitly registered for security.

## 📋 Complete Redirect URI List

Your Google Cloud Console should have all these URIs:

```
http://localhost:5003/auth/callback
http://localhost:3000/auth/callback
https://appedupractice.vercel.app/auth/callback
https://uwleuknnerwyvfhxgqbx.supabase.co/auth/v1/callback
```

## ⚠️ Important Notes

- The Supabase callback URI is **different** from your app's callback URI
- Google requires **both** URIs to be registered
- Changes in Google Cloud Console can take a few minutes to propagate
- Make sure there are no trailing slashes or typos in the URIs

## 🚀 After the Fix

Once you add the missing redirect URI, the OAuth flow will work:
1. User clicks "Continue with Google"
2. Google redirects to: `https://uwleuknnerwyvfhxgqbx.supabase.co/auth/v1/callback`
3. Supabase processes the OAuth response
4. Supabase redirects to your app: `https://appedupractice.vercel.app/auth/callback`
5. User is successfully authenticated

---

**This is the only fix needed - no code changes required!**
