import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let unsubscribe;

    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user || null);

        const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
          setSession(newSession);
          setUser(newSession?.user || null);
          if (event === 'SIGNED_OUT') setError(null);
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
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const signIn = async (email, password) => {
    if (!supabase) return { success: false, error: 'Auth not configured' };
    setError(null);
    const result = await authService.signInWithEmail(email, password);
    if (result.error) {
      const errorMsg = authService.formatAuthError(result.error);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
    return { success: true, user: result.data.user };
  };

  const signInWithGoogle = async () => {
    if (!supabase) return { success: false, error: 'Auth not configured' };
    setError(null);
    const result = await authService.signInWithGoogle();
    if (result.error) {
      const errorMsg = authService.formatAuthError(result.error);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
    return { success: true };
  };

  const signUp = async (email, password, userData) => {
    if (!supabase) return { success: false, error: 'Auth not configured' };
    setError(null);
    const result = await authService.signUpWithEmail(email, password, userData);
    if (result.error) {
      const errorMsg = authService.formatAuthError(result.error);
      setError(errorMsg);
      return { success: false, error: errorMsg, needsVerification: false };
    }
    return { success: true, user: result.data.user, needsVerification: result.data.needsEmailVerification };
  };

  const verifyOtp = async (email, token, type = 'signup') => {
    if (!supabase) return { success: false, error: 'Auth not configured' };
    setError(null);
    const result = await authService.verifyOtp(email, token, type);
    if (result.error) {
      const errorMsg = authService.formatAuthError(result.error);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
    return { success: true, user: result.data.user };
  };

  const resendVerificationEmail = async (email) => {
    if (!supabase) return { success: false, error: 'Auth not configured' };
    setError(null);
    const result = await authService.resendVerificationEmail(email);
    if (result.error) {
      const errorMsg = authService.formatAuthError(result.error);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
    return { success: true };
  };

  const requestPasswordReset = async (email) => {
    if (!supabase) return { success: false, error: 'Auth not configured' };
    setError(null);
    const result = await authService.requestPasswordReset(email);
    if (result.error) {
      const errorMsg = authService.formatAuthError(result.error);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
    return { success: true };
  };

  const updatePassword = async (password) => {
    if (!supabase) return { success: false, error: 'Auth not configured' };
    setError(null);
    const result = await authService.updatePasswordWithToken(password);
    if (result.error) {
      const errorMsg = authService.formatAuthError(result.error);
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
    return { success: true };
  };

  const logOut = async () => {
    if (!supabase) return { success: true };
    setError(null);
    const result = await authService.signOut();
    if (result.error) console.error('Sign out error:', result.error);
    setUser(null);
    setSession(null);
    return { success: !result.error };
  };

  const clearError = () => setError(null);

  const value = {
    user, session, isLoading, error,
    isAuthenticated: !!user,
    signIn, signInWithGoogle, signUp, verifyOtp,
    resendVerificationEmail, requestPasswordReset,
    updatePassword, logOut, clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
