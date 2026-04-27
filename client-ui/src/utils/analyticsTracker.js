/**
 * Analytics Tracker - Tracks user interactions and generates real metrics
 * Stores data in localStorage for persistence across sessions
 */

const STORAGE_KEY = 'edu_practice_analytics';

// Initialize or retrieve analytics data
const getAnalyticsData = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    sessionStartTime: new Date().toISOString(),
    topicsViewed: [],
    practiceAttempts: [],
    examsStarted: [],
    examsCompleted: [],
    chatInteractions: 0,
    totalTimeSpent: 0, // in minutes
    lastUpdated: new Date().toISOString(),
  };
};

// Save analytics data
const saveAnalyticsData = (data) => {
  data.lastUpdated = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// Track topic view
export const trackTopicView = (topicName, topicId) => {
  const data = getAnalyticsData();
  const timestamp = new Date().toISOString();
  
  data.topicsViewed.push({
    topicName,
    topicId,
    timestamp,
    duration: 0, // Will be updated on topic switch
  });
  
  saveAnalyticsData(data);
};

// Track practice attempt
export const trackPracticeAttempt = (topicName, score, duration) => {
  const data = getAnalyticsData();
  
  data.practiceAttempts.push({
    topicName,
    score, // Score as percentage
    duration, // Duration in minutes
    timestamp: new Date().toISOString(),
  });
  
  saveAnalyticsData(data);
};

// Track exam start
export const trackExamStart = (examName, examLevel) => {
  const data = getAnalyticsData();
  
  data.examsStarted.push({
    examName,
    examLevel,
    startTime: new Date().toISOString(),
  });
  
  saveAnalyticsData(data);
};

// Track exam completion
export const trackExamCompletion = (examName, score, duration) => {
  const data = getAnalyticsData();
  
  data.examsCompleted.push({
    examName,
    score, // Score as percentage
    duration, // Duration in minutes
    timestamp: new Date().toISOString(),
  });
  
  saveAnalyticsData(data);
};

// Track chat interaction
export const trackChatInteraction = (messageType) => {
  const data = getAnalyticsData();
  data.chatInteractions += 1;
  saveAnalyticsData(data);
};

// Calculate metrics
export const getMetrics = () => {
  const data = getAnalyticsData();
  
  // Calculate improvement (compare first 3 vs last 3 practice attempts)
  const practiceScores = data.practiceAttempts.map(p => p.score);
  let improvement = 0;
  if (practiceScores.length >= 3) {
    const firstThree = practiceScores.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const lastThree = practiceScores.slice(-3).reduce((a, b) => a + b, 0) / 3;
    improvement = Math.round(lastThree - firstThree);
  }
  
  // Calculate average accuracy from practice and exams
  const allScores = [
    ...data.practiceAttempts.map(p => p.score),
    ...data.examsCompleted.map(e => e.score),
  ];
  const avgAccuracy = allScores.length > 0 
    ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
    : 0;
  
  // Total exams taken
  const examsTaken = data.examsCompleted.length;
  
  // Topics mastered (topics with average score > 80%)
  const topicScores = {};
  data.practiceAttempts.forEach(attempt => {
    if (!topicScores[attempt.topicName]) {
      topicScores[attempt.topicName] = [];
    }
    topicScores[attempt.topicName].push(attempt.score);
  });
  
  const topicsMastered = Object.values(topicScores).filter(scores => {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return avg > 80;
  }).length;
  
  return {
    improvement, // e.g., "+15" means 15% improvement
    examsTaken,
    avgAccuracy,
    topicsMastered,
    totalAttempts: data.practiceAttempts.length,
    chatInteractions: data.chatInteractions,
    practiceScores,
    examsScores: data.examsCompleted.map(e => e.score),
  };
};

// Reset analytics (for testing)
export const resetAnalytics = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// Get raw analytics data (for debugging)
export const getRawAnalyticsData = () => {
  return getAnalyticsData();
};

export default {
  trackTopicView,
  trackPracticeAttempt,
  trackExamStart,
  trackExamCompletion,
  trackChatInteraction,
  getMetrics,
  resetAnalytics,
  getRawAnalyticsData,
};
