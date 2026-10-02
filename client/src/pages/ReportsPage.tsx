import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function formatDate(value?: string) {
  if (!value) return 'Recent';
  try {
    return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Recent';
  }
}

export default function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    api.get('/reports').then((res) => setReports(res.data.data || []));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="kicker">Library</div>
          <h1 className="section-title mt-2">Reports</h1>
        </div>
        <Link to="/check" className="inline-flex items-center justify-center rounded-xl bg-[#5A0714] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#43050E]">
          Run a new audit
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="panel p-8 text-center">
          <div className="text-2xl">No reports yet</div>
          <p className="mt-2 text-sm text-[#737373]">Audit a website to generate a report library entry.</p>
          <Link to="/check" className="mt-5 inline-flex items-center rounded-xl bg-[#5A0714] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#43050E]">
            Start an audit
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((report) => (
            <Link key={report._id} to={`/reports/${report._id}`} className="panel block p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(23,23,23,0.07)]">
              <div className="flex items-center justify-between gap-4">
                <div className="text-lg font-semibold text-[#171717]">{report.reportData?.domain || 'Website report'}</div>
                <span className="score-badge">{report.reportData?.overallScore ?? 0}/100</span>
              </div>

              <div className="mt-4 text-sm text-[#737373]">Audit date: {formatDate(report.createdAt)}</div>

              <div className="mt-5 flex items-center justify-between border-t border-[#E7E5E4] pt-4 text-sm">
                <span className="text-[#737373]">Open report</span>
                <span className="text-[#171717]">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
