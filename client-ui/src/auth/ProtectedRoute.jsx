// components/ProtectedRoute.jsx
import { useEffect, useState } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';

const ProtectedRoute = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

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

  // Validate and persist a URL token into sessionStorage
  const authenticateFromUrlToken = (token) => {
    if (!token || typeof token !== 'string' || token.trim() === '') {
      console.warn('URL token is empty or invalid.');
      return false;
    }

    console.log('Authenticating from URL token...');

    // Persist token in sessionStorage for the duration of this browser session
    sessionStorage.setItem('auth_token', token);
    sessionStorage.setItem('login_timestamp', Date.now().toString());

    // Remove the token from the URL so it isn't bookmarked or shared accidentally
    searchParams.delete('token');
    setSearchParams(searchParams, { replace: true });

    console.log('URL token accepted — stored in sessionStorage, token removed from URL.');
    return true;
  };

  // Function to check authentication status (sessionStorage or cookies)
  const checkAuth = () => {
    try {
      // Prefer sessionStorage token (set by URL token flow)
      const authToken = sessionStorage.getItem('auth_token') || getCookie('auth_token');
      const loginTimestamp = sessionStorage.getItem('login_timestamp') || getCookie('login_timestamp');

      console.log('Auth check — auth_token:', !!authToken, 'login_timestamp:', loginTimestamp);

      if (!authToken) return false;

      // Check 3-day expiry
      const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
      if (loginTimestamp) {
        const timestamp = parseInt(loginTimestamp, 10);
        if (isNaN(timestamp) || Date.now() - timestamp > THREE_DAYS_MS) {
          console.log('Auth token expired — clearing stored auth.');
          sessionStorage.removeItem('auth_token');
          sessionStorage.removeItem('login_timestamp');
          document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
          document.cookie = 'login_timestamp=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      return false;
    }
  };

  // On mount: try URL token first, then fall back to cookies
  useEffect(() => {
    setLoading(true);

    const urlToken = searchParams.get('token');
    let isAuth = false;

    if (urlToken) {
      // URL token takes priority — authenticate and persist it
      isAuth = authenticateFromUrlToken(urlToken);
    }

    if (!isAuth) {
      // Fall back to existing cookie-based auth
      isAuth = checkAuth();
    }

    setIsAuthenticated(isAuth);
    setLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-check auth periodically — catches when external login sets cookies
  useEffect(() => {
    if (loading || isAuthenticated) return;

    const checkInterval = setInterval(() => {
      console.log('Periodic auth check...');
      const isAuth = checkAuth();
      if (isAuth) {
        setIsAuthenticated(true);
        clearInterval(checkInterval);
      }
    }, 500);

    return () => clearInterval(checkInterval);
  }, [loading, isAuthenticated]);

  // Re-check immediately when tab becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab visible — re-checking auth...');
        const isAuth = checkAuth();
        if (isAuth) setIsAuthenticated(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Redirect unauthenticated users to login
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