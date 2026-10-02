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

export default function HistoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/analysis').then((res) => setItems(res.data.data || []));
  }, []);

  async function remove(id: string) {
    await api.delete(`/analysis/${id}`);
    setItems((prev) => prev.filter((item) => item._id !== id));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#21130D]">Audit History</h1>
          <p className="text-sm text-[#796B64] font-medium mt-0.5">Chronological record of website audits</p>
        </div>
        <Link to="/check" className="btn-burgundy px-4 py-2 text-xs font-semibold">
          New Audit
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="glass-panel p-8 text-center space-y-3">
          <div className="text-base font-bold text-[#21130D]">No audits found</div>
          <p className="text-xs text-[#796B64]">Run your first website check to see it listed here.</p>
          <Link to="/check" className="btn-burgundy px-5 py-2.5 text-xs font-semibold inline-block">
            Start An Audit
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const rawUrl = String(item.url || 'website.com').replace(/^https?:\/\//, '').replace(/\/.*$/, '');
            const score = Math.round(Number(item.overallScore || 0));

            return (
              <div
                key={item._id}
                className="glass-panel p-4 flex items-center justify-between gap-3 hover:bg-white/90 transition"
              >
                <div
                  onClick={() => navigate(`/analysis/${item._id}`)}
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#FAF4EE] border border-[#EBE0D6] flex items-center justify-center flex-shrink-0 font-bold text-xs text-[#611722]">
                    {rawUrl.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-[#21130D] truncate">{rawUrl}</div>
                    <div className="text-xs text-[#796B64] font-medium">{formatDate(item.completedAt || item.createdAt)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs ${
                      score >= 90
                        ? 'border-emerald-500 text-emerald-700 bg-emerald-50/60'
                        : score >= 75
                        ? 'border-amber-500 text-amber-700 bg-amber-50/60'
                        : 'border-rose-500 text-rose-700 bg-rose-50/60'
                    }`}
                  >
                    {score}
                  </div>

                  <button
                    type="button"
                    onClick={() => remove(item._id)}
                    className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center text-xs font-bold hover:bg-rose-100 transition"
                    title="Delete audit"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
