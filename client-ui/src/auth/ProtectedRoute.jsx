// components/ProtectedRoute.jsx
import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);

      try {
        // 1. Check if auth_token exists in cookies
        const authToken = getCookie('auth_token');
        const loginTimestamp = getCookie('login_timestamp');

        if (!authToken) {
          setIsAuthenticated(false);
        } else {
          // 2. Check 3-day expiry
          const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

          if (loginTimestamp && (Date.now() - parseInt(loginTimestamp) > THREE_DAYS_MS)) {
            // Token expired based on 3-day rule
            // Clear cookies by setting them to expire
            document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
            document.cookie = 'login_timestamp=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
            setIsAuthenticated(false);
          } else {
            // Token is valid
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      }
      
      setLoading(false);
    };

    checkAuth();

    // Listen for cookie changes (when user logs in from external site)
    const cookieCheckInterval = setInterval(() => {
      const authToken = getCookie('auth_token');
      if (authToken && !isAuthenticated) {
        setIsAuthenticated(true);
      } else if (!authToken && isAuthenticated) {
        setIsAuthenticated(false);
      }
    }, 1000);

    return () => clearInterval(cookieCheckInterval);
  }, []);

  // Handle redirect for unauthorized users - prevent infinite redirects
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Only redirect if not already redirecting (check sessionStorage flag)
      if (!sessionStorage.getItem('auth_redirecting')) {
        sessionStorage.setItem('auth_redirecting', 'true');
        // Redirect to external login with return URL
        const returnUrl = window.location.href;
        window.location.href = `https://edupractice.vercel.app/login?return=${encodeURIComponent(returnUrl)}`;
      }
    } else if (isAuthenticated) {
      // Clear redirect flag when authenticated
      sessionStorage.removeItem('auth_redirecting');
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div className="flex justify-center items-center h-screen">Redirecting to login...</div>;
  }

  return <Outlet />;
};

export default ProtectedRoute;