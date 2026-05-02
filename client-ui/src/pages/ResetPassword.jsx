import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCapIcon, LockIcon, CheckIcon, CircleAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import * as authService from '../services/authService';

/**
 * ResetPassword Component
 * Used when user clicks the reset password link in their email
 * The email contains a special token in the URL
 */
export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const auth = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  // Check if we have a valid reset token in the URL
  useEffect(() => {
    const token = searchParams.get('token');
    const type = searchParams.get('type');

    // Supabase sends reset tokens in the URL
    // We need to verify it's a valid recovery/reset token
    if (token && type === 'recovery') {
      setHasToken(true);
    } else {
      setError('Invalid or missing reset link. Please request a new password reset.');
    }
  }, [searchParams]);

  // Validate password strength in real-time
  useEffect(() => {
    if (password) {
      setPasswordStrength(authService.validatePasswordStrength(password));
    } else {
      setPasswordStrength(null);
    }
  }, [password]);

  // Redirect authenticated users
  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate('/dashboard');
    }
  }, [auth.isAuthenticated, navigate]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!passwordStrength?.isValid) {
      setError(
        'Password must be at least 8 characters with uppercase, lowercase, and numbers/symbols'
      );
      return;
    }

    setLoading(true);

    const result = await auth.updatePassword(password);

    if (result.success) {
      setSuccess(true);
      // Redirect to login after success
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex items-center justify-center p-4 sm:p-6 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8"
      >
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
            <GraduationCapIcon className="w-7 h-7 text-gray-900" />
          </div>
          <span className="text-2xl font-bold text-white">EduPractice</span>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Reset Password</h1>
          <p className="text-sm sm:text-base text-gray-400 mt-2">
            {hasToken ? 'Enter your new password' : 'Invalid reset link'}
          </p>
        </div>

        {!hasToken ? (
          <div className="space-y-4">
            <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-2">
              <CircleAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-amber-500 text-gray-900 rounded-lg font-semibold hover:bg-amber-400 transition-colors"
            >
              Back to Login
            </button>
          </div>
        ) : success ? (
          <div className="space-y-4">
            <div className="px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm flex items-start gap-2">
              <CheckIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>Password updated successfully! Redirecting to login...</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {error && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-2">
                <CircleAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* New Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#1a1f2e] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors text-sm"
                  required
                  disabled={loading}
                />
              </div>

              {/* Password Strength Indicator */}
              {password && passwordStrength && (
                <div className="mt-2 space-y-2">
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-1 rounded-full transition-colors ${
                          i < passwordStrength.score
                            ? passwordStrength.score <= 1
                              ? 'bg-red-500'
                              : passwordStrength.score <= 2
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                            : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div className={passwordStrength.length ? 'text-green-400' : 'text-gray-400'}>
                      ✓ At least 8 characters
                    </div>
                    <div className={passwordStrength.uppercase ? 'text-green-400' : 'text-gray-400'}>
                      ✓ Uppercase letter
                    </div>
                    <div className={passwordStrength.lowercase ? 'text-green-400' : 'text-gray-400'}>
                      ✓ Lowercase letter
                    </div>
                    <div
                      className={
                        passwordStrength.numbers || passwordStrength.specialChars
                          ? 'text-green-400'
                          : 'text-gray-400'
                      }
                    >
                      ✓ Number or special character
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#1a1f2e] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors text-sm"
                  required
                  disabled={loading}
                />
                {confirmPassword && password === confirmPassword && (
                  <CheckIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !passwordStrength?.isValid || password !== confirmPassword}
              className="w-full py-3 bg-amber-500 text-gray-900 rounded-lg font-semibold hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
