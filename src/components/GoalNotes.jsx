import React, { useState, useEffect } from 'react';
import { getNotes, saveNotes } from '../utils/storage';

const GoalNotes = ({ user }) => {
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (user?.id) {
      getNotes(user.id).then(setNotes);
    }
  }, [user]);

  const handleNotesChange = (e) => {
    const value = e.target.value;
    setNotes(value);
    if (user?.id) {
      saveNotes(user.id, value);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex-1 flex flex-col">
        <textarea
          placeholder="Write down your overarching goals, thoughts, or daily notes here..."
          className="flex-1 min-h-[200px] w-full resize-none border-0 bg-transparent p-0 text-sm focus-visible:outline-none"
          value={notes}
          onChange={handleNotesChange}
        />
      </div>
    </div>
  );
};

export default GoalNotes;
