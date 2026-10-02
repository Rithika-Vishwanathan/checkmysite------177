import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';

const categories = [
  { key: 'performance', label: 'Performance', icon: '⚡', path: 'performance' },
  { key: 'seo', label: 'SEO', icon: '🔎', path: 'seo' },
  { key: 'accessibility', label: 'Accessibility', icon: '♿', path: 'accessibility' },
  { key: 'security', label: 'Security', icon: '🔐', path: 'security' },
  { key: 'mobile', label: 'Mobile', icon: '📱', path: 'mobile' },
  { key: 'technical', label: 'Technical', icon: '🌐', path: 'technical' },
];

const stageOrder = [
  { key: 'validation', label: 'Website access' },
  { key: 'loading', label: 'Website access' },
  { key: 'performance', label: 'Performance' },
  { key: 'accessibility', label: 'Accessibility' },
  { key: 'seo', label: 'SEO' },
  { key: 'security', label: 'Security' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'technical', label: 'Technical' },
  { key: 'completed', label: 'AI analysis' },
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
      // EventSource is unavailable in some environments; fall back to static state
    }

    return () => eventSource?.close();
  }, [id]);

  const bannerScore = analysis?.overallScore ?? progress?.progress ?? 0;
  const activeStage = progress?.stage || (analysis?.status === 'completed' ? 'completed' : 'validation');

  const stageProgress = useMemo(() => {
    const currentIndex = stageOrder.findIndex((stage) => stage.key === activeStage);
    const displayValue = analysis?.status === 'completed' ? 100 : Math.max(10, Math.min(95, (progress?.progress ?? 20) || 20));
    return { currentIndex, displayValue };
  }, [activeStage, analysis?.status, progress?.progress]);

  if (loading) {
    const loadingProgress = progress?.progress ?? 65;
    const currentMessage = progress?.message || 'Analyzing content structure...';

    return (
      <div className="analysis-loading-shell">
        <div className="analysis-loading-card">
          <div className="analysis-loading-head">
            <div>
              <div className="eyebrow">Analyzing</div>
              <h2>Analyzing Website...</h2>
              <p>Please wait while we analyze the website</p>
            </div>
            <div className="analysis-timer">{Math.min(99, Math.max(10, loadingProgress))}%</div>
          </div>

          <div className="analysis-eye-stage">
            <div className="analysis-eye-frame">
              <svg viewBox="0 0 420 420" className="splash-logo" aria-label="Loading logo" role="img">
                <defs>
                  <linearGradient id="splashStroke2" x1="0%" x2="100%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#f8e8d9" />
                    <stop offset="35%" stopColor="#edd4b6" />
                    <stop offset="75%" stopColor="#c9997a" />
                    <stop offset="100%" stopColor="#7f4d3d" />
                  </linearGradient>
                </defs>
                <path d="M103 303 C102 219, 169 116, 237 111 C 288 108, 323 136, 337 174 C 352 216, 322 254, 292 271 C 266 286, 215 289, 190 301 C 163 315, 159 338, 187 349 C 221 363, 271 349, 307 319" fill="none" stroke="url(#splashStroke2)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" className="splash-s-shape" />
                <circle cx="212" cy="214" r="92" fill="none" stroke="url(#splashStroke2)" strokeWidth="14" className="splash-eye-ring" />
                <circle cx="212" cy="214" r="52" fill="rgba(24,18,17,0.18)" stroke="rgba(32,24,22,0.32)" strokeWidth="12" className="splash-eye-core" />
                <circle cx="212" cy="214" r="19" fill="#1e1715" className="splash-eye-pupil" />
              </svg>
            </div>
          </div>

          <div className="analysis-progress-wrap">
            <div className="analysis-progress-ring" style={{ background: `conic-gradient(#7a1027 ${loadingProgress * 3.6}deg, rgba(122,16,39,0.12) 0deg)` }}>
              <span className="analysis-progress-value">{loadingProgress}%</span>
            </div>
          </div>

          <div className="analysis-status-label">{currentMessage}</div>

          <div className="analysis-checklist">
            {['Fetching website data', 'Analyzing design & UX', 'Checking SEO elements...', 'Evaluating performance', 'Generating insights'].map((item) => (
              <div key={item} className="analysis-checklist-item">
                <span className="bullet" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return <div className="panel p-6 text-sm text-[#737373]">Analysis not found.</div>;
  }

  const isRunning = analysis.status === 'running' || analysis.status === 'failed' || !analysis.completedAt;

  return (
    <div className="space-y-6">
      <section className="panel p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="kicker">Website</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#171717]">{analysis.url}</h1>
            <div className="mt-2 text-sm text-[#737373]">{formatDate(analysis.completedAt || analysis.createdAt)}</div>
          </div>

          <div className="rounded-2xl border border-[#E7E5E4] bg-[#F9F9F8] p-4 text-right">
            <div className="text-xs uppercase tracking-[0.12em] text-[#737373]">Overall score</div>
            <div className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-[#5A0714]">{analysis.overallScore ?? 0}/100</div>
          </div>
        </div>
      </section>

      {isRunning ? (
        <section className="panel p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="kicker">Audit in progress</div>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#171717]">Analyzing {analysis.url}</h2>
            </div>
            <div className="score-badge">{Math.min(100, Math.max(0, stageProgress.displayValue))}%</div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-sm text-[#737373]">
              <span>Overall progress</span>
              <span>{Math.min(100, Math.max(0, stageProgress.displayValue))}%</span>
            </div>
            <div className="progress-track mt-3">
              <div
                className="h-full rounded-full bg-[#5A0714] transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, stageProgress.displayValue))}%` }}
              />
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-[#E7E5E4] bg-[#F9F9F8] p-4">
            <div className="text-xs uppercase tracking-[0.12em] text-[#737373]">Current stage</div>
            <div className="mt-2 text-lg font-semibold text-[#171717]">
              {progress?.message || 'Validating URL'}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {stageOrder.map((stage, index) => {
              const isCurrent = stage.key === activeStage;
              const isComplete = index < stageProgress.currentIndex || (analysis.status === 'completed' && index <= stageOrder.length - 1);

              return (
                <div
                  key={stage.key}
                  className={`rounded-2xl border p-3 ${
                    isCurrent
                      ? 'border-[#5A0714] bg-[#F8E9EC]'
                      : isComplete
                        ? 'border-[#DCFCE7] bg-[#F0FDF4]'
                        : 'border-[#E7E5E4] bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-[#171717]">{stage.label}</span>
                    <span className="text-base">{isComplete ? '✓' : isCurrent ? '•' : '○'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.key}
            to={`/analysis/${id}/${category.path}`}
            className="panel block p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(23,23,23,0.07)]"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm text-[#737373]">{category.icon} {category.label}</div>
                <div className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#171717]">
                  {analysis[category.key]?.score ?? 0}
                </div>
              </div>
              <span className="text-xl">→</span>
            </div>
            <div className="mt-3 text-sm text-[#737373]">Open detailed audit</div>
          </Link>
        ))}
      </section>
    </div>
  );
}
