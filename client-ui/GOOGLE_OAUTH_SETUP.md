# Google OAuth Setup for Supabase - EduPracticeApp

This guide will help you configure Google OAuth authentication in Supabase for the EduPracticeApp project, following Supabase official documentation.

## 📋 Prerequisites

- Supabase project created
- Google Cloud Console account
- Admin access to both Supabase and Google Cloud Console

## 🔧 Step 1: Configure Google Cloud Console

### 1.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your **Project ID** (you'll need this later)

### 1.2 Enable Google+ API

1. In your Google Cloud project, go to **APIs & Services > Library**
2. Search for **"Google+ API"** or **"People API"**
3. Click **Enable** (required for user profile information)

### 1.3 Create OAuth 2.0 Credentials

1. Go to **APIs & Services > Credentials**
2. Click **+ CREATE CREDENTIALS > OAuth 2.0 Client ID**
3. Configure the OAuth consent screen first if prompted:
   - **Application Type**: Web application
   - **Application Name**: EduPracticeApp
   - **User Support Email**: Your email
   - **Developer Contact**: Your email
4. Create the OAuth 2.0 Client ID:
   - **Application Type**: Web application
   - **Name**: EduPracticeApp Web Client
   - **Authorized JavaScript origins**: 
     ```
     http://localhost:5003
     http://localhost:3000
     https://appedupractice.vercel.app
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:5003/auth/callback
     http://localhost:3000/auth/callback
     https://appedupractice.vercel.app/auth/callback
     ```
5. Click **Create**
6. **Copy your Client ID and Client Secret** - you'll need these for Supabase

## 🔐 Step 2: Configure Supabase

### 2.1 Enable Google Provider in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication > Providers**
4. Find **Google** in the providers list
5. Toggle **Enable** to turn on Google authentication

### 2.2 Configure Google Provider Settings

In the Google provider configuration, enter:

- **Client ID**: Your Google OAuth 2.0 Client ID
- **Client Secret**: Your Google OAuth 2.0 Client Secret
- **Authorized Redirect URI**: (This should match what you set in Google Cloud)
  ```
  https://[YOUR-SUPABASE-PROJECT-ID].supabase.co/auth/v1/callback
  ```

### 2.3 Configure Site URL

1. In Supabase, go to **Settings > General**
2. Set **Site URL** to your application URL:
   - Development: `http://localhost:5003`
   - Production: `https://appedupractice.vercel.app`

## ⚙️ Step 3: Environment Configuration

### 3.1 Update Environment Variables

Create or update your `.env` file in the client-ui directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://[YOUR-SUPABASE-PROJECT-ID].supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: For development
VITE_SUPABASE_DEV_URL=http://localhost:54321
VITE_SUPABASE_DEV_ANON_KEY=your-dev-anon-key
```

### 3.2 Update Supabase Client Configuration

Ensure your `supabaseClient.js` is configured correctly:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
```

## 🧪 Step 4: Test Configuration

### 4.1 Development Testing

1. Start your development server:
   ```bash
   cd client-ui
   npm run dev
   ```

2. Navigate to `http://localhost:5003`
3. Click **"Continue with Google"**
4. Complete the Google OAuth flow
5. Verify successful redirect to dashboard

### 4.2 Production Testing

1. Deploy your application to Vercel
2. Navigate to `https://appedupractice.vercel.app`
3. Test the Google OAuth flow
4. Verify authentication works in production

## 🔍 Step 5: Troubleshooting

### Common Issues and Solutions

#### Issue 1: "Invalid redirect_uri" Error
**Solution**: Ensure the redirect URI in Google Cloud Console matches exactly:
```
https://[YOUR-SUPABASE-PROJECT-ID].supabase.co/auth/v1/callback
```

#### Issue 2: "OAuth state parameter is invalid" Error
**Solution**: This is now fixed in the latest code with enhanced state validation.

#### Issue 3: "API key not valid" Error
**Solution**: Verify your Supabase URL and anon key are correct in environment variables.

#### Issue 4: CORS Issues
**Solution**: Ensure your domain is added to Supabase CORS settings:
- Go to **Settings > API > CORS**
- Add your development and production URLs

### Debug Tools

1. **Browser Console**: Check for JavaScript errors
2. **Network Tab**: Monitor OAuth requests and responses
3. **Supabase Logs**: Go to **Authentication > Logs** in Supabase dashboard

## 🚀 Step 6: Production Deployment

### 6.1 Vercel Environment Variables

Add these environment variables in your Vercel dashboard:

```
VITE_SUPABASE_URL=https://[YOUR-SUPABASE-PROJECT-ID].supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 6.2 Domain Verification

1. In Google Cloud Console, add your production domain to authorized origins
2. Update Supabase site URL to your production domain
3. Test the complete OAuth flow in production

## 📝 Step 7: Security Best Practices

### 7.1 Environment Security
- Never commit `.env` files to version control
- Use different keys for development and production
- Regularly rotate your OAuth secrets

### 7.2 OAuth Configuration
- Enable **PKCE** (Public Key Code Exchange) in Supabase
- Set appropriate **session timeout** in Supabase settings
- Monitor authentication logs for suspicious activity

### 7.3 Domain Security
- Use HTTPS in production (enforced by Vercel)
- Add all required domains to Google OAuth console
- Keep redirect URIs specific and minimal

## 🔄 Step 8: Maintenance

### Regular Tasks
- Monitor Google Cloud Console for API usage
- Check Supabase authentication logs
- Update OAuth credentials if compromised
- Review authorized domains periodically

### Monitoring
- Set up alerts for authentication failures
- Monitor OAuth token refresh rates
- Track user authentication patterns

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

## 🎯 Quick Checklist

- [ ] Google Cloud Project created
- [ ] Google+ API enabled
- [ ] OAuth 2.0 Client ID created
- [ ] Redirect URIs configured
- [ ] Supabase Google provider enabled
- [ ] Environment variables set
- [ ] Development testing completed
- [ ] Production testing completed
- [ ] Security best practices implemented
- [ ] Monitoring and maintenance plan in place

---

**Note**: This guide is specifically configured for the EduPracticeApp project with the correct OAuth callback handling and session management implemented in the codebase.
