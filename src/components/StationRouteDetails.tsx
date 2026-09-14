import React from 'react';
import { StationRouteDetail } from '../data/trainStationRoutes';
import {
  Train,
  Clock,
  ArrowRight,
  ShieldCheck,
  X,
  Footprints,
  Sparkles,
  Navigation,
  Layers,
  MapPin,
} from 'lucide-react';

interface StationRouteDetailsProps {
  stationDetail: StationRouteDetail;
  onClose: () => void;
  isPinned?: boolean;
}

export const StationRouteDetails: React.FC<StationRouteDetailsProps> = ({
  stationDetail,
  onClose,
  isPinned = false,
}) => {
  const isMRT = stationDetail.type.includes('MRT');

  return (
    <div
      id="station-route-details-panel"
      className="p-5 rounded-2xl border border-teal-200/80 bg-linear-to-b from-white via-teal-50/20 to-slate-50/50 shadow-md space-y-5 transition-all duration-300 animate-in fade-in slide-in-from-top-2"
    >
      {/* Top Bar: Station Header & Dismiss */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
              isMRT ? 'bg-purple-700 text-white' : 'bg-teal-700 text-white'
            }`}
          >
            <Train className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-black tracking-wider px-2 py-0.5 rounded-md bg-slate-900 text-amber-300">
                {stationDetail.stationCode}
              </span>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  isMRT
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : 'bg-teal-100 text-teal-800 border border-teal-200'
                }`}
              >
                {stationDetail.type}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {stationDetail.lineName}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
              {stationDetail.stationName}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-50 border border-teal-200/80 text-xs font-semibold text-teal-800">
            <Footprints className="w-3.5 h-3.5 text-teal-600" />
            <span>{stationDetail.distanceFromOla}</span>
            <span className="text-teal-400">•</span>
            <span className="text-slate-600">{stationDetail.walkTimeFromOla}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close route details"
            aria-label="Close route details"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Access from OLA EC Notice */}
      <div className="p-3 rounded-xl bg-teal-900 text-white text-xs flex items-start gap-2.5 shadow-2xs">
        <ShieldCheck className="w-4 h-4 text-teal-300 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-teal-200 mr-1.5">Direct Access from OLA:</span>
          <span className="text-teal-50/90">{stationDetail.accessNotes}</span>
        </div>
      </div>

      {/* Route Stops Sequence Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-teal-700" />
            <span>{stationDetail.loopOrDirection}</span>
          </label>
          <span className="text-[11px] text-slate-400 font-medium">
            Sequential Route Order
          </span>
        </div>

        {/* Scrollable Track */}
        <div className="overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-slate-300">
          <div className="flex items-stretch gap-2 min-w-max">
            {stationDetail.routeStops.map((stop, idx) => {
              const isCurrent = stop.isCurrent;
              return (
                <div key={`${stop.code}-${idx}`} className="flex items-center">
                  <div
                    className={`p-2.5 rounded-xl border flex flex-col justify-between min-w-[130px] max-w-[160px] transition-all ${
                      isCurrent
                        ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/40 shadow-sm'
                        : stop.isInterchange
                        ? 'bg-purple-50/60 border-purple-200 hover:bg-purple-50'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span
                        className={`text-[10px] font-mono font-black px-1.5 py-0.5 rounded ${
                          isCurrent
                            ? 'bg-amber-600 text-white'
                            : stop.isInterchange
                            ? 'bg-purple-700 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {stop.code}
                      </span>

                      {isCurrent ? (
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">
                          Selected
                        </span>
                      ) : stop.isInterchange ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-200 text-purple-900">
                          Transfer
                        </span>
                      ) : null}
                    </div>

                    <div className="font-bold text-xs text-slate-900 leading-tight line-clamp-1">
                      {stop.name}
                    </div>

                    {stop.landmark && (
                      <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                        {stop.landmark}
                      </div>
                    )}

                    {stop.interchangeLines && stop.interchangeLines.length > 0 && (
                      <div className="text-[9px] font-semibold text-purple-700 mt-1 truncate">
                        ⇄ {stop.interchangeLines.join(' • ')}
                      </div>
                    )}
                  </div>

                  {idx < stationDetail.routeStops.length - 1 && (
                    <div className="px-1 text-slate-300">
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Alternate Line Stops (e.g. For Sengkang MRT showing LRT Loops) */}
        {stationDetail.alternateLineStops && (
          <div className="mt-2 pt-2 border-t border-slate-100 space-y-1.5">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
              {stationDetail.alternateLineStops.lineTitle}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {stationDetail.alternateLineStops.stops.map(st => (
                <span
                  key={st.code}
                  className={`text-[11px] px-2 py-0.5 rounded-lg border font-medium ${
                    st.isCurrent
                      ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="font-mono font-bold mr-1 text-teal-700">{st.code}</span>
                  {st.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grid: Key Interchanges, Travel Times & Operating Hours */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
        {/* Key Interchanges */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            Key Line Interchanges
          </span>
          <div className="space-y-1.5">
            {stationDetail.keyInterchanges.map((ic, i) => (
              <div key={i} className="text-xs pb-1 border-b border-slate-200/60 last:border-0">
                <div className="font-bold text-slate-800">{ic.station}</div>
                <div className="text-[11px] text-slate-500">{ic.line}</div>
                <div className="text-[10px] font-semibold text-teal-700">{ic.travelTime}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Travel Times to Common Hubs */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-teal-700" />
            Estimated Journey Times
          </span>
          <div className="space-y-1.5">
            {stationDetail.travelTimes.map((tt, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-0.5">
                <span className="text-slate-700 font-medium truncate mr-2" title={tt.destination}>
                  {tt.destination}
                </span>
                <span className="font-mono font-bold text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                  {tt.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Operating Schedule & Frequency */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Timetable & Frequency
          </span>
          <div className="space-y-1.5 text-xs text-slate-600">
            <div>
              <span className="font-semibold text-slate-700 block text-[11px]">First / Last Train:</span>
              <span className="text-[11px] text-slate-600 leading-tight block">
                {stationDetail.operatingInfo.firstTrain}
              </span>
              <span className="text-[11px] text-slate-500 leading-tight block">
                Last: {stationDetail.operatingInfo.lastTrain}
              </span>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block text-[11px]">Frequency:</span>
              <span className="text-[11px] font-medium text-teal-800">
                {stationDetail.operatingInfo.frequency}
              </span>
            </div>
            <div>
              <span className="font-semibold text-slate-700 block text-[11px]">Platforms:</span>
              <span className="text-[10px] text-slate-500 leading-tight block">
                {stationDetail.operatingInfo.platforms}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Resident Insight Tip */}
      <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold mr-1">Resident Tip:</span>
          <span>{stationDetail.residentTips}</span>
        </div>
      </div>
    </div>
  );
};
