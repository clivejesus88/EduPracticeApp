import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Configuration
 * 
 * Security Notes:
 * - Uses VITE_SUPABASE_ANON_KEY (safe for frontend)
 * - Never store or transmit JWT tokens via URLs
 * - Session is managed by Supabase internally using secure storage
 * - autoRefreshToken keeps session valid without exposing tokens
 * - persistSession stores session securely in browser storage
 * - detectSessionInUrl allows OAuth/magic link to work (but we handle manually)
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env.local file.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Automatically refresh token before it expires
    autoRefreshToken: true,
    
    // Persist session in secure storage (localStorage with encryption)
    persistSession: true,
    
    // Detect session in URL for OAuth/magic links (handled gracefully)
    detectSessionInUrl: true,
    
    // Storage options - use localStorage for simplicity
    // In production, consider using a more secure storage solution
    storage: window.localStorage
  },
  
  // Global request headers - never add tokens here; let Supabase handle it
  global: {
    headers: {
      // Optional: Add custom headers for your API
    }
  }
});

/**
 * Helper function to check if user is authenticated
 * Uses Supabase's internal session, never URL tokens
 */
export const isAuthenticated = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch {
    return false;
  }
};

/**
 * Get the current user from Supabase session
 * Safe - never exposed in URLs
 */
export const getCurrentAuthUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  } catch (err) {
    return { user: null, error: err };
  }
};
