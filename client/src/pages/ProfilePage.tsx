import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    api.get('/profile').then((res) => setProfile(res.data.data)).catch(() => setProfile(null));
  }, []);

  const displayName = user?.displayName || user?.name || profile?.name || 'Rithika';
  const email = user?.email || profile?.email || 'rithika@example.com';

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#21130D]">Profile</h1>
        <p className="text-sm text-[#796B64] font-medium mt-0.5">Manage your workspace account</p>
      </div>

      <div className="glass-panel p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#611722] text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-[#611722]/20 flex-shrink-0">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#21130D]">{displayName}</h2>
          <p className="text-xs text-[#796B64] font-medium mt-0.5">{email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass-panel p-4 text-center">
          <span className="text-[10px] font-bold text-[#796B64] uppercase tracking-wider block">Total Audits</span>
          <span className="text-2xl font-extrabold text-[#21130D] mt-1 block">{profile?.stats?.analyses ?? 12}</span>
        </div>
        <div className="glass-panel p-4 text-center">
          <span className="text-[10px] font-bold text-[#796B64] uppercase tracking-wider block">Saved Reports</span>
          <span className="text-2xl font-extrabold text-[#21130D] mt-1 block">{profile?.stats?.reports ?? 4}</span>
        </div>
      </div>
    </div>
  );
}
