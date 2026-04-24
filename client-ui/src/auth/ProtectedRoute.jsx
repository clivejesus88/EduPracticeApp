// components/ProtectedRoute.jsx
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const ProtectedRoute = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);

      // 1. Get current session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setIsAuthenticated(false);
      } else {
        // 2. Check 3-day expiry (Method 2 logic)
        const loginTimestamp = localStorage.getItem('login_timestamp');
        const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

        if (loginTimestamp && (Date.now() - parseInt(loginTimestamp) > THREE_DAYS_MS)) {
          // Token expired based on our 3-day rule
          await supabase.auth.signOut();
          localStorage.removeItem('login_timestamp');
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      }
      
      setLoading(false);
    };

    checkAuth();

    // 3. Listen for auth changes (e.g., manual logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('login_timestamp');
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle redirect for unauthorized users
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = 'https://edupractice.vercel.app/login';
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    // Return a minimal loading state to prevent flash of content
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return isAuthenticated ? <Outlet /> : null;
};

export default ProtectedRoute;