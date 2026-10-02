import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

const tabs = ['Overview', 'SEO', 'Performance', 'Security'];

function formatDate(value?: string) {
  if (!value) return '28 Sep 2026, 08:24 PM';
  try {
    const d = new Date(value);
    return d.toLocaleString([], { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '28 Sep 2026, 08:24 PM';
  }
}

function makePdf(report: any, analysis: any) {
  const domain = report?.reportData?.domain || 'website';
  const baseScore = Number(report?.reportData?.overallScore ?? analysis?.overallScore ?? 0);
  const lines = [
    'CheckMySite Report',
    `Domain: ${domain}`,
    `Generated: ${formatDate(report?.createdAt || analysis?.completedAt)}`,
    `Overall score: ${baseScore}/100`,
    `Performance: ${analysis?.performance?.score ?? 0}/100`,
    `SEO: ${analysis?.seo?.score ?? 0}/100`,
    `Accessibility: ${analysis?.accessibility?.score ?? 0}/100`,
    `Security: ${analysis?.security?.score ?? 0}/100`,
    `Summary: ${analysis?.aiSummary || 'Full website audit completed successfully.'}`,
  ];

  const pageWidth = 595;
  const pageHeight = 842;
  const pageText = lines
    .map((line, index) => {
      const safe = line
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)');
      return `BT /F1 12 Tf 50 ${pageHeight - 90 - index * 22} Td (${safe}) Tj ET`;
    })
    .join('\n');

  const content = `BT /F1 16 Tf 50 800 Td (CheckMySite Report) Tj ET\n${pageText}`;
  const pdf = `%PDF-1.4\n1 0 obj<< /Type /Catalog /Pages 2 0 R>>endobj\n2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj\n3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>endobj\n4 0 obj<< /Length ${content.length} >>stream\n${content}\nendstream\nendobj\n5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj\nxref\n0 6\n0000000000 65535 f \n0000000010 00000 n \n0000000066 00000 n \n0000000123 00000 n \n0000000798 00000 n \n0000001451 00000 n \ntrailer\n<< /Root 1 0 R /Size 6 >>\nstartxref\n${1451 + content.length}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

export default function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    if (!id) return;

    api
      .get(`/reports/${id}`)
      .then((res) => {
        const nextReport = res.data.data;
        setReport(nextReport);
        if (nextReport?.analysisId) {
          return api.get(`/analysis/${nextReport.analysisId}`);
        }
        return null;
      })
      .then((analysisRes) => {
        if (analysisRes) setAnalysis(analysisRes.data.data);
      })
      .catch(() => setReport(null));
  }, [id]);

  const overallScore = Number(report?.reportData?.overallScore ?? analysis?.overallScore ?? 92);
  const scorePercent = Math.min(100, Math.max(0, overallScore));
  const domain = report?.reportData?.domain || analysis?.url?.replace(/^https?:\/\//, '').replace(/\/.*$/, '') || 'shopseasy.in';

  const categoryBreakdown = useMemo(() => {
    return [
      {
        key: 'design',
        label: 'Design & UI/UX',
        score: Number(analysis?.design?.score ?? report?.reportData?.design ?? 95),
        barColor: 'bg-emerald-500',
        icon: (
          <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        ),
      },
      {
        key: 'seo',
        label: 'SEO Optimization',
        score: Number(analysis?.seo?.score ?? report?.reportData?.seo ?? 88),
        barColor: 'bg-emerald-500',
        icon: (
          <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        ),
      },
      {
        key: 'performance',
        label: 'Performance',
        score: Number(analysis?.performance?.score ?? report?.reportData?.performance ?? 90),
        barColor: 'bg-emerald-500',
        icon: (
          <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        ),
      },
      {
        key: 'security',
        label: 'Security',
        score: Number(analysis?.security?.score ?? report?.reportData?.security ?? 85),
        barColor: 'bg-blue-500',
        icon: (
          <svg className="w-5 h-5 text-sky-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        ),
      },
      {
        key: 'accessibility',
        label: 'Accessibility',
        score: Number(analysis?.accessibility?.score ?? report?.reportData?.accessibility ?? 80),
        barColor: 'bg-amber-500',
        icon: (
          <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="4" r="2" />
            <path d="M12 6v7M6 8l6 2 6-2M8 21l4-8 4 8" />
          </svg>
        ),
      },
    ];
  }, [analysis, report]);

  function downloadReport() {
    const file = makePdf(report || {}, analysis || {});
    const url = URL.createObjectURL(file);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${domain.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-analysis-report.pdf`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5 pb-16">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-2xl bg-white/60 border border-white/80 shadow-sm flex items-center justify-center text-[#21130D] hover:bg-white transition"
          aria-label="Back"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="w-10 h-10 rounded-2xl bg-white/60 border border-white/80 shadow-sm flex items-center justify-center text-[#21130D] hover:bg-white transition"
            aria-label="Share"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" /></svg>
          </button>
          <button
            type="button"
            onClick={downloadReport}
            className="w-10 h-10 rounded-2xl bg-white/60 border border-white/80 shadow-sm flex items-center justify-center text-[#21130D] hover:bg-white transition"
            aria-label="Download"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
          </button>
          <button
            type="button"
            className="w-10 h-10 rounded-2xl bg-white/60 border border-white/80 shadow-sm flex items-center justify-center text-[#21130D] hover:bg-white transition"
            aria-label="More"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>
          </button>
        </div>
      </div>

      {/* Website Card Preview */}
      <div className="glass-panel p-4 flex items-center gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-[#FAF4EE] border border-[#EBE0D6] flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
          <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
            alt={domain}
            className="w-6 h-6"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className="text-sm font-extrabold text-[#611722] uppercase">
            {domain.charAt(0)}
          </span>
        </div>
        <div>
          <h2 className="font-bold text-base text-[#21130D] leading-tight">{domain}</h2>
          <div className="text-xs text-[#796B64] font-medium mt-0.5">E-Commerce Website</div>
          <div className="text-[11px] text-[#A3948C] font-medium">Analyzed on {formatDate(report?.createdAt)}</div>
        </div>
      </div>

      {/* Overall Score Gauge Card */}
      <div className="glass-panel p-5 flex items-center gap-5">
        <div className="relative flex-shrink-0">
          <div
            className="w-24 h-24 rounded-full p-2 flex items-center justify-center shadow-md"
            style={{
              background: `conic-gradient(#16A34A ${scorePercent * 3.6}deg, rgba(22, 163, 74, 0.12) 0deg)`,
            }}
          >
            <div className="w-full h-full rounded-full bg-[#FDFBF8] flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-[#21130D]">{scorePercent}</span>
              <span className="text-[10px] font-bold text-[#796B64]">/100</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-bold text-[#21130D]">Excellent!</h3>
          <p className="text-xs text-[#796B64] font-medium mt-1 leading-relaxed">
            Your website is well-optimized and performs great.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition flex-shrink-0 ${
              activeTab === tab
                ? 'bg-[#611722] text-white shadow-md shadow-[#611722]/20'
                : 'bg-white/60 border border-white/80 text-[#796B64] hover:bg-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Detailed Category Scores Breakdown (Screen 10) */}
      <div className="glass-panel p-5 space-y-4">
        <h3 className="font-bold text-base text-[#21130D]">Detailed Analysis</h3>

        <div className="space-y-3.5">
          {categoryBreakdown.map((cat) => (
            <div key={cat.key} className="p-3.5 rounded-2xl bg-white/60 border border-white/80 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#FAF4EE]">
                    {cat.icon}
                  </div>
                  <span className="text-xs font-bold text-[#21130D]">{cat.label}</span>
                </div>
                <span className="text-xs font-extrabold text-[#21130D]">{cat.score} <span className="text-[#A3948C] font-semibold">/100</span></span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-[#EBE0D6] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${cat.barColor}`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Insights List */}
      <div className="glass-panel p-5 space-y-3.5">
        <h3 className="font-bold text-sm text-[#21130D]">Key Insights</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 font-bold text-xs flex items-center justify-center flex-shrink-0">✓</div>
            <span className="text-xs font-semibold text-[#21130D]">Clean and modern design</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 font-bold text-xs flex items-center justify-center flex-shrink-0">✓</div>
            <span className="text-xs font-semibold text-[#21130D]">Good loading performance</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-amber-500/15 text-amber-600 font-bold text-xs flex items-center justify-center flex-shrink-0">⚠</div>
            <span className="text-xs font-semibold text-[#21130D]">Meta descriptions can be improved</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 font-bold text-xs flex items-center justify-center flex-shrink-0">↑</div>
            <span className="text-xs font-semibold text-[#21130D]">Mobile responsive</span>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Pill Button */}
      <div className="sticky bottom-4 inset-x-0 z-20">
        <button
          type="button"
          onClick={downloadReport}
          className="btn-burgundy w-full py-4 text-sm font-bold flex items-center justify-center gap-2 shadow-xl"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
          Download Report (PDF)
        </button>
      </div>
    </div>
  );
}
