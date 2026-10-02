import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
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
  return categoryLabels[category] || 'Audit Detail';
}

export default function CategoryPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get(`/analysis/${id}`).then((res) => setAnalysis(res.data.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="glass-panel p-6 text-sm text-[#796B64]">Loading category...</div>;
  if (!analysis) return <div className="glass-panel p-6 text-sm text-[#796B64]">Audit not found.</div>;

  const category = location.pathname.split('/').pop() || 'performance';
  const data = analysis[category] || {};
  const score = Number(data.score ?? analysis.overallScore ?? 85);

  const findings = Array.isArray(data.findings)
    ? data.findings
    : Array.isArray(data.violations)
      ? data.violations.map((item: any) => ({
          title: item.help || item.id || 'Issue',
          severity: item.impact || 'medium',
          description: item.description || 'No description available.',
        }))
      : [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-2xl bg-white/60 border border-white/80 shadow-sm flex items-center justify-center text-[#21130D] hover:bg-white transition"
          aria-label="Back"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </button>

        <div className="px-3 py-1 rounded-full bg-[#611722]/10 border border-[#611722]/20 text-xs font-bold text-[#611722]">
          {score}/100 Score
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#21130D]">{getHeadingLabel(category)}</h1>
        <p className="text-sm text-[#796B64] font-medium mt-0.5">Category audit breakdown & findings</p>
      </div>

      <div className="glass-panel p-5 space-y-4">
        <h3 className="font-bold text-sm text-[#21130D]">Findings & Recommendations</h3>

        {findings.length ? (
          <div className="space-y-3">
            {findings.map((item: any, index: number) => (
              <div key={index} className="p-3.5 rounded-2xl bg-white/60 border border-white/80 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-[#21130D]">{item.title || 'Issue'}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                    {item.severity || 'medium'}
                  </span>
                </div>
                <p className="text-xs text-[#796B64] font-medium">{item.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-xs text-[#796B64] font-medium bg-white/60 rounded-2xl border border-white/80">
            No critical issues detected in this section.
          </div>
        )}
      </div>
    </div>
  );
}
