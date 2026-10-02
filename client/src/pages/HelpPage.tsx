import { useNavigate } from 'react';

export default function HelpPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#21130D]">Help & Support</h1>
        <p className="text-sm text-[#796B64] font-medium mt-0.5">Assistance and troubleshooting guides</p>
      </div>

      <div className="glass-panel p-5 space-y-3">
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/60 border border-white/80 cursor-pointer hover:bg-white" onClick={() => navigate('/ai')}>
          <div className="w-10 h-10 rounded-2xl bg-[#611722]/10 text-[#611722] font-bold text-sm flex items-center justify-center flex-shrink-0">
            AI
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#21130D]">AI Consultant</h3>
            <p className="text-xs text-[#796B64]">Get instant guidance on audit score improvements</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/60 border border-white/80 cursor-pointer hover:bg-white" onClick={() => navigate('/check')}>
          <div className="w-10 h-10 rounded-2xl bg-[#611722]/10 text-[#611722] font-bold text-sm flex items-center justify-center flex-shrink-0">
            ?
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#21130D]">Troubleshooting Audits</h3>
            <p className="text-xs text-[#796B64]">Learn how website scores are calculated</p>
          </div>
        </div>
      </div>
    </div>
  );
}
