import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showBadge?: boolean;
  variant?: 'light' | 'dark';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showBadge = false,
  variant = 'light',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const subTextSizes = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs',
  };

  const isDark = variant === 'dark' || className.includes('text-white');

  return (
    <div id="ola-buddy-brand-logo" className={`flex items-center gap-3 select-none ${className}`}>
      {/* Curated Vector Emblem */}
      <div
        id="ola-logo-emblem"
        className={`relative ${iconSizes[size]} rounded-2xl bg-gradient-to-br from-amber-500 via-rose-500 to-teal-700 p-0.5 shadow-md flex items-center justify-center shrink-0`}
      >
        <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center overflow-hidden p-1 relative">
          {/* Decorative geometric arcs inspired by OLA EC Spanish architecture & Anchorvale river waves */}
          <svg viewBox="0 0 40 40" fill="none" className="w-full h-full text-white">
            <defs>
              <linearGradient id="olaSunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="60%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#0D9488" />
              </linearGradient>
              <linearGradient id="olaWaveGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0EA5E9" />
                <stop offset="100%" stopColor="#2DD4BF" />
              </linearGradient>
            </defs>

            {/* Radiant Sun Rising */}
            <circle cx="20" cy="15" r="7" fill="url(#olaSunGrad)" />

            {/* Sweeping Architectural Arches / Wave Crests */}
            <path
              d="M6 31 C 12 21, 28 21, 34 31"
              stroke="#FBBF24"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M9 35 C 15 27, 25 27, 31 35"
              stroke="url(#olaWaveGrad)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />

            {/* Compass / Location Star */}
            <circle cx="20" cy="9" r="1.5" fill="#FFFFFF" />
          </svg>
        </div>
      </div>

      {/* Brand Typographic Identity */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            id="ola-brand-title"
            className={`font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'} ${textSizes[size]} leading-none`}
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            OLA <span className={`${isDark ? 'text-teal-400' : 'text-teal-700'} font-extrabold tracking-wide`}>BUDDY</span>
          </span>
        </div>

        {showBadge && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              id="ola-postal-badge"
              className={`font-semibold tracking-wider uppercase text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/70 ${subTextSizes[size]}`}
            >
              Anchorvale • S544651
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
