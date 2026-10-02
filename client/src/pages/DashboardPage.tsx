import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

function formatDate(value?: string) {
  if (!value) return 'No date';
  try {
    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'No date';
  }
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<any[]>([]);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/analysis')
      .then((analysisRes) => {
        setAnalysis(Array.isArray(analysisRes.data?.data) ? analysisRes.data.data : []);
      })
      .catch(() => setAnalysis([]))
      .finally(() => setLoading(false));
  }, []);

  const quickActions = [
    { label: 'Quick\nCheck', icon: 'check', route: '/check' },
    { label: 'Deep\nAnalysis', icon: 'chart', route: '/check' },
    { label: 'Compare\nSites', icon: 'compare', route: '/compare' },
    { label: 'Saved\nReports', icon: 'saved', route: '/saved' },
  ];

  const recentAnalyses = useMemo(() => analysis.slice(0, 4), [analysis]);
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Rithika';

  async function handleAnalyze() {
    if (!url.trim()) return;
    try {
      const response = await api.post('/analysis/start', { url });
      navigate(`/analysis/${response.data.analysisId}`);
    } catch (err: any) {
      window.alert(err.response?.data?.message || 'Unable to analyze that website.');
    }
  }

  if (loading) {
    return <div className="soft-panel panel-loading">Loading your workspace…</div>;
  }

  return (
    <div className="dashboard-layout">
      <section className="panel dashboard-panel">
        <div className="hero-header">
          <div className="hero-copy">
            <h1>Hi, {displayName} 👋</h1>
            <p>Ready to analyze today?</p>
          </div>
        </div>

        <div className="url-entry">
          <span className="link-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M10.5 13.5 13.5 10.5" /><path d="M8.5 15.5 7 17a3 3 0 0 1-4.2-4.2l2.7-2.7A3 3 0 0 1 8.5 9" /><path d="M15.5 8.5 17 7a3 3 0 1 1 4.2 4.2l-2.7 2.7A3 3 0 0 1 15.5 15" /></svg>
          </span>
          <input value={url} onChange={(e) => setUrl(e.target.value)} type="url" placeholder="Paste a website URL..." />
          <button type="button" onClick={handleAnalyze} aria-label="Analyze">→</button>
        </div>

        <div className="quick-grid">
          {quickActions.map((action) => (
            <button type="button" key={action.label} className="quick-action" onClick={() => navigate(action.route)}>
              <span className={`quick-icon quick-icon-${action.icon}`} aria-hidden="true">
                {action.icon === 'check' && '◌'}
                {action.icon === 'chart' && '◍'}
                {action.icon === 'compare' && '⇄'}
                {action.icon === 'saved' && '▣'}
              </span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="list-panel panel">
        <div className="panel-header">
          <h2>Recent Analyses</h2>
          <button type="button" className="link-button" onClick={() => navigate('/history')}>See all →</button>
        </div>

        <div className="recent-list">
          {recentAnalyses.length ? (
            recentAnalyses.map((item) => {
              const domain = String(item.url || 'site').replace(/^https?:\/\//, '').replace(/\/.*$/, '').split('.')[0] || 'site';
              const score = Math.round(Number(item.overallScore || 0));
              return (
                <button type="button" key={item._id} className="recent-item" onClick={() => navigate(`/analysis/${item._id}`)}>
                  <div className="item-badge">{domain}</div>
                  <div className="item-copy">
                    <strong>{String(item.url || '').replace(/^https?:\/\//, '').replace(/\/$/, '') || 'website.com'}</strong>
                    <span>{formatDate(item.completedAt || item.createdAt)}</span>
                  </div>
                  <div className="item-score">{score}</div>
                </button>
              );
            })
          ) : (
            <div className="empty-state">No analyses yet</div>
          )}
        </div>
      </section>
    </div>
  );
}
