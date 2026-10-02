interface EmblemLogoProps {
  size?: number;
  className?: string;
}

export default function EmblemLogo({ size = 120, className = '' }: EmblemLogoProps) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-[0_12px_24px_rgba(110,65,45,0.22)]" aria-label="CheckMySite Emblem">
        <defs>
          {/* Metallic Bronze & Gold Ribbon Gradient */}
          <linearGradient id="emblemGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2E5" />
            <stop offset="25%" stopColor="#E6B898" />
            <stop offset="55%" stopColor="#C48665" />
            <stop offset="85%" stopColor="#8C4E36" />
            <stop offset="100%" stopColor="#4A2518" />
          </linearGradient>

          <linearGradient id="emblemShine" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3D1D12" />
            <stop offset="35%" stopColor="#9C5D44" />
            <stop offset="70%" stopColor="#F5D8C3" />
            <stop offset="100%" stopColor="#FFF9F5" />
          </linearGradient>

          {/* Lens Radial Gradient */}
          <radialGradient id="emblemLens" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFF8F0" />
            <stop offset="35%" stopColor="#DFC3AB" />
            <stop offset="75%" stopColor="#6E3C2C" />
            <stop offset="100%" stopColor="#1C0E0A" />
          </radialGradient>

          <radialGradient id="pupilGlow" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#45271F" />
            <stop offset="60%" stopColor="#1E0D08" />
            <stop offset="100%" stopColor="#0B0403" />
          </radialGradient>

          <filter id="emblemGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Back Glow */}
        <circle cx="200" cy="200" r="140" fill="url(#emblemShine)" opacity="0.12" filter="url(#emblemGlow)" />

        {/* Outer Infinity Spiral Ribbon Top Arm */}
        <path
          d="M 110,270 C 90,190 145,100 230,105 C 295,108 340,145 345,190 C 350,240 305,275 260,270 C 210,265 175,215 145,170 C 130,148 115,130 90,145 C 65,160 60,195 85,225 Z"
          fill="url(#emblemGold)"
          opacity="0.9"
        />

        {/* Counter Ribbon Bottom Arm */}
        <path
          d="M 290,130 C 310,210 255,300 170,295 C 105,292 60,255 55,210 C 50,160 95,125 140,130 C 190,135 225,185 255,230 C 270,252 285,270 310,255 C 335,240 340,205 315,175 Z"
          fill="url(#emblemShine)"
          opacity="0.85"
        />

        {/* Inner Curved Sweeps */}
        <path
          d="M 100,270 C 110,180 180,110 260,130 C 310,142 335,180 320,230 C 305,270 250,290 190,265"
          fill="none"
          stroke="url(#emblemGold)"
          strokeWidth="14"
          strokeLinecap="round"
        />

        <path
          d="M 300,130 C 290,220 220,290 140,270 C 90,258 65,220 80,170 C 95,130 150,110 210,135"
          fill="none"
          stroke="url(#emblemShine)"
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Outer Ring Bezel */}
        <circle cx="200" cy="200" r="78" fill="none" stroke="url(#emblemGold)" strokeWidth="12" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.25))" />
        <circle cx="200" cy="200" r="72" fill="none" stroke="#FFF2E5" strokeWidth="2" opacity="0.8" />

        {/* Inner Lens Housing */}
        <circle cx="200" cy="200" r="54" fill="url(#pupilGlow)" stroke="url(#emblemShine)" strokeWidth="8" />

        {/* Lens Pupil / Center Eye */}
        <circle cx="200" cy="200" r="28" fill="#120705" stroke="#5E3326" strokeWidth="4" />
        <circle cx="200" cy="200" r="18" fill="url(#emblemLens)" />

        {/* Camera Specular Highlights */}
        <ellipse cx="184" cy="184" rx="10" ry="6" fill="#FFFFFF" opacity="0.85" transform="rotate(-30 184 184)" />
        <circle cx="214" cy="214" r="3" fill="#FFFFFF" opacity="0.5" />
      </svg>
    </div>
  );
}
