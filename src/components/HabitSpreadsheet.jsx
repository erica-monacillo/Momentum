import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Check, Plus, Flame, Edit2, Trash2, X, Save, Dumbbell, Code, BookOpen, Activity, Coffee, Terminal } from 'lucide-react';
import { getLocalDateString } from '../utils/date';

const getHabitIcon = (name) => {
  const n = name.toLowerCase();
  if (n.includes('gym') || n.includes('workout') || n.includes('exercise')) return { icon: <Dumbbell size={16} />, bg: 'bg-indigo-500/20 text-indigo-400' };
  if (n.includes('code') || n.includes('program') || n.includes('dev')) return { icon: <Code size={16} />, bg: 'bg-emerald-500/20 text-emerald-400' };
  if (n.includes('read') || n.includes('book')) return { icon: <BookOpen size={16} />, bg: 'bg-blue-500/20 text-blue-400' };
  if (n.includes('water') || n.includes('drink')) return { icon: <Coffee size={16} />, bg: 'bg-cyan-500/20 text-cyan-400' };
  if (n.includes('terminal')) return { icon: <Terminal size={16} />, bg: 'bg-yellow-500/20 text-yellow-400' };
  return { icon: <Activity size={16} />, bg: 'bg-primary/20 text-primary' };
};

const HabitSpreadsheet = ({ habits, onToggleDate, onAdd, onEdit, onDelete }) => {
  const [newHabitName, setNewHabitName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const editInputRef = useRef(null);
  const containerRef = useRef(null);

  // Generate the current calendar month days
  const days = useMemo(() => {
    const dArray = [];
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const dateStr = getLocalDateString(d);
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

  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    if (!hasScrolled && habits.length > 0 && containerRef.current) {
      const todayStr = getLocalDateString(new Date());
      // Give a slight delay to ensure DOM is fully rendered
      const timeout = setTimeout(() => {
        const todayEl = document.getElementById(`day-col-${todayStr}`);
        if (todayEl && containerRef.current) {
          // Center the current date column
          const containerWidth = containerRef.current.clientWidth;
          const stickyWidth = 220; // Width of the sticky left column
          const scrollLeft = todayEl.offsetLeft - stickyWidth - (containerWidth - stickyWidth) / 2 + (todayEl.clientWidth / 2);
          
          containerRef.current.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
          setHasScrolled(true);
        }
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [days, habits.length, hasScrolled]);

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
    setEditName(habit.title || habit.name);
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



  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="text-sm font-semibold text-primary">{monthLabel} ▾</div>
        <button 
          onClick={() => setIsAdding(!isAdding)} 
          className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground h-9 px-4"
        >
          <Plus size={16} /> Add Habit
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="animate-fade-in border-b border-border/50 bg-muted/20 p-4 flex gap-2">
          <input 
            type="text" 
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="E.g., Drink 2L water"
            className="input-field max-w-sm"
            autoFocus
          />
          <button type="submit" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4">Save</button>
          <button type="button" onClick={() => setIsAdding(false)} className="btn-icon h-10 w-10">
            <X size={20} />
          </button>
        </form>
      )}

      {habits.length === 0 && !isAdding ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <p className="text-muted-foreground mb-4">No habits added yet.</p>
          <button onClick={() => setIsAdding(true)} className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4">
            <Plus size={18} /> Create your first habit
          </button>
        </div>
      ) : (
        habits.length > 0 && (
          <div ref={containerRef} className="spreadsheet-container flex-1 animate-fade-in pb-4 overflow-x-auto w-full relative">
            <table className="spreadsheet-table w-full">
              <thead>
                <tr>
                  <th className="bg-transparent border-b border-border/50 font-semibold text-sm text-foreground">Habit</th>
                  {days.map((day, i) => (
                    <th key={i} id={`day-col-${day.dateStr}`} className="bg-transparent border-b border-border/50">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[11px] font-medium text-muted-foreground uppercase">{day.name}</span>
                        <span className="text-sm font-bold text-foreground">{day.num}</span>
                      </div>
                    </th>
                  ))}
                  <th className="bg-transparent border-b border-border/50 font-semibold text-sm text-foreground">Streak</th>
                  <th className="bg-transparent border-b border-border/50 font-semibold text-sm text-foreground min-w-[80px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {habits.map((habit) => {
                  const name = habit.title || habit.name;
                  const iconData = getHabitIcon(name);
                  return (
                    <tr key={habit.id} className="hover:bg-muted/10 transition-colors">
                      <td className="border-border/50 py-3">
                        {editingId === habit.id ? (
                          <div className="flex gap-2 items-center px-4">
                            <input 
                              ref={editInputRef}
                              type="text" 
                              className="input-field h-8 text-sm" 
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit();
                                if (e.key === 'Escape') cancelEdit();
                              }}
                            />
                            <button onClick={saveEdit} className="text-green-500 hover:text-green-400 transition-colors"><Save size={16} /></button>
                            <button onClick={cancelEdit} className="text-muted-foreground hover:text-foreground transition-colors"><X size={16} /></button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 px-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconData.bg}`}>
                              {iconData.icon}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm text-foreground">{name}</span>
                              <span className="text-[11px] text-muted-foreground">{Object.keys(habit.history || {}).length} total</span>
                            </div>
                          </div>
                        )}
                      </td>
                      {days.map((day, i) => {
                        const isCompleted = habit.history && habit.history[day.dateStr];
                        return (
                          <td key={i} className="border-border/50 text-center py-3">
                            <button 
                              className={`cell-button ${isCompleted ? 'active' : ''}`}
                              onClick={() => onToggleDate(habit.id, day.dateStr)}
                              aria-label={`Toggle for ${day.dateStr}`}
                            >
                              <Check size={16} strokeWidth={3} />
                            </button>
                          </td>
                        );
                      })}
                      <td className="border-border/50 text-center py-3">
                        <div className={`flex items-center justify-center gap-1.5 ${habit.streak > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                          <Flame size={14} />
                          <span className="font-bold text-sm">{habit.streak}</span>
                        </div>
                      </td>
                      <td className="border-border/50 text-center py-3">
                        <div className="flex items-center justify-center gap-2">
                           <button onClick={() => startEdit(habit)} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Edit"><Edit2 size={16} /></button>
                           <button onClick={() => handleDelete(habit.id)} className="text-muted-foreground hover:text-destructive transition-colors" aria-label="Delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

export default HabitSpreadsheet;
