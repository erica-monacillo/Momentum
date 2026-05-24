import { supabase } from '../lib/supabaseClient';
import { getLocalDateString } from './date';

const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('placeholder');

// --- LOCAL STORAGE FALLBACK CONSTANTS ---
const HABITS_KEY = 'habit_tracker_habits';
const USER_KEY = 'habit_tracker_user';
const ACCOUNTS_KEY = 'habit_tracker_accounts';

// --- HELPER: Local logic ---
const getLocalAccounts = () => {
  const accounts = localStorage.getItem(ACCOUNTS_KEY);
  return accounts ? JSON.parse(accounts) : [];
};

// --- AUTHENTICATION ---
export const getUser = async () => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const saveUser = async (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
};

export const register = async (username, email, password) => {
  if (isSupabaseConfigured) {
    // Custom Auth via Supabase Table
    const { data: existing } = await supabase.from('accounts').select('username').eq('username', username).single();
    if (existing) throw new Error('Username already exists.');

    const { error } = await supabase.from('accounts').insert([{ username, email, password }]);
    if (error) throw error;
  } else {
    const accounts = getLocalAccounts();
    if (accounts.some(acc => (acc.username || '').toLowerCase() === username.toLowerCase())) {
      throw new Error('Username already exists.');
    }
    const newAccount = { username, email, password, createdAt: new Date().toISOString() };
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, newAccount]));
  }

  const user = { username, email, loggedInAt: new Date().toISOString() };
  await saveUser(user);
  return user;
};

export const login = async (username, password) => {
  let account = null;

  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('accounts').select('*').eq('username', username).eq('password', password).single();
    if (error || !data) throw new Error('Invalid Username or Password.');
    account = data;
  } else {
    const accounts = getLocalAccounts();
    account = accounts.find(acc => (acc.username || '').toLowerCase() === username.toLowerCase() && acc.password === password);
    if (!account) throw new Error('Invalid Username or Password.');
  }

  const existingUser = await getUser();
  const user = { 
    username: account.username, 
    email: account.email, 
    loggedInAt: new Date().toISOString(), 
    xp: (existingUser && existingUser.username === account.username) ? existingUser.xp : 0, 
    level: (existingUser && existingUser.username === account.username) ? existingUser.level : 1 
  };
  await saveUser(user);
  return user;
};

export const logout = async () => {
  localStorage.removeItem(USER_KEY);
};

// --- DATA FETCHING & MUTATION ---
export const getHabits = async (userId) => {
  if (!userId) return [];
  
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('habits').select('*, habit_logs(completed_at, status)').eq('user_id', userId);
    if (error) {
      console.error(error);
      return [];
    }
    
    return data.map(habit => {
      const history = {};
      if (habit.habit_logs) {
        habit.habit_logs.forEach(log => {
          if (log.status) history[log.completed_at] = true;
        });
      }
      
      let streak = 0;
      const today = new Date();
      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dateKey = getLocalDateString(d);
        if (history[dateKey]) streak++;
        else if (i > 0) break;
      }

      return { ...habit, history, streak };
    }) || [];
  } else {
    const habitsStr = localStorage.getItem(HABITS_KEY);
    if (!habitsStr) return [];
    let habits = JSON.parse(habitsStr);
    return habits.filter(h => h.username === userId);
  }
};

export const addHabit = async (name, userId) => {
  const newHabit = {
    id: crypto.randomUUID(),
    user_id: userId,
    name,
    history: {},
    streak: 0,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('habits').insert([{
      user_id: userId,
      title: name,
      emoji: '📝',
      frequency: 'daily'
    }]).select().single();
    if (error) console.error(error);
    return data ? { ...data, history: {}, streak: 0 } : newHabit;
  } else {
    const habitsStr = localStorage.getItem(HABITS_KEY);
    const habits = habitsStr ? JSON.parse(habitsStr) : [];
    localStorage.setItem(HABITS_KEY, JSON.stringify([...habits, newHabit]));
    return newHabit;
  }
};

