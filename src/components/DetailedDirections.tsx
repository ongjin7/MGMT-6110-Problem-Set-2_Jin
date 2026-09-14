import React, { useState } from 'react';
import {
  Bus,
  Car,
  Bike,
  Footprints,
  Clock,
  Navigation,
  Sparkles,
  Info,
  CheckCircle2,
  Train,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { LocationItem, TravelMode } from '../types';
import { generateDetailedDirections, ModeDirections, DirectionStep } from '../utils/directionsHelper';

interface DetailedDirectionsProps {
  destination: LocationItem;
  initialMode?: TravelMode;
  onModeChange?: (mode: TravelMode) => void;
}

export const DetailedDirections: React.FC<DetailedDirectionsProps> = ({
  destination,
  initialMode = 'pt',
  onModeChange,
}) => {
  const [activeMode, setActiveMode] = useState<TravelMode>(initialMode);
  const [showAllModes, setShowAllModes] = useState<boolean>(false);

  const directionsMap = generateDetailedDirections(destination);
  const currentDirection: ModeDirections = directionsMap[activeMode];

  const handleSelectMode = (mode: TravelMode) => {
    setActiveMode(mode);
    if (onModeChange) onModeChange(mode);
  };

  const getStepIcon = (iconType?: string) => {
    switch (iconType) {
      case 'lrt':
      case 'mrt':
        return <Train className="w-4 h-4 text-emerald-600" />;
      case 'bus':
        return <Bus className="w-4 h-4 text-sky-600" />;
      case 'car':
        return <Car className="w-4 h-4 text-blue-600" />;
      case 'bike':
        return <Bike className="w-4 h-4 text-teal-600" />;
      case 'walk':
        return <Footprints className="w-4 h-4 text-amber-600" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-teal-700" />;
    }
  };

  return (
    <div id="detailed-directions-container" className="space-y-5">
      {/* 4-Mode Overview Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {(['pt', 'drive', 'cycle', 'walk'] as TravelMode[]).map((mode) => {
          const info = directionsMap[mode];
          const isSelected = activeMode === mode;
          const icons = {
            pt: <Bus className="w-4 h-4" />,
            drive: <Car className="w-4 h-4" />,
            cycle: <Bike className="w-4 h-4" />,
            walk: <Footprints className="w-4 h-4" />,
          };

          return (
            <button
              key={mode}
              type="button"
              id={`mode-tab-${mode}`}
              onClick={() => handleSelectMode(mode)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-teal-900 text-white border-teal-700 shadow-md ring-2 ring-teal-500/50'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-2xs hover:border-teal-300'
              }`}
            >
              <div className="flex items-center justify-between gap-1 w-full">
                <span className="flex items-center gap-1.5 text-xs font-bold">
                  <span className={isSelected ? 'text-amber-400' : 'text-teal-700'}>
                    {icons[mode]}
                  </span>
                  <span className="truncate">{info.modeLabel}</span>
                </span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                )}
              </div>

              <div className="mt-2 flex items-baseline justify-between gap-2">
                <span
                  className={`text-lg font-black tracking-tight ${
                    isSelected ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {info.timeMins} <span className="text-xs font-normal">mins</span>
                </span>
                <span
                  className={`text-[11px] font-mono ${
                    isSelected ? 'text-teal-200' : 'text-slate-500'
                  }`}
                >
                  {info.distanceKm} km
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Mode Header & Key Highlights */}
      <div
        id="active-mode-header-card"
        className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white border border-teal-800/40 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-teal-800/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                Directions from OLA (S544651)
              </span>
              <span className="text-xs text-teal-300 font-semibold">
                via {currentDirection.modeLabel}
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white mt-1">
              {currentDirection.summary}
            </h4>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-2xl font-black text-amber-400 flex items-center justify-end gap-1">
                <Clock className="w-5 h-5" />
                <span>{currentDirection.timeMins} min</span>
              </div>
              <span className="text-[11px] text-teal-200">
                {currentDirection.distanceKm} km distance
              </span>
            </div>
          </div>
        </div>

        {/* Highlights Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-3">
          {currentDirection.highlights.map((h, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-900/60 border border-teal-700/50 text-[11px] font-medium text-teal-200"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              {h}
            </span>
          ))}

          {currentDirection.fareOrCost && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300 ml-auto">
              <Info className="w-3 h-3 text-slate-400" />
              {currentDirection.fareOrCost}
            </span>
          )}
        </div>
      </div>

      {/* Step-by-Step Directions Card */}
      <div
        id="step-by-step-directions"
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-teal-700" />
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Step-by-Step Directions
            </h4>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {currentDirection.steps.length} Steps
          </span>
        </div>

        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {currentDirection.steps.map((step) => (
            <div
              key={step.stepNumber}
              className="relative group"
            >
              {/* Step indicator dot */}
              <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-white border-2 border-teal-600 flex items-center justify-center text-[10px] font-bold text-teal-800 shadow-2xs group-hover:scale-110 transition-transform">
                {step.stepNumber}
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 group-hover:bg-teal-50/40 border border-slate-200/80 group-hover:border-teal-200 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-md bg-white border border-slate-200 shadow-2xs">
                      {getStepIcon(step.iconType)}
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      {step.instruction}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {step.badge && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-100 text-teal-800 border border-teal-200">
                        {step.badge}
                      </span>
                    )}
                    {step.distanceOrTime && (
                      <span className="text-xs font-mono font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {step.distanceOrTime}
                      </span>
                    )}
                  </div>
                </div>

                {step.detail && (
                  <p className="text-xs text-slate-600 pl-7 leading-relaxed">
                    {step.detail}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Resident Pro-Tip Box */}
        <div className="mt-4 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-900 block">
              OLA Resident Tip
            </span>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              {currentDirection.residentTips}
            </p>
          </div>
        </div>
      </div>

      {/* Toggle to expand all 4 transport modes */}
      <div className="pt-1 text-center">
        <button
          type="button"
          onClick={() => setShowAllModes(!showAllModes)}
          className="text-xs font-semibold text-teal-800 hover:text-teal-900 underline underline-offset-4 cursor-pointer inline-flex items-center gap-1.5"
        >
          <span>{showAllModes ? 'Hide all modes comparison' : 'Compare all 4 modes (Public Transport, Car, Bike, Walk)'}</span>
          <ArrowRight className={`w-3.5 h-3.5 transition-transform ${showAllModes ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* All 4 Modes Comparison Panel */}
      {showAllModes && (
        <div
          id="all-modes-comparison-panel"
          className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2"
        >
          {(['pt', 'drive', 'cycle', 'walk'] as TravelMode[]).map((m) => {
            const modeInfo = directionsMap[m];
            const modeIcons = {
              pt: <Bus className="w-4 h-4 text-teal-700" />,
              drive: <Car className="w-4 h-4 text-blue-700" />,
              cycle: <Bike className="w-4 h-4 text-emerald-700" />,
              walk: <Footprints className="w-4 h-4 text-amber-700" />,
            };

            return (
              <div
                key={m}
                className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    {modeIcons[m]}
                    <h5 className="text-sm font-bold text-slate-900">
                      {modeInfo.modeLabel}
                    </h5>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-teal-800">
                      ~{modeInfo.timeMins} min
                    </span>
                    <span className="text-[11px] text-slate-500 ml-1.5 font-mono">
                      ({modeInfo.distanceKm} km)
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 font-medium">
                  {modeInfo.summary}
                </p>

                <ul className="space-y-1.5 text-xs text-slate-600">
                  {modeInfo.steps.slice(0, 3).map((s) => (
                    <li key={s.stepNumber} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {s.stepNumber}
                      </span>
                      <span className="line-clamp-2">{s.instruction}</span>
                    </li>
                  ))}
                  {modeInfo.steps.length > 3 && (
                    <li className="text-[11px] text-slate-400 pl-6">
                      +{modeInfo.steps.length - 3} more steps
                    </li>
                  )}
                </ul>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => handleSelectMode(m)}
                    className="w-full py-1.5 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-teal-50 hover:text-teal-800 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
                  >
                    View Full {modeInfo.modeLabel} Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
