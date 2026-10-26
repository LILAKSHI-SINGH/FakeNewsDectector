import React from 'react';
import { ShieldCheck, Activity, Settings, Moon, Sun, Sparkles, RefreshCw } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  serverStatus,
  isDemoMode,
  setIsDemoMode,
  onOpenSettings,
  theme,
  setTheme
}) {
  return (
    <header className="navbar-container">
      <div className="navbar-brand">
        <div className="brand-logo">
          <ShieldCheck className="brand-icon" size={28} />
          <div className="brand-glow" />
        </div>
        <div>
          <h1 className="brand-title">VERITAS <span className="brand-gradient">AI</span></h1>
          <p className="brand-subtitle">Explainable Fake News Intelligence</p>
        </div>
      </div>

      <nav className="navbar-tabs">
        <button
          className={`tab-btn ${activeTab === 'check' ? 'active' : ''}`}
          onClick={() => setActiveTab('check')}
        >
          <Sparkles size={16} />
          <span>Fact Check</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <Activity size={16} />
          <span>Analytics & History</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'model' ? 'active' : ''}`}
          onClick={() => setActiveTab('model')}
        >
          <ShieldCheck size={16} />
          <span>Model Architecture</span>
        </button>
      </nav>

      <div className="navbar-actions">
        {/* Server Status Pill */}
        <div
          className={`status-pill ${
            isDemoMode
              ? 'status-demo'
              : serverStatus?.status === 'OK'
              ? 'status-online'
              : 'status-offline'
          }`}
          title={isDemoMode ? 'Running in Offline Demo Mode' : `Backend: ${serverStatus?.status || 'Offline'}`}
        >
          <span className="status-dot" />
          <span className="status-text">
            {isDemoMode ? 'Demo Mode' : serverStatus?.status === 'OK' ? 'ML Backend Live' : 'Backend Offline'}
          </span>
        </div>

        {/* Settings button */}
        <button
          className="icon-btn"
          onClick={onOpenSettings}
          title="Backend API Settings"
        >
          <Settings size={18} />
        </button>

        {/* Theme toggle */}
        <button
          className="icon-btn"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
