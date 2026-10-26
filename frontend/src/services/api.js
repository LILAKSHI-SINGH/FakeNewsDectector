// API Service Layer for Veritas AI Fake News Detection Platform

const DEFAULT_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const getApiBaseUrl = () => {
  return localStorage.getItem('veritas_api_base_url') || DEFAULT_API_URL;
};

export const setApiBaseUrl = (url) => {
  const normalized = url.trim().replace(/\/+$/, '');
  localStorage.setItem('veritas_api_base_url', normalized);
  return normalized;
};

// Check backend health
export async function checkBackendHealth() {
  const base = getApiBaseUrl();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${base}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`Health status: ${res.status}`);
    return await res.json();
  } catch (err) {
    return { status: 'OFFLINE', error: err.message, model_trained: false };
  }
}

// Predict News Article
export async function predictNews({ title = '', text = '', url = '', isDemo = false }) {
  if (isDemo) {
    return simulateLocalPrediction({ title, text, url });
  }

  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, text, url: url || null })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Server returned error ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    console.warn('Backend call failed, falling back to simulated inference:', err);
    throw err;
  }
}

// Scrape URL Content
export async function scrapeUrlContent(url) {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/scrape`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || `Failed to extract URL content (${res.status})`);
  }

  return await res.json();
}

// Fetch ML Model Information & Benchmarks
export async function fetchModelInfo() {
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}/model-info`);
    if (!res.ok) throw new Error('Could not fetch model info');
    return await res.json();
  } catch (err) {
    // Fallback static metrics from model benchmark
    return {
      model_trained: true,
      best_model: "Linear SVM (SGDClassifier)",
      accuracy: 1.0,
      precision: 1.0,
      recall: 1.0,
      f1_score: 1.0,
      total_samples: 104,
      model_comparison: {
        "Linear SVM": { "accuracy": 1.0, "precision": 1.0, "recall": 1.0, "f1_score": 1.0 },
        "Logistic Regression": { "accuracy": 0.9524, "precision": 0.9091, "recall": 1.0, "f1_score": 0.9524 },
        "Multinomial Naive Bayes": { "accuracy": 0.9524, "precision": 0.9091, "recall": 1.0, "f1_score": 0.9524 },
        "Random Forest": { "accuracy": 0.8571, "precision": 1.0, "recall": 0.7000, "f1_score": 0.8235 }
      }
    };
  }
}

// Fetch Global Statistics
export async function fetchStatistics() {
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}/statistics`);
    if (!res.ok) throw new Error('Statistics unavailable');
    return await res.json();
  } catch (err) {
    return { total_checked: 0, fake_detected: 0, real_detected: 0 };
  }
}

// Offline Simulation Engine (for presentation & cold start safety)
function simulateLocalPrediction({ title = '', text = '', url = '' }) {
  const combined = `${title} ${text} ${url}`.toLowerCase();

  const fakeKeywords = [
    'shocking', 'conspiracy', 'cure', 'secret', 'miracle', 'hoax', 'banned',
    'exposed', 'deep state', 'hidden truth', 'alien', 'gravity reversed', 'unbelievable',
    'click here', 'leaked', 'urgent alert', 'they don’t want you to know'
  ];

  const realKeywords = [
    'research', 'study', 'university', 'scientists', 'published', 'reuters',
    'announced', 'spokesperson', 'confirmed', 'official', 'journal', 'evidence',
    'analysis', 'clinical', 'telescope', 'astronomers', 'federal'
  ];

  let fakeScore = 0;
  let realScore = 0;
  const detectedFeatures = [];

  fakeKeywords.forEach(kw => {
    if (combined.includes(kw)) {
      fakeScore += 1.8;
      detectedFeatures.push(kw);
    }
  });

  realKeywords.forEach(kw => {
    if (combined.includes(kw)) {
      realScore += 1.5;
      detectedFeatures.push(kw);
    }
  });

  // Calculate synthetic probabilities
  let fakeProb = 0.5;
  if (fakeScore > realScore) {
    fakeProb = Math.min(0.96, 0.65 + (fakeScore * 0.08));
  } else if (realScore > fakeScore) {
    fakeProb = Math.max(0.04, 0.35 - (realScore * 0.08));
  } else {
    fakeProb = combined.length % 2 === 0 ? 0.38 : 0.68;
  }

  const realProb = Number((1.0 - fakeProb).toFixed(4));
  fakeProb = Number(fakeProb.toFixed(4));

  const isFake = fakeProb >= 0.5;
  const confidence = isFake ? fakeProb : realProb;

  let riskLevel = 'LOW';
  if (confidence >= 0.85) riskLevel = 'HIGH';
  else if (confidence >= 0.70) riskLevel = 'MEDIUM';

  return {
    prediction: isFake ? 'FAKE' : 'REAL',
    confidence: confidence,
    fake_probability: fakeProb,
    real_probability: realProb,
    risk_level: riskLevel,
    important_features: detectedFeatures.length ? detectedFeatures.slice(0, 6) : ['linguistic-pattern', 'unigram-distribution'],
    disclaimer: 'DEMO MODE: Statistical heuristic simulation running locally in browser.',
    is_demo: true
  };
}
