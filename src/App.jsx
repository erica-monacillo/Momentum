import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { getUser, logout as logoutUser } from './utils/storage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('habit_tracker_theme') || 'dark';
  });

  useEffect(() => {
    // Apply theme to body
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('habit_tracker_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const storedUser = await getUser();
      if (storedUser) {
        setUser(storedUser);
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  if (loading) {
    return <div className="container flex-center" style={{ minHeight: '100vh' }}>Loading...</div>;
  }

  return (
    <>
      {user ? (
        <Dashboard 
          user={user} 
          onLogout={handleLogout} 
          onUserUpdate={handleUserUpdate}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </>
  );
}

export default App;
