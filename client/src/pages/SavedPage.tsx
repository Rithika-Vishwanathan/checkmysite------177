import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api';

export default function SavedPage() {
  const navigate = useNavigate();
  const [saved, setSaved] = useState<any[]>([]);

  useEffect(() => {
    api.get('/reports')
      .then((res) => setSaved(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => setSaved([]));
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#21130D]">Saved Reports</h1>
          <p className="text-sm text-[#796B64] font-medium mt-0.5">Bookmarks and pinned audits</p>
        </div>
        <button type="button" onClick={() => navigate('/check')} className="btn-burgundy px-4 py-2 text-xs font-semibold">
          New Audit
        </button>
      </div>

      {saved.length ? (
        <div className="space-y-3">
          {saved.map((item) => {
            const domain = item.reportData?.domain || 'Saved report';
            const score = Math.round(Number(item.reportData?.overallScore || 0));

            return (
              <div
                key={item._id}
                onClick={() => navigate(`/reports/${item._id}`)}
                className="glass-panel p-4 flex items-center justify-between hover:bg-white/90 transition cursor-pointer"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-[#FEF5E7] border border-[#FDE3BE] flex items-center justify-center flex-shrink-0 text-[#D97706]">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-[#21130D] truncate">{domain}</div>
                    <div className="text-xs text-[#796B64] font-medium">{new Date(item.createdAt).toLocaleDateString()}</div>
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
      ) : (
        <div className="glass-panel p-8 text-center space-y-3">
          <div className="text-base font-bold text-[#21130D]">No saved analyses yet</div>
          <p className="text-xs text-[#796B64]">Bookmark audit reports to access them quickly here.</p>
        </div>
      )}
    </div>
  );
}
