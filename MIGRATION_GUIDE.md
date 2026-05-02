# Migration Guide: From Insecure to Secure Authentication

This guide helps developers transition from the old authentication system (URL tokens, insecure session handling) to the new secure system.

## What Changed

### Before (Insecure)
```javascript
// Tokens passed via URL
window.location.href = `https://appedupractice.vercel.app/?token=${accessToken}`

// Tokens stored in sessionStorage
sessionStorage.setItem('auth_token', token)

// No rate limiting
await supabase.auth.signInWithPassword({ email, password })

// Manual session checking
const checkAuth = () => {
  const authToken = sessionStorage.getItem('auth_token')
  return !!authToken
}

// Redirect to different domain
window.location.href = 'https://edupractice.vercel.app/login'
```

### After (Secure)
```javascript
// No URL tokens - session managed by Supabase
const result = await auth.signIn(email, password)
if (result.success) {
  navigate('/dashboard') // Same domain, secure session
}

// Rate limiting enforced
// Max 5 attempts per email, 15 minute window

// Supabase manages session automatically
const auth = useAuth()
const isAuthenticated = auth.isAuthenticated

// Redirect on same domain
navigate('/login')
```

## Step-by-Step Migration

### 1. Update `.env.local`
```env
# Add Supabase configuration (if not already present)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Remove old auth variables (if any)
# VITE_AUTH_API_URL=... (delete if present)
# VITE_TOKEN_STORAGE_KEY=... (delete if present)
```

### 2. Update App Root (`main.tsx` or `App.jsx`)

**Before:**
```jsx
import App from './App'
import { UserProvider } from './contexts/UserContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <UserProvider>
      <App />
    </UserProvider>
  </React.StrictMode>
)
```

**After:**
```jsx
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import { UserProvider } from './contexts/UserContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <UserProvider>
        <App />
      </UserProvider>
    </AuthProvider>
  </React.StrictMode>
)
```

### 3. Update Routes Configuration

**Before:**
```jsx
<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
  
  {/* Manual auth checking */}
  <Route path="/dashboard" element={<Dashboard />} />
</Routes>
```

**After:**
```jsx
import ProtectedRoute from './auth/ProtectedRoute'

<Routes>
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
  <Route path="/reset-password" element={<ResetPassword />} />
  
  {/* Protected routes - automatic auth checking */}
  <Route element={<ProtectedRoute />}>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/profile" element={<Profile />} />
  </Route>
</Routes>
```

### 4. Update Component Authentication Checks

**Before:**
```jsx
// Old way - checking token manually
const checkAuth = () => {
  const authToken = sessionStorage.getItem('auth_token')
  return !!authToken
}

if (!checkAuth()) {
  navigate('/login')
}
```

**After:**
```jsx
// New way - using AuthContext
import { useAuth } from '../contexts/AuthContext'

const { isAuthenticated, isLoading } = useAuth()

if (isLoading) return <LoadingSpinner />
if (!isAuthenticated) {
  navigate('/login')
}
```

### 5. Update Login Component

**Before:**
```jsx
const handleSubmit = async (e) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email, password
  })
  
  if (data?.session?.access_token) {
    // INSECURE: Token in URL
    const url = new URL(window.location.origin)
    url.searchParams.set('token', data.session.access_token)
    window.location.href = url.toString()
  }
}
```

**After:**
```jsx
import { useAuth } from '../contexts/AuthContext'

const auth = useAuth()

const handleSubmit = async (e) => {
  const result = await auth.signIn(email, password)
  
  if (result.success) {
    // SECURE: Session managed by Supabase, redirect safely
    navigate('/dashboard')
  } else {
    setError(result.error)
  }
}
```

### 6. Update Signup Component

**Before:**
```jsx
// After OTP verification
if (data?.session) {
  // INSECURE: Token in URL
  const dest = new URL(window.location.origin)
  dest.searchParams.set('token', data.session.access_token)
  window.location.href = dest.toString()
}
```

**After:**
```jsx
const auth = useAuth()

// After OTP verification
const result = await auth.verifyOtp(email, otpCode, 'signup')

if (result.success) {
  // SECURE: Navigate to dashboard (session auto-managed)
  navigate('/dashboard')
} else {
  setError(result.error)
}
```

### 7. Update Logout Functionality

**Before:**
```jsx
const handleLogout = () => {
  sessionStorage.removeItem('auth_token')
  sessionStorage.removeItem('login_timestamp')
  navigate('/login')
}
```

**After:**
```jsx
const auth = useAuth()

const handleLogout = async () => {
  await auth.logOut()
  navigate('/login')
}
```

### 8. Update User Profile Access

**Before:**
```jsx
// Getting user data from localStorage
const savedUser = localStorage.getItem('eduPractice_user')
const user = savedUser ? JSON.parse(savedUser) : defaultUser
```

**After:**
```jsx
import { useUser } from '../contexts/UserContext'

const { user, isLoading, updateUser } = useUser()

// User data automatically loaded from Supabase
// Stays in sync across tabs/windows
```

### 9. Clean Up Old Code

**Remove these functions/patterns:**
```javascript
// DELETE THESE - No longer needed:

// Old token redirect function
const redirectWithToken = (token, url) => { ... }

// Old cookie reading
const getAuthTokenFromCookie = () => { ... }

// Old session storage usage
const checkAuth = () => {
  const authToken = sessionStorage.getItem('auth_token')
  return !!authToken
}

