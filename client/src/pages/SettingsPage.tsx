import { useState } from 'react';

export default function SettingsPage() {
  const [preference, setPreference] = useState('Balanced');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [auditNotifications, setAuditNotifications] = useState(true);

  return (
    <div className="space-y-6">
      <div className="panel p-5 sm:p-6">
        <div className="kicker">Workspace</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#171717]">Settings</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="panel p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-[#171717]">AI preferences</h2>
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[#171717]">Response style</span>
              <select
                value={preference}
                onChange={(e) => setPreference(e.target.value)}
                className="w-full rounded-xl border border-[#E7E5E4] bg-white px-3 py-2.5 text-[#171717] outline-none transition focus:border-[#5A0714] focus:ring-2 focus:ring-[#F8E9EC]"
              >
                <option>Beginner Friendly</option>
                <option>Balanced</option>
                <option>Detailed</option>
              </select>
            </label>
          </div>
        </section>

        <section className="panel p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-[#171717]">Notifications</h2>
          <div className="mt-4 space-y-4">
            <div className="metric-row">
              <span className="font-medium text-[#171717]">Email alerts</span>
              <button type="button" onClick={() => setEmailAlerts((value) => !value)} className={`rounded-full px-2 py-1 text-xs font-semibold ${emailAlerts ? 'bg-[#F8E9EC] text-[#5A0714]' : 'bg-[#F3F2EF] text-[#737373]'}`}>
                {emailAlerts ? 'On' : 'Off'}
              </button>
            </div>
            <div className="metric-row">
              <span className="font-medium text-[#171717]">Weekly digest</span>
              <button type="button" onClick={() => setWeeklyDigest((value) => !value)} className={`rounded-full px-2 py-1 text-xs font-semibold ${weeklyDigest ? 'bg-[#F8E9EC] text-[#5A0714]' : 'bg-[#F3F2EF] text-[#737373]'}`}>
                {weeklyDigest ? 'On' : 'Off'}
              </button>
            </div>
            <div className="metric-row">
              <span className="font-medium text-[#171717]">Audit completion alerts</span>
              <button type="button" onClick={() => setAuditNotifications((value) => !value)} className={`rounded-full px-2 py-1 text-xs font-semibold ${auditNotifications ? 'bg-[#F8E9EC] text-[#5A0714]' : 'bg-[#F3F2EF] text-[#737373]'}`}>
                {auditNotifications ? 'On' : 'Off'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
