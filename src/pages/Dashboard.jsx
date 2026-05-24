import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import HabitSpreadsheet from '../components/HabitSpreadsheet';
import WeeklyProgressChart, { ConsistencyBarChart, CompletionPieChart } from '../components/ProgressChart';
import CalendarHeatmap from '../components/CalendarHeatmap';
import GoalNotes from '../components/GoalNotes';
import AnimatedNumber from '../components/AnimatedNumber';
import { getHabits, toggleHabitDate, addHabit, editHabit, deleteHabit } from '../utils/storage';
import { getLocalDateString } from '../utils/date';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Flame, CheckCircle2, TrendingUp, Calendar as CalendarIcon, Target } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const MOTIVATIONAL_QUOTES = [
  "Success is the sum of small efforts, repeated day in and day out.",
  "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
  "Motivation is what gets you started. Habit is what keeps you going.",
  "The secret of your future is hidden in your daily routine.",
  "Small daily improvements over time lead to stunning results.",
  "Good habits are as addictive as bad habits, and a lot more rewarding.",
  "You do not rise to the level of your goals. You fall to the level of your systems.",
  "Every action you take is a vote for the type of person you wish to become.",
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

const Dashboard = ({ theme, toggleTheme }) => {
  const { user } = useAuth();
  const [habits, setHabits] = useState([]);
  const [quote, setQuote] = useState("");

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';

  useEffect(() => {
    if (user?.id) {
      getHabits(user.id).then(setHabits);
    }
    setQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  }, [user]);

  const handleToggleDate = async (id, dateStr) => {
    const newHabits = [...habits];
    const index = newHabits.findIndex(h => h.id === id);
    if (index === -1) return;

    const habit = { ...newHabits[index] };
    const history = { ...habit.history };
    const isNowCompleted = !history[dateStr];

    if (isNowCompleted) {
      history[dateStr] = true;
    } else {
      delete history[dateStr];
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
    newHabits[index] = habit;
    
    // Optimistic UI Update (Instant)
    setHabits(newHabits);

    // Confetti logic: only when today hits 100%
    const todayStr = getLocalDateString(new Date());
    if (dateStr === todayStr && isNowCompleted) {
      const completedToday = newHabits.filter(h => h.history && h.history[todayStr]).length;
      if (completedToday === newHabits.length && newHabits.length > 0) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#10b981', '#f59e0b', '#ec4899'],
          zIndex: 9999
        });
      }
    }

    // Background Network Sync
    await toggleHabitDate(id, dateStr, user?.id, isNowCompleted);
  };

  const handleAdd = async (name) => {
    const newHabit = await addHabit(name, user?.id);
    setHabits(prev => [...prev, newHabit]);
  };

  const handleEdit = async (id, name) => {
    const updated = await editHabit(id, name, user?.id);
    setHabits(updated);
  };

  const handleDelete = async (id) => {
    const updated = await deleteHabit(id, user?.id);
    setHabits(updated);
  };

  // Stats Calculations
  const activeStreaks = habits.filter(h => h.streak > 0).length;
  const totalCompletions = habits.reduce((acc, h) => acc + Object.keys(h.history || {}).length, 0);

  // Today's completion logic
  const todayStr = getLocalDateString(new Date());
  const completedTodayCount = habits.filter(h => h.history && h.history[todayStr]).length;
  const totalHabitsCount = habits.length;
  const todayProgressPercent = totalHabitsCount === 0 ? 0 : Math.round((completedTodayCount / totalHabitsCount) * 100);

  const currentHour = new Date().getHours();
  let greeting = 'Good evening';
  if (currentHour < 12) greeting = 'Good morning';
  else if (currentHour < 18) greeting = 'Good afternoon';

  return (
    <div className="relative min-h-[calc(100vh-4rem)]">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background pointer-events-none -z-10" />

      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold tracking-tight">{greeting}, {displayName} 👋</h1>
          <p className="text-muted-foreground mt-1">Let's make today count.</p>
          <p className="text-sm text-primary/90 italic mt-2 font-medium">"{quote}"</p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

          <Card className="relative overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Progress</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold tracking-tighter">
                  <AnimatedNumber value={todayProgressPercent} />%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <AnimatedNumber value={completedTodayCount} /> of <AnimatedNumber value={totalHabitsCount} /> habits completed
                </p>
              </div>
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-muted/20" />
                  <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent"
                    strokeDasharray={175}
                    strokeDashoffset={175 - (todayProgressPercent / 100) * 175}
                    className="text-primary transition-all duration-1000 ease-out"
                  />
                </svg>
                <CheckCircle2 className="absolute text-primary" size={20} />
              </div>
            </CardContent>
            <div className="absolute bottom-0 left-4 right-4 h-1 bg-primary/20 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${todayProgressPercent}%` }} />
            </div>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">Active Streaks</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold tracking-tighter">
                <AnimatedNumber value={activeStreaks} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Habits with a streak {'>'} 0
              </p>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-24 opacity-30 pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[{ v: 0 }, { v: 10 }, { v: 5 }, { v: 20 }, { v: 15 }, { v: 30 }, { v: 25 }, { v: 40 }]}>
                  <defs>
                    <linearGradient id="colorOrange" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke="#f97316" fillOpacity={1} fill="url(#colorOrange)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">Total Completions</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold tracking-tighter">
                <AnimatedNumber value={totalCompletions} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                All-time completed days
              </p>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-24 opacity-30 pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[{ v: 0 }, { v: 5 }, { v: 15 }, { v: 10 }, { v: 25 }, { v: 20 }, { v: 35 }, { v: 40 }]}>
                  <defs>
                    <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="v" stroke="#10b981" fillOpacity={1} fill="url(#colorGreen)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
              <CardTitle className="text-sm font-medium">Total Habits</CardTitle>
              <CalendarIcon className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold tracking-tighter">
                <AnimatedNumber value={totalHabitsCount} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Tracked routines
              </p>
            </CardContent>
            <div className="absolute top-0 right-0 bottom-0 w-1/2 pointer-events-none opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle at center, var(--primary) 2px, transparent 2px)', backgroundSize: '16px 16px', backgroundPosition: '100% 50%' }}
            />
          </Card>
        </motion.div>

        <motion.div variants={itemVariants} className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 lg:col-span-5 overflow-hidden flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Habit Tracker</CardTitle>
                  <CardDescription className="mt-1">Your daily routine tracker. Click a cell to toggle completion.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto flex-1">
              <HabitSpreadsheet
                habits={habits}
                onToggleDate={handleToggleDate}
                onAdd={handleAdd}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </CardContent>
          </Card>

          <div className="col-span-4 lg:col-span-2 flex flex-col gap-4">
            <Card className="flex-1 min-h-[250px]">
              <CardContent className="pt-6 h-full">
                <GoalNotes user={user} />
              </CardContent>
            </Card>

            <Card className="overflow-hidden relative h-48 bg-gradient-to-br from-[#1a1133] to-[#0a0515] border-primary/20 shrink-0">
              <div className="absolute inset-0 z-0 opacity-80 mix-blend-screen pointer-events-none">
                <img src="/mountain.png" alt="Momentum Mountain" className="w-full h-full object-cover object-right" />
              </div>
              <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#1a1133] via-[#1a1133]/60 to-transparent pointer-events-none" />
              <div className="relative z-10 p-5 h-full flex flex-col">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm mb-2 drop-shadow-md">
                  <Target size={16} />
                  <span>Keep the Momentum</span>
                </div>
                <p className="text-sm text-white/90 leading-relaxed font-medium drop-shadow-md max-w-[80%]">
                  Consistency today, transformation tomorrow.
                </p>
              </div>
            </Card>
          </div>
        </motion.div>

        {/* Analytics Section */}
        <motion.div variants={itemVariants}>
          <h2 className="text-2xl font-bold tracking-tight mt-8 mb-4">Analytics</h2>

          <div className="grid gap-4 md:grid-cols-3 mb-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Weekly Trend</CardTitle>
                <CardDescription>Completion rate over last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <WeeklyProgressChart habits={habits} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Consistency</CardTitle>
                <CardDescription>Most completed habits</CardDescription>
              </CardHeader>
              <CardContent>
                <ConsistencyBarChart habits={habits} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Today's Split</CardTitle>
                <CardDescription>Completed vs Pending</CardDescription>
              </CardHeader>
              <CardContent>
                <CompletionPieChart habits={habits} />
              </CardContent>
            </Card>
          </div>

          <div className="mb-4">
            <CalendarHeatmap habits={habits} />
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default Dashboard;
