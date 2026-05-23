import React, { useMemo } from 'react';

const DailyProgress = ({ habits }) => {
  const { completed, total, percentage } = useMemo(() => {
    if (habits.length === 0) return { completed: 0, total: 0, percentage: 0 };
    
    const todayStr = new Date().toISOString().split('T')[0];
    let comp = 0;
    
    habits.forEach(h => {
      if (h.history && h.history[todayStr]) {
        comp++;
      }
    });
    
    return {
      completed: comp,
      total: habits.length,
      percentage: Math.round((comp / habits.length) * 100)
    };
  }, [habits]);

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="card glass flex-center" style={{ flexDirection: 'column', padding: '1.5rem', height: '100%' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Today's Progress</h3>
      
      <div style={{ position: 'relative', width: '100px', height: '100px' }}>
        <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="var(--border-color)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="var(--success)"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {percentage}%
          </span>
        </div>
      </div>
      
      <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        {completed} of {total} completed
      </div>
    </div>
  );
};

export default DailyProgress;
