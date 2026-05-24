import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();
  const location = useLocation();
  
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('habit_tracker_theme') || 'dark';
  });

  useEffect(() => {
    const isLogin = location.pathname === '/login';
    const effectiveTheme = isLogin ? 'light' : theme;

    // Apply theme to body
    if (effectiveTheme === 'light') {
      document.body.classList.add('light-theme');
      document.documentElement.classList.remove('dark');
    } else {
      document.body.classList.remove('light-theme');
      document.documentElement.classList.add('dark');
    }
    
    if (!isLogin) {
      localStorage.setItem('habit_tracker_theme', theme);
    }
  }, [theme, location.pathname]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <AppLayout theme={theme} toggleTheme={toggleTheme} />
          </ProtectedRoute>
        } 
      >
        <Route index element={<Dashboard />} />
        {/* We can add /dashboard/habits and /dashboard/analytics here later */}
      </Route>
      {/* Redirect root to dashboard (or login if not authenticated) */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
