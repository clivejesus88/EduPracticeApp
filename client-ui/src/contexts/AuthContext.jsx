import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

/**
 * AuthProvider - Manages authentication state globally
 * - Syncs with Supabase session
 * - Provides auth methods to entire app
 * - Handles loading states
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize session on mount
  useEffect(() => {
    let unsubscribe;

    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user || null);

        // Subscribe to auth changes
        const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
          setSession(newSession);
          setUser(newSession?.user || null);
          
          // Handle specific events
          if (event === 'SIGNED_OUT') {
            setError(null);
          }
        });

        unsubscribe = () => data.subscription.unsubscribe();
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  /**
   * Sign in with email and password
   * No tokens passed in URLs - all session management handled by Supabase
   */
  const signIn = async (email, password) => {
    setError(null);
    const result = await authService.signInWithEmail(email, password);
    
    if (result.error) {
      const errorMsg = authService.formatAuthError(result.error);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    return { success: true, user: result.data.user };
  };

  /**
   * Sign in with Google OAuth
   */
  const signInWithGoogle = async () => {
    setError(null);
    const result = await authService.signInWithGoogle();

    if (result.error) {
      const errorMsg = authService.formatAuthError(result.error);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    return { success: true };
  };

  /**
   * Sign up with email, password, and user info
   */
  const signUp = async (email, password, userData) => {
    setError(null);
    const result = await authService.signUpWithEmail(email, password, userData);
    
    if (result.error) {
      const errorMsg = authService.formatAuthError(result.error);
      setError(errorMsg);
      return { 
        success: false, 
        error: errorMsg,
        needsVerification: false 
      };
    }

    return {
      success: true,
      user: result.data.user,
      needsVerification: result.data.needsEmailVerification
    };
  };

  /**
   * Verify OTP code
   */
  const verifyOtp = async (email, token, type = 'signup') => {
    setError(null);
    const result = await authService.verifyOtp(email, token, type);
    
    if (result.error) {
      const errorMsg = authService.formatAuthError(result.error);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    return { success: true, user: result.data.user };
  };

  /**
   * Resend signup verification email
   */
  const resendVerificationEmail = async (email) => {
    setError(null);
    const result = await authService.resendVerificationEmail(email);

    if (result.error) {
      const errorMsg = authService.formatAuthError(result.error);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    return { success: true };
  };

  /**
   * Request password reset email
   */
  const requestPasswordReset = async (email) => {
    setError(null);
    const result = await authService.requestPasswordReset(email);
    
    if (result.error) {
      const errorMsg = authService.formatAuthError(result.error);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    return { success: true };
  };

  /**
   * Update password with recovery token
   */
  const updatePassword = async (password) => {
    setError(null);
    const result = await authService.updatePasswordWithToken(password);
    
    if (result.error) {
      const errorMsg = authService.formatAuthError(result.error);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }

    return { success: true };
  };

  /**
   * Sign out
   */
  const logOut = async () => {
    setError(null);
    const result = await authService.signOut();
    
    if (result.error) {
      console.error('Sign out error:', result.error);
    }
    
    // Clear state on sign out
    setUser(null);
    setSession(null);
    
    return { success: !result.error };
  };

  /**
   * Clear error
   */
  const clearError = () => setError(null);

  const value = {
    // State
    user,
    session,
    isLoading,
    error,
    isAuthenticated: !!user,

    // Methods
    signIn,
    signInWithGoogle,
    signUp,
    verifyOtp,
    resendVerificationEmail,
    requestPasswordReset,
    updatePassword,
    logOut,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth hook - Access auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
