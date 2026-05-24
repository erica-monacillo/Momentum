import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Upload, Trash2, FileText, Save, User } from 'lucide-react';
import { exportData, importData, resetData } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import html2pdf from 'html2pdf.js';

const SettingsModal = ({ isOpen, onClose }) => {
  const { user, updateDisplayName } = useAuth();
  const fileInputRef = useRef(null);
  const [importStatus, setImportStatus] = useState('');
  
  const currentName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || '';
  const [displayName, setDisplayName] = useState(currentName);
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDisplayName(currentName);
      setNameSaved(false);
    }
  }, [isOpen, currentName]);

  if (!isOpen) return null;

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!displayName.trim() || displayName.trim() === currentName) return;
    setIsSavingName(true);
    await updateDisplayName(displayName.trim());
    setIsSavingName(false);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 3000);
  };

  const handleExportJSON = () => {
    const dataStr = exportData();
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'habit-tracker-backup.json';
    
    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleExportPDF = () => {
    const element = document.querySelector('.container') || document.body;
    const modal = document.getElementById('settings-modal');
    if (modal) modal.style.display = 'none';

    const opt = {
      margin:       0.5,
      filename:     'habit-tracker.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      if (modal) modal.style.display = 'flex';
    });
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const success = importData(event.target.result);
      if (success) {
        setImportStatus('success');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setImportStatus('error');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm("WARNING: This will permanently delete all your habits, history, and notes. Are you absolutely sure?")) {
      resetData(user?.id);
      window.location.reload();
    }
  };

  return (
    <div id="settings-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 rounded-xl border border-border bg-card text-card-foreground shadow-lg animate-in zoom-in-95 fade-in duration-200">
        
        <div className="flex flex-col space-y-1.5 p-6 pb-4 border-b border-border relative">
          <button onClick={onClose} className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          <h2 className="text-lg font-semibold leading-none tracking-tight">Settings</h2>
          <p className="text-sm text-muted-foreground">Manage your profile and app data.</p>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Profile Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2 text-foreground">
              <User size={16} /> Profile
            </h3>
            <form onSubmit={handleSaveName} className="flex gap-2">
              <input 
                type="text" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter display name"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button 
                type="submit" 
                disabled={isSavingName || displayName.trim() === currentName}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 whitespace-nowrap"
              >
                {isSavingName ? 'Saving...' : <><Save className="mr-2 h-4 w-4" /> Save</>}
              </button>
            </form>
            {nameSaved && <p className="text-xs text-green-500 font-medium">Display name updated successfully!</p>}
          </div>

          <div className="h-px bg-border w-full"></div>

          {/* Data Management Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground">Data Management</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Export Backup</p>
                <p className="text-xs text-muted-foreground">Download a .json backup file.</p>
              </div>
              <button onClick={handleExportJSON} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
                <Download className="mr-2 h-4 w-4" /> Backup
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Export to PDF</p>
                <p className="text-xs text-muted-foreground">Download a printable calendar.</p>
              </div>
              <button onClick={handleExportPDF} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
                <FileText className="mr-2 h-4 w-4" /> to PDF
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Import Backup</p>
                <p className="text-xs text-muted-foreground">Restore from a .json file.</p>
                {importStatus === 'success' && <p className="text-xs text-green-500 font-medium mt-1">Import successful! Reloading...</p>}
                {importStatus === 'error' && <p className="text-xs text-red-500 font-medium mt-1">Invalid backup file.</p>}
              </div>
              <input type="file" accept=".json" className="hidden" ref={fileInputRef} onChange={handleImport} />
              <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
                <Upload className="mr-2 h-4 w-4" /> Import
              </button>
            </div>
          </div>

          <div className="h-px bg-border w-full"></div>

          {/* Danger Zone */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-destructive">Reset Tracker</p>
                <p className="text-xs text-muted-foreground">Permanently wipe all habits.</p>
              </div>
              <button onClick={handleReset} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-3">
                <Trash2 className="mr-2 h-4 w-4" /> Reset
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
