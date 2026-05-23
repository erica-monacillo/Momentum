import React, { useState, useEffect } from 'react';
import { getNotes, saveNotes } from '../utils/storage';

const GoalNotes = ({ user }) => {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (user?.username) {
      getNotes(user.username).then(setNotes);
    }
  }, [user]);

  const handleNotesChange = (e) => {
    const value = e.target.value;
    setNotes(value);
    if (user?.username) {
      saveNotes(user.username, value);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', minHeight: '36px' }}>
        <h2>Goals & Notes</h2>
      </div>
      <div className="card glass animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1rem' }}>
        <textarea
          placeholder="Write down your overarching goals, thoughts, or daily notes here..."
          style={{ flex: 1, resize: 'none', minHeight: '200px', border: 'none', background: 'transparent', outline: 'none', padding: '0.5rem', color: 'var(--text-primary)', fontFamily: 'inherit', fontSize: '0.875rem' }}
          value={notes}
          onChange={handleNotesChange}
        />
      </div>
    </div>
  );
};

export default GoalNotes;
