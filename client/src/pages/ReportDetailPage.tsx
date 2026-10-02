import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

const tabs = ['Overview', 'SEO', 'Performance', 'Security'];

function formatDate(value?: string) {
  if (!value) return 'Recent';
  try {
    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Recent';
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

  const overallScore = Number(report?.reportData?.overallScore ?? analysis?.overallScore ?? 0);
  const scorePercent = Math.min(100, Math.max(0, overallScore));

  const metricCards = useMemo(() => {
    return [
      { label: 'Performance', value: Number(analysis?.performance?.score ?? report?.reportData?.performance ?? 0) },
      { label: 'Accessibility', value: Number(analysis?.accessibility?.score ?? report?.reportData?.accessibility ?? 0) },
      { label: 'SEO', value: Number(analysis?.seo?.score ?? report?.reportData?.seo ?? 0) },
      { label: 'Security', value: Number(analysis?.security?.score ?? report?.reportData?.security ?? 0) },
      { label: 'Mobile', value: Number(analysis?.mobile?.score ?? report?.reportData?.mobile ?? 0) },
      { label: 'Technical', value: Number(analysis?.technical?.score ?? report?.reportData?.technical ?? 0) },
    ];
  }, [analysis, report]);

  const keyInsights = useMemo(() => {
    const items = [] as Array<{ title: string; detail: string }>; 

    if (analysis?.aiSummary) items.push({ title: 'Executive summary', detail: analysis.aiSummary });
    if (analysis?.performance?.score !== undefined) items.push({ title: 'Performance', detail: `Performance score: ${analysis.performance.score}/100` });
    if (analysis?.seo?.score !== undefined) items.push({ title: 'SEO', detail: `SEO score: ${analysis.seo.score}/100` });
    if (analysis?.security?.score !== undefined) items.push({ title: 'Security', detail: `Security score: ${analysis.security.score}/100` });
    if (items.length === 0) {
      items.push({ title: 'Audit', detail: 'The system completed a full audit for this website.' });
    }

    return items;
  }, [analysis]);

  async function recheck() {
    if (!report?.analysisId) return;
    try {
      const response = await api.post(`/analysis/${report.analysisId}/recheck`);
      const nextId = response.data.analysisId || report.analysisId;
      navigate(`/analysis/${nextId}`);
    } catch {
      navigate('/check');
    }
  }

  function downloadReport() {
    if (!report) return;
    const file = makePdf(report, analysis);
    const url = URL.createObjectURL(file);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${(report.reportData?.domain || 'checkmysite-report').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.pdf`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (!report) return <div className="panel p-6 text-sm text-[#737373]">Report not found.</div>;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'SEO':
        return (
          <div className="report-tab-panel">
            <div className="report-metric-row"><span>Title</span><strong>{analysis?.seo?.title || 'Not available'}</strong></div>
            <div className="report-metric-row"><span>Description</span><strong>{analysis?.seo?.description || 'Not available'}</strong></div>
            <div className="report-metric-row"><span>Canonical</span><strong>{analysis?.seo?.canonical || 'Not available'}</strong></div>
          </div>
        );
      case 'Performance':
        return (
          <div className="report-tab-panel">
            <div className="report-metric-row"><span>FCP</span><strong>{analysis?.performance?.metrics?.fcp ? `${Math.round(analysis.performance.metrics.fcp / 1000)}s` : 'N/A'}</strong></div>
            <div className="report-metric-row"><span>LCP</span><strong>{analysis?.performance?.metrics?.lcp ? `${Math.round(analysis.performance.metrics.lcp / 1000)}s` : 'N/A'}</strong></div>
            <div className="report-metric-row"><span>CLS</span><strong>{analysis?.performance?.metrics?.cls ?? 'N/A'}</strong></div>
          </div>
        );
      case 'Security':
        return (
          <div className="report-tab-panel">
            <div className="report-metric-row"><span>Check count</span><strong>{Array.isArray(analysis?.security?.checks) ? analysis.security.checks.length : 'N/A'}</strong></div>
            <div className="report-metric-row"><span>Findings</span><strong>{Array.isArray(analysis?.security?.findings) ? analysis.security.findings.length : 0}</strong></div>
            <div className="report-metric-row"><span>Overall</span><strong>{analysis?.security?.score ?? 0}/100</strong></div>
          </div>
        );
      default:
        return (
          <div className="report-tab-panel">
            <div className="report-metric-row"><span>Website</span><strong>{report.reportData?.domain || analysis?.url || 'Website'}</strong></div>
            <div className="report-metric-row"><span>URL</span><strong>{analysis?.url || report.reportData?.url || 'Not available'}</strong></div>
            <div className="report-metric-row"><span>Overall score</span><strong>{scorePercent}/100</strong></div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <section className="panel report-header-panel">
        <div className="report-header-top">
          <button type="button" className="panel-icon-button" onClick={() => navigate(-1)} aria-label="Back">←</button>
          <div className="report-header-meta">
            <div className="eyebrow">Website report</div>
            <h1>{report.reportData?.domain || 'Website report'}</h1>
            <div className="report-date">{formatDate(report.createdAt)}</div>
          </div>
          <div className="report-header-actions">
            <button type="button" className="panel-icon-button" aria-label="Share">↗</button>
            <button type="button" className="panel-icon-button" onClick={downloadReport} aria-label="Download report">↓</button>
            <button type="button" className="panel-icon-button" aria-label="More actions">⋯</button>
          </div>
        </div>

        <div className="report-score-panel">
          <div className="report-score-ring" style={{ background: `conic-gradient(#7a1027 ${scorePercent * 3.6}deg, rgba(122, 16, 39, 0.12) 0deg)` }}>
            <div className="report-score-center">
              <div className="report-score-value">{scorePercent}</div>
              <div className="report-score-label">Score</div>
            </div>
          </div>
        </div>
      </section>

      <div className="report-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`report-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metricCards.map((item) => (
          <div key={item.label} className="panel metric-card">
            <div className="metric-card-label">{item.label}</div>
            <div className="metric-card-value">{item.value}/100</div>
            <div className="metric-card-bar">
              <span style={{ width: `${Math.min(100, Math.max(0, item.value))}%` }} />
            </div>
          </div>
        ))}
      </section>

      <section className="panel report-insight-panel">
        <div className="section-headline">Key Insights</div>
        <div className="insight-list">
          {keyInsights.map((item) => (
            <div key={item.title} className="insight-item">
              <div className="insight-title">{item.title}</div>
              <div className="insight-detail">{item.detail}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel report-details-panel">
        {renderTabContent()}
      </section>
    </div>
  );
}
