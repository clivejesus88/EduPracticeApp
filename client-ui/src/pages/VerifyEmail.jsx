import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, CircleAlert, GraduationCapIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [countdown, setCountdown] = useState(5);

  const isVerified = !!auth.user?.email_confirmed_at;

  useEffect(() => {
    if (!auth.isLoading && auth.isAuthenticated && isVerified) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            navigate('/dashboard', { replace: true });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [auth.isLoading, auth.isAuthenticated, isVerified, navigate]);

  if (auth.isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#0B1120] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mb-4"></div>
          <p className="text-gray-400">Verifying your email session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4 sm:p-6 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8"
      >
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center">
            <GraduationCapIcon className="w-6 h-6 sm:w-7 sm:h-7 text-gray-900" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-white">EduPractice</span>
        </Link>

        {auth.isAuthenticated && isVerified ? (
          <div className="text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto" />
            <h1 className="text-2xl font-bold text-white">Email verified</h1>
            <p className="text-gray-400 text-sm">
              Your email is confirmed. Redirecting to dashboard in {countdown}s...
            </p>
            <button
              type="button"
              onClick={() => navigate('/dashboard', { replace: true })}
              className="w-full py-3 bg-amber-500 text-gray-900 rounded-lg font-semibold hover:bg-amber-400 transition-colors"
            >
              Go to dashboard now
            </button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <CircleAlert className="w-12 h-12 text-amber-400 mx-auto" />
            <h1 className="text-2xl font-bold text-white">Verification pending</h1>
            <p className="text-gray-400 text-sm">
              This link may be expired, invalid, or your session has not been established yet.
              Try signing in again or request another verification email.
            </p>
            <Link
              to="/login"
              className="block w-full py-3 bg-amber-500 text-gray-900 rounded-lg font-semibold hover:bg-amber-400 transition-colors"
            >
              Go to sign in
            </Link>
            <Link
              to="/signup"
              className="block w-full py-3 bg-[#1a1f2e] border border-gray-700 text-gray-300 rounded-lg font-semibold hover:text-white hover:border-gray-500 transition-colors"
            >
              Back to signup
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
