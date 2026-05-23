import React, { useState, useRef } from 'react';
import { X, Download, Upload, Trash2, FileText } from 'lucide-react';
import { exportData, importData, resetData } from '../utils/storage';
import html2pdf from 'html2pdf.js';

const SettingsModal = ({ isOpen, onClose }) => {
  const fileInputRef = useRef(null);
  const [importStatus, setImportStatus] = useState('');

  if (!isOpen) return null;

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
    const element = document.querySelector('.container');
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
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setImportStatus('error');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm("WARNING: This will permanently delete all your habits, history, and notes. Are you absolutely sure?")) {
      resetData();
      window.location.reload();
    }
  };

  return (
    <div id="settings-modal" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'transparent',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="card animate-fade-in" style={{ 
        width: '100%', maxWidth: '500px', margin: '0 1rem', position: 'relative', 
        padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
      }}>
        <button onClick={onClose} className="btn-icon" style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
          <X size={20} />
        </button>
        
        <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: 700 }}>Settings</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Export JSON */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ paddingRight: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Export Backup File</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Download a .json backup of your habits and notes.</p>
            </div>
            <button onClick={handleExportJSON} className="btn btn-secondary" style={{ flexShrink: 0 }}>
              <Download size={18} /> Backup
            </button>
          </div>

          {/* Export PDF */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ paddingRight: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Export to PDF</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Download a printable PDF of your habit tracker.</p>
            </div>
            <button onClick={handleExportPDF} className="btn btn-primary" style={{ flexShrink: 0 }}>
              <FileText size={18} /> to PDF
            </button>
          </div>

          {/* Import */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ paddingRight: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>Import Backup Data</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Restore your tracker from a .json backup file.</p>
              {importStatus === 'success' && <p style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '0.5rem', fontWeight: 500 }}>Import successful! Reloading...</p>}
              {importStatus === 'error' && <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.5rem', fontWeight: 500 }}>Invalid backup file.</p>}
            </div>
            <input 
              type="file" 
              accept=".json" 
              style={{ display: 'none' }} 
              ref={fileInputRef} 
              onChange={handleImport} 
            />
            <button onClick={() => fileInputRef.current.click()} className="btn btn-secondary" style={{ flexShrink: 0 }}>
              <Upload size={18} /> Import
            </button>
          </div>

          {/* Reset Data */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
            <div style={{ paddingRight: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--danger)', marginBottom: '0.25rem' }}>Reset Tracker</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Permanently wipe all habits and notes.</p>
            </div>
            <button onClick={handleReset} className="btn btn-danger" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
              <Trash2 size={18} /> Reset
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
