import { useEffect, useState } from 'react';
import api from '../api';
import { auth } from '../firebase';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    api.get('/profile').then((res) => setProfile(res.data.data)).catch(() => setProfile(null));
  }, []);

  const displayName = auth?.currentUser?.displayName || profile?.name || 'User';
  const email = auth?.currentUser?.email || profile?.email || 'No email linked';

  return (
    <div className="space-y-6">
      <div className="panel p-5 sm:p-6">
        <div className="kicker">Account</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#171717]">Profile</h1>
      </div>

      <div className="panel p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5A0714] text-xl font-semibold text-white">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-2xl font-semibold tracking-[-0.04em] text-[#171717]">{displayName}</div>
            <div className="mt-1 text-sm text-[#737373]">{email}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="panel p-4">
          <div className="text-xs uppercase tracking-[0.12em] text-[#737373]">Website</div>
          <div className="mt-3 text-lg font-semibold text-[#171717]">{profile?.website || 'Not set'}</div>
        </div>
        <div className="panel p-4">
          <div className="text-xs uppercase tracking-[0.12em] text-[#737373]">Location</div>
          <div className="mt-3 text-lg font-semibold text-[#171717]">{profile?.location || 'Not set'}</div>
        </div>
        <div className="panel p-4">
          <div className="text-xs uppercase tracking-[0.12em] text-[#737373]">AI preference</div>
          <div className="mt-3 text-lg font-semibold text-[#171717]">{profile?.aiPreference || 'Balanced'}</div>
        </div>
      </div>

      <div className="panel p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-[#171717]">Account information</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="soft-panel p-3">
            <div className="text-xs uppercase tracking-[0.12em] text-[#737373]">Analyses</div>
            <div className="mt-2 text-xl font-semibold text-[#171717]">{profile?.stats?.analyses ?? 0}</div>
          </div>
          <div className="soft-panel p-3">
            <div className="text-xs uppercase tracking-[0.12em] text-[#737373]">Reports</div>
            <div className="mt-2 text-xl font-semibold text-[#171717]">{profile?.stats?.reports ?? 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
