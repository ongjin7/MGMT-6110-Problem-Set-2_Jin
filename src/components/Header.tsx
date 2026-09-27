import React from 'react';
import { motion } from 'motion/react';
import { Logo } from './Logo';
import { AppScreen, SystemHealth } from '../types';
import { Navigation, CloudSun, Users, Activity, ShieldCheck, Building2 } from 'lucide-react';

interface HeaderProps {
  currentScreen: AppScreen;
  onScreenChange: (screen: AppScreen) => void;
  systemHealth: SystemHealth | null;
  onOpenHealth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onScreenChange,
  systemHealth,
  onOpenHealth,
}) => {
  const isHealthy = systemHealth?.status === 'ok';

  return (
    <>
      <header
        id="ola-main-header"
        className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5">
          <div className="flex items-center justify-between gap-3">
            {/* Logo & Subtitle */}
            <Logo
              size="md"
              showBadge={false}
              subtitle="Your condo companion for transport, weather and activities, resident discussions, and local home-bakery listings."
            />

            {/* Right side controls: Resident JO Avatar + Health */}
            <div className="flex items-center gap-2.5">
              {/* Mobile Resident badge */}
              <div
                id="header-resident-badge-mobile"
                className="relative group flex md:hidden items-center justify-center"
                title="Jack Ong"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-800 to-teal-700 text-white font-semibold text-[10px] tracking-tight flex items-center justify-center shadow-xs ring-2 ring-white border border-teal-500/30 cursor-default select-none transition-transform duration-150 group-hover:scale-105">
                  JO
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                <div className="pointer-events-none absolute right-0 top-full mt-1.5 px-2.5 py-1 rounded-lg bg-slate-900/95 text-white text-[11px] font-medium whitespace-nowrap shadow-md opacity-0 translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150 z-50 flex items-center gap-1">
                  <span>Jack Ong</span>
                  <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                </div>
              </div>

              {/* Mobile Health pill */}
              <button
                type="button"
                onClick={onOpenHealth}
                id="header-health-btn-mobile"
                className="flex md:hidden items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
                title="View Upstream Integrations Status"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isHealthy ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                  }`}
                />
                <span className="text-[11px] text-slate-600 font-mono">
                  {isHealthy ? 'API Live' : 'API Check'}
                </span>
              </button>

              {/* Desktop Resident Profile Indicator */}
              <div
                id="header-resident-badge-desktop"
                className="relative group hidden md:flex items-center justify-center"
                title="Jack Ong"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-800 to-teal-700 text-white font-semibold text-[11px] tracking-tight flex items-center justify-center shadow-xs ring-2 ring-slate-100 border border-teal-500/30 cursor-default select-none transition-transform duration-150 group-hover:scale-105">
                  JO
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                <div className="pointer-events-none absolute right-0 top-full mt-1.5 px-2.5 py-1 rounded-lg bg-slate-900/95 text-white text-xs font-medium whitespace-nowrap shadow-md opacity-0 translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150 z-50 flex items-center gap-1.5">
                  <span>Jack Ong</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                </div>
              </div>

              {/* Desktop Upstream Health Button */}
              <button
                type="button"
                onClick={onOpenHealth}
                id="header-health-btn-desktop"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
                title="Integration Status & Upstream Health"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isHealthy ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                <span className="text-xs text-slate-700 font-medium">Health</span>
                <Activity className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Integrated OLA Buddy Overview & Screen Filter Box */}
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 pt-5 sm:pt-6">
        <div
          id="origin-ola-card"
          className="rounded-2xl bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white shadow-md border border-teal-700/60 overflow-hidden"
        >
          {/* Overview Content */}
          <div className="p-4 sm:p-5 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <Building2 className="w-5 h-5 text-amber-300" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                OLA Executive Condominium
              </h2>
              <p className="text-xs text-teal-200/80 mt-0.5">
                70 Anchorvale Crescent • Sengkang, Singapore <span className="font-mono text-teal-300 font-semibold">(S544651)</span>
              </p>
            </div>
          </div>

          {/* Integrated Screen Navigation Filter */}
          <div className="px-3 sm:px-5 pb-3.5 pt-3 bg-slate-950/35 border-t border-teal-700/50">
            <nav
              id="ola-screen-tabs"
              className="relative grid grid-cols-3 p-1 bg-slate-900/65 rounded-xl border border-teal-700/40 shadow-inner gap-1"
              aria-label="Screen Navigation"
            >
              {/* Screen 1: Directions Tab */}
              <button
                type="button"
                id="tab-directions"
                onClick={() => onScreenChange('directions')}
                className={`relative flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-200 cursor-pointer select-none z-10 ${
                  currentScreen === 'directions'
                    ? 'text-slate-900 font-bold'
                    : 'text-teal-100/80 hover:text-white'
                }`}
              >
                {currentScreen === 'directions' && (
                  <motion.div
                    layoutId="activeFilterTab"
                    className="absolute inset-0 bg-white rounded-lg shadow-xs -z-10"
                    transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }}
                  />
                )}
                <div
                  className={`p-1 rounded-md transition-colors ${
                    currentScreen === 'directions'
                      ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-600/20'
                      : 'text-teal-300/80'
                  }`}
                >
                  <Navigation className="w-4 h-4" />
                </div>
                <span className="tracking-tight whitespace-nowrap hidden sm:inline">Directions From OLA</span>
                <span className="tracking-tight whitespace-nowrap sm:hidden">Directions</span>
              </button>

              {/* Screen 2: Weather & Things To Do Tab */}
              <button
                type="button"
                id="tab-weather"
                onClick={() => onScreenChange('weather')}
                className={`relative flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-200 cursor-pointer select-none z-10 ${
                  currentScreen === 'weather'
                    ? 'text-slate-900 font-bold'
                    : 'text-teal-100/80 hover:text-white'
                }`}
              >
                {currentScreen === 'weather' && (
                  <motion.div
                    layoutId="activeFilterTab"
                    className="absolute inset-0 bg-white rounded-lg shadow-xs -z-10"
                    transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }}
                  />
                )}
                <div
                  className={`p-1 rounded-md transition-colors ${
                    currentScreen === 'weather'
                      ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-500/20'
                      : 'text-amber-300/80'
                  }`}
                >
                  <CloudSun className="w-4 h-4" />
                </div>
                <span className="tracking-tight whitespace-nowrap hidden sm:inline">Weather & Activities</span>
                <span className="tracking-tight whitespace-nowrap sm:hidden">Weather</span>
              </button>

              {/* Screen 3: OLA Hub Tab */}
              <button
                type="button"
                id="tab-hub"
                onClick={() => onScreenChange('hub')}
                className={`relative flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-200 cursor-pointer select-none z-10 ${
                  currentScreen === 'hub'
                    ? 'text-slate-900 font-bold'
                    : 'text-teal-100/80 hover:text-white'
                }`}
              >
                {currentScreen === 'hub' && (
                  <motion.div
                    layoutId="activeFilterTab"
                    className="absolute inset-0 bg-white rounded-lg shadow-xs -z-10"
                    transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }}
                  />
                )}
                <div
                  className={`p-1 rounded-md transition-colors ${
                    currentScreen === 'hub'
                      ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20'
                      : 'text-emerald-300/80'
                  }`}
                >
                  <Users className="w-4 h-4" />
                </div>
                <span className="tracking-tight whitespace-nowrap">OLA Hub</span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
};

