import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import EmblemLogo from '../components/EmblemLogo';

const categories = [
  { key: 'performance', label: 'Performance', icon: '⚡', path: 'performance' },
  { key: 'seo', label: 'SEO', icon: '🔎', path: 'seo' },
  { key: 'accessibility', label: 'Accessibility', icon: '♿', path: 'accessibility' },
  { key: 'security', label: 'Security', icon: '🔐', path: 'security' },
  { key: 'mobile', label: 'Mobile', icon: '📱', path: 'mobile' },
  { key: 'technical', label: 'Technical', icon: '🌐', path: 'technical' },
];

function formatDate(value?: string) {
  if (!value) return 'Recent';
  try {
    return new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Recent';
  }
}

export default function AnalysisPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    let eventSource: EventSource | null = null;

    api
      .get(`/analysis/${id}`)
      .then((res) => setAnalysis(res.data.data))
      .finally(() => setLoading(false));

    try {
      eventSource = new EventSource(`/api/analysis/progress/${id}`);
      eventSource.addEventListener('progress', (event) => {
        try {
          const payload = JSON.parse((event as MessageEvent).data);
          setProgress(payload);
        } catch {
          // ignore malformed progress events
        }
      });
      eventSource.onerror = () => {
        eventSource?.close();
      };
    } catch {
      // EventSource is unavailable in some environments
    }

    return () => eventSource?.close();
  }, [id]);

  const loadingProgress = progress?.progress ?? 65;
  const currentMessage = progress?.message || 'Analyzing content structure...';
  const isRunning = loading || analysis?.status === 'running' || analysis?.status === 'failed' || !analysis?.completedAt;

  if (isRunning) {
    return (
      <div className="space-y-6">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-2xl bg-white/60 border border-white/80 shadow-sm flex items-center justify-center text-[#21130D] hover:bg-white transition"
            aria-label="Back"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 border border-white/80 text-xs font-semibold text-[#796B64]">
            <svg className="w-4 h-4 text-[#611722]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
            <span>00:24</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-[#21130D]">
            Analyzing Website...
          </h1>
          <p className="text-sm text-[#796B64] mt-0.5 font-medium">
            Please wait while we analyze the website
          </p>
        </div>

        {/* Central 3D Metallic Emblem & Progress Arc */}
        <div className="flex flex-col items-center justify-center py-4 relative">
          <div className="relative flex items-center justify-center">
            {/* Outer Progress Ring */}
            <div
              className="w-56 h-56 rounded-full p-2.5 flex items-center justify-center shadow-lg"
              style={{
                background: `conic-gradient(#611722 ${loadingProgress * 3.6}deg, rgba(97, 23, 34, 0.1) 0deg)`,
              }}
            >
              <div className="w-full h-full rounded-full bg-[#FAF2EB] backdrop-blur-xl border border-white/80 flex flex-col items-center justify-center p-4">
                <EmblemLogo size={100} />
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <span className="text-3xl font-extrabold text-[#21130D] block">{loadingProgress}%</span>
            <span className="text-xs text-[#796B64] font-semibold">{currentMessage}</span>
          </div>
        </div>

        {/* Progress Checklist */}
        <div className="glass-panel p-5 space-y-3.5">
          {[
            { label: 'Fetching website data', done: true },
            { label: 'Analyzing design & UX', done: true },
            { label: 'Checking SEO elements...', active: true },
            { label: 'Evaluating performance', pending: true },
            { label: 'Generating insights', pending: true },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              {item.done && (
                <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 font-bold text-xs flex items-center justify-center flex-shrink-0">
                  ✓
                </div>
              )}
              {item.active && (
                <div className="w-5 h-5 rounded-full bg-[#611722]/15 text-[#611722] flex items-center justify-center flex-shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#611722] animate-pulse-dot" />
                </div>
              )}
              {item.pending && (
                <div className="w-5 h-5 rounded-full border-2 border-[#A3948C]/40 flex-shrink-0" />
              )}
              <span
                className={`text-xs font-semibold ${
                  item.active ? 'text-[#611722] font-bold' : item.done ? 'text-[#21130D]' : 'text-[#A3948C]'
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!analysis) {
    return <div className="glass-panel p-6 text-sm text-[#796B64]">Analysis not found.</div>;
  }

  return (
    <div className="space-y-6">
      <section className="glass-panel p-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-[#796B64]">Website</span>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#21130D] truncate max-w-[260px]">{analysis.url}</h1>
              <div className="mt-0.5 text-xs text-[#796B64] font-medium">{formatDate(analysis.completedAt || analysis.createdAt)}</div>
            </div>

            <div className="rounded-2xl border border-white/90 bg-white/70 p-3 text-center min-w-[90px] shadow-sm">
              <div className="text-[10px] uppercase font-bold text-[#796B64]">Overall</div>
              <div className="text-2xl font-extrabold text-[#611722]">{analysis.overallScore ?? 0}/100</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        {categories.map((category) => (
          <Link
            key={category.key}
            to={`/analysis/${id}/${category.path}`}
            className="glass-panel p-4 block transition hover:bg-white/90 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#796B64] font-semibold">{category.icon} {category.label}</span>
              <span className="text-sm font-bold text-[#21130D]">→</span>
            </div>
            <div className="mt-3 text-2xl font-extrabold text-[#21130D]">
              {analysis[category.key]?.score ?? 0}
            </div>
            <div className="mt-1 text-[11px] font-medium text-[#796B64]">Open audit</div>
          </Link>
        ))}
      </section>
    </div>
  );
}
