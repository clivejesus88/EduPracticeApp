// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardUI from './pages/DashboardUI';
import Practice from './pages/Practice';
import Layout from './pages/Layout';
import ProtectedRoute from './auth/ProtectedRoute';
import { LocalizationProvider } from './contexts/LocalizationContext';

import './App.css';

function App() {
  return (
    <LocalizationProvider>
      <Router>
        <Routes>
          {/* Protected Routes - All routes require authentication */}
          {/* Unauthorized users are redirected to https://edupractice.vercel.app/login */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<DashboardUI />} />
              <Route path="/dashboard" element={<DashboardUI />} />
              <Route path="/practice" element={<Practice />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </LocalizationProvider>
  )
}

export default App;
