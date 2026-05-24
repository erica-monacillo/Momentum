import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import SettingsModal from '../SettingsModal';

const AppLayout = ({ theme, toggleTheme }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background flex-col">
      <Navbar 
        theme={theme} 
        toggleTheme={toggleTheme} 
        onSettingsClick={() => setIsSettingsOpen(true)}
      />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 w-full">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

export default AppLayout;
