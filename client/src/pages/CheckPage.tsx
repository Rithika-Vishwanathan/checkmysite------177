import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const analysisOptions = ['Full Analysis', 'SEO Focus', 'Security Check', 'Performance'];

export default function CheckPage() {
  const [url, setUrl] = useState('');
  const [analysisType, setAnalysisType] = useState('Full Analysis');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const normalizedUrl = useMemo(() => {
    const value = url.trim();
    if (!value) return '';
    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
  }, [url]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!normalizedUrl) {
      setError('Please enter a valid website URL.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/analysis/start', { url: normalizedUrl, analysisType });
      navigate(`/analysis/${response.data.analysisId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to analyze that website.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="check-page panel check-panel">
      <div className="check-header">
        <div className="top-back-row">
          <button type="button" className="glass-icon" aria-label="Back" onClick={() => navigate(-1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button type="button" className="glass-icon" aria-label="Share">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 8a3 3 0 1 0-2.8-4.2M7 13a3 3 0 1 0 2.8 4.2M18 21a3 3 0 1 0-2.8-4.2" /><path d="M11.8 6.9l.4 10.2" /></svg>
          </button>
        </div>

        <h1>Analyze Website</h1>
        <p>Get detailed insights about any website</p>
      </div>

      <form onSubmit={onSubmit} className="check-form">
        <div className="url-input-row">
          <span className="url-prefix">https://</span>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder=""
            aria-label="Website URL"
          />
          <button type="submit" disabled={loading}>{loading ? '...' : '→'}</button>
        </div>
      </form>

      <div className="analysis-section-label">Analysis Type</div>
      <div className="analysis-options">
        {analysisOptions.map((label) => (
          <button
            type="button"
            key={label}
            className={`analysis-option ${analysisType === label ? 'selected' : ''}`}
            onClick={() => setAnalysisType(label)}
          >
            <span className="analysis-label">{label}</span>
          </button>
        ))}
      </div>

      <button type="button" className="primary-action wide" onClick={onSubmit as any}>
        {loading ? 'Starting...' : 'Start Analysis →'}
      </button>

      <div className="analysis-section-title">What we analyze?</div>
      <div className="analysis-checks">
        {['Design & User Experience', 'SEO & Performance', 'Security & Best Practices', 'Competitor Insights'].map((item) => (
          <div key={item} className="analysis-check-item">
            <span className="checkmark">✓</span>
            <span>{item}</span>
          </div>
        ))}
      </div>

      {error && <div className="auth-error">{error}</div>}
    </div>
  );
}
