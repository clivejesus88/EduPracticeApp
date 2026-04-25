// components/ProtectedRoute.jsx
import { useEffect, useState } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';

const ProtectedRoute = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchParams] = useSearchParams();

  // Helper function to get cookie value by name
  const getCookie = (name) => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + '=')) {
        return cookie.substring(name.length + 1);
      }
    }
    return null;
  };

  // Function to check authentication status
  const checkAuth = () => {
    try {
      // 1. Check if auth_token exists in cookies
      const authToken = getCookie('auth_token');
      const loginTimestamp = getCookie('login_timestamp');

      if (!authToken) {
        return false;
      }

      // 2. Check 3-day expiry
      const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

      if (loginTimestamp && (Date.now() - parseInt(loginTimestamp) > THREE_DAYS_MS)) {
        // Token expired - clear cookies
        document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        document.cookie = 'login_timestamp=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
        return false;
      }

      // Token is valid
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  };

  // Initial auth check on mount
  useEffect(() => {
    setLoading(true);
    const isAuth = checkAuth();
    setIsAuthenticated(isAuth);
    setLoading(false);
  }, []);

  // Re-check auth when returning from login (check for return parameter)
  useEffect(() => {
    const isReturningFromLogin = searchParams.has('return');
    if (isReturningFromLogin) {
      console.log('Returning from login, re-checking auth...');
      const isAuth = checkAuth();
      setIsAuthenticated(isAuth);
    }
  }, [searchParams]);

  // Listen for visibility changes - re-check when tab becomes visible (user switched back from login)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab is now visible, re-checking auth...');
        const isAuth = checkAuth();
        setIsAuthenticated(isAuth);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Handle redirect for unauthenticated users
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Redirect to external login with return URL
      const returnUrl = window.location.href;
      window.location.href = `https://edupractice.vercel.app/login?return=${encodeURIComponent(returnUrl)}`;
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return isAuthenticated ? <Outlet /> : null;
};

export default ProtectedRoute;