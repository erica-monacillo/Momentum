import React, { useState } from 'react';
import { login, register } from '../utils/storage';

const Login = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  // Form fields
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLoginMode) {
        if (!username.trim() || !password.trim()) {
          setError('Username and Password are required.');
          return;
        }
        const user = await login(username.trim(), password);
        onLogin(user);
      } else {
        if (!username.trim() || !email.trim() || !password.trim()) {
          setError('All fields are required.');
          return;
        }
        const user = await register(username.trim(), email.trim(), password);
        onLogin(user);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setUsername('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="container flex-center animate-fade-in" style={{ minHeight: '100vh' }}>
      <div className="card glass" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '2.5rem 2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            width: '60px', height: '60px', borderRadius: '16px', 
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-hover))',
            margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h1>HabitTracker</h1>
          <p style={{ marginTop: '0.5rem' }}>{isLoginMode ? 'Welcome back!' : 'Create your account'}</p>
        </div>
        
        {error && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            type="text" 
            placeholder="Username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field"
            required
            autoFocus
          />
          
          {!isLoginMode && (
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          )}

          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            required
          />

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            {isLoginMode ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {isLoginMode ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={toggleMode}
            style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontWeight: 600, cursor: 'pointer' }}
          >
            {isLoginMode ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
