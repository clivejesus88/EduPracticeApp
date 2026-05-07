# Backend Authentication Security Implementation Guide

## Overview
This guide provides backend implementations for security features that MUST be implemented server-side to make the frontend security fixes effective.

## 1. Server-Side Rate Limiting

### Node.js/Express Implementation

```javascript
// middleware/rateLimiters.js
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

// Create Redis client for distributed rate limiting
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

// ─── LOGIN RATE LIMITER ───
// 5 failed attempts per 15 minutes per email
// Only count actual failures (successful logins don't count)
const loginLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'login_attempts:',
    expiry: 15 * 60 // 15 minutes
  }),
  keyGenerator: (req) => req.body.email?.toLowerCase() || req.ip,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many login attempts. Please try again later.',
      retryAfter: req.rateLimit.resetTime
    });
  },
  skip: (req) => {
    // Skip counting if login was successful
    return req.loginSuccess === true;
  }
});

// ─── SIGNUP RATE LIMITER ───
// 3 signup attempts per hour per IP
const signupLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'signup_attempts:',
    expiry: 60 * 60 // 1 hour
  }),
  keyGenerator: (req) => req.ip,
  max: 3,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many signup attempts from this IP. Please try again later.'
    });
  }
});

// ─── PASSWORD RESET RATE LIMITER ───
// 3 password reset requests per hour per email
const passwordResetLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'password_reset:',
    expiry: 60 * 60 // 1 hour
  }),
  keyGenerator: (req) => req.body.email?.toLowerCase() || req.ip,
  max: 3,
  handler: (req, res) => {
    // Don't reveal rate limiting info (see account enumeration fix below)
    res.json({
      success: true,
      message: 'If this email exists, you will receive a password reset link'
    });
  }
});

// ─── EMAIL VERIFICATION RESEND LIMITER ───
// 5 resend attempts per 30 minutes per email
const emailResendLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'email_resend:',
    expiry: 30 * 60 // 30 minutes
  }),
  keyGenerator: (req) => req.body.email?.toLowerCase() || req.ip,
  max: 5,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many verification email requests. Please try again later.'
    });
  }
});

module.exports = {
  loginLimiter,
  signupLimiter,
  passwordResetLimiter,
  emailResendLimiter
};
```

### Routes Implementation

```javascript
// routes/auth.js
const express = require('express');
const { supabase } = require('../lib/supabaseClient');
const { validateEmail, validatePassword } = require('../utils/validation');
const { 
  loginLimiter, 
  signupLimiter, 
  passwordResetLimiter, 
  emailResendLimiter 
} = require('../middleware/rateLimiters');
const logger = require('../utils/logger');

const router = express.Router();

// ─── LOGIN ENDPOINT ───
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    // Attempt login with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      // Log failed attempt for security monitoring
      logger.warn('Failed login attempt', {
        email: email.substring(0, 3) + '***', // Partially masked
        ip: req.ip,
        timestamp: new Date().toISOString()
      });

      // Mark as failure (will be counted in rate limiter on next request)
      req.loginSuccess = false;

      // Return generic error message
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Login successful - mark for rate limiter to skip counting
    req.loginSuccess = true;

    // Log successful login
    logger.info('Successful login', {
      userId: data.user.id,
      email: data.user.email,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email
      },
      session: data.session
    });

  } catch (err) {
    logger.error('Login error', { error: err.message, ip: req.ip });
    res.status(500).json({ error: 'Authentication service error' });
  }
});

// ─── SIGNUP ENDPOINT ───
router.post('/signup', signupLimiter, async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validate email
    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Validate password strength
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.isValid) {
      return res.status(400).json({
        error: 'Password does not meet requirements',
        requirements: passwordCheck
      });
    }

    // Check for existing user
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(email);
    if (existingUser) {
      // Don't reveal that email exists
      return res.json({
        success: true,
        message: 'If this is a new email, you will receive a verification email'
      });
    }

    // Create user
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: {
        first_name: firstName,
        last_name: lastName
      }
    });

    if (error) {
      logger.error('Signup error', { email: email.substring(0, 3) + '***', error: error.message });
      
      // Return generic error
      return res.json({
        success: true,
        message: 'If this is a new email, you will receive a verification email'
      });
    }

    // Send verification email
    await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${process.env.FRONTEND_URL}/verify-email`
      }
    });

    logger.info('User signup', {
      userId: data.user.id,
      email: data.user.email,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      userId: data.user.id,
      needsVerification: true
    });

  } catch (err) {
    logger.error('Signup service error', { error: err.message });
    res.status(500).json({ error: 'Service temporarily unavailable' });
  }
});

// ─── PASSWORD RESET ENDPOINT ───
// IMPORTANT: Always return success to prevent email enumeration
router.post('/forgot-password', passwordResetLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!validateEmail(email)) {
      // Still return success message
      return res.json({
        success: true,
        message: 'If this email exists, you will receive a password reset link'
      });
    }

    // Try to send reset email (don't check if user exists first)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`
    });

    // Log the request (regardless of success)
    logger.info('Password reset requested', {
      email: email.substring(0, 3) + '***',
      ip: req.ip,
      timestamp: new Date().toISOString()
    });

    // Always return same response
    res.json({
      success: true,
      message: 'If this email exists, you will receive a password reset link'
    });

  } catch (err) {
    logger.error('Password reset error', { error: err.message });
    // Still return success to prevent enumeration
    res.json({
      success: true,
      message: 'If this email exists, you will receive a password reset link'
    });
  }
});

