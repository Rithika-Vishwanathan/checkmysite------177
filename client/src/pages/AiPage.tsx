import { useEffect, useState } from 'react';
import api from '../api';

export default function AiPage() {
  const [question, setQuestion] = useState('Why is my website score low?');
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
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="panel p-5 sm:p-6">
        <div className="kicker">AI expert</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#171717]">AI Assistant</h1>
        <p className="mt-2 text-sm text-[#737373]">
          Ask about performance, SEO, accessibility, security, or mobile issues using the latest real audit context when available.
        </p>
      </div>

      <div className="panel p-5 sm:p-6">
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#171717]">Audit context</span>
            <select
              value={selectedAnalysisId}
              onChange={(e) => setSelectedAnalysisId(e.target.value)}
              className="w-full rounded-xl border border-[#E7E5E4] bg-white px-3 py-2.5 text-[#171717] outline-none transition focus:border-[#5A0714] focus:ring-2 focus:ring-[#F8E9EC]"
            >
              <option value="">No audit context</option>
              {analyses.map((analysis) => (
                <option key={analysis._id} value={analysis._id}>{analysis.url}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#171717]">Question</span>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[120px] w-full rounded-2xl border border-[#E7E5E4] bg-white px-4 py-3 text-[#171717] outline-none transition focus:border-[#5A0714] focus:ring-2 focus:ring-[#F8E9EC]"
            />
          </label>

          <button type="submit" disabled={loading} className="inline-flex items-center justify-center rounded-xl bg-[#5A0714] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#43050E] disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? 'Thinking...' : 'Ask AI'}
          </button>
        </form>
      </div>

      <div className="panel p-5 sm:p-6">
        <div className="text-xs uppercase tracking-[0.12em] text-[#737373]">Response</div>
        <div className="mt-4 rounded-2xl bg-[#F9F9F8] p-4 text-sm leading-7 text-[#171717]">
          {answer || 'Ask about performance, SEO, accessibility, security, or mobile issues.'}
        </div>
      </div>
    </div>
  );
}
