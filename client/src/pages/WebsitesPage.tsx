import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const filterOptions = ['All', 'Healthy', 'Needs Attention', 'Never Analyzed'];

function getStatusMeta(score: number, lastAnalyzedAt?: string, status?: string) {
  if (!lastAnalyzedAt || status === 'never_analyzed') {
    return { label: 'Never analyzed', tone: 'bg-[#F3F2EF] text-[#737373]', score: 'N/A' };
  }
  if (score >= 80) {
    return { label: 'Healthy', tone: 'bg-[#F0FDF4] text-[#166534]', score: `${score}/100` };
  }
  return { label: 'Needs Attention', tone: 'bg-[#FFFBEB] text-[#92400E]', score: `${score}/100` };
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
    <div className="space-y-6">
      <section className="panel p-5 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="kicker">Workspace</div>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#171717]">CheckMySite</h1>
            <p className="mt-2 text-sm text-[#737373]">Monitor, analyze and improve your websites.</p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center rounded-xl bg-[#5A0714] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#43050E]"
          >
            + Add Website
          </button>
        </div>
      </section>

      <section className="panel p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full max-w-lg">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search websites..."
              className="w-full rounded-xl border border-[#E7E5E4] bg-white px-3 py-2.5 text-sm text-[#171717] outline-none transition focus:border-[#5A0714] focus:ring-2 focus:ring-[#F8E9EC]"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => setFilter(option)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  filter === option ? 'bg-[#F8E9EC] text-[#5A0714]' : 'bg-[#F3F2EF] text-[#737373] hover:bg-[#E7E5E4]'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </section>

      {filteredItems.length === 0 ? (
        <div className="panel p-8 text-center">
          <div className="text-2xl font-semibold text-[#171717]">No websites yet</div>
          <p className="mt-2 text-sm text-[#737373]">Add your first website to start monitoring its health.</p>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-5 inline-flex items-center justify-center rounded-xl bg-[#5A0714] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#43050E]"
          >
            + Add Website
          </button>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredItems.map((item) => {
            const latestAnalysis = analyses.find((entry) => entry.url === item.url || entry.url === item.normalizedUrl || entry.websiteId === item._id);
            const overallScore = Number(latestAnalysis?.overallScore ?? item.latestScore ?? 0);
            const performanceScore = Number(latestAnalysis?.performance?.score ?? 0);
            const seoScore = Number(latestAnalysis?.seo?.score ?? 0);
            const accessibilityScore = Number(latestAnalysis?.accessibility?.score ?? 0);
            const securityScore = Number(latestAnalysis?.security?.score ?? 0);
            const mobileScore = Number(latestAnalysis?.mobile?.score ?? 0);
            const technicalScore = Number(latestAnalysis?.technical?.score ?? 0);
            const statusMeta = getStatusMeta(overallScore, item.lastAnalyzedAt || latestAnalysis?.completedAt, item.latestStatus);

            return (
              <article key={item._id} className="panel overflow-hidden p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_38px_rgba(23,23,23,0.07)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#E7E5E4] bg-[#F9F9F8] text-lg font-semibold text-[#171717]">
                      {item.name?.[0]?.toUpperCase() || item.domain?.[0]?.toUpperCase() || 'W'}
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-[#171717]">{item.name || item.domain}</div>
                      <div className="mt-1 text-sm text-[#737373]">{item.url}</div>
                    </div>
                  </div>

                  <span className={`status-pill ${statusMeta.tone}`}>{statusMeta.label}</span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    { label: 'Performance', value: performanceScore },
                    { label: 'SEO', value: seoScore },
                    { label: 'Accessibility', value: accessibilityScore },
                    { label: 'Security', value: securityScore },
                  ].map((metric) => (
                    <div key={metric.label} className="soft-panel p-3">
                      <div className="text-[10px] uppercase tracking-[0.12em] text-[#737373]">{metric.label}</div>
                      <div className="mt-2 text-xl font-semibold text-[#171717]">{metric.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#E7E5E4] pt-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.12em] text-[#737373]">Last analyzed</div>
                    <div className="mt-1 text-sm text-[#171717]">{formatWhen(item.lastAnalyzedAt || latestAnalysis?.completedAt)}</div>
                  </div>

                  <div className="score-badge">{statusMeta.score}</div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <button type="button" onClick={() => analyzeWebsite(item.url)} className="rounded-lg bg-[#5A0714] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#43050E]">Analyze Again</button>
                  {latestAnalysis ? (
                    <button type="button" onClick={() => navigate(`/analysis/${latestAnalysis._id}`)} className="rounded-lg border border-[#E7E5E4] bg-white px-3 py-2 text-xs font-semibold text-[#171717] transition hover:border-[#D5D1CE]">View Website</button>
                  ) : (
                    <button type="button" className="rounded-lg border border-[#E7E5E4] bg-white px-3 py-2 text-xs font-semibold text-[#171717] transition hover:border-[#D5D1CE] opacity-60">View Website</button>
                  )}
                  <button type="button" onClick={() => openEditModal(item)} className="rounded-lg border border-[#E7E5E4] bg-white px-3 py-2 text-xs font-semibold text-[#171717] transition hover:border-[#D5D1CE]">Edit</button>
                  <button type="button" onClick={() => deleteWebsite(item._id)} className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs font-semibold text-[#B91C1C] transition hover:border-[#FCA5A5]">Delete</button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171717]/40 p-4">
          <div className="w-full max-w-lg rounded-[24px] border border-[#E7E5E4] bg-white p-5 shadow-[0_24px_80px_rgba(23,23,23,0.15)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="kicker">{editingWebsite ? 'Edit website' : 'Add website'}</div>
                <h2 className="mt-2 text-2xl font-semibold text-[#171717]">{editingWebsite ? 'Update website' : 'New website'}</h2>
              </div>
              <button type="button" onClick={() => setShowModal(false)} className="rounded-lg border border-[#E7E5E4] bg-white px-2 py-1 text-sm text-[#171717]">✕</button>
            </div>

            <form onSubmit={submitWebsite} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#171717]">Website URL</label>
                <input
                  value={form.url}
                  onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
                  placeholder="https://yourwebsite.com"
                  className="w-full rounded-xl border border-[#E7E5E4] bg-white px-3 py-2.5 text-[#171717] outline-none transition focus:border-[#5A0714] focus:ring-2 focus:ring-[#F8E9EC]"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#171717]">Website Name (optional)</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Brand or company name"
                  className="w-full rounded-xl border border-[#E7E5E4] bg-white px-3 py-2.5 text-[#171717] outline-none transition focus:border-[#5A0714] focus:ring-2 focus:ring-[#F8E9EC]"
                />
              </div>

              {error && <div className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-3 text-sm text-[#B91C1C]">{error}</div>}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="rounded-xl border border-[#E7E5E4] bg-white px-4 py-2.5 text-sm font-semibold text-[#171717]">Cancel</button>
                <button type="submit" disabled={submitting} className="rounded-xl bg-[#5A0714] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#43050E] disabled:opacity-60">
                  {submitting ? (editingWebsite ? 'Saving...' : 'Adding...') : editingWebsite ? 'Save Changes' : 'Add Website'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
