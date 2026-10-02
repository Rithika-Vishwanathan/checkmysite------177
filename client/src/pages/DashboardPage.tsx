import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

function formatDate(value?: string) {
  if (!value) return 'Today • 8:24 PM';
  try {
    const d = new Date(value);
    const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return `${dateStr} • ${timeStr}`;
  } catch {
    return 'Today • 8:24 PM';
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
    {
      label: 'Quick\nCheck',
      badgeClass: 'bg-[#FCE8EA] text-[#611722]',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
      ),
      route: '/check',
    },
    {
      label: 'Deep\nAnalysis',
      badgeClass: 'bg-[#EBF3FC] text-[#2563EB]',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>
      ),
      route: '/check',
    },
    {
      label: 'Compare\nSites',
      badgeClass: 'bg-[#EDF7EF] text-[#16A34A]',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></svg>
      ),
      route: '/compare',
    },
    {
      label: 'Saved\nReports',
      badgeClass: 'bg-[#FEF5E7] text-[#D97706]',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
      ),
      route: '/saved',
    },
  ];

  const recentAnalyses = useMemo(() => {
    if (analysis.length > 0) return analysis.slice(0, 4);
    // Default demo recent items if empty to populate reference look
    return [
      { _id: 'demo-1', url: 'https://shopseasy.in', overallScore: 92, createdAt: new Date().toISOString() },
      { _id: 'demo-2', url: 'https://notion.so', overallScore: 86, createdAt: new Date(Date.now() - 3600000 * 3).toISOString() },
      { _id: 'demo-3', url: 'https://nike.com', overallScore: 78, createdAt: new Date(Date.now() - 86400000).toISOString() },
    ];
  }, [analysis]);

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
    return (
      <div className="glass-panel p-8 text-center text-[#796B64] font-medium">
        Loading your workspace…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#21130D]">
          Hi, {displayName} 👋
        </h1>
        <p className="text-sm text-[#796B64] mt-0.5 font-medium">
          Ready to analyze today?
        </p>
      </div>

      {/* Main URL Entry Pill Container */}
      <div className="input-pill flex items-center p-2 pl-4 gap-3 bg-white/80 border border-white/90 shadow-sm backdrop-blur-xl rounded-full">
        <svg className="w-5 h-5 text-[#9C8B82] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          type="url"
          placeholder="Paste a website URL..."
          className="w-full bg-transparent text-[#21130D] placeholder-[#A3948C] outline-none text-sm font-medium"
          onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
        />
        <button
          type="button"
          onClick={handleAnalyze}
          className="w-10 h-10 rounded-full bg-[#611722] text-white flex items-center justify-center font-bold text-lg hover:bg-[#490F18] transition shadow-md shadow-[#611722]/20 flex-shrink-0"
          aria-label="Analyze URL"
        >
          →
        </button>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <button
            type="button"
            key={action.label}
            onClick={() => navigate(action.route)}
            className="glass-panel p-4 flex flex-col items-center justify-center text-center gap-2.5 hover:bg-white/90 transition group cursor-pointer border border-white/80"
          >
            <div className={`p-3 rounded-2xl ${action.badgeClass} shadow-sm group-hover:scale-105 transition-transform`}>
              {action.icon}
            </div>
            <span className="text-xs font-semibold text-[#21130D] whitespace-pre-line leading-tight">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Recent Analyses List */}
      <div className="glass-panel p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-base text-[#21130D]">Recent Analyses</h2>
          <button
            type="button"
            className="text-xs font-semibold text-[#611722] hover:underline flex items-center gap-1"
            onClick={() => navigate('/history')}
          >
            See all →
          </button>
        </div>

        <div className="space-y-2.5">
          {recentAnalyses.map((item) => {
            const rawUrl = String(item.url || 'website.com').replace(/^https?:\/\//, '').replace(/\/.*$/, '');
            const domain = rawUrl || 'website.com';
            const score = Math.round(Number(item.overallScore || 0));

            return (
              <div
                key={item._id}
                onClick={() => navigate(`/analysis/${item._id}`)}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/60 border border-white/80 shadow-sm hover:bg-white/90 transition cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-[#FAF4EE] border border-[#EBE0D6] flex items-center justify-center flex-shrink-0">
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
                      alt={domain}
                      className="w-5 h-5 rounded-sm"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className="text-xs font-extrabold text-[#611722] uppercase">
                      {domain.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-[#21130D] truncate">{domain}</div>
                    <div className="text-xs text-[#796B64] font-medium">{formatDate(item.createdAt)}</div>
                  </div>
                </div>

                <div
                  className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    score >= 90
                      ? 'border-emerald-500 text-emerald-700 bg-emerald-50/60'
                      : score >= 75
                      ? 'border-amber-500 text-amber-700 bg-amber-50/60'
                      : 'border-rose-500 text-rose-700 bg-rose-50/60'
                  }`}
                >
                  {score}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
