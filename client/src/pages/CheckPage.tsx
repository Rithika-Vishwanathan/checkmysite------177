import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const analysisOptions = [
  {
    label: 'Full Analysis',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    activeClass: 'bg-[#611722]/10 border-[#611722] text-[#611722]',
  },
  {
    label: 'SEO Focus',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    ),
    activeClass: 'bg-[#2563EB]/10 border-[#2563EB] text-[#2563EB]',
  },
  {
    label: 'Security Check',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    activeClass: 'bg-[#0284C7]/10 border-[#0284C7] text-[#0284C7]',
  },
  {
    label: 'Performance',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    activeClass: 'bg-[#D97706]/10 border-[#D97706] text-[#D97706]',
  },
];

export default function CheckPage() {
  const [url, setUrl] = useState('');
  const [analysisType, setAnalysisType] = useState('Full Analysis');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const normalizedUrl = useMemo(() => {
    const value = url.trim();
    if (!value) return '';
    return /^https?:\/\//i.test(value) ? value : `https://${value}`;
  }, [url]);

  async function onSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setError('');
    if (!normalizedUrl) {
      setError('Please enter a valid website URL.');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/analysis/start', { url: normalizedUrl, analysisType });
      navigate(`/analysis/${response.data.analysisId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to analyze that website.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header Actions */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-2xl bg-white/60 border border-white/80 shadow-sm flex items-center justify-center text-[#21130D] hover:bg-white transition"
          aria-label="Back"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
        </button>

        <button
          type="button"
          className="w-10 h-10 rounded-2xl bg-white/60 border border-white/80 shadow-sm flex items-center justify-center text-[#21130D] hover:bg-white transition"
          aria-label="Share"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" /></svg>
        </button>
      </div>

      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#21130D]">
          Analyze Website
        </h1>
        <p className="text-sm text-[#796B64] mt-0.5 font-medium">
          Get detailed insights about any website
        </p>
      </div>

      {/* URL Entry Form Pill */}
      <form onSubmit={onSubmit} className="input-pill flex items-center p-2 pl-4 gap-2.5 bg-white/80 border border-white/90 shadow-sm backdrop-blur-xl rounded-full">
        <svg className="w-5 h-5 text-[#9C8B82] flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <span className="text-sm font-semibold text-[#796B64]">https://</span>
        <input
          value={url.replace(/^https?:\/\//i, '')}
          onChange={(e) => setUrl(e.target.value)}
          type="text"
          placeholder=""
          className="w-full bg-transparent text-[#21130D] placeholder-[#A3948C] outline-none text-sm font-medium"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-10 h-10 rounded-full bg-[#611722] text-white flex items-center justify-center font-bold text-lg hover:bg-[#490F18] transition shadow-md shadow-[#611722]/20 flex-shrink-0"
        >
          {loading ? '…' : '→'}
        </button>
      </form>

      {/* Analysis Type Options */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold text-[#796B64] uppercase tracking-wider block">
          Analysis Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {analysisOptions.map((option) => {
            const isSelected = analysisType === option.label;
            return (
              <button
                type="button"
                key={option.label}
                onClick={() => setAnalysisType(option.label)}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition cursor-pointer ${
                  isSelected
                    ? option.activeClass + ' border-2 shadow-sm'
                    : 'bg-white/60 border-white/80 text-[#21130D] hover:bg-white/90'
                }`}
              >
                <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/60' : 'bg-[#FAF4EE] text-[#611722]'}`}>
                  {option.icon}
                </div>
                <span className="text-xs font-bold leading-tight text-left">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        type="button"
        disabled={loading}
        onClick={() => onSubmit()}
        className="btn-burgundy w-full py-4 text-base tracking-wide"
      >
        {loading ? 'Starting...' : 'Start Analysis →'}
      </button>

      {error && (
        <div className="p-3.5 rounded-2xl bg-[#611722]/10 border border-[#611722]/20 text-[#611722] text-xs font-medium">
          {error}
        </div>
      )}

      {/* "What we analyze?" Checklist Section */}
      <div className="glass-panel p-5 space-y-3.5">
        <h3 className="font-bold text-sm text-[#21130D]">What we analyze?</h3>
        <div className="space-y-3">
          {[
            'Design & User Experience',
            'SEO & Performance',
            'Security & Best Practices',
            'Competitor Insights',
          ].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-[#611722]/10 text-[#611722] font-bold text-xs flex items-center justify-center flex-shrink-0">
                ✓
              </div>
              <span className="text-xs font-semibold text-[#21130D]">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
