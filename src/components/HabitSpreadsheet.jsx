import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Check, Plus, Flame, Edit2, Trash2, X, Save } from 'lucide-react';

const HabitSpreadsheet = ({ habits, onToggleDate, onAdd, onEdit, onDelete }) => {
  const [newHabitName, setNewHabitName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const editInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newHabitName.trim()) {
      onAdd(newHabitName.trim());
      setNewHabitName('');
      setIsAdding(false);
    }
  };

  const startEdit = (habit) => {
    setEditingId(habit.id);
    setEditName(habit.name);
  };

  const saveEdit = () => {
    if (editName.trim() && editingId) {
      onEdit(editingId, editName.trim());
    }
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this habit? All history will be lost.')) {
      onDelete(id);
    }
  };

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  // Generate the last 7 days
  const days = useMemo(() => {
    const dArray = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const shortName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      dArray.push({ name: shortName, num: dayNum, dateStr, monthName });
    }
    return dArray;
  }, []);

  const monthLabel = useMemo(() => {
    if (days.length === 0) return '';
    const firstMonth = days[0].monthName;
    const lastMonth = days[days.length - 1].monthName;
    if (firstMonth === lastMonth) {
      return firstMonth;
    }
    return `${firstMonth} / ${lastMonth}`;
  }, [days]);

  return (
    <div>
      <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
        <h2>Habit Tracking</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)} 
          className="btn-icon" 
          style={{ background: 'var(--bg-secondary)' }}
          aria-label="Add habit"
        >
          <Plus size={20} />
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="animate-fade-in card glass" style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', padding: '1rem' }}>
          <input 
            type="text" 
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="E.g., Drink 2L water"
            className="input-field"
            autoFocus
          />
          <button type="submit" className="btn btn-primary">Add</button>
          <button type="button" onClick={() => setIsAdding(false)} className="btn btn-icon">
            <X size={20} />
          </button>
        </form>
      )}

      {habits.length === 0 && !isAdding ? (
        <div className="card glass" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <p style={{ marginBottom: '1rem' }}>No habits added yet.</p>
          <button onClick={() => setIsAdding(true)} className="btn btn-primary">
            <Plus size={18} /> Create your first habit
          </button>
        </div>
      ) : (
        habits.length > 0 && (
          <div className="spreadsheet-container animate-fade-in">
            <div style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'left' }}>
              {monthLabel}
            </div>
            <table className="spreadsheet-table">
              <thead>
                <tr>
                  <th>Habit</th>
                  {days.map((day, i) => (
                    <th key={i}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                        <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{day.name}</span>
                        <span style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{day.num}</span>
                      </div>
                    </th>
                  ))}
                  <th>Streak</th>
                  <th style={{ minWidth: '100px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {habits.map((habit) => (
                  <tr key={habit.id}>
                    <td>
                      {editingId === habit.id ? (
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <input 
                            ref={editInputRef}
                            type="text" 
                            className="input-field" 
                            style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit();
                              if (e.key === 'Escape') cancelEdit();
                            }}
                          />
                          <button onClick={saveEdit} className="btn-icon" style={{ color: 'var(--success)' }}><Save size={16} /></button>
                          <button onClick={cancelEdit} className="btn-icon"><X size={16} /></button>
                        </div>
                      ) : (
                        <>
                          <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{habit.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            {Object.keys(habit.history || {}).length} total
                          </div>
                        </>
                      )}
                    </td>
                    {days.map((day, i) => {
                      const isCompleted = habit.history && habit.history[day.dateStr];
                      return (
                        <td key={i}>
                          <button 
                            className={`cell-button ${isCompleted ? 'active pulse' : ''}`}
                            onClick={() => onToggleDate(habit.id, day.dateStr)}
                            aria-label={`Toggle for ${day.dateStr}`}
                          >
                            <Check size={18} strokeWidth={3} />
                          </button>
                        </td>
                      );
                    })}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', color: habit.streak > 0 ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                        <Flame size={16} />
                        <span style={{ fontWeight: 600 }}>{habit.streak}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
                         <button onClick={() => startEdit(habit)} className="btn-icon" aria-label="Edit"><Edit2 size={16} /></button>
                         <button onClick={() => handleDelete(habit.id)} className="btn-icon" style={{ color: 'var(--danger)' }} aria-label="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

export default HabitSpreadsheet;