// ─── RESEND EMAIL VERIFICATION ───
router.post('/resend-verification', emailResendLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    // Resend verification email
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${process.env.FRONTEND_URL}/verify-email`
      }
    });

    if (error) {
      logger.warn('Resend verification error', {
        email: email.substring(0, 3) + '***',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Verification email sent'
    });

  } catch (err) {
    logger.error('Resend verification service error', { error: err.message });
    res.status(500).json({ error: 'Service error' });
  }
});

module.exports = router;
```

## 2. Password Validation

```javascript
// utils/validation.js
const validator = require('validator');

// Email validation: RFC 5322 compliant
const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  if (email.length > 254) return false;
  
  try {
    return validator.isEmail(email);
  } catch {
    return false;
  }
};

// Password strength validation
const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      reasons: ['Password is required']
    };
  }

  const reasons = [];

  if (password.length < 8) {
    reasons.push('At least 8 characters');
  }
  if (password.length > 128) {
    reasons.push('Maximum 128 characters');
  }
  if (!/[A-Z]/.test(password)) {
    reasons.push('Must include uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    reasons.push('Must include lowercase letter');
  }
  if (!/\d/.test(password) && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    reasons.push('Must include number or special character');
  }

  // Check for common patterns
  const commonPatterns = [
    /^123456/,
    /^password/i,
    /^qwerty/i,
    /^admin/i,
    /^letmein/i,
    /^welcome/i
  ];

  if (commonPatterns.some(pattern => pattern.test(password))) {
    reasons.push('Password is too common');
  }

  // Check for repeated characters
  if (/(.)\1{2,}/.test(password)) {
    reasons.push('Too many repeated characters');
  }

  return {
    isValid: reasons.length === 0,
    reasons
  };
};

module.exports = {
  validateEmail,
  validatePassword
};
```

## 3. Logging & Monitoring

```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'auth-service' },
  transports: [
    // Log to file
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    
    // Log to console in development
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: winston.format.simple()
      })
    ] : [])
  ]
});

module.exports = logger;

// Example monitoring queries
const securityEvents = [
  '5+ failed logins from same IP in 1 hour',
  'Password reset request from new IP',
  'Account created then immediately deleted',
  'Multiple failed email verifications',
  'Signup from known VPN/proxy IPs'
];
```

## 4. CSRF Protection for OAuth

```javascript
// middleware/csrf.js
const crypto = require('crypto');

// Generate CSRF token
const generateCsrfToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// CSRF middleware
const csrfProtection = (req, res, next) => {
  // Generate token for GET requests
  if (req.method === 'GET') {
    if (!req.session) {
      req.session = {};
    }
    req.csrfToken = req.session.csrfToken || generateCsrfToken();
    req.session.csrfToken = req.csrfToken;
  }
  next();
};

// CSRF validation for POST requests
const validateCsrf = (req, res, next) => {
  const token = req.body._csrf || req.headers['x-csrf-token'];
  const sessionToken = req.session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }

  delete req.session.csrfToken; // Single-use token
  next();
};

// OAuth callback CSRF validation
const validateOAuthState = (req, res, next) => {
  const { state } = req.query;
  const sessionState = req.session?.oauthState;

  if (!state || !sessionState || state !== sessionState) {
    logger.warn('OAuth CSRF validation failed', {
      ip: req.ip,
      provider: req.query.provider
    });
    return res.status(400).send('Invalid OAuth state parameter');
  }

  delete req.session.oauthState;
  next();
};

module.exports = {
  csrfProtection,
  validateCsrf,
  validateOAuthState,
  generateCsrfToken
};
```

## Environment Variables Required

```bash
# .env.backend

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Redis (for distributed rate limiting)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# CORS
FRONTEND_URL=https://yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Logging
LOG_LEVEL=info
LOG_DIR=./logs

# Security
JWT_SECRET=your-jwt-secret
SESSION_SECRET=your-session-secret
```

## Testing the Backend Security

```bash
# Test 1: Rate limiting on login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"wrong"}' \
  # Repeat 6 times - should be blocked on 6th

# Test 2: Account enumeration protection
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"nonexistent@example.com"}'
# Should return success message even if email doesn't exist

# Test 3: Email validation
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email","password":"Test123!@#"}'
# Should reject invalid email

# Test 4: Strong password requirement
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"weak"}'
# Should reject weak password
```

## Deployment Checklist

- [ ] Enable HTTPS/TLS for all endpoints
- [ ] Configure CORS properly (whitelist domains)
- [ ] Set up Redis for distributed rate limiting
- [ ] Enable request logging and monitoring
- [ ] Configure alerting for security events
- [ ] Set up email service with proper authentication
- [ ] Enable database encryption at rest
- [ ] Configure automatic backups
- [ ] Set up WAF (Web Application Firewall)
- [ ] Enable DDoS protection
- [ ] Regular security audits and penetration testing
