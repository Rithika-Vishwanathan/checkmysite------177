import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const filterOptions = ['All', 'Healthy', 'Needs Attention', 'Never Analyzed'];

function getStatusMeta(score: number, lastAnalyzedAt?: string, status?: string) {
  if (!lastAnalyzedAt || status === 'never_analyzed') {
    return { label: 'Never analyzed', tone: 'bg-white/60 text-[#796B64]', score: 'N/A' };
  }
  if (score >= 80) {
    return { label: 'Healthy', tone: 'bg-emerald-50 text-emerald-700', score: `${score}/100` };
  }
  return { label: 'Needs Attention', tone: 'bg-amber-50 text-amber-700', score: `${score}/100` };
}

function formatWhen(value?: string) {
  if (!value) return 'Not analyzed yet';
  try {
    return new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Not analyzed yet';
  }
}

export default function WebsitesPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ url: '', name: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/websites'), api.get('/analysis')]).then(([websitesRes, analysesRes]) => {
      setItems(websitesRes.data.data || []);
      setAnalyses(analysesRes.data.data || []);
    });
  }, []);

  const filteredItems = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();
    return items.filter((item) => {
      const analysis = analyses.find((entry) => entry.url === item.url || entry.url === item.normalizedUrl || entry.websiteId === item._id);
      const primaryScore = Number(analysis?.overallScore ?? item.latestScore ?? 0);
      const statusMeta = getStatusMeta(primaryScore, item.lastAnalyzedAt || analysis?.completedAt, item.latestStatus);
      const matchesQuery = !lowerQuery || [item.name || item.domain, item.url, item.domain].join(' ').toLowerCase().includes(lowerQuery);
      const matchesFilter =
        filter === 'All' ||
        (filter === 'Healthy' && statusMeta.label === 'Healthy') ||
        (filter === 'Needs Attention' && statusMeta.label === 'Needs Attention') ||
        (filter === 'Never Analyzed' && statusMeta.label === 'Never analyzed');

      return matchesQuery && matchesFilter;
    });
  }, [items, analyses, query, filter]);

  function openAddModal() {
    setEditingWebsite(null);
    setForm({ url: '', name: '' });
    setError('');
    setShowModal(true);
  }

  function openEditModal(item: any) {
    setEditingWebsite(item);
    setForm({ url: item.url, name: item.name || '' });
    setError('');
    setShowModal(true);
  }

  async function submitWebsite(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = { url: form.url, name: form.name };
      const res = editingWebsite
        ? await api.put(`/websites/${editingWebsite._id}`, payload)
        : await api.post('/websites', payload);

      const website = res.data.data;
      setItems((prev) => {
        if (editingWebsite) {
          return prev.map((entry) => (entry._id === website._id ? website : entry));
        }
        return [website, ...prev];
      });
      setShowModal(false);
      setForm({ url: '', name: '' });
      setEditingWebsite(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to save website.');
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteWebsite(id: string) {
    if (!window.confirm('Delete this website from your workspace?')) return;
    await api.delete(`/websites/${id}`);
    setItems((prev) => prev.filter((item) => item._id !== id));
  }

  async function analyzeWebsite(url: string) {
    try {
      const response = await api.post('/analysis/start', { url });
      navigate(`/analysis/${response.data.analysisId}`);
    } catch (err: any) {
      window.alert(err.response?.data?.message || 'Unable to analyze website.');
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#21130D]">Monitored Sites</h1>
          <p className="text-sm text-[#796B64] font-medium mt-0.5">Manage and track website scores</p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="btn-burgundy px-4 py-2 text-xs font-semibold"
        >
          + Add Site
        </button>
      </div>

      <div className="space-y-3">
        <div className="input-pill px-4 py-2.5 bg-white/80">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search websites..."
            className="w-full bg-transparent text-sm font-medium text-[#21130D] placeholder-[#A3948C] outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {filterOptions.map((option) => (
            <button
              type="button"
              key={option}
              onClick={() => setFilter(option)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition flex-shrink-0 ${
                filter === option
                  ? 'bg-[#611722] text-white'
                  : 'bg-white/60 border border-white/80 text-[#796B64] hover:bg-white'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="glass-panel p-8 text-center space-y-3">
          <div className="text-base font-bold text-[#21130D]">No websites found</div>
          <p className="text-xs text-[#796B64]">Add a website to monitor its health metrics continuously.</p>
          <button
            type="button"
            onClick={openAddModal}
            className="btn-burgundy px-5 py-2.5 text-xs font-semibold inline-block"
          >
            + Add Website
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const latestAnalysis = analyses.find((entry) => entry.url === item.url || entry.url === item.normalizedUrl || entry.websiteId === item._id);
            const overallScore = Number(latestAnalysis?.overallScore ?? item.latestScore ?? 0);
            const statusMeta = getStatusMeta(overallScore, item.lastAnalyzedAt || latestAnalysis?.completedAt, item.latestStatus);
            const domainName = item.name || item.domain || 'Website';

            return (
              <div key={item._id} className="glass-panel p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FAF4EE] border border-[#EBE0D6] flex items-center justify-center font-bold text-xs text-[#611722] uppercase">
                      {domainName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#21130D]">{domainName}</h3>
                      <p className="text-xs text-[#796B64] font-medium">{item.url}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${statusMeta.tone}`}>
                    {statusMeta.label}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-white/60 pt-3">
                  <button
                    type="button"
                    onClick={() => analyzeWebsite(item.url)}
                    className="btn-burgundy px-3.5 py-1.5 text-xs font-semibold"
                  >
                    Analyze Now
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="px-3 py-1.5 rounded-xl bg-white/70 border border-white/90 text-xs font-bold text-[#21130D] hover:bg-white"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteWebsite(item._id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 text-xs font-bold hover:bg-rose-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="drawer-backdrop flex items-center justify-center p-4">
          <div className="glass-panel p-6 w-full max-w-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base text-[#21130D]">
                {editingWebsite ? 'Edit Website' : 'Add Website'}
              </h2>
              <button type="button" onClick={() => setShowModal(false)} className="text-sm font-bold text-[#796B64]">✕</button>
            </div>

            <form onSubmit={submitWebsite} className="space-y-3">
              <div className="input-pill px-3 py-2.5 bg-white">
                <input
                  value={form.url}
                  onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
                  placeholder="https://yourwebsite.com"
                  className="w-full bg-transparent text-xs font-medium text-[#21130D] outline-none"
                  required
                />
              </div>

              <div className="input-pill px-3 py-2.5 bg-white">
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Website name (optional)"
                  className="w-full bg-transparent text-xs font-medium text-[#21130D] outline-none"
                />
              </div>

              {error && <div className="text-xs text-rose-600 font-medium">{error}</div>}

              <button type="submit" disabled={submitting} className="btn-burgundy w-full py-3 text-xs font-bold">
                {submitting ? 'Saving...' : editingWebsite ? 'Save Changes' : 'Add Website'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
