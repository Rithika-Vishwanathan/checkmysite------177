import { useState } from 'react';

export default function SettingsPage() {
  const [preference, setPreference] = useState('Balanced');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [auditNotifications, setAuditNotifications] = useState(true);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#21130D]">Settings</h1>
        <p className="text-sm text-[#796B64] font-medium mt-0.5">Customize your audit preferences</p>
      </div>

      <div className="glass-panel p-5 space-y-4">
        <h2 className="font-bold text-base text-[#21130D]">AI Response Style</h2>
        <div className="input-pill px-3 py-2.5 bg-white/80">
          <select
            value={preference}
            onChange={(e) => setPreference(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-[#21130D] outline-none"
          >
            <option>Beginner Friendly</option>
            <option>Balanced</option>
            <option>Detailed</option>
          </select>
        </div>
      </div>

      <div className="glass-panel p-5 space-y-4">
        <h2 className="font-bold text-base text-[#21130D]">Notification Toggles</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/60 border border-white/80">
            <span className="text-xs font-semibold text-[#21130D]">Email alerts</span>
            <button
              type="button"
              onClick={() => setEmailAlerts((v) => !v)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                emailAlerts ? 'bg-[#611722] text-white' : 'bg-[#EBE0D6] text-[#796B64]'
              }`}
            >
              {emailAlerts ? 'On' : 'Off'}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/60 border border-white/80">
            <span className="text-xs font-semibold text-[#21130D]">Weekly digest</span>
            <button
              type="button"
              onClick={() => setWeeklyDigest((v) => !v)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                weeklyDigest ? 'bg-[#611722] text-white' : 'bg-[#EBE0D6] text-[#796B64]'
              }`}
            >
              {weeklyDigest ? 'On' : 'Off'}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/60 border border-white/80">
            <span className="text-xs font-semibold text-[#21130D]">Audit completion alerts</span>
            <button
              type="button"
              onClick={() => setAuditNotifications((v) => !v)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                auditNotifications ? 'bg-[#611722] text-white' : 'bg-[#EBE0D6] text-[#796B64]'
              }`}
            >
              {auditNotifications ? 'On' : 'Off'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
