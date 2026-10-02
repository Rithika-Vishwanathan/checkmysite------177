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
    <div className="dashboard-layout">
      <section className="panel list-panel">
        <div className="panel-header">
          <h2>Compare</h2>
          <button type="button" className="link-button" onClick={() => navigate('/check')}>Analyze another site</button>
        </div>

        {items.length >= 2 ? (
          <div className="report-stack">
            {items.slice(0, 2).map((item) => (
              <button type="button" key={item._id} className="report-row" onClick={() => navigate(`/analysis/${item._id}`)}>
                <div className="report-title">{item.url}</div>
                <div className="report-meta">{new Date(item.completedAt || item.createdAt).toLocaleDateString()}</div>
                <div className="mini-score">{Math.round(Number(item.overallScore || 0))}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-state">Run at least two analyses to compare them</div>
        )}
      </section>
    </div>
  );
}
