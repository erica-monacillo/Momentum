import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const Login = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLoginMode) {
        if (!email.trim() || !password.trim()) {
          setError('Email and Password are required.');
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      } else {
        if (!email.trim() || !password.trim()) {
          setError('Email and Password are required.');
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setError('');
    setEmail('');
    setPassword('');
  };

  return (
    <div className="flex items-center justify-center w-full min-h-screen bg-background p-4 animate-fade-in">
      <div className="card glass" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '2.5rem 2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ margin: '0 auto 1.5rem', display: 'flex', justifyContent: 'center' }}>
            <img src="/logo.png" alt="Momentum Logo" style={{ width: '250px', height: '160px', objectFit: 'contain' }} />
          </div>
        </div>
        
        {error && (
          <div style={{ marginBottom: '1rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            type="email" 
            placeholder="Email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            required
            autoFocus
          />

          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            required
          />

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Processing...' : (isLoginMode ? 'Log In' : 'Create Account')}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          {isLoginMode ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={toggleMode}
            type="button"
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
