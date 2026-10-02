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
    <div className="dashboard-layout">
      <section className="panel list-panel">
        <div className="panel-header">
          <h2>Saved</h2>
          <button type="button" className="link-button" onClick={() => navigate('/check')}>Run new audit</button>
        </div>

        {saved.length ? (
          <div className="recent-list">
            {saved.map((item) => (
              <button type="button" key={item._id} className="recent-item" onClick={() => navigate(`/reports/${item._id}`)}>
                <div className="item-badge">Saved</div>
                <div className="item-copy">
                  <strong>{item.reportData?.domain || 'Saved report'}</strong>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="item-score">{Math.round(Number(item.reportData?.overallScore || 0))}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-state">No saved analyses yet</div>
        )}
      </section>
    </div>
  );
}
