import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { validateOAuthCallback } from '../services/authService';
import { supabase } from '../lib/supabaseClient';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('Processing...');
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Handle OAuth errors
        if (error) {
          setError(errorDescription || error);
          setStatus('Authentication failed');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // Validate CSRF state
        const validation = validateOAuthCallback(state || '');
        if (!validation.valid) {
          setError(validation.error || 'Security validation failed');
          setStatus('Security validation failed');
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // Let Supabase handle the OAuth callback - it will automatically update the session
        setStatus('Completing sign in...');
        
        // Wait a moment for Supabase to process the callback
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if we have a session now
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Store session data in localStorage for AuthContext to pick up
          const sessionData = {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            user: session.user,
            expires_at: session.expires_at
          };
          
          localStorage.setItem('supabase.auth.token', JSON.stringify(sessionData));
          localStorage.setItem('eduPractice_session', JSON.stringify({
            user: session.user,
            accessToken: session.access_token,
            isAuthenticated: true,
            timestamp: Date.now()
          }));
          
          setStatus('Successfully signed in!');
          setTimeout(() => navigate('/dashboard'), 1000);
        } else {
          setError('Failed to complete sign in - no session found');
          // Clear any existing session data on failure
          localStorage.removeItem('supabase.auth.token');
          localStorage.removeItem('eduPractice_session');
          setTimeout(() => navigate('/login'), 3000);
        }
      } catch (err) {
        setError('An unexpected error occurred during authentication');
        console.error('Auth callback error:', err);
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen w-full bg-[#0B1120] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto mb-6">
          <div className={`w-8 h-8 rounded-full border-2 border-amber-400 ${status.includes('Successfully') ? 'bg-emerald-500 border-emerald-400' : ''} ${error ? 'bg-red-500 border-red-400' : ''} animate-spin`}></div>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">
          {error ? 'Authentication Error' : 'Completing Sign In'}
        </h1>
        
        <p className={`text-sm ${error ? 'text-red-400' : 'text-slate-400'} mb-4`}>
          {error || status}
        </p>
        
        {!error && (
          <p className="text-xs text-slate-500">
            You will be redirected automatically...
          </p>
        )}
        
        {error && (
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg transition-colors"
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
}
