import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCapIcon } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const auth = useAuth()

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (auth.isAuthenticated) {
      navigate('/dashboard')
    }
  }, [auth.isAuthenticated, navigate])

  // Google OAuth
  const handleGoogleSignIn = async () => {
    setError('')
    setLoading(true)
    try {
      const result = await auth.signInWithGoogle()

      if (!result.success) {
        setError(result.error || 'Failed to sign in with Google. Please try again.')
        setLoading(false)
      }
    } catch (err) {
      setError(err?.message || 'An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  if (auth.isLoading) {
    return (
      <div className="min-h-screen w-full bg-[#0B1120] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400 mb-4"></div>
          <p className="text-gray-400">Loading authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-[#0B1120] flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-6 sm:mb-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg flex items-center justify-center">
            <GraduationCapIcon className="w-6 h-6 sm:w-7 sm:h-7 text-gray-900" />
          </div>
          <span className="text-xl sm:text-2xl font-bold text-white">EduPractice</span>
        </Link>

        {/* Login Card */}
        <div className="bg-[#111827] border border-gray-800 rounded-2xl p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 text-center">
            Welcome Back
          </h1>
          <p className="text-sm sm:text-base text-gray-400 text-center mb-8 sm:mb-10">
            Sign in with Google to continue your learning journey
          </p>

          {error && (
            <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm text-center flex items-center justify-center gap-2">
              <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 px-4 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 min-h-[48px]"
            title="Sign in with Google"
          >
            {loading ? (
              <>
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <p className="text-center text-gray-500 text-xs mt-6 px-4">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>

          {/* Sign Up */}
          <p className="text-center text-gray-400 text-sm mt-6 sm:mt-8">
            New to EduPractice?{' '}
            <Link to="/signup" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
              Create account
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <Link
          to="/"
          className="block text-center text-gray-400 hover:text-white text-sm mt-5 sm:mt-6 transition-colors"
        >
          ← Back to home
        </Link>
      </motion.div>
    </div>
  )
}