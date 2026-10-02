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
      title: 'Quick Check',
      subtitle: 'Instant speed & UX audit',
      badgeClass: 'bg-[#FCE8EA] text-[#591620]',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
      ),
      route: '/check',
    },
    {
      title: 'Deep Analysis',
      subtitle: 'Full 100+ metric scan',
      badgeClass: 'bg-[#EBF3FC] text-[#2563EB]',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>
      ),
      route: '/check',
    },
    {
      title: 'Compare Sites',
      subtitle: 'Side-by-side benchmark',
      badgeClass: 'bg-[#EDF7EF] text-[#16A34A]',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></svg>
      ),
      route: '/compare',
    },
    {
      title: 'Saved Reports',
      subtitle: 'Exported & pinned PDFs',
      badgeClass: 'bg-[#FEF5E7] text-[#D97706]',
      icon: (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
      ),
      route: '/saved',
    },
  ];

  const recentAnalyses = useMemo(() => {
    if (analysis.length > 0) return analysis.slice(0, 5);
    return [
      { _id: 'demo-1', url: 'https://shopseasy.in', overallScore: 92, createdAt: new Date().toISOString() },
      { _id: 'demo-2', url: 'https://notion.so', overallScore: 86, createdAt: new Date(Date.now() - 3600000 * 3).toISOString() },
      { _id: 'demo-3', url: 'https://nike.com', overallScore: 78, createdAt: new Date(Date.now() - 86400000).toISOString() },
    ];
  }, [analysis]);

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Rithika';

  async function handleAnalyze(targetUrl?: string) {
    const finalUrl = targetUrl || url;
    if (!finalUrl.trim()) return;
    try {
      const response = await api.post('/analysis/start', { url: finalUrl });
      navigate(`/analysis/${response.data.analysisId}`);
    } catch (err: any) {
      window.alert(err.response?.data?.message || 'Unable to analyze that website.');
    }
  }

  if (loading) {
    return (
      <div className="glass-panel p-12 text-center text-[#796B64] font-medium">
        <div className="w-10 h-10 border-3 border-[#591620] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Initializing luxury workspace...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner Greeting & Quick Search Input */}
      <div className="glass-panel p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 glass-pill text-xs font-extrabold text-[#591620] mb-3">
            <span>✨ AI Web Auditor v2.0</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#21130D]">
            Hi, {displayName} 👋
          </h1>
          <p className="text-sm sm:text-base text-[#796B64] mt-1 font-medium">
            Enter any domain to run instant UX, Performance, SEO & Security audits.
          </p>

          {/* Main URL Entry Pill Container */}
          <div className="mt-6 input-pill flex items-center p-2 pl-4 gap-3">
            <svg className="w-5 h-5 text-[#9C8B82] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              type="url"
              placeholder="Paste website URL (e.g., https://example.com)..."
              className="w-full bg-transparent text-[#21130D] placeholder-[#A3948C] outline-none text-sm font-semibold"
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            <button
              type="button"
              onClick={() => handleAnalyze()}
              className="btn-burgundy px-6 py-2.5 text-sm font-bold flex items-center gap-2 flex-shrink-0"
            >
              <span>Analyze</span>
              <span className="text-base">→</span>
            </button>
          </div>

          {/* Quick Preset Badges */}
          <div className="mt-3.5 flex items-center gap-2 text-xs text-[#796B64] overflow-x-auto no-scrollbar">
            <span className="font-semibold text-[#21130D]">Try:</span>
            {['shopseasy.in', 'notion.so', 'nike.com', 'stripe.com'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setUrl(`https://${item}`);
                  handleAnalyze(`https://${item}`);
                }}
                className="px-3 py-1 glass-pill text-[#591620] font-semibold transition hover:scale-105"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => (
          <div
            key={action.title}
            onClick={() => navigate(action.route)}
            className="glass-panel glass-panel-hover p-5 flex flex-col justify-between gap-4 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className={`p-3.5 rounded-2xl ${action.badgeClass} shadow-sm`}>
                {action.icon}
              </div>
              <span className="text-xs font-bold text-[#796B64]">Launch →</span>
            </div>
            <div>
              <div className="font-bold text-base text-[#21130D]">{action.title}</div>
              <div className="text-xs text-[#796B64] font-medium mt-0.5">{action.subtitle}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main 2-Column Web Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left / Main Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Analyses Card */}
          <div className="glass-panel p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-lg text-[#21130D]">Recent Website Audits</h2>
                <p className="text-xs text-[#796B64] mt-0.5">Click any report to view deep diagnostic metrics.</p>
              </div>
              <button
                type="button"
                className="text-xs font-bold text-[#591620] hover:underline flex items-center gap-1"
                onClick={() => navigate('/history')}
              >
                View History →
              </button>
            </div>

            <div className="space-y-3">
              {recentAnalyses.map((item) => {
                const rawUrl = String(item.url || 'website.com').replace(/^https?:\/\//, '').replace(/\/.*$/, '');
                const domain = rawUrl || 'website.com';
                const score = Math.round(Number(item.overallScore || 0));

                return (
                  <div
                    key={item._id}
                    onClick={() => navigate(`/analysis/${item._id}`)}
                    className="flex items-center justify-between p-4 rounded-2xl glass-panel glass-panel-hover cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-[#FAF4EE] border border-[#EBE0D6] flex items-center justify-center flex-shrink-0 shadow-sm">
                        <img
                          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
                          alt={domain}
                          className="w-6 h-6 rounded-sm"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <span className="text-sm font-extrabold text-[#591620] uppercase">
                          {domain.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-base text-[#21130D] truncate">{domain}</div>
                        <div className="text-xs text-[#796B64] font-medium">{formatDate(item.createdAt)}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="hidden sm:inline text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Completed
                      </span>
                      <div
                        className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center font-extrabold text-sm shadow-sm flex-shrink-0 ${
                          score >= 90
                            ? 'border-emerald-500 text-emerald-700 bg-emerald-50/70'
                            : score >= 75
                            ? 'border-amber-500 text-amber-700 bg-amber-50/70'
                            : 'border-rose-500 text-rose-700 bg-rose-50/70'
                        }`}
                      >
                        {score}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Category Score Breakdown */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="font-extrabold text-base text-[#21130D]">Audit Engine Benchmark Categories</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'Design & UI/UX', score: 95, color: 'bg-emerald-500', target: 'UX Benchmark' },
                { name: 'SEO Optimization', score: 88, color: 'bg-blue-500', target: 'Search Ranking' },
                { name: 'Speed Performance', score: 90, color: 'bg-amber-500', target: 'Page Load < 1.2s' },
                { name: 'Security & Headers', score: 85, color: 'bg-indigo-500', target: 'SSL & Headers' },
              ].map((cat) => (
                <div key={cat.name} className="p-4 rounded-2xl glass-panel space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#21130D]">{cat.name}</span>
                    <span className="text-[#591620]">{cat.score}/100</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-black/5 overflow-hidden">
                    <div className={`h-full ${cat.color} rounded-full transition-all duration-1000`} style={{ width: `${cat.score}%` }} />
                  </div>
                  <div className="text-[11px] text-[#796B64] font-medium">{cat.target}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar Widgets (1 Col) */}
        <div className="space-y-6">
          {/* AI Consultant Glass Advice Card */}
          <div className="glass-panel p-6 space-y-4 bg-gradient-to-br from-white/80 to-[#FAF0E6]/80 border-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#591620] text-white flex items-center justify-center font-bold">
                💡
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-[#21130D]">AI Consultant Insight</h3>
                <p className="text-[11px] text-[#796B64]">Real-time recommendations</p>
              </div>
            </div>
            <p className="text-xs text-[#4A3B34] font-medium leading-relaxed">
              "Enabling WebP image compression and lazy loading can boost your overall Performance score by up to +14 points!"
            </p>
            <button
              type="button"
              onClick={() => navigate('/ai')}
              className="w-full btn-burgundy py-2.5 text-xs font-bold"
            >
              Ask AI Consultant →
            </button>
          </div>

          {/* System Health Metric Summary */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="font-extrabold text-sm text-[#21130D]">Workspace Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-2xl glass-panel">
                <span className="text-xs font-semibold text-[#796B64]">Total Audits Run</span>
                <span className="text-sm font-extrabold text-[#21130D]">24 Sites</span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-2xl glass-panel">
                <span className="text-xs font-semibold text-[#796B64]">Avg Portfolio Health</span>
                <span className="text-sm font-extrabold text-emerald-700">88.5% Excellent</span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-2xl glass-panel">
                <span className="text-xs font-semibold text-[#796B64]">PDF Export Status</span>
                <span className="text-xs font-bold text-[#591620]">Ready (HD)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
