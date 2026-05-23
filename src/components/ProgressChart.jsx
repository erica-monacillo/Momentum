import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ProgressChart = ({ habits }) => {
  const data = useMemo(() => {
    // Generate last 7 days including today
    const days = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const shortName = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      let completedCount = 0;
      habits.forEach(h => {
        if (h.history && h.history[dateStr]) {
          completedCount++;
        }
      });
      
      // Max possible is total number of habits
      const totalHabits = habits.length > 0 ? habits.length : 1;
      const completionRate = Math.round((completedCount / totalHabits) * 100);

      days.push({
        name: shortName,
        date: dateStr,
        rate: completionRate,
        completed: completedCount
      });
    }
    return days;
  }, [habits]);

  if (habits.length === 0) return null;

  return (
    <div className="card glass animate-fade-in" style={{ marginTop: '2rem' }}>
      <h3 style={{ marginBottom: '1.5rem' }}>Weekly Completion %</h3>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <AreaChart
            data={data}
            margin={{ top: 5, right: 0, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--bg-secondary)', 
                borderColor: 'var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)'
              }}
              itemStyle={{ color: 'var(--accent-primary)' }}
            />
            <Area 
              type="monotone" 
              dataKey="rate" 
              stroke="var(--accent-primary)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRate)" 
              activeDot={{ r: 6, fill: 'var(--accent-primary)', stroke: 'var(--bg-primary)', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProgressChart;
