import React, { useMemo } from 'react';
import { 
  AreaChart, Area, 
  BarChart, Bar, 
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { getLocalDateString } from '../utils/date';

export const WeeklyProgressChart = ({ habits }) => {
  const data = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = getLocalDateString(d);
      const shortName = d.toLocaleDateString('en-US', { weekday: 'short' });
      let completedCount = 0;
      habits.forEach(h => {
        if (h.history && h.history[dateStr]) completedCount++;
      });
      const totalHabits = habits.length > 0 ? habits.length : 1;
      days.push({
        name: shortName,
        rate: Math.round((completedCount / totalHabits) * 100),
      });
    }
    return days;
  }, [habits]);

  if (habits.length === 0) return null;

  return (
    <div className="w-full h-[250px] animate-in fade-in duration-500">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'calc(var(--radius) * 0.8)', color: 'var(--card-foreground)' }}
            itemStyle={{ color: 'var(--primary)' }}
          />
          <Area type="monotone" dataKey="rate" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" activeDot={{ r: 6, fill: 'var(--primary)', stroke: 'var(--background)', strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ConsistencyBarChart = ({ habits }) => {
  const data = useMemo(() => {
    return habits.map(h => ({
      name: h.title || h.name,
      completed: Object.keys(h.history || {}).length,
    })).sort((a, b) => b.completed - a.completed).slice(0, 5); // top 5
  }, [habits]);

  if (habits.length === 0) return null;

  return (
    <div className="w-full h-[250px] animate-in fade-in duration-500">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} allowDecimals={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'calc(var(--radius) * 0.8)', color: 'var(--card-foreground)' }}
            cursor={{ fill: 'var(--muted)' }}
          />
          <Bar dataKey="completed" fill="var(--primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CompletionPieChart = ({ habits }) => {
  const data = useMemo(() => {
    const todayStr = getLocalDateString(new Date());
    let completed = 0;
    let pending = 0;
    
    habits.forEach(h => {
      if (h.history && h.history[todayStr]) completed++;
      else pending++;
    });

    return [
      { name: 'Completed', value: completed },
      { name: 'Pending', value: pending }
    ];
  }, [habits]);

  if (habits.length === 0) return null;

  const COLORS = ['var(--primary)', 'var(--muted)'];

  return (
    <div className="w-full h-[250px] animate-in fade-in duration-500">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: 'calc(var(--radius) * 0.8)', color: 'var(--card-foreground)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklyProgressChart;
