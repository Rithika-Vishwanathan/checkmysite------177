import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api';

export default function ComparePage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    api.get('/analysis')
      .then((res) => setItems(Array.isArray(res.data?.data) ? res.data.data : []))
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#21130D]">Compare Sites</h1>
          <p className="text-sm text-[#796B64] font-medium mt-0.5">Benchmark website performances side-by-side</p>
        </div>
        <button type="button" onClick={() => navigate('/check')} className="btn-burgundy px-4 py-2 text-xs font-semibold">
          Analyze Site
        </button>
      </div>

      {items.length >= 2 ? (
        <div className="grid grid-cols-2 gap-3">
          {items.slice(0, 2).map((item) => {
            const domain = String(item.url || 'website.com').replace(/^https?:\/\//, '').replace(/\/.*$/, '');
            const score = Math.round(Number(item.overallScore || 0));

            return (
              <div
                key={item._id}
                onClick={() => navigate(`/analysis/${item._id}`)}
                className="glass-panel p-4 flex flex-col items-center text-center gap-3 hover:bg-white/90 transition cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#EDF7EF] border border-[#C6E9CC] flex items-center justify-center text-[#16A34A] font-bold">
                  {domain.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-xs text-[#21130D] truncate max-w-[130px]">{domain}</div>
                  <div className="text-[11px] text-[#796B64] font-medium">{new Date(item.completedAt || item.createdAt).toLocaleDateString()}</div>
                </div>

                <div
                  className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-extrabold text-sm ${
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
          <div className="text-base font-bold text-[#21130D]">Compare requires at least 2 audits</div>
          <p className="text-xs text-[#796B64]">Run at least two website analyses to see benchmark comparisons.</p>
          <button type="button" onClick={() => navigate('/check')} className="btn-burgundy px-5 py-2.5 text-xs font-semibold">
            Start An Audit
          </button>
        </div>
      )}
    </div>
  );
}
