import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardUI from './pages/DashboardUI';
import Practice from './pages/Practice';
import Layout from './pages/Layout';

import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<DashboardUI />} />
          <Route path="/dashboard" element={<DashboardUI />} />
          <Route path="/practice" element={<Practice />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App;
