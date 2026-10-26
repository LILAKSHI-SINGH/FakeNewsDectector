import React, { useState } from 'react';
import { Search, Link, FileText, Globe, ArrowRight, RotateCcw, Download, AlertCircle } from 'lucide-react';
import { scrapeUrlContent } from '../services/api';

const SAMPLE_PRESETS = [
  {
    label: "🔬 Sample: NASA Webb Discovery (Real)",
    type: "real",
    title: "NASA's James Webb Space Telescope Discovers Most Distant Active Supermassive Black Hole",
    text: "Astronomers utilizing data from NASA's James Webb Space Telescope have identified the most distant active supermassive black hole known to date. The cosmic observatory confirmed the black hole's host galaxy, CEERS 1019, existed just over 570 million years after the big bang. The research was published by international researchers and verified with spectroscopic analysis.",
    url: "https://www.nasa.gov/mission_pages/webb/main/index.html"
  },
  {
    label: "⚠️ Sample: Hidden Miracle Cure (Fake)",
    type: "fake",
    title: "Shocking Secret Miracle Cure Banned By Governments And Big Pharma Exposed In Leaked Papers",
    text: "A secret leaked conspiracy document reveals that international pharmaceutical giants and corrupt scientists have hidden an ancient miracle cure that eliminates all illnesses within 24 hours. The shocking truth they don’t want you to know has finally leaked to the public! Click here before this urgent post gets taken down by authorities.",
    url: ""
  },
  {
    label: "⚡ Sample: Perovskite Solar Cells (Real)",
    type: "real",
    title: "MIT Researchers Achieve Breakthrough In Next-Generation Perovskite Solar Cell Efficiency",
    text: "Engineers and materials scientists at the Massachusetts Institute of Technology announced a major advance in tandem silicon-perovskite photovoltaic cells, reaching an independently confirmed power conversion efficiency exceeding 33 percent. The findings were documented in a peer-reviewed journal.",
    url: ""
  },
  {
    label: "👽 Sample: Gravity Reversal Hoax (Fake)",
    type: "fake",
    title: "Scientists Confirm Earth's Gravity Field Will Reverse For Exactly Ten Seconds Next Tuesday",
    text: "Top secret whistleblower documents from deep underground observatories confirm that the earth magnetic field and gravity will switch off next Tuesday morning. Millions of citizens are advised to tie themselves to heavy furniture. Official mainstream media is suppressing the shocking discovery.",
    url: ""
  }
];

export default function PredictionForm({ onAnalyze, isLoading, isDemoMode }) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState(null);

  const handleApplyPreset = (preset) => {
    setTitle(preset.title);
    setText(preset.text);
    setUrl(preset.url || '');
    setScrapeError(null);
  };

  const handleClear = () => {
    setTitle('');
    setText('');
    setUrl('');
    setScrapeError(null);
  };

  const handleScrape = async () => {
    if (!url.trim()) return;
    setIsScraping(true);
    setScrapeError(null);
    try {
      const data = await scrapeUrlContent(url.trim());
      if (data.title && !title) setTitle(data.title);
      if (data.text) setText(data.text);
    } catch (err) {
      setScrapeError(err.message || 'Could not fetch URL content');
    } finally {
      setIsScraping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() && !text.trim() && !url.trim()) {
      alert("Please provide at least a Headline, Article Content, or a URL to analyze.");
      return;
    }
    onAnalyze({ title: title.trim(), text: text.trim(), url: url.trim() });
  };

  return (
    <div className="glass-panel form-panel">
      <div className="panel-header">
        <div className="header-badge">
          <Search size={16} />
          <span>News Credibility Analyzer</span>
        </div>
        <h2 className="panel-title">Analyze News Content</h2>
        <p className="panel-desc">
          Paste a headline, article text, or web URL. Our TF-IDF vectorizer and Linear Support Vector Machine evaluate linguistic markers and cross-verify pattern indicators.
        </p>
      </div>

      {/* Preset Quick Load Buttons */}
      <div className="presets-container">
        <span className="presets-label">Test Samples:</span>
        <div className="presets-list">
          {SAMPLE_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              className={`preset-chip ${preset.type}`}
              onClick={() => handleApplyPreset(preset)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="analysis-form">
        {/* Optional URL Scraper Field */}
        <div className="input-group">
          <label htmlFor="news-url">
            <Globe size={15} />
            <span>Article Web URL (Optional)</span>
          </label>
          <div className="url-input-wrapper">
            <input
              id="news-url"
              type="url"
              placeholder="https://example.com/news/article-headline"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="text-input"
            />
            <button
              type="button"
              className="scrape-btn"
              onClick={handleScrape}
              disabled={isScraping || !url.trim()}
              title="Extract article title and paragraphs"
            >
              {isScraping ? (
                <span className="spinner-sm" />
              ) : (
                <>
                  <Download size={14} />
                  <span>Fetch Content</span>
                </>
              )}
            </button>
          </div>
          {scrapeError && (
            <div className="error-note">
              <AlertCircle size={14} />
              <span>{scrapeError}</span>
            </div>
          )}
        </div>

        {/* Headline Input */}
        <div className="input-group">
          <label htmlFor="news-title">
            <FileText size={15} />
            <span>Headline / Title</span>
          </label>
          <input
            id="news-title"
            type="text"
            placeholder="e.g. Researchers Publish Clinical Study Results on Clean Energy"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-input"
          />
        </div>

        {/* Article Body Input */}
        <div className="input-group">
          <div className="label-with-meta">
            <label htmlFor="news-text">
              <FileText size={15} />
              <span>Article Content / Body Text</span>
            </label>
            <span className="char-count">{text.length} characters</span>
          </div>
          <textarea
            id="news-text"
            rows={5}
            placeholder="Paste the full news article body or several sentences here for maximum ML accuracy..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="text-area"
          />
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleClear}
            disabled={isLoading || (!title && !text && !url)}
          >
            <RotateCcw size={16} />
            <span>Clear</span>
          </button>

          <button
            type="submit"
            className="btn-primary"
            disabled={isLoading || (!title && !text && !url)}
          >
            {isLoading ? (
              <>
                <span className="spinner-sm" />
                <span>Extracting Features & Inferring...</span>
              </>
            ) : (
              <>
                <span>Run AI Detection</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
