import React, { useMemo } from 'react';
import { getLocalDateString } from '../utils/date';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';

const CalendarHeatmap = ({ habits }) => {
  const { weeks, monthLabels } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
    const numDays = 52 * 7 + (dayOfWeek + 1);
    
    const dates = [];
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      dates.push(d);
    }

    const weeksArray = [];
    let currentWeek = [];
    dates.forEach((d) => {
      currentWeek.push(d);
      if (currentWeek.length === 7) {
        weeksArray.push(currentWeek);
        currentWeek = [];
      }
    });
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null);
      }
      weeksArray.push(currentWeek);
    }

    // Month labels
    const mLabels = [];
    let lastMonth = -1;
    weeksArray.forEach((week, index) => {
      const firstValidDay = week.find(d => d !== null);
      if (firstValidDay) {
        const month = firstValidDay.getMonth();
        if (month !== lastMonth) {
          // Only add label if it's not the very first week and squished, or adjust logic
          // A label needs some space
          mLabels.push({ index, label: firstValidDay.toLocaleString('default', { month: 'short' }) });
          lastMonth = month;
        }
      }
    });

    return { weeks: weeksArray, monthLabels: mLabels };
  }, []);

  const getDayStats = (dateStr) => {
    let completed = 0;
    habits.forEach(h => {
      if (h.history && h.history[dateStr]) completed++;
    });
    return completed;
  };

  const getIntensity = (completed, total) => {
    if (total === 0 || completed === 0) return 0;
    const ratio = completed / total;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  };

  const colorClasses = {
    0: 'bg-muted/40 dark:bg-muted/20',
    1: 'bg-primary/30 dark:bg-primary/40',
    2: 'bg-primary/60 dark:bg-primary/60',
    3: 'bg-primary/80 dark:bg-primary/80',
    4: 'bg-primary dark:bg-primary',
  };

  const totalHabits = habits.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Heatmap</CardTitle>
        <CardDescription>365-day habit completion calendar</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[850px] flex flex-col gap-2">
            
            {/* Months Row */}
            <div className="flex pl-8 text-xs text-muted-foreground relative h-4">
              {monthLabels.map((m, i) => (
                <div 
                  key={i} 
                  className="absolute"
                  style={{ left: `${m.index * 16 + 32}px` }} // index * (w-3 + gap-1) + offset for Day Labels
                >
                  {m.label}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              {/* Day Labels Row */}
              <div className="flex flex-col gap-1 text-[10px] text-muted-foreground w-6 text-right pr-1">
                <div className="h-3 leading-3"></div>
                <div className="h-3 leading-3">Mon</div>
                <div className="h-3 leading-3"></div>
                <div className="h-3 leading-3">Wed</div>
                <div className="h-3 leading-3"></div>
                <div className="h-3 leading-3">Fri</div>
                <div className="h-3 leading-3"></div>
              </div>

              {/* Heatmap Grid */}
              <div className="flex gap-1">
                {weeks.map((week, wIndex) => (
                  <div key={wIndex} className="flex flex-col gap-1">
                    {week.map((day, dIndex) => {
                      if (!day) return <div key={dIndex} className="w-3 h-3" />;
                      
                      const dateStr = getLocalDateString(day);
                      const completedCount = getDayStats(dateStr);
                      const intensity = getIntensity(completedCount, totalHabits);
                      
                      return (
                        <div 
                          key={dIndex}
                          className={`w-3 h-3 rounded-[2px] ${colorClasses[intensity]} transition-colors hover:ring-2 hover:ring-border cursor-pointer`}
                          title={`${dateStr}: ${completedCount} completed`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-2 text-[10px] text-muted-foreground mt-2 mr-2">
              <span>Less</span>
              <div className="flex gap-1">
                <div className={`w-3 h-3 rounded-[2px] ${colorClasses[0]}`}></div>
                <div className={`w-3 h-3 rounded-[2px] ${colorClasses[1]}`}></div>
                <div className={`w-3 h-3 rounded-[2px] ${colorClasses[2]}`}></div>
                <div className={`w-3 h-3 rounded-[2px] ${colorClasses[3]}`}></div>
                <div className={`w-3 h-3 rounded-[2px] ${colorClasses[4]}`}></div>
              </div>
              <span>More</span>
            </div>

          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarHeatmap;