export const toggleHabitDate = async (id, dateStr, userId, isCompleted) => {
  if (isSupabaseConfigured) {
    if (isCompleted) {
      // Use upsert to avoid select-then-insert race conditions
      await supabase.from('habit_logs').upsert(
        { habit_id: id, completed_at: dateStr, status: true },
        { onConflict: 'habit_id,completed_at' }
      );
    } else {
      await supabase.from('habit_logs').delete().match({ habit_id: id, completed_at: dateStr });
    }
    return { success: true };
  } else {
    const habits = await getHabits(userId);
    const index = habits.findIndex(h => h.id === id);
    if (index === -1) return { habits };

    const habit = habits[index];
    const history = { ...habit.history };

    if (history[dateStr]) {
      delete history[dateStr];
    } else {
      history[dateStr] = true;
    }

    habit.history = history;

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateKey = getLocalDateString(d);
      if (history[dateKey]) streak++;
      else if (i > 0) break;
    }
    habit.streak = streak;

    const allHabitsStr = localStorage.getItem(HABITS_KEY);
    let allHabits = allHabitsStr ? JSON.parse(allHabitsStr) : [];
    const allIndex = allHabits.findIndex(h => h.id === id);
    if (allIndex !== -1) allHabits[allIndex] = habit;
    localStorage.setItem(HABITS_KEY, JSON.stringify(allHabits));

    const updatedHabits = await getHabits(userId);
    const user = await getUser();
    return { habits: updatedHabits, user };
  }
};

export const editHabit = async (id, newName, userId) => {
  if (isSupabaseConfigured) {
    await supabase.from('habits').update({ title: newName }).eq('id', id);
  } else {
    const allHabitsStr = localStorage.getItem(HABITS_KEY);
    let allHabits = allHabitsStr ? JSON.parse(allHabitsStr) : [];
    const index = allHabits.findIndex(h => h.id === id);
    if (index !== -1) {
      allHabits[index].name = newName;
      localStorage.setItem(HABITS_KEY, JSON.stringify(allHabits));
    }
  }
  return await getHabits(userId);
};

export const deleteHabit = async (id, userId) => {
  if (isSupabaseConfigured) {
    await supabase.from('habits').delete().eq('id', id);
  } else {
    const allHabitsStr = localStorage.getItem(HABITS_KEY);
    let allHabits = allHabitsStr ? JSON.parse(allHabitsStr) : [];
    allHabits = allHabits.filter(h => h.id !== id);
    localStorage.setItem(HABITS_KEY, JSON.stringify(allHabits));
  }
  return await getHabits(userId);
};

export const getNotes = async (userId) => {
  if (!userId) return '';
  if (isSupabaseConfigured) {
    // Note: notes table hasn't been updated yet in SQL schema
    const { data, error } = await supabase.from('notes').select('content').eq('username', userId).single();
    if (error || !data) return '';
    return data.content;
  } else {
    return localStorage.getItem('habit_tracker_general_notes_' + userId) || '';
  }
};

export const saveNotes = async (userId, content) => {
  if (!userId) return;
  if (isSupabaseConfigured) {
    const { data } = await supabase.from('notes').select('username').eq('username', userId).single();
    if (data) {
      await supabase.from('notes').update({ content }).eq('username', userId);
    } else {
      await supabase.from('notes').insert([{ username: userId, content }]);
    }
  } else {
    localStorage.setItem('habit_tracker_general_notes_' + userId, content);
  }
};

// --- SETTINGS EXPORT / IMPORT ---
export const exportData = async () => {
  const data = {
    user: localStorage.getItem(USER_KEY),
    habits: localStorage.getItem(HABITS_KEY),
    theme: localStorage.getItem('habit_tracker_theme')
  };
  return JSON.stringify(data);
};

export const importData = async (jsonStr) => {
  try {
    const data = JSON.parse(jsonStr);
    if (data.user) localStorage.setItem(USER_KEY, data.user);
    if (data.habits) localStorage.setItem(HABITS_KEY, data.habits);
    if (data.theme) localStorage.setItem('habit_tracker_theme', data.theme);
    return true;
  } catch (e) {
    return false;
  }
};

export const resetData = async (username) => {
  if (isSupabaseConfigured && username) {
    await supabase.from('habits').delete().eq('username', username);
  } else {
    localStorage.removeItem(HABITS_KEY);
  }
};
