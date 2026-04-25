// components/ProtectedRoute.jsx
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkAttempt, setCheckAttempt] = useState(0);

  // Helper function to get cookie value by name
  const getCookie = (name) => {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + '=')) {
        const value = cookie.substring(name.length + 1);
        return value ? decodeURIComponent(value) : value;
      }
    }
    return null;
  };

  // Function to check authentication status
  const checkAuth = () => {
    try {
      const authToken = getCookie('auth_token');
      const loginTimestamp = getCookie('login_timestamp');

      console.log('Auth check - auth_token:', !!authToken, 'login_timestamp:', loginTimestamp);

      if (!authToken) {
        return false;
      }

      // Check 3-day expiry
      const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
      if (loginTimestamp) {
        const timestamp = parseInt(loginTimestamp);
        if (Date.now() - timestamp > THREE_DAYS_MS) {
          // Token expired - clear cookies
          document.cookie = 'auth_token=; path=/; domain=.edupractice.vercel.app; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
          document.cookie = 'login_timestamp=; path=/; domain=.edupractice.vercel.app; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
          return false;
        }
      }

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

  // Re-check auth periodically - this catches when external login sets cookies
  useEffect(() => {
    if (loading || isAuthenticated) return;

    const checkInterval = setInterval(() => {
      console.log('Periodic auth check...');
      const isAuth = checkAuth();
      if (isAuth) {
        setIsAuthenticated(true);
        clearInterval(checkInterval);
      }
      setCheckAttempt(prev => prev + 1);
    }, 500); // Check every 500ms for cookies

    return () => clearInterval(checkInterval);
  }, [loading, isAuthenticated]);

  // Listen for visibility changes - immediately re-check when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab is now visible, re-checking auth...');
        const isAuth = checkAuth();
        if (isAuth) {
          setIsAuthenticated(true);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Handle redirect for unauthenticated users
  useEffect(() => {
    if (!loading && !isAuthenticated) {
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