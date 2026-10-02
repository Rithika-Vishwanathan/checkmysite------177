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

  async function recheck(id: string) {
    try {
      const response = await api.post(`/analysis/${id}/recheck`);
      const nextId = response.data.analysisId || id;
      navigate(`/analysis/${nextId}`);
    } catch {
      navigate('/check');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="kicker">Audit trail</div>
          <h1 className="section-title mt-2">History</h1>
        </div>
        <Link to="/check" className="inline-flex items-center justify-center rounded-xl bg-[#5A0714] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#43050E]">
          Start a new audit
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="panel p-8 text-center">
          <div className="text-2xl">No audits yet</div>
          <p className="mt-2 text-sm text-[#737373]">Run your first check to populate your audit history.</p>
          <Link to="/check" className="mt-5 inline-flex items-center rounded-xl bg-[#5A0714] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#43050E]">
            Audit a website
          </Link>
        </div>
      ) : (
        <div className="panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="bg-[#F9F9F8] text-left text-xs uppercase tracking-[0.12em] text-[#737373]">
                <tr>
                  <th className="px-5 py-4 font-medium">Website</th>
                  <th className="px-5 py-4 font-medium">Score</th>
                  <th className="px-5 py-4 font-medium">Date</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} className="border-t border-[#E7E5E4] align-middle">
                    <td className="px-5 py-4">
                      <div className="font-medium text-[#171717]">{item.url}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="score-badge">{item.overallScore ?? 0}/100</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#737373]">{formatDate(item.completedAt || item.createdAt)}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`status-pill ${
                          item.status === 'completed'
                            ? 'border-[#DCFCE7] bg-[#F0FDF4] text-[#166534]'
                            : item.status === 'failed'
                              ? 'border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]'
                              : 'border-[#FEF3C7] bg-[#FFFBEB] text-[#92400E]'
                        }`}
                      >
                        {item.status || 'completed'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        <Link to={`/analysis/${item._id}`} className="rounded-lg border border-[#E7E5E4] bg-white px-3 py-2 text-xs font-medium text-[#171717] transition hover:border-[#D5D1CE]">View</Link>
                        <button type="button" onClick={() => recheck(item._id)} className="rounded-lg border border-[#E7E5E4] bg-white px-3 py-2 text-xs font-medium text-[#171717] transition hover:border-[#D5D1CE]">Recheck</button>
                        <button type="button" onClick={() => remove(item._id)} className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs font-medium text-[#B91C1C] transition hover:border-[#FCA5A5]">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
