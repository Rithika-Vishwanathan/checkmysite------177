import { useEffect, useState } from 'react';
import api from '../api';

export default function AiPage() {
  const [question, setQuestion] = useState('Why is my website score low and how can I fix it?');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState('');

  useEffect(() => {
    api.get('/analysis').then((res) => {
      const list = res.data.data || [];
      setAnalyses(list);
      if (list[0]) setSelectedAnalysisId(list[0]._id);
    });
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/ai/chat', { question, analysisId: selectedAnalysisId || '' });
      setAnswer(res.data.data?.answer || 'No answer available.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#21130D]">AI Consultant</h1>
        <p className="text-sm text-[#796B64] font-medium mt-0.5">Instant AI audit recommendations & optimization insights</p>
      </div>

      <div className="glass-panel p-5 space-y-4">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#796B64] uppercase tracking-wider mb-2">
              Select Audit Context
            </label>
            <div className="input-pill px-3 py-2.5 bg-white/80">
              <select
                value={selectedAnalysisId}
                onChange={(e) => setSelectedAnalysisId(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-[#21130D] outline-none"
              >
                <option value="">No audit context</option>
                {analyses.map((analysis) => (
                  <option key={analysis._id} value={analysis._id}>
                    {analysis.url}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#796B64] uppercase tracking-wider mb-2">
              Ask AI Expert
            </label>
            <div className="input-pill p-3.5 bg-white/80">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full h-24 bg-transparent text-sm font-medium text-[#21130D] placeholder-[#A3948C] outline-none resize-none"
                placeholder="Ask anything about performance, SEO, security, or UX..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-burgundy w-full py-3.5 text-sm font-bold"
          >
            {loading ? 'Thinking...' : 'Ask AI Consultant →'}
          </button>
        </form>
      </div>

      {answer && (
        <div className="glass-panel p-5 space-y-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#611722] text-white flex items-center justify-center font-bold text-xs">
              AI
            </div>
            <h3 className="font-bold text-sm text-[#21130D]">Recommendation</h3>
          </div>
          <p className="text-xs text-[#21130D] font-medium leading-relaxed whitespace-pre-line bg-white/60 p-4 rounded-2xl border border-white/80">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}
