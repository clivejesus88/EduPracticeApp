import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabaseClient';

const UserContext = createContext(null);

/**
 * Default user data structure
 */
const defaultUser = {
  id: null,
  email: '',
  firstName: 'User',
  lastName: '',
  fullName: 'User',
  schoolName: '',
  examLevel: '',
  dailyGoal: 50,
  notifications: true,
  twoFactor: false,
  isVerified: false,
  avatar: null,
  stats: {
    questionsAttempted: 0,
    averageAccuracy: 0,
    totalStudyTime: '0h 0m',
    achievements: 0
  }
};

/**
 * Build full name from first and last names
 */
const buildFullName = (firstName, lastName) => {
  const parts = [firstName, lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'User';
};

/**
 * Fetch user data from Supabase
 */
const fetchUserDataFromSupabase = async (authUser) => {
  if (!authUser) return null;

  try {
    // Try to get user profile from profiles table
    // Note: You'll need to create this table in Supabase with the following structure:
    // CREATE TABLE profiles (
    //   id uuid REFERENCES auth.users(id) PRIMARY KEY,
    //   email text UNIQUE,
    //   first_name text,
    //   last_name text,
    //   school_name text,
    //   exam_level text,
    //   avatar_url text,
    //   daily_goal integer DEFAULT 50,
    //   notifications boolean DEFAULT true,
    //   two_factor boolean DEFAULT false,
    //   created_at timestamp DEFAULT now()
    // );

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found (expected for new users)
      console.warn('Error fetching user profile:', error);
      return null;
    }

    // Build user data from auth user and profile
    const fullName = buildFullName(
      profile?.first_name || authUser.user_metadata?.first_name || '',
      profile?.last_name || authUser.user_metadata?.last_name || ''
    );

    return {
      id: authUser.id,
      email: authUser.email || '',
      firstName: profile?.first_name || authUser.user_metadata?.first_name || '',
      lastName: profile?.last_name || authUser.user_metadata?.last_name || '',
      fullName,
      schoolName: profile?.school_name || '',
      examLevel: profile?.exam_level || '',
      dailyGoal: profile?.daily_goal || 50,
      notifications: profile?.notifications !== false,
      twoFactor: profile?.two_factor || false,
      isVerified: authUser.email_confirmed_at !== null,
      avatar: profile?.avatar_url || null,
      stats: {
        questionsAttempted: 0,
        averageAccuracy: 0,
        totalStudyTime: '0h 0m',
        achievements: 0
      }
    };
  } catch (err) {
    console.error('Failed to fetch user data:', err);
    return null;
  }
};

/**
 * Save user profile to Supabase
 */
const saveUserProfileToSupabase = async (userId, userData) => {
  if (!userId) return false;

  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        school_name: userData.schoolName,
        exam_level: userData.examLevel,
        avatar_url: userData.avatar,
        daily_goal: userData.dailyGoal,
        notifications: userData.notifications,
        two_factor: userData.twoFactor
      });

    if (error) {
      console.warn('Error saving user profile:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to save user profile:', err);
    return false;
  }
};

/**
 * UserProvider Component
 * Manages user data synchronized with Supabase
 */
export function UserProvider({ children }) {
  const auth = useAuth();
  const [user, setUser] = useState(defaultUser);
  const [isLoading, setIsLoading] = useState(true);

  // Load user data when auth state changes
  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (auth.isLoading) {
          setIsLoading(true);
          return;
        }

        if (!auth.isAuthenticated || !auth.user) {
          // User not authenticated - reset to default
          setUser(defaultUser);
          setIsLoading(false);
          return;
        }

        // Fetch user data from Supabase
        const userData = await fetchUserDataFromSupabase(auth.user);

        if (userData) {
          setUser(userData);
        } else {
          // Create a user object from auth data
          const fullName = buildFullName(
            auth.user.user_metadata?.first_name || '',
            auth.user.user_metadata?.last_name || ''
          );

          setUser({
            ...defaultUser,
            id: auth.user.id,
            email: auth.user.email || '',
            firstName: auth.user.user_metadata?.first_name || '',
            lastName: auth.user.user_metadata?.last_name || '',
            fullName,
            schoolName: auth.user.user_metadata?.school_name || '',
            examLevel: auth.user.user_metadata?.exam_level || '',
            isVerified: auth.user.email_confirmed_at !== null
          });
        }
      } catch (err) {
        console.error('Failed to load user data:', err);
        setUser(defaultUser);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [auth.isAuthenticated, auth.user, auth.isLoading]);

  /**
   * Update user data locally and sync to Supabase
   */
  const updateUser = async (updates) => {
    if (!user.id) {
      console.warn('Cannot update user without ID');
      return false;
    }

    const newUser = { ...user, ...updates };

    // If full name is updated, recalculate it
    if (updates.firstName || updates.lastName) {
      newUser.fullName = buildFullName(
        updates.firstName || user.firstName,
        updates.lastName || user.lastName
      );
    }

    try {
      // Update in Supabase
      const success = await saveUserProfileToSupabase(user.id, newUser);

      if (success) {
        setUser(newUser);
        return true;
      }

      return false;
    } catch (err) {
      console.error('Failed to update user:', err);
      return false;
    }
  };

  /**
   * Update user statistics
   */
  const updateStats = (updates) => {
    setUser(prev => ({
      ...prev,
      stats: { ...prev.stats, ...updates }
    }));
  };

  /**
   * Get first name for greetings
   */
  const getFirstName = () => {
    return user.firstName || 'User';
  };

  /**
   * Get initials for avatar fallback
   */
  const getInitials = () => {
    const parts = [user.firstName, user.lastName].filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return user.email ? user.email.substring(0, 2).toUpperCase() : 'U';
  };

  const value = {
    user,
    isLoading,
    updateUser,
    updateStats,
    getFirstName,
    getInitials
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

/**
 * useUser hook
 */
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export default UserContext;
