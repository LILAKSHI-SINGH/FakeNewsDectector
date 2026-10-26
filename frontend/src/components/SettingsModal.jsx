import React, { useState } from 'react';
import { X, Check, Server, RefreshCw, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { getApiBaseUrl, setApiBaseUrl, checkBackendHealth } from '../services/api';

export default function SettingsModal({
  isOpen,
  onClose,
  isDemoMode,
  setIsDemoMode,
  onServerStatusUpdated
}) {
  if (!isOpen) return null;

  const [url, setUrl] = useState(getApiBaseUrl());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleSave = () => {
    const saved = setApiBaseUrl(url);
    setUrl(saved);
    handleTest(saved);
  };

  const handleTest = async (testUrl = url) => {
    setTesting(true);
    setTestResult(null);
    const start = performance.now();
    try {
      const res = await checkBackendHealth();
      const latency = Math.round(performance.now() - start);
      if (res.status === 'OK') {
        setTestResult({
          success: true,
          message: `Connected successfully! (Latency: ${latency}ms, Model: ${res.model_name || 'Active'})`
        });
        onServerStatusUpdated(res);
      } else {
        setTestResult({
          success: false,
          message: `Backend returned status: ${res.status || 'Offline'}`
        });
        onServerStatusUpdated({ status: 'OFFLINE' });
      }
    } catch (e) {
      setTestResult({
        success: false,
        message: `Connection failed: ${e.message}`
      });
      onServerStatusUpdated({ status: 'OFFLINE' });
    } finally {
      setTesting(false);
    }
  };

  const handleReset = () => {
    const def = 'http://localhost:8000';
    setUrl(def);
    setApiBaseUrl(def);
    setTestResult(null);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Server size={20} className="modal-icon" />
            <h3 className="modal-title">API Connection Settings</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-desc">
            Connect the frontend to your local FastAPI backend server or deployed Render URL:
          </p>

          <div className="input-group">
            <label htmlFor="api-url">Backend Server URL</label>
            <div className="url-save-wrap">
              <input
                id="api-url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://localhost:8000 or https://your-app.onrender.com"
                className="text-input"
              />
              <button className="btn-secondary-sm" onClick={handleSave}>
                Save
              </button>
            </div>
            <span className="input-hint">For production deployment on Render, enter: <code>https://your-service.onrender.com</code></span>
          </div>

          {/* Test Status Banner */}
          {testResult && (
            <div className={`test-banner ${testResult.success ? 'test-success' : 'test-fail'}`}>
              {testResult.success ? <Check size={16} /> : <AlertCircle size={16} />}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Offline Demo Mode Toggle */}
          <div className="toggle-box">
            <div className="toggle-text">
              <span className="toggle-label">Offline Demo Simulation Mode</span>
              <span className="toggle-desc">Simulates real-time ML predictions in browser without requiring an active backend connection.</span>
            </div>
            <button
              className={`toggle-switch-btn ${isDemoMode ? 'active' : ''}`}
              onClick={() => setIsDemoMode(!isDemoMode)}
            >
              {isDemoMode ? <ToggleRight size={32} className="toggle-on" /> : <ToggleLeft size={32} />}
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary-sm" onClick={handleReset}>
            Reset Default
          </button>
          <div className="footer-right">
            <button
              className="btn-outline-sm btn-primary-outline"
              onClick={() => handleTest()}
              disabled={testing}
            >
              <RefreshCw size={14} className={testing ? 'animate-spin' : ''} />
              <span>{testing ? 'Testing...' : 'Test Connection'}</span>
            </button>
            <button className="btn-primary-sm" onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
