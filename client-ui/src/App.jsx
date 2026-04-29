// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardUI from './pages/DashboardUI';
import Practice from './pages/Practice';
import Analytics from './pages/Analytics';
import MockExams from './pages/MockExams';
import ExamRunner from './pages/ExamRunner';
import ExamResults from './pages/ExamResults';
import Profile from './pages/Profile';
import Layout from './pages/Layout';
import ProtectedRoute from './auth/ProtectedRoute';
import { LocalizationProvider } from './contexts/LocalizationContext';
import { UserProvider } from './contexts/UserContext';

import './App.css';

function App() {
  return (
    <LocalizationProvider>
      <UserProvider>
        <Router>
        <Routes>
          {/* Protected Routes - All routes require authentication */}
          {/* Unauthorized users are redirected to https://edupractice.vercel.app/login */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardUI />} />
              <Route path="/dashboard" element={<DashboardUI />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/mock-exams" element={<MockExams />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            {/* Distraction-free exam routes (no sidebar) */}
            <Route path="/exam/run" element={<ExamRunner />} />
            <Route path="/exam/results/:attemptId" element={<ExamResults />} />
          </Route>
        </Routes>
        </Router>
      </UserProvider>
    </LocalizationProvider>
  )
}

export default App;
