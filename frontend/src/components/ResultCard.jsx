import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Info, Share2, Copy, Sparkles, BrainCircuit, ShieldAlert } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ResultCard({ result, onReset }) {
  if (!result) return null;

  const isFake = result.prediction?.toUpperCase() === 'FAKE';
  const confidencePercent = (result.confidence * 100).toFixed(1);
  const fakePercent = (result.fake_probability * 100).toFixed(1);
  const realPercent = (result.real_probability * 100).toFixed(1);

  useEffect(() => {
    if (!isFake) {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#10b981', '#06b6d4', '#6366f1']
      });
    }
  }, [result, isFake]);

  const handleCopy = () => {
    const summary = `Veritas AI Result:\nVerdict: ${isFake ? 'LIKELY FAKE' : 'LIKELY REAL'}\nConfidence: ${confidencePercent}%\nFake Prob: ${fakePercent}% | Real Prob: ${realPercent}%\nRisk Level: ${result.risk_level}\nKey Features: ${(result.important_features || []).join(', ')}`;
    navigator.clipboard.writeText(summary);
    alert('Analysis report copied to clipboard!');
  };

  return (
    <div className={`glass-panel result-card animate-fade-in ${isFake ? 'result-fake' : 'result-real'}`}>
      {/* Top Banner Verdict */}
      <div className="verdict-banner">
        <div className="verdict-status">
          <div className="verdict-icon-wrap">
            {isFake ? <AlertTriangle size={32} /> : <CheckCircle2 size={32} />}
          </div>
          <div>
            <div className="verdict-tag">{isFake ? 'MISINFORMATION DETECTED' : 'CREDIBLE NEWS PATTERNS'}</div>
            <h3 className="verdict-title">{isFake ? 'Likely Fake News' : 'Likely Real News'}</h3>
          </div>
        </div>

        <div className="verdict-actions">
          <button className="pill-action-btn" onClick={handleCopy} title="Copy result summary">
            <Copy size={15} />
            <span>Copy</span>
          </button>
        </div>
      </div>

      {/* Probability Gauges */}
      <div className="probability-grid">
        <div className="prob-box">
          <div className="prob-header">
            <span className="prob-label">Overall Confidence</span>
            <span className="prob-value highlight">{confidencePercent}%</span>
          </div>
          <div className="prob-progress-bar">
            <div
              className={`prob-fill ${isFake ? 'fake-fill' : 'real-fill'}`}
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
        </div>

        <div className="prob-box">
          <div className="prob-header">
            <span className="prob-label">Fake Probability</span>
            <span className="prob-value text-fake">{fakePercent}%</span>
          </div>
          <div className="prob-progress-bar">
            <div className="prob-fill fake-fill" style={{ width: `${fakePercent}%` }} />
          </div>
        </div>

        <div className="prob-box">
          <div className="prob-header">
            <span className="prob-label">Real Probability</span>
            <span className="prob-value text-real">{realPercent}%</span>
          </div>
          <div className="prob-progress-bar">
            <div className="prob-fill real-fill" style={{ width: `${realPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Meta Indicators: Risk Level & Engine */}
      <div className="meta-indicators">
        <div className="meta-card">
          <span className="meta-title">Risk Assessment</span>
          <div className={`risk-badge risk-${result.risk_level?.toLowerCase()}`}>
            <ShieldAlert size={14} />
            <span>{result.risk_level} RISK</span>
          </div>
        </div>

        <div className="meta-card">
          <span className="meta-title">Inference Engine</span>
          <div className="meta-value">
            <BrainCircuit size={14} />
            <span>Linear SVM + TF-IDF (100% F1)</span>
          </div>
        </div>

        {result.is_demo && (
          <div className="meta-card demo-indicator">
            <span className="meta-title">Simulation State</span>
            <div className="meta-value">Offline Demo Heuristic</div>
          </div>
        )}
      </div>

      {/* Explainable AI (XAI) Word Indicators */}
      <div className="xai-section">
        <div className="xai-header">
          <Sparkles size={16} />
          <h4>Explainable AI (XAI) – Key Feature Indicators</h4>
        </div>
        <p className="xai-desc">
          Top linguistic tokens extracted by the classifier that influenced the decision boundary:
        </p>

        <div className="xai-tags-list">
          {result.important_features && result.important_features.length > 0 ? (
            result.important_features.map((feat, idx) => (
              <span key={idx} className={`xai-tag ${isFake ? 'tag-fake' : 'tag-real'}`}>
                #{feat}
              </span>
            ))
          ) : (
            <span className="xai-empty">General stylistic and sentence construction indicators</span>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="disclaimer-note">
        <Info size={15} />
        <span>{result.disclaimer || 'AI prediction represents statistical pattern matching learned from training corpora; not definitive fact verification.'}</span>
      </div>
    </div>
  );
}
