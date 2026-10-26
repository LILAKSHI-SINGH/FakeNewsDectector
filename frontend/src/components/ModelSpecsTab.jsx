import React, { useState } from 'react';
import { Award, Layers, Cpu, CheckCircle2, RefreshCw, BarChart3, Database } from 'lucide-react';
import { getApiBaseUrl } from '../services/api';

export default function ModelSpecsTab({ modelInfo, onRetrain, isRetraining }) {
  const comparison = modelInfo?.model_comparison || {
    "Linear SVM": { accuracy: 1.0, precision: 1.0, recall: 1.0, f1_score: 1.0 },
    "Logistic Regression": { accuracy: 0.9524, precision: 0.9091, recall: 1.0, f1_score: 0.9524 },
    "Multinomial Naive Bayes": { accuracy: 0.9524, precision: 0.9091, recall: 1.0, f1_score: 0.9524 },
    "Random Forest": { accuracy: 0.8571, precision: 1.0, recall: 0.7000, f1_score: 0.8235 }
  };

  const bestModel = modelInfo?.best_model || "Linear SVM";

  return (
    <div className="model-specs-tab animate-fade-in">
      {/* Top Banner: Champion Model */}
      <div className="glass-panel champion-banner">
        <div className="champion-badge">
          <Award size={24} className="trophy-icon" />
          <div>
            <span className="badge-subtitle">TOP RANKED CLASSIFIER</span>
            <h3 className="badge-title">{bestModel}</h3>
          </div>
        </div>

        <div className="champion-metrics">
          <div className="metric-pill">
            <span className="pill-title">Accuracy</span>
            <span className="pill-val">100.0%</span>
          </div>
          <div className="metric-pill">
            <span className="pill-title">F1-Score</span>
            <span className="pill-val">1.0000</span>
          </div>
          <div className="metric-pill">
            <span className="pill-title">Precision</span>
            <span className="pill-val">100.0%</span>
          </div>
          <div className="metric-pill">
            <span className="pill-title">Recall</span>
            <span className="pill-val">100.0%</span>
          </div>
        </div>
      </div>

      {/* Model Benchmark Grid */}
      <div className="glass-panel benchmark-panel">
        <div className="panel-head-flex">
          <div>
            <h3 className="section-title">Model Comparison & Benchmark</h3>
            <p className="section-desc">Stratified 80/20 train/test evaluation across 4 candidate NLP classifiers:</p>
          </div>

          <button
            className="btn-outline-sm btn-primary-outline"
            onClick={onRetrain}
            disabled={isRetraining}
            title="Retrain models on current dataset"
          >
            <RefreshCw size={14} className={isRetraining ? 'animate-spin' : ''} />
            <span>{isRetraining ? 'Training...' : 'Trigger Retrain'}</span>
          </button>
        </div>

        <div className="table-responsive">
          <table className="benchmark-table">
            <thead>
              <tr>
                <th>Classifier Algorithm</th>
                <th>Accuracy</th>
                <th>Precision</th>
                <th>Recall</th>
                <th>F1 Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(comparison).map(([name, metrics]) => {
                const isSelected = name.toLowerCase().includes('svm') || name === bestModel;
                return (
                  <tr key={name} className={isSelected ? 'selected-row' : ''}>
                    <td className="font-semibold">
                      <div className="algo-name">
                        {isSelected && <Award size={14} className="selected-star" />}
                        <span>{name}</span>
                      </div>
                    </td>
                    <td>{(metrics.accuracy * 100).toFixed(1)}%</td>
                    <td>{(metrics.precision * 100).toFixed(1)}%</td>
                    <td>{(metrics.recall * 100).toFixed(1)}%</td>
                    <td className="f1-highlight">{(metrics.f1_score).toFixed(4)}</td>
                    <td>
                      {isSelected ? (
                        <span className="status-tag tag-champ">SELECTED BEST</span>
                      ) : (
                        <span className="status-tag tag-eval">Evaluated</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pipeline Architecture Diagram */}
      <div className="glass-panel pipeline-panel">
        <h3 className="section-title">End-to-End NLP Architecture Flow</h3>
        <p className="section-desc">How input news transforms from raw text to explainable classification:</p>

        <div className="pipeline-flow">
          <div className="flow-step">
            <div className="step-num">01</div>
            <div className="step-icon-wrap"><Layers size={20} /></div>
            <h4 className="step-title">Text Preprocessing</h4>
            <p className="step-desc">Lowercasing, HTML stripping, regex URL cleaning, and NLTK stopword elimination.</p>
          </div>

          <div className="flow-arrow">→</div>

          <div className="flow-step">
            <div className="step-num">02</div>
            <div className="step-icon-wrap"><Database size={20} /></div>
            <h4 className="step-title">TF-IDF Vectorizer</h4>
            <p className="step-desc">Extracts unigram & bigram statistical frequencies across 5,000 vocabulary features.</p>
          </div>

          <div className="flow-arrow">→</div>

          <div className="flow-step">
            <div className="step-num">03</div>
            <div className="step-icon-wrap"><Cpu size={20} /></div>
            <h4 className="step-title">Linear SVM Inference</h4>
            <p className="step-desc">Maximizes margin separation in high-dimensional sparse TF-IDF feature space.</p>
          </div>

          <div className="flow-arrow">→</div>

          <div className="flow-step">
            <div className="step-num">04</div>
            <div className="step-icon-wrap"><BarChart3 size={20} /></div>
            <h4 className="step-title">Explainable AI (XAI)</h4>
            <p className="step-desc">Cross-references weights with active document tokens to identify influential keywords.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
