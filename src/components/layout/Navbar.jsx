import React, { useState, useEffect, useRef } from 'react';
import { Bell, Sun, Moon, LogOut, Settings, Flame, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getHabits } from '../../utils/storage';
import { getLocalDateString } from '../../utils/date';

const NotificationBell = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!userId) return;
    getHabits(userId).then(habits => {
      const notifs = [];
      const todayStr = getLocalDateString(new Date());
      
      // Calculate pending habits
      const pending = habits.filter(h => !h.history || !h.history[todayStr]);
      if (pending.length > 0) {
        notifs.push({
          id: 'pending',
          icon: <CheckCircle2 size={16} className="text-blue-500" />,
          title: 'Daily Reminder',
          desc: `You have ${pending.length} habit${pending.length > 1 ? 's' : ''} left to complete today.`
        });
      }

      // Calculate streak milestones (e.g., 7, 30, 100 days)
      const milestones = [7, 14, 21, 30, 50, 100, 365];
      habits.forEach(h => {
        if (milestones.includes(h.streak)) {
          notifs.push({
            id: `streak-${h.id}`,
            icon: <Flame size={16} className="text-orange-500" />,
            title: 'Streak Milestone!',
            desc: `You hit a ${h.streak}-day streak on "${h.title || h.name}"!`
          });
        }
      });

      if (notifs.length === 0) {
        notifs.push({
          id: 'empty',
          icon: <CheckCircle2 size={16} className="text-green-500" />,
          title: 'All caught up!',
          desc: 'You have completed all your habits. Great job!'
        });
      }

      setNotifications(notifs);
    });
  }, [userId, isOpen]); // refresh when opened

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasUnread = notifications.length > 0 && notifications[0].id !== 'empty';

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground relative"
        title="Notifications"
      >
        <Bell size={20} />
        {hasUnread && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary animate-pulse"></span>}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 md:w-80 rounded-md border border-border bg-card shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
          <div className="p-3 border-b border-border">
            <h3 className="font-semibold text-sm">Notifications</h3>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {notifications.map(n => (
              <div key={n.id} className="p-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors flex gap-3">
                <div className="mt-0.5">{n.icon}</div>
                <div>
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Navbar = ({ theme, toggleTheme, onSettingsClick }) => {
  const { user, signOut } = useAuth();
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2">
        <img src="/logo1.png" alt="Logo" className="w-8 h-8 object-contain" />
        <h2 className="text-xl font-bold tracking-tight">Momentum</h2>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        
        <NotificationBell userId={user?.id} />

        <button 
          onClick={onSettingsClick}
          className="inline-flex items-center justify-center rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Settings"
        >
          <Settings size={20} />
        </button>
        
        <button 
          onClick={toggleTheme}
          className="inline-flex items-center justify-center rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-border ml-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium text-sm">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm font-medium">{displayName}</span>
        </div>

        <button 
          onClick={signOut}
          className="inline-flex items-center justify-center rounded-md p-2 text-destructive hover:bg-destructive/10 ml-2"
          title="Log out"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
