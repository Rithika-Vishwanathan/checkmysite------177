import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import api from '../api';

const categoryLabels: Record<string, string> = {
  performance: 'Performance',
  seo: 'SEO',
  accessibility: 'Accessibility',
  security: 'Security',
  mobile: 'Mobile',
  technical: 'Technical',
};

function getHeadingLabel(category: string) {
  return categoryLabels[category] || 'Audit detail';
}

export default function CategoryPage() {
  const { id } = useParams();
  const location = useLocation();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get(`/analysis/${id}`).then((res) => setAnalysis(res.data.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="panel p-6 text-sm text-[#737373]">Loading...</div>;
  if (!analysis) return <div className="panel p-6 text-sm text-[#737373]">Not found.</div>;

  const category = location.pathname.split('/').pop() || 'performance';
  const data = analysis[category] || {};
  const score = Number(data.score ?? analysis.overallScore ?? 0);

  const findings = Array.isArray(data.findings)
    ? data.findings
    : Array.isArray(data.violations)
      ? data.violations.map((item: any) => ({
          title: item.help || item.id || 'Issue',
          severity: item.impact || 'medium',
          description: item.description || 'No description available.',
        }))
      : Array.isArray(data.responsiveFindings)
        ? data.responsiveFindings.map((item: any) => ({
            title: item.title || 'Issue',
            severity: item.severity || 'medium',
            description: item.description || 'Issue detected.',
          }))
        : [];

  const detailCards = [
    { label: 'Design & UI/UX', score: Number(analysis.accessibility?.score ?? 0), route: 'accessibility' },
    { label: 'SEO Optimization', score: Number(analysis.seo?.score ?? 0), route: 'seo' },
    { label: 'Performance', score: Number(analysis.performance?.score ?? 0), route: 'performance' },
    { label: 'Security', score: Number(analysis.security?.score ?? 0), route: 'security' },
    { label: 'Accessibility', score: Number(analysis.accessibility?.score ?? 0), route: 'accessibility' },
  ];

  return (
    <div className="space-y-6">
      <section className="panel p-5 sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="kicker">Detailed Analysis</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#171717]">{getHeadingLabel(category)}</h1>
          </div>

          <div className="rounded-2xl border border-[#E7E5E4] bg-[#F9F9F8] p-4 text-right">
            <div className="text-xs uppercase tracking-[0.12em] text-[#737373]">Score</div>
            <div className="mt-2 text-4xl font-semibold tracking-[-0.05em] text-[#5A0714]">{score}/100</div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {detailCards.map((card) => (
          <button key={card.label} type="button" className="detail-card-panel" onClick={() => window.location.assign(`/analysis/${id}/${card.route}`)}>
            <div className="detail-card-top">
              <span className="detail-card-icon">•</span>
              <span>{card.label}</span>
            </div>
            <div className="detail-card-score">{card.score}/100</div>
            <div className="detail-card-meter"><span style={{ width: `${Math.min(100, Math.max(0, card.score))}%` }} /></div>
          </button>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="panel p-5 sm:p-6">
          <div className="flex items-center justify-center">
            <div
              className="flex h-40 w-40 items-center justify-center rounded-full border-[10px] border-[#F3F2EF]"
              style={{ background: `conic-gradient(#5A0714 ${Math.min(100, Math.max(0, score)) * 3.6}deg, #F3F2EF 0deg)` }}
            >
              <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white text-center">
                <div className="text-2xl font-semibold text-[#171717]">{score}</div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-[#737373]">score</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {category === 'performance' && data.metrics ? (
            <div className="panel p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-[#171717]">Key metrics</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {Object.entries(data.metrics).map(([key, value]) => (
                  <div key={key} className="soft-panel p-3">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-[#737373]">{key}</div>
                    <div className="mt-2 text-lg font-semibold text-[#171717]">{value !== null && value !== undefined ? String(value) : 'N/A'}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {category === 'seo' && data.title ? (
            <div className="panel p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-[#171717]">SEO metadata</h2>
              <div className="mt-4 space-y-3 text-sm text-[#171717]">
                <div><span className="font-medium text-[#737373]">Title:</span> {data.title || 'Not found'}</div>
                <div><span className="font-medium text-[#737373]">Description:</span> {data.description || 'Not found'}</div>
                <div><span className="font-medium text-[#737373]">Canonical:</span> {data.canonical || 'Not found'}</div>
              </div>
            </div>
          ) : null}

          {category === 'security' && data.checks ? (
            <div className="panel p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-[#171717]">Security checks</h2>
              <div className="mt-4 space-y-2 text-sm text-[#171717]">
                {Object.entries(data.checks).map(([key, value]) => (
                  <div key={key} className="metric-row">
                    <span className="font-medium capitalize text-[#171717]">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className={value === 'PASS' ? 'text-[#16A34A]' : value === 'FAIL' ? 'text-[#DC2626]' : 'text-[#D97706]'}>{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="panel p-5 sm:p-6">
        <h2 className="section-title">Findings</h2>
        <div className="mt-5 space-y-3">
          {findings.length ? (
            findings.map((item: any, index: number) => (
              <div key={`${item.title || 'issue'}-${index}`} className="rounded-2xl border border-[#E7E5E4] bg-[#F9F9F8] p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="font-medium text-[#171717]">{item.title || 'Issue'}</div>
                  <span
                    className={`status-pill ${
                      String(item.severity || 'low').toLowerCase() === 'critical'
                        ? 'border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]'
                        : String(item.severity || 'low').toLowerCase() === 'high'
                          ? 'border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]'
                          : String(item.severity || 'low').toLowerCase() === 'medium'
                            ? 'border-[#FCD34D] bg-[#FFFBEB] text-[#92400E]'
                            : 'border-[#DCFCE7] bg-[#F0FDF4] text-[#166534]'
                    }`}
                  >
                    {item.severity || 'info'}
                  </span>
                </div>
                <p className="mt-2 text-sm text-[#737373]">{item.description || item.help || item.message || 'Issue discovered during audit.'}</p>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-[#D6D3D1] bg-[#F9F9F8] p-6 text-center text-[#737373]">No issues detected for this category.</div>
          )}
        </div>
      </section>
    </div>
  );
}
