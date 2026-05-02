import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCapIcon, MailIcon, LockIcon, UserIcon, CheckIcon, CircleAlert } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import * as authService from '../services/authService';
import { useRateLimit } from '../hooks/useRateLimit';
import { supabase } from '../lib/supabaseClient';

export default function Signup() {
  const navigate = useNavigate();
  const auth = useAuth();

  // If auth is not configured, skip signup entirely
  useEffect(() => {
    if (!supabase) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    schoolName: '',
    examLevel: ''
  });
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Verification state
  const [verifying, setVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [verificationMessage, setVerificationMessage] = useState('');

  const signupRL = useRateLimit('signup');

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate('/dashboard');
    }
  }, [auth.isAuthenticated, navigate]);

  // Validate password strength in real-time
  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(authService.validatePasswordStrength(formData.password));
    }
  }, [formData.password]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  // Validate form before submission
  const validateForm = () => {
    if (!formData.firstName.trim()) return 'First name is required';
    if (!formData.lastName.trim()) return 'Last name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (formData.password !== formData.confirmPassword) return "Passwords don't match";
    if (!passwordStrength?.isValid) {
      return 'Password must be at least 8 characters with uppercase, lowercase, and numbers/symbols';
    }
    return null;
  };

  // Handle signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (signupRL.blocked) {
      setError(signupRL.message);
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    signupRL.record();

    const result = await auth.signUp(formData.email, formData.password, {
      firstName: formData.firstName,
      lastName: formData.lastName,
      schoolName: formData.schoolName,
      examLevel: formData.examLevel
    });

    if (result.success) {
      // Email verification required
      setVerifying(true);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  // Resend verification email
  const handleResendVerification = async () => {
    setVerificationError('');
    setVerificationMessage('');

    setLoading(true);
    const result = await auth.resendVerificationEmail(formData.email);

    if (result.success) {
      setVerificationMessage('A new verification email has been sent.');
    } else {
      setVerificationError(result.error);
    }

    setLoading(false);
  };

  const handleGoogleSignup = async () => {
    setError('');
    setLoading(true);
    const result = await auth.signInWithGoogle();

    if (!result.success) {
      setError(result.error);
      setLoading(false);
    }
  };

  if (auth.isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#0B1120] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mb-4"></div>
          <p className="text-gray-400">Loading authentication...</p>
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
        {/* Header */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center">
            <GraduationCapIcon className="w-6 h-6 sm:w-7 sm:h-7 text-gray-900" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-white">EduPractice</span>
        </Link>

        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {verifying ? 'Verify Your Email' : 'Create Account'}
          </h1>
          <p className="text-sm sm:text-base text-gray-400 mt-2">
            {verifying
              ? 'Check your inbox to verify your email address'
              : 'Join thousands of students preparing for exams'}
          </p>
        </div>

        {!verifying ? (
          <>
            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full mb-4 py-3 bg-[#1a1f2e] border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-sm font-medium">{loading ? 'Redirecting...' : 'Continue with Google'}</span>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-[#111827] text-gray-500">Or sign up with email</span>
              </div>
            </div>

            {/* Signup Form */}
            {error && (
              <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-2">
                <CircleAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full bg-[#1a1f2e] border border-gray-700 p-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors text-sm"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full bg-[#1a1f2e] border border-gray-700 p-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors text-sm"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 bg-[#1a1f2e] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors text-sm"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 bg-[#1a1f2e] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors text-sm"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Password Strength Indicator */}
                {formData.password && passwordStrength && (
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
                      <div className={passwordStrength.numbers || passwordStrength.specialChars ? 'text-green-400' : 'text-gray-400'}>
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
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 bg-[#1a1f2e] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors text-sm"
                    required
                    disabled={loading}
                  />
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <CheckIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                </div>
              </div>

              {/* School Info (Optional) */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    School (Optional)
                  </label>
                  <input
                    type="text"
                    name="schoolName"
                    placeholder="Your school"
                    value={formData.schoolName}
                    onChange={handleInputChange}
                    className="w-full bg-[#1a1f2e] border border-gray-700 p-3 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors text-sm"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Exam Level (Optional)
                  </label>
                  <select
                    name="examLevel"
                    value={formData.examLevel}
                    onChange={handleInputChange}
                    className="w-full bg-[#1a1f2e] border border-gray-700 p-3 rounded-lg text-white focus:outline-none focus:border-amber-400 transition-colors text-sm"
                    disabled={loading}
                  >
                    <option value="">Select level</option>
                    <option value="A-Level">A-Level</option>
                    <option value="UACE">UACE</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !passwordStrength?.isValid}
                className="w-full py-3 bg-amber-500 text-gray-900 rounded-lg font-semibold hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Login Link */}
            <p className="text-center text-gray-400 text-sm mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </>
        ) : (
          <>
            {/* Verification Form */}
            {verificationError && (
              <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm flex items-start gap-2">
                <CircleAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{verificationError}</span>
              </div>
            )}
            {verificationMessage && (
              <div className="mb-4 px-4 py-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                {verificationMessage}
              </div>
            )}

            <div className="space-y-4">
              <p className="text-center text-gray-400 text-sm">
                We sent a verification link to <span className="text-gray-200">{formData.email}</span>.
                Open your email and click the link to activate your account.
              </p>

              <Link
                to="/login"
                className="block w-full text-center py-3 bg-amber-500 text-gray-900 rounded-lg font-semibold hover:bg-amber-400 transition-colors"
              >
                Continue to sign in
              </Link>

              <button
                type="button"
                onClick={handleResendVerification}
                className="w-full py-3 bg-[#1a1f2e] border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Resend verification email'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setVerifying(false);
                  setVerificationError('');
                  setVerificationMessage('');
                }}
                className="w-full text-gray-400 text-sm hover:text-gray-300 transition-colors"
                disabled={loading}
              >
                ← Back to signup form
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}