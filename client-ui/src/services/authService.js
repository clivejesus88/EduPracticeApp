import { supabase } from '../lib/supabaseClient';

/**
 * AuthService - Secure authentication with rate limiting
 * - Never passes tokens via URLs
 * - Rate limits login attempts per email
 * - Handles session management via Supabase
 * - Enforces email verification
 */

const RATE_LIMIT_KEY = 'auth_rate_limit';
const MAX_LOGIN_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Get rate limit state for an email
 */
const getRateLimitState = (email) => {
  try {
    const stored = localStorage.getItem(`${RATE_LIMIT_KEY}:${email}`);
    if (!stored) return { attempts: 0, resetTime: null };
    
    const state = JSON.parse(stored);
    const now = Date.now();
    
    // Reset if window has passed
    if (state.resetTime && now > state.resetTime) {
      localStorage.removeItem(`${RATE_LIMIT_KEY}:${email}`);
      return { attempts: 0, resetTime: null };
    }
    
    return state;
  } catch (e) {
    console.error('Error reading rate limit state:', e);
    return { attempts: 0, resetTime: null };
  }
};

/**
 * Increment rate limit counter
 */
const incrementRateLimit = (email) => {
  const state = getRateLimitState(email);
  const now = Date.now();
  const resetTime = state.resetTime || now + RATE_LIMIT_WINDOW;
  
  const newState = {
    attempts: state.attempts + 1,
    resetTime
  };
  
  localStorage.setItem(`${RATE_LIMIT_KEY}:${email}`, JSON.stringify(newState));
  return newState;
};

/**
 * Clear rate limit for an email (after successful login)
 */
const clearRateLimit = (email) => {
  localStorage.removeItem(`${RATE_LIMIT_KEY}:${email}`);
};

/**
 * Get minutes until rate limit resets
 */
const getResetMinutes = (resetTime) => {
  if (!resetTime) return 0;
  const remaining = Math.ceil((resetTime - Date.now()) / 1000 / 60);
  return Math.max(1, remaining);
};

/**
 * Sign in with email and password
 * - Rate limited
 * - Uses Supabase session (persisted automatically)
 */
export const signInWithEmail = async (email, password) => {
  // Check rate limit
  const rateLimit = getRateLimitState(email);
  if (rateLimit.attempts >= MAX_LOGIN_ATTEMPTS) {
    const resetMinutes = getResetMinutes(rateLimit.resetTime);
    return {
      error: new Error(
        `Too many login attempts. Please try again in ${resetMinutes} minute${resetMinutes > 1 ? 's' : ''}.`
      ),
      data: null
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      // Increment failed attempts
      incrementRateLimit(email);
      return { error, data: null };
    }

    // Clear rate limit on success
    clearRateLimit(email);

    return {
      error: null,
      data: {
        user: data.user,
        session: data.session
      }
    };
  } catch (err) {
    incrementRateLimit(email);
    return {
      error: err,
      data: null
    };
  }
};

/**
 * Sign up with email, password, and user info
 * - Requires email verification
 * - Stores additional user metadata
 */
export const signUpWithEmail = async (email, password, userData = {}) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: userData.firstName || '',
          last_name: userData.lastName || '',
          school_name: userData.schoolName || '',
          exam_level: userData.examLevel || '',
          created_at: new Date().toISOString()
        },
        emailRedirectTo: `${window.location.origin}/verify-email`
      }
    });

    if (error) {
      return { error, data: null };
    }

    return {
      error: null,
      data: {
        user: data.user,
        session: data.session,
        needsEmailVerification: !data.session // User needs to verify email
      }
    };
  } catch (err) {
    return { error: err, data: null };
  }
};

/**
 * Sign in with Google OAuth
 */
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });

    if (error) {
      return { error, data: null };
    }

    return { error: null, data };
  } catch (err) {
    return { error: err, data: null };
  }
};

/**
 * Verify OTP for signup or recovery
 */
export const verifyOtp = async (email, token, type = 'signup') => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type
    });

    if (error) {
      return { error, data: null };
    }

    return {
      error: null,
      data: {
        user: data.user,
        session: data.session
      }
    };
  } catch (err) {
    return { error: err, data: null };
  }
};

/**
 * Resend signup verification email
 */
export const resendVerificationEmail = async (email) => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/verify-email`
      }
    });

    return { error };
  } catch (err) {
    return { error: err };
  }
};

/**
 * Send password reset email
 */
export const requestPasswordReset = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (err) {
    return { error: err };
  }
};

/**
 * Update password with recovery token
 */
export const updatePasswordWithToken = async (password) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password
    });

    if (error) {
      return { error, data: null };
    }

    return {
      error: null,
      data: { user: data.user }
    };
  } catch (err) {
    return { error: err, data: null };
  }
};

/**
 * Get current session
 */
export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error };
  } catch (err) {
    return { session: null, error: err };
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    return { user: data.user, error };
  } catch (err) {
    return { user: null, error: err };
  }
};

/**
 * Sign out (clears session)
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err) {
    return { error: err };
  }
};

/**
 * Subscribe to auth state changes
 */
export const onAuthStateChange = (callback) => {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  // Return unsubscribe function
  return data.subscription.unsubscribe;
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const strength = {
    isValid: password.length >= minLength && hasUppercase && hasLowercase && (hasNumbers || hasSpecialChars),
    length: password.length >= minLength,
    uppercase: hasUppercase,
    lowercase: hasLowercase,
    numbers: hasNumbers,
    specialChars: hasSpecialChars,
    score: [
      password.length >= minLength,
      hasUppercase,
      hasLowercase,
      hasNumbers || hasSpecialChars
    ].filter(Boolean).length
  };

  return strength;
};

/**
 * Format auth error messages for display
 */
export const formatAuthError = (error) => {
  if (!error) return null;

  const message = error.message || error;
  
  // Map common Supabase errors to user-friendly messages
  const errorMap = {
    'Invalid login credentials': 'Email or password is incorrect',
    'Email not confirmed': 'Please verify your email before logging in',
    'User already registered': 'This email is already registered',
    'Weak password': 'Password must be at least 8 characters with uppercase, lowercase, and numbers',
    'Invalid email': 'Please enter a valid email address',
    'New password should be different': 'Please enter a different password'
  };

  return errorMap[message] || message;
};
