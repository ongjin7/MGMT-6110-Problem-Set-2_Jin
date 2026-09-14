import React from 'react';
import { motion } from 'motion/react';
import { Logo } from './Logo';
import { AppScreen, SystemHealth } from '../types';
import { Navigation, CloudSun, Users, Activity, ShieldCheck } from 'lucide-react';

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
    <header
      id="ola-main-header"
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center justify-between w-full md:w-auto">
            <Logo size="md" showBadge={false} />

            {/* Right side controls on mobile */}
            <div className="flex items-center gap-2 md:hidden">
              {/* Resident badge on mobile */}
              <div
                id="header-resident-badge-mobile"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border border-teal-200 bg-teal-50 text-teal-900"
                title="Logged in as Jack Ong"
              >
                <span className="w-5 h-5 rounded-full bg-teal-700 text-white font-black text-[10px] flex items-center justify-center">
                  JO
                </span>
                <span className="text-[11px] font-semibold text-slate-800">Jack Ong</span>
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
              </div>

              {/* Health pill on mobile */}
              <button
                type="button"
                onClick={onOpenHealth}
                id="header-health-btn-mobile"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
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
            </div>
          </div>

          {/* Sophisticated Segmented Screen Filter */}
          <nav
            id="ola-screen-tabs"
            className="relative flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 shadow-inner w-full sm:w-auto justify-center gap-0.5"
            aria-label="Screen Navigation"
          >
            {/* Screen 1: Directions Tab */}
            <button
              type="button"
              id="tab-directions"
              onClick={() => onScreenChange('directions')}
              className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-200 cursor-pointer select-none z-10 ${
                currentScreen === 'directions'
                  ? 'text-slate-900 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {currentScreen === 'directions' && (
                <motion.div
                  layoutId="activeFilterTab"
                  className="absolute inset-0 bg-white rounded-xl shadow-xs border border-slate-200/90 -z-10"
                  transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }}
                />
              )}
              <div
                className={`p-1 rounded-lg transition-colors ${
                  currentScreen === 'directions'
                    ? 'bg-teal-50 text-teal-700 ring-1 ring-teal-600/20'
                    : 'text-slate-400'
                }`}
              >
                <Navigation className="w-4 h-4" />
              </div>
              <span className="tracking-tight whitespace-nowrap">Directions From OLA</span>
            </button>

            {/* Screen 2: Weather & Things To Do Tab */}
            <button
              type="button"
              id="tab-weather"
              onClick={() => onScreenChange('weather')}
              className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-200 cursor-pointer select-none z-10 ${
                currentScreen === 'weather'
                  ? 'text-slate-900 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {currentScreen === 'weather' && (
                <motion.div
                  layoutId="activeFilterTab"
                  className="absolute inset-0 bg-white rounded-xl shadow-xs border border-slate-200/90 -z-10"
                  transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }}
                />
              )}
              <div
                className={`p-1 rounded-lg transition-colors ${
                  currentScreen === 'weather'
                    ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-500/20'
                    : 'text-slate-400'
                }`}
              >
                <CloudSun className="w-4 h-4" />
              </div>
              <span className="tracking-tight whitespace-nowrap">Weather & Activities</span>
            </button>

            {/* Screen 3: OLA Hub Tab */}
            <button
              type="button"
              id="tab-hub"
              onClick={() => onScreenChange('hub')}
              className={`relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-200 cursor-pointer select-none z-10 ${
                currentScreen === 'hub'
                  ? 'text-slate-900 font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {currentScreen === 'hub' && (
                <motion.div
                  layoutId="activeFilterTab"
                  className="absolute inset-0 bg-white rounded-xl shadow-xs border border-slate-200/90 -z-10"
                  transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }}
                />
              )}
              <div
                className={`p-1 rounded-lg transition-colors ${
                  currentScreen === 'hub'
                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500/20'
                    : 'text-slate-400'
                }`}
              >
                <Users className="w-4 h-4" />
              </div>
              <span className="tracking-tight whitespace-nowrap">OLA Hub</span>
            </button>
          </nav>

          {/* Desktop Right Side: Logged-in Resident & Health */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Resident Profile Indicator */}
            <div
              id="header-resident-badge-desktop"
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-teal-200/80 bg-teal-50/70 text-slate-800 shadow-2xs"
              title="Logged in as verified OLA resident Jack Ong"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-teal-600 to-emerald-500 text-white font-black text-[11px] flex items-center justify-center shadow-xs">
                JO
              </div>
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="text-xs font-bold text-slate-900">Jack Ong</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
            </div>

            {/* Upstream Health Button */}
            <button
              type="button"
              onClick={onOpenHealth}
              id="header-health-btn-desktop"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
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
  );
};

