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
    totalStudyTime: '0 minutes',
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
 * Fetch user stats from Supabase
 */
const fetchUserStatsFromSupabase = async (userId) => {
  if (!userId) return null;

  try {
    const { data: stats, error } = await supabase
      .from('user_stats')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn('Error fetching user stats:', error);
      return null;
    }

    return {
      questionsAttempted: stats?.questions_attempted || 0,
      averageAccuracy: stats?.average_accuracy || 0,
      totalStudyTime: stats?.total_study_time || '0 minutes',
      achievements: stats?.achievements || 0
    };
  } catch (err) {
    console.error('Failed to fetch user stats:', err);
    return null;
  }
};

/**
 * Save user stats to Supabase
 */
const saveUserStatsToSupabase = async (userId, stats) => {
  if (!userId) return false;

  try {
    const { error } = await supabase
      .from('user_stats')
      .upsert({
        id: userId,
        questions_attempted: stats.questionsAttempted,
        average_accuracy: stats.averageAccuracy,
        total_study_time: stats.totalStudyTime,
        achievements: stats.achievements,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.warn('Error saving user stats:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to save user stats:', err);
    return false;
  }
};

/**
 * Fetch user profile from Supabase
 */
const fetchUserDataFromSupabase = async (authUser) => {
  if (!authUser) return null;

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn('Error fetching user profile:', error);
      return null;
    }

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
      stats: defaultUser.stats // will be replaced after stats fetch
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

const PREFS_KEY = 'edupractice_user_prefs';

function loadLocalPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveLocalPrefs(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {}
}

/**
 * UserProvider Component
 */
export function UserProvider({ children }) {
  const auth = useAuth();
  const [user, setUser] = useState(defaultUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        if (auth.isLoading) {
          setIsLoading(true);
          return;
        }

        if (!auth.isAuthenticated || !auth.user) {
          // Load saved preferences from localStorage for unauthenticated users
          const local = loadLocalPrefs();
          setUser(local ? { ...defaultUser, ...local } : defaultUser);
          setIsLoading(false);
          return;
        }

        const userData = await fetchUserDataFromSupabase(auth.user);
        const statsData = await fetchUserStatsFromSupabase(auth.user.id);

        if (userData) {
          setUser({
            ...userData,
            stats: statsData || defaultUser.stats
          });
        } else {
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

  const updateUser = async (updates) => {
    const newUser = { ...user, ...updates };

    if (updates.firstName || updates.lastName) {
      newUser.fullName = buildFullName(
        updates.firstName || user.firstName,
        updates.lastName || user.lastName
      );
    }

    // Always persist to localStorage so preferences survive page reloads
    const prefsToSave = {
      fullName: newUser.fullName,
      email: newUser.email,
      schoolName: newUser.schoolName,
      examLevel: newUser.examLevel,
      dailyGoal: newUser.dailyGoal,
      notifications: newUser.notifications,
    };
    saveLocalPrefs(prefsToSave);

    // Optimistically update state immediately
    setUser(newUser);

    // Also persist to Supabase if authenticated
    if (user.id) {
      try {
        await saveUserProfileToSupabase(user.id, newUser);
      } catch (err) {
        console.error('Failed to sync prefs to Supabase:', err);
      }
    }

    return true;
  };

  const updateStats = async (updates) => {
    if (!user.id) {
      console.warn('Cannot update stats without user ID');
      return false;
    }

    const newStats = { ...user.stats, ...updates };
    const success = await saveUserStatsToSupabase(user.id, newStats);

    if (success) {
      setUser(prev => ({ ...prev, stats: newStats }));
      return true;
    }
    return false;
  };

  const getFirstName = () => user.firstName || 'User';

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

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export default UserContext;
