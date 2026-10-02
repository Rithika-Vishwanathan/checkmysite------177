import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/reports').then((res) => setReports(res.data.data || []));
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#21130D]">My Reports</h1>
          <p className="text-sm text-[#796B64] font-medium mt-0.5">Your generated audit library</p>
        </div>
        <Link to="/check" className="btn-burgundy px-4 py-2 text-xs font-semibold">
          New Audit
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="glass-panel p-8 text-center space-y-3">
          <div className="text-base font-bold text-[#21130D]">No reports generated yet</div>
          <p className="text-xs text-[#796B64]">Run an audit on any website to populate your report library.</p>
          <Link to="/check" className="btn-burgundy px-5 py-2.5 text-xs font-semibold inline-block">
            Start An Audit
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const domain = report.reportData?.domain || 'Website report';
            const score = Math.round(Number(report.reportData?.overallScore || 0));

            return (
              <div
                key={report._id}
                onClick={() => navigate(`/reports/${report._id}`)}
                className="glass-panel p-4 flex items-center justify-between hover:bg-white/90 transition cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-[#FAF4EE] border border-[#EBE0D6] flex items-center justify-center flex-shrink-0">
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
                      alt={domain}
                      className="w-5 h-5"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <span className="text-xs font-extrabold text-[#611722] uppercase">{domain.charAt(0)}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-[#21130D] truncate">{domain}</div>
                    <div className="text-xs text-[#796B64] font-medium">{formatDate(report.createdAt)}</div>
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
      )}
    </div>
  );
}