// Old localStorage auth management
localStorage.setItem('auth_token', token)
sessionStorage.setItem('login_timestamp', Date.now())
```

**Update these patterns:**
```javascript
// OLD: Manual rate limiting (if it existed)
// NEW: Built into authService.js

// OLD: Manual token expiration checking
// NEW: Supabase handles auto-refresh

// OLD: sessionStorage session management
// NEW: Supabase persistSession handles it
```

### 10. Clear Browser Storage

Users' old data won't migrate automatically. Clear it:

```javascript
// Run this once to clean up old data
function clearLegacyAuth() {
  // Clear old auth tokens
  sessionStorage.removeItem('auth_token')
  sessionStorage.removeItem('login_timestamp')
  localStorage.removeItem('eduPractice_user')
  
  // Clear old cookies
  document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC'
  document.cookie = 'login_timestamp=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC'
}

// Call on app startup if needed
if (localStorage.getItem('eduPractice_user')) {
  clearLegacyAuth()
}
```

## Testing During Migration

### 1. Test Each Flow
- [ ] **Login** - Email/password flow works
- [ ] **Signup** - New account creation with verification
- [ ] **Logout** - Session cleared properly
- [ ] **Protected Routes** - Can't access without auth
- [ ] **Password Reset** - Email flow works
- [ ] **Session Persistence** - Refresh page, still logged in

### 2. Verify No URL Tokens
```javascript
// Check browser URL - should NOT have tokens
https://appedupractice.vercel.app/dashboard
// NOT this:
https://appedupractice.vercel.app/dashboard?token=eyJhbGc...
```

### 3. Verify Rate Limiting
```javascript
// In browser console, try rapid login attempts:
for (let i = 0; i < 6; i++) {
  await authService.signInWithEmail('test@example.com', 'wrong')
}
// Should get rate limit error after 5 attempts
```

### 4. Check No Token Exposure
```javascript
// In browser DevTools Console:
console.log(localStorage)
console.log(sessionStorage)
// Should NOT see plain JWT tokens
```

## Common Issues During Migration

### Issue: "useAuth is not defined"
**Solution:** Make sure `<AuthProvider>` wraps your app:
```jsx
<AuthProvider>
  <App />
</AuthProvider>
```

### Issue: "Still redirecting to old domain"
**Solution:** Update redirects:
```javascript
// OLD
window.location.href = 'https://edupractice.vercel.app/login'

// NEW
navigate('/login')
```

### Issue: "User data not loading"
**Solution:** Check `UserProvider` is inside `AuthProvider`:
```jsx
<AuthProvider>
  <UserProvider>  {/* Must be inside AuthProvider */}
    <App />
  </UserProvider>
</AuthProvider>
```

### Issue: "Rate limiting not working"
**Solution:** Verify localStorage is enabled:
```javascript
try {
  localStorage.setItem('test', 'test')
  localStorage.removeItem('test')
} catch (e) {
  console.error('localStorage not available')
}
```

### Issue: "Old tokens still in localStorage"
**Solution:** Clear browser storage:
```javascript
// Open DevTools → Application → Storage
// Clear all: localStorage, sessionStorage, cookies
```

## Backwards Compatibility

The new auth system is **not backwards compatible** with the old system. All users will need to:

1. **Clear browser cache/storage** (happens automatically on first load)
2. **Re-login** with their credentials (new session)
3. **Re-verify email** if required

This is a **one-time migration**. Plan accordingly:
- Announce downtime if needed
- Provide clear instructions to users
- Have support team ready for questions

## Deployment Strategy

### Phase 1: Preparation
1. Create new auth branch: `git checkout -b feat/secure-auth`
2. Implement all changes
3. Test thoroughly locally
4. Get code review

### Phase 2: Staging
1. Deploy to staging environment
2. Full QA testing
3. Load testing (rate limiting)
4. Security review

### Phase 3: Production
1. Backup current auth system (just in case)
2. Deploy during low-traffic period
3. Monitor logs closely
4. Have rollback plan ready

### Phase 4: Post-Deployment
1. Monitor error rates
2. Check email delivery
3. Verify rate limiting
4. Collect user feedback

## Rollback Plan

If critical issues arise:

```bash
# Revert to previous commit
git revert <commit-hash>

# OR restore from backup
git checkout <backup-branch>
```

**Note:** Users who re-logged in will need to re-login again after rollback.

## Timeline

- **Week 1-2:** Implement new auth system
- **Week 3:** Testing and QA
- **Week 4:** Staging deployment and review
- **Week 5:** Production deployment
- **Week 6:** Monitoring and stabilization

## Success Criteria

✓ All auth flows working
✓ No URL tokens exposed
✓ Rate limiting enforced
✓ Email verification working
✓ Session persists across refreshes
✓ No security warnings
✓ Performance acceptable
✓ Users can login/signup

## Support Resources

- **Documentation:** See [AUTHENTICATION.md](./AUTHENTICATION.md)
- **Implementation Checklist:** See [AUTH_IMPLEMENTATION_CHECKLIST.md](./AUTH_IMPLEMENTATION_CHECKLIST.md)
- **Code Examples:** In component files (Login.jsx, Signup.jsx, etc.)
- **Questions:** Refer to Supabase docs or reach out to team

---

**Migration Completed By:** [Your Name]
**Date:** [Date]
**Status:** [In Progress / Complete]
