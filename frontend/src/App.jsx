import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PredictionForm from './components/PredictionForm';
import ResultCard from './components/ResultCard';
import AnalyticsTab from './components/AnalyticsTab';
import ModelSpecsTab from './components/ModelSpecsTab';
import SettingsModal from './components/SettingsModal';
import {
  checkBackendHealth,
  predictNews,
  fetchModelInfo,
  getApiBaseUrl
} from './services/api';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('check');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // History persistence in localStorage
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('veritas_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Server health state
  const [serverStatus, setServerStatus] = useState(null);

  // Demo mode toggle
  const [isDemoMode, setIsDemoMode] = useState(() => {
    return localStorage.getItem('veritas_demo_mode') === 'true';
  });

  // Settings modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Theme
  const [theme, setTheme] = useState('dark');

  // Model Info
  const [modelInfo, setModelInfo] = useState(null);
  const [isRetraining, setIsRetraining] = useState(false);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Save demo mode
  useEffect(() => {
    localStorage.setItem('veritas_demo_mode', isDemoMode ? 'true' : 'false');
  }, [isDemoMode]);

  // Initial health check & model info load
  useEffect(() => {
    checkBackendHealth().then(status => {
      setServerStatus(status);
      if (status.status !== 'OK') {
        console.warn('Backend is offline, demo mode can be used.');
      }
    });

    fetchModelInfo().then(info => setModelInfo(info));
  }, []);

  const handleAnalyze = async ({ title, text, url }) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const predResult = await predictNews({
        title,
        text,
        url,
        isDemo: isDemoMode
      });

      setResult(predResult);

      // Add to history
      const newHistoryItem = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        title: title || (text ? text.substring(0, 70) + '...' : url),
        text,
        url,
        prediction: predResult.prediction,
        confidence: predResult.confidence,
        risk_level: predResult.risk_level,
        important_features: predResult.important_features
      };

      const updatedHistory = [newHistoryItem, ...history];
      setHistory(updatedHistory);
      try {
        localStorage.setItem('veritas_history', JSON.stringify(updatedHistory.slice(0, 100)));
      } catch (err) {
        console.error('Failed to save history in localStorage', err);
      }
    } catch (err) {
      setError(err.message || 'Prediction failed. Check backend connection or switch to Demo Mode in Settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your prediction history?')) {
      setHistory([]);
      localStorage.removeItem('veritas_history');
    }
  };

  const handleDeleteHistoryItem = (id) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem('veritas_history', JSON.stringify(updated));
  };

  const handleSelectHistoryItem = (item) => {
    setResult({
      prediction: item.prediction,
      confidence: item.confidence,
      fake_probability: item.prediction === 'FAKE' ? item.confidence : (1 - item.confidence),
      real_probability: item.prediction === 'REAL' ? item.confidence : (1 - item.confidence),
      risk_level: item.risk_level,
      important_features: item.important_features || [],
      disclaimer: 'Loaded from prediction history'
    });
    setActiveTab('check');
  };

  const handleRetrain = async () => {
    setIsRetraining(true);
    try {
      const base = getApiBaseUrl();
      const res = await fetch(`${base}/train`, { method: 'POST' });
      if (!res.ok) throw new Error('Retrain request failed');
      const data = await res.json();
      alert(`Model successfully retrained! Best algorithm: ${data.metrics?.best_model || 'Linear SVM'}`);
      const updatedInfo = await fetchModelInfo();
      setModelInfo(updatedInfo);
    } catch (err) {
      alert(`Retraining failed: ${err.message}. If the backend is offline, please ensure it is running.`);
    } finally {
      setIsRetraining(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        serverStatus={serverStatus}
        isDemoMode={isDemoMode}
        setIsDemoMode={setIsDemoMode}
        onOpenSettings={() => setIsSettingsOpen(true)}
        theme={theme}
        setTheme={setTheme}
      />

      <main className="main-content">
        {/* Error notification banner if any */}
        {error && (
          <div className="error-banner animate-fade-in">
            <span className="error-msg">⚠️ {error}</span>
            <div className="error-actions">
              <button
                className="btn-link"
                onClick={() => {
                  setIsDemoMode(true);
                  setError(null);
                }}
              >
                Enable Demo Mode
              </button>
              <button className="btn-link-close" onClick={() => setError(null)}>✕</button>
            </div>
          </div>
        )}

        {/* Tab 1: Check News */}
        {activeTab === 'check' && (
          <div className="check-tab-layout">
            <PredictionForm
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              isDemoMode={isDemoMode}
            />

            {result && (
              <ResultCard
                result={result}
                onReset={() => setResult(null)}
              />
            )}
          </div>
        )}

        {/* Tab 2: Analytics & History */}
        {activeTab === 'analytics' && (
          <AnalyticsTab
            history={history}
            onClearHistory={handleClearHistory}
            onDeleteItem={handleDeleteHistoryItem}
            onSelectHistoryItem={handleSelectHistoryItem}
          />
        )}

        {/* Tab 3: Model Architecture & Specs */}
        {activeTab === 'model' && (
          <ModelSpecsTab
            modelInfo={modelInfo}
            onRetrain={handleRetrain}
            isRetraining={isRetraining}
          />
        )}
      </main>

      <footer className="app-footer">
        <p className="footer-text">
          Veritas AI • Explainable Fake News Detection System • Linear SVM & TF-IDF NLP Architecture
        </p>
        <p className="footer-subtext">
          Frontend ready for Vercel • Backend ready for Render
        </p>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDemoMode={isDemoMode}
        setIsDemoMode={setIsDemoMode}
        onServerStatusUpdated={(status) => setServerStatus(status)}
      />
    </div>
  );
}
