import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, CircleAlert, GraduationCapIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // 'pending', 'verified', 'expired'

  const isVerified = !!auth.user?.email_confirmed_at;
  const hasToken = !!searchParams.get('token');
  const hasType = searchParams.get('type') === 'signup';

  // If user landed here from email link with token, Supabase automatically verifies them
  // If they're already authenticated and verified, redirect to dashboard
  useEffect(() => {
    if (!auth.isLoading && auth.isAuthenticated && isVerified) {
      setVerificationStatus('verified');
      
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
    } else if (!auth.isLoading && auth.isAuthenticated && !isVerified) {
      // User is authenticated but email not verified
      // This is the normal signup flow waiting for email verification
      setVerificationStatus('pending');
    } else if (!auth.isLoading && !auth.isAuthenticated) {
      // User not authenticated - check if token expired or they need to sign in
      if (hasToken && hasType) {
        // Token was in URL but verification failed - likely expired
        setVerificationStatus('expired');
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, isVerified, hasToken, hasType, navigate]);

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

        {verificationStatus === 'verified' ? (
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
        ) : verificationStatus === 'expired' ? (
          <div className="text-center space-y-4">
            <CircleAlert className="w-12 h-12 text-red-400 mx-auto" />
            <h1 className="text-2xl font-bold text-white">Link Expired</h1>
            <p className="text-gray-400 text-sm">
              This verification link has expired. Please sign in and request a new verification email if needed.
            </p>
            <Link
              to="/login"
              className="block w-full py-3 bg-amber-500 text-gray-900 rounded-lg font-semibold hover:bg-amber-400 transition-colors text-center"
            >
              Go to sign in
            </Link>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 mx-auto flex items-center justify-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
            </div>
            <h1 className="text-2xl font-bold text-white">Verification Pending</h1>
            <p className="text-gray-400 text-sm">
              Check your email for a verification link. Click it to confirm your account.
            </p>
            <p className="text-gray-500 text-xs">
              Didn't receive an email? Check your spam folder or click below to request another.
            </p>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="block w-full py-3 bg-[#1a1f2e] border border-gray-700 text-gray-300 rounded-lg font-semibold hover:text-white hover:border-gray-500 transition-colors"
            >
              Request new verification email
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
