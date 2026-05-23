import React, { useState, useEffect } from 'react';
import HabitSpreadsheet from '../components/HabitSpreadsheet';
import ProgressChart from '../components/ProgressChart';
import DailyProgress from '../components/DailyProgress';
import GoalNotes from '../components/GoalNotes';
import SettingsModal from '../components/SettingsModal';
import { getHabits, toggleHabitDate, addHabit, editHabit, deleteHabit } from '../utils/storage';
import { LogOut, Sun, Moon, Settings } from 'lucide-react';

const Dashboard = ({ user, onLogout, onUserUpdate, theme, toggleTheme }) => {
  const [habits, setHabits] = useState([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (user?.username) {
      getHabits(user.username).then(setHabits);
    }
  }, [user]);

  const handleToggleDate = async (id, dateStr) => {
    const { habits: updated, user: updatedUser } = await toggleHabitDate(id, dateStr, user?.username);
    setHabits(updated);
    if (updatedUser) onUserUpdate(updatedUser);
  };



  const handleAdd = async (name) => {
    const newHabit = await addHabit(name, user?.username);
    setHabits(prev => [...prev, newHabit]);
  };

  const handleEdit = async (id, name) => {
    const updated = await editHabit(id, name, user?.username);
    setHabits(updated);
  };

  const handleDelete = async (id) => {
    const updated = await deleteHabit(id, user?.username);
    setHabits(updated);
  };

  // Calculate some stats
  const activeStreaks = habits.filter(h => h.streak > 0).length;
  const totalCompletions = habits.reduce((acc, h) => acc + Object.keys(h.history || {}).length, 0);

  // Level progress calculations
  const xp = user?.xp || 0;
  const level = user?.level || 1;
  const currentLevelXp = xp % 100;
  const progressPercent = (currentLevelXp / 100) * 100;

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
      <header className="flex-between" style={{ padding: '2rem 0', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem' }}>Hello, {user.username} 👋</h1>
          <p>Let's make today count.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setIsSettingsOpen(true)} className="btn-icon" aria-label="Settings">
            <Settings size={20} />
          </button>
          <button onClick={toggleTheme} className="btn-icon" aria-label="Toggle Theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={onLogout} className="btn-icon" aria-label="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Stats & Gamification Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card glass" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem' }}>Level {level}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>{currentLevelXp} / 100 XP</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Habit Tracker</h2>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        <div className="card glass" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Active Streaks</p>
          <h2 style={{ color: 'var(--accent-primary)', fontSize: '2rem' }}>{activeStreaks}</h2>
        </div>
        
        <div className="card glass" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Completions</p>
          <h2 style={{ color: 'var(--success)', fontSize: '2rem' }}>{totalCompletions}</h2>
        </div>
        
        <DailyProgress habits={habits} />
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'stretch', marginTop: '2rem' }}>
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
          <HabitSpreadsheet 
            habits={habits} 
            onToggleDate={handleToggleDate} 
            onAdd={handleAdd} 
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
        {/* Goals & Notes Panel */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <GoalNotes user={user} />
        </div>
      </div>
      <ProgressChart habits={habits} />
      
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
};

export default Dashboard;
