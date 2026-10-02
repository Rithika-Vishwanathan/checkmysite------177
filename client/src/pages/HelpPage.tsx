import { useNavigate } from 'react-router-dom';

export default function HelpPage() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-layout">
      <section className="panel list-panel">
        <div className="panel-header">
          <h2>Help & Support</h2>
          <button type="button" className="link-button" onClick={() => navigate('/dashboard')}>Back to home</button>
        </div>

        <div className="report-stack">
          <div className="report-row">
            <div className="report-title">Need help with an audit?</div>
            <div className="report-meta">Support</div>
            <div className="mini-score">?</div>
          </div>
          <div className="report-row">
            <div className="report-title">Use the AI Consultant</div>
            <div className="report-meta">Smart guidance</div>
            <div className="mini-score">AI</div>
          </div>
        </div>
      </section>
    </div>
  );
}
