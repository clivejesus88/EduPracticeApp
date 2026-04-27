import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext(null);

// Default user data
const defaultUser = {
  fullName: 'Sarah K.',
  email: 'sarah.k@example.com',
  schoolName: 'Makerere University',
  examLevel: 'A-Level',
  dailyGoal: 50,
  notifications: true,
  twoFactor: false,
  isVerified: true,
  stats: {
    questionsAttempted: 1248,
    averageAccuracy: 86.5,
    totalStudyTime: '156h 45m',
    achievements: 24
  }
};

// Load user data from localStorage
const loadUserData = () => {
  try {
    const saved = localStorage.getItem('eduPractice_user');
    if (saved) {
      return { ...defaultUser, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load user data:', e);
  }
  return defaultUser;
};

// Save user data to localStorage
const saveUserData = (data) => {
  try {
    localStorage.setItem('eduPractice_user', JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save user data:', e);
  }
};

export function UserProvider({ children }) {
  const [user, setUser] = useState(loadUserData);

  // Save to localStorage whenever user changes
  useEffect(() => {
    saveUserData(user);
  }, [user]);

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const updateStats = (updates) => {
    setUser(prev => ({
      ...prev,
      stats: { ...prev.stats, ...updates }
    }));
  };

  // Get first name for greetings
  const getFirstName = () => {
    const name = user.fullName || 'User';
    return name.split(' ')[0];
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    const name = user.fullName || 'User';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const value = {
    user,
    updateUser,
    updateStats,
    getFirstName,
    getInitials
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export default UserContext;
