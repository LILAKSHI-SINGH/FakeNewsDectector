import React, { useState } from 'react';
import { Activity, ShieldCheck, AlertTriangle, Trash2, Download, Search, Filter, Calendar } from 'lucide-react';

export default function AnalyticsTab({ history, onClearHistory, onDeleteItem, onSelectHistoryItem }) {
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const totalChecked = history.length;
  const fakeCount = history.filter(h => h.prediction === 'FAKE').length;
  const realCount = history.filter(h => h.prediction === 'REAL').length;
  const fakeRate = totalChecked > 0 ? ((fakeCount / totalChecked) * 100).toFixed(1) : 0;

  const filteredHistory = history.filter(item => {
    if (filter === 'FAKE' && item.prediction !== 'FAKE') return false;
    if (filter === 'REAL' && item.prediction !== 'REAL') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = (item.title || '').toLowerCase().includes(q);
      const textMatch = (item.text || '').toLowerCase().includes(q);
      return titleMatch || textMatch;
    }
    return true;
  });

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `veritas_ai_history_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="analytics-tab animate-fade-in">
      {/* Metric Cards Row */}
      <div className="metrics-grid">
        <div className="glass-panel metric-card">
          <div className="metric-header">
            <span className="metric-label">Total Articles Analyzed</span>
            <Activity className="metric-icon" size={20} />
          </div>
          <div className="metric-value">{totalChecked}</div>
          <div className="metric-subtext">Across browser session</div>
        </div>

        <div className="glass-panel metric-card">
          <div className="metric-header">
            <span className="metric-label">Fake News Flagged</span>
            <AlertTriangle className="metric-icon icon-fake" size={20} />
          </div>
          <div className="metric-value text-fake">{fakeCount}</div>
          <div className="metric-subtext">{fakeRate}% of analyzed articles</div>
        </div>

        <div className="glass-panel metric-card">
          <div className="metric-header">
            <span className="metric-label">Credible Real Articles</span>
            <ShieldCheck className="metric-icon icon-real" size={20} />
          </div>
          <div className="metric-value text-real">{realCount}</div>
          <div className="metric-subtext">Verified statistical patterns</div>
        </div>
      </div>

      {/* History Table Container */}
      <div className="glass-panel history-panel">
        <div className="history-toolbar">
          <div className="search-wrap">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search history by keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-chips">
            <button
              className={`filter-chip ${filter === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilter('ALL')}
            >
              All ({history.length})
            </button>
            <button
              className={`filter-chip chip-fake ${filter === 'FAKE' ? 'active' : ''}`}
              onClick={() => setFilter('FAKE')}
            >
              Fake Only ({fakeCount})
            </button>
            <button
              className={`filter-chip chip-real ${filter === 'REAL' ? 'active' : ''}`}
              onClick={() => setFilter('REAL')}
            >
              Real Only ({realCount})
            </button>
          </div>

          <div className="history-actions">
            <button
              className="btn-outline-sm"
              onClick={handleExportJSON}
              disabled={history.length === 0}
              title="Export history to JSON"
            >
              <Download size={14} />
              <span>Export</span>
            </button>

            <button
              className="btn-outline-sm btn-danger"
              onClick={onClearHistory}
              disabled={history.length === 0}
              title="Clear all stored history"
            >
              <Trash2 size={14} />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <div className="history-empty">
            <Activity size={40} className="empty-icon" />
            <p className="empty-title">No predictions recorded yet</p>
            <p className="empty-desc">Run your first article analysis in the Fact Check tab to see real-time history logs here.</p>
          </div>
        ) : (
          <div className="history-list">
            {filteredHistory.map((item) => {
              const isItemFake = item.prediction === 'FAKE';
              return (
                <div
                  key={item.id}
                  className={`history-item ${isItemFake ? 'item-fake' : 'item-real'}`}
                  onClick={() => onSelectHistoryItem(item)}
                >
                  <div className="item-meta">
                    <span className={`verdict-pill ${isItemFake ? 'pill-fake' : 'pill-real'}`}>
                      {isItemFake ? 'LIKELY FAKE' : 'LIKELY REAL'}
                    </span>
                    <span className="confidence-pill">
                      {(item.confidence * 100).toFixed(1)}% Conf
                    </span>
                    <span className="item-date">
                      <Calendar size={12} />
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h4 className="item-title">
                    {item.title || (item.text ? item.text.substring(0, 80) + '...' : 'Untitled Analysis')}
                  </h4>

                  {item.important_features && item.important_features.length > 0 && (
                    <div className="item-tags">
                      {item.important_features.slice(0, 4).map((tag, i) => (
                        <span key={i} className="mini-tag">#{tag}</span>
                      ))}
                    </div>
                  )}

                  <button
                    className="delete-item-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItem(item.id);
                    }}
                    title="Delete entry"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
