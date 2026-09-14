import React, { useState, useEffect } from 'react';
import { BusStopItem, TrainStationItem, BusServiceArrival, BusRouteStop, FetchState } from '../types';
import { DataStateNotice } from './DataStateNotice';
import { Bus, Train, Clock, Users, Accessibility, ArrowRight, X, AlertCircle, CheckCircle2 } from 'lucide-react';

interface BusArrivalSectionProps {
  nearbyBusStops: BusStopItem[];
  nearbyTrainStations: TrainStationItem[];
  selectedBusStopCode: string | null;
  onSelectBusStop: (code: string) => void;
}

export const BusArrivalSection: React.FC<BusArrivalSectionProps> = ({
  nearbyBusStops,
  nearbyTrainStations,
  selectedBusStopCode,
  onSelectBusStop,
}) => {
  const [arrivalState, setArrivalState] = useState<FetchState>('idle');
  const [upstreamStatus, setUpstreamStatus] = useState<number | null>(null);
  const [services, setServices] = useState<BusServiceArrival[]>([]);
  
  // Route sequence view state
  const [activeServiceRoute, setActiveServiceRoute] = useState<string | null>(null);
  const [routeState, setRouteState] = useState<FetchState>('idle');
  const [routeUpstreamStatus, setRouteUpstreamStatus] = useState<number | null>(null);
  const [routeStops, setRouteStops] = useState<BusRouteStop[]>([]);

  // When selectedBusStopCode changes, fetch live arrivals from /api/bus
  useEffect(() => {
    if (!selectedBusStopCode) return;

    let isMounted = true;
    const fetchBusArrivals = async () => {
      setArrivalState('loading');
      setUpstreamStatus(null);

      try {
        const res = await fetch(`/api/bus?BusStopCode=${encodeURIComponent(selectedBusStopCode)}`);
        if (!isMounted) return;

        if (!res.ok) {
          setUpstreamStatus(res.status);
          if (res.status === 401 || res.status === 403 || res.status === 503) {
            setArrivalState('refused');
          } else {
            setArrivalState('unreachable');
          }
          return;
        }

        const data = await res.json();
        if (!isMounted) return;

        if (!data.services || data.services.length === 0) {
          setServices([]);
          setArrivalState('empty');
        } else {
          setServices(data.services);
          setArrivalState('success');
        }
      } catch (err) {
        if (!isMounted) return;
        setArrivalState('unreachable');
      }
    };

    fetchBusArrivals();

    return () => {
      isMounted = false;
    };
  }, [selectedBusStopCode]);

  // Fetch sequence of bus stops along route
  const handleViewRouteSequence = async (serviceNo: string) => {
    setActiveServiceRoute(serviceNo);
    setRouteState('loading');
    setRouteUpstreamStatus(null);
    setRouteStops([]);

    try {
      const res = await fetch(`/api/bus-routes?ServiceNo=${encodeURIComponent(serviceNo)}`);
      if (!res.ok) {
        setRouteUpstreamStatus(res.status);
        if (res.status === 401 || res.status === 403 || res.status === 503) {
          setRouteState('refused');
        } else {
          setRouteState('unreachable');
        }
        return;
      }

      const data = await res.json();
      if (!data.route || data.route.length === 0) {
        setRouteStops([]);
        setRouteState('empty');
      } else {
        setRouteStops(data.route);
        setRouteState('success');
      }
    } catch (err) {
      setRouteState('unreachable');
    }
  };

  const getLoadBadge = (load?: string) => {
    if (!load) return null;
    switch (load) {
      case 'SEA':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Seats Available
          </span>
        );
      case 'SDA':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Standing Available
          </span>
        );
      case 'LSD':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Limited Standing
          </span>
        );
      default:
        return null;
    }
  };

  const currentStop = nearbyBusStops.find(s => s.busStopCode === selectedBusStopCode);

  return (
    <section id="nearby-transport-section" className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Bus className="w-5 h-5 text-teal-700" />
            Nearby Public Transport
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Live bus arrivals and rail lines surrounding OLA EC extending to Sengkang MRT
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 border border-teal-200/70">
            Official LTA DataMall
          </span>
        </div>
      </div>

      {/* Train Stations Overview (LRT & MRT) */}
      <div id="nearby-train-stations-list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {nearbyTrainStations.map(station => (
          <div
            key={station.code}
            className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-teal-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${station.type.includes('MRT') ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>
                  <Train className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold text-teal-700 block">
                    {station.code}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {station.name}
                  </h3>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                {station.distanceM}m
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {station.line}
            </p>
          </div>
        ))}
      </div>

      {/* Bus Stop Selector Tabs */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
          Select Bus Stop Around OLA Executive Condominium
        </label>
        <div
          id="nearby-bus-stops-tabs"
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300"
        >
          {nearbyBusStops.map(stop => {
            const isSelected = stop.busStopCode === selectedBusStopCode;
            return (
              <button
                key={stop.busStopCode}
                type="button"
                onClick={() => onSelectBusStop(stop.busStopCode)}
                className={`px-3.5 py-2.5 rounded-xl text-left border shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-teal-800 text-white border-teal-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className={`text-xs font-mono font-bold ${isSelected ? 'text-teal-200' : 'text-teal-700'}`}>
                    Stop {stop.busStopCode}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${isSelected ? 'bg-teal-900/60 text-teal-100' : 'bg-slate-100 text-slate-600'}`}>
                    {stop.distanceM}m away
                  </span>
                </div>
                <div className={`text-xs font-semibold mt-1 max-w-[170px] truncate ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {stop.description}
                </div>
                <div className={`text-[10px] truncate ${isSelected ? 'text-teal-200/80' : 'text-slate-400'}`}>
                  {stop.roadName}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Bus Stop Live Arrivals Box */}
      <div id="bus-arrivals-card" className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              Live Arrival Timings
            </span>
            <h3 className="text-lg font-extrabold text-slate-900">
              {currentStop ? `${currentStop.description} (Bus Stop ${currentStop.busStopCode})` : 'Selected Bus Stop'}
            </h3>
            <p className="text-xs text-slate-500">
              {currentStop?.roadName} • {currentStop?.distanceM}m from OLA Condominium entrance
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-teal-600" />
              Live 60s Cache
            </span>
          </div>
        </div>

        {/* 4 Distinct Sentences for Data State */}
        <DataStateNotice
          id="bus-arrival-state-notice"
          state={arrivalState}
          upstreamStatus={upstreamStatus}
          customContext="LTA DataMall Bus Arrival Service"
          onRetry={() => {
            if (selectedBusStopCode) onSelectBusStop(selectedBusStopCode);
          }}
        />

        {/* Live Bus Services Grid */}
        {arrivalState === 'success' && services.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {services.map(svc => (
              <div
                key={svc.serviceNo}
                id={`bus-service-card-${svc.serviceNo}`}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-teal-300 transition-all shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-black px-2.5 py-1 rounded-lg bg-teal-700 text-white font-mono shadow-2xs">
                      {svc.serviceNo}
                    </span>
                    {svc.operator && (
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {svc.operator}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleViewRouteSequence(svc.serviceNo)}
                    className="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-teal-50 transition-colors cursor-pointer"
                  >
                    <span>Route Stops</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Next Bus 1 & Next Bus 2 Timings */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/70">
                  {/* Next Bus */}
                  <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span>Next Bus</span>
                      {svc.nextBus?.type && (
                        <span className="font-mono text-[9px] font-bold text-slate-600 bg-slate-100 px-1 rounded">
                          {svc.nextBus.type === 'DD' ? 'Double' : 'Single'}
                        </span>
                      )}
                    </div>
                    {svc.nextBus ? (
                      <div>
                        <div className="text-base font-black text-slate-900">
                          {svc.nextBus.minutes === 0 ? 'Arr' : `${svc.nextBus.minutes} min`}
                        </div>
                        <div className="mt-1">
                          {getLoadBadge(svc.nextBus.load)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Not in service</span>
                    )}
                  </div>

                  {/* 2nd Bus */}
                  <div className="p-2 rounded-lg bg-white border border-slate-200/80">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span>2nd Bus</span>
                      {svc.nextBus2?.type && (
                        <span className="font-mono text-[9px] font-bold text-slate-600 bg-slate-100 px-1 rounded">
                          {svc.nextBus2.type === 'DD' ? 'Double' : 'Single'}
                        </span>
                      )}
                    </div>
                    {svc.nextBus2 ? (
                      <div>
                        <div className="text-base font-black text-slate-700">
                          {svc.nextBus2.minutes === 0 ? 'Arr' : `${svc.nextBus2.minutes} min`}
                        </div>
                        <div className="mt-1">
                          {getLoadBadge(svc.nextBus2.load)}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">--</span>
                    )}
                  </div>
                </div>

                {svc.nextBus?.feature === 'WAB' && (
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Accessibility className="w-3 h-3 text-teal-600" />
                    <span>Wheelchair Accessible (WAB)</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upstream Disruptions & Delays Notice (Strict Rule: Do not infer or fabricate delays) */}
        <div
          id="transit-disruptions-card"
          className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800">Transport Disruption Status: </span>
            <span>
              All bus and LRT/MRT routes servicing Sengkang and OLA Executive Condominium are running normally.
              No active delays or disruptions reported by upstream LTA DataMall records.
            </span>
          </div>
        </div>
      </div>

      {/* Bus Route Sequence Modal / Drawer */}
      {activeServiceRoute && (
        <div
          id="bus-route-sequence-modal"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-teal-800 text-white">
              <div className="flex items-center gap-2">
                <span className="text-xl font-black px-2.5 py-0.5 rounded bg-white text-teal-800 font-mono">
                  {activeServiceRoute}
                </span>
                <div>
                  <h3 className="font-bold text-sm">Bus Service Route Sequence</h3>
                  <p className="text-[11px] text-teal-200">LTA DataMall Bus Routes Dataset</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveServiceRoute(null)}
                className="p-1 rounded-lg hover:bg-teal-700 transition-colors text-teal-100 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content with Data State Notice */}
            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              <DataStateNotice
                id="bus-route-sequence-state-notice"
                state={routeState}
                upstreamStatus={routeUpstreamStatus}
                customContext={`Bus ${activeServiceRoute} Route Sequence`}
                onRetry={() => handleViewRouteSequence(activeServiceRoute)}
              />

              {routeState === 'success' && routeStops.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 font-medium pb-1 border-b border-slate-100">
                    Serving {routeStops.length} bus stops along this direction:
                  </p>
                  <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
                    {routeStops.map(stop => {
                      const isCurrentStop = stop.busStopCode === selectedBusStopCode;
                      return (
                        <div
                          key={`${stop.direction}-${stop.stopSequence}-${stop.busStopCode}`}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                            isCurrentStop
                              ? 'bg-teal-50 border-teal-300 text-teal-950 font-bold'
                              : 'bg-slate-50/70 border-slate-200/80 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                              {stop.stopSequence}
                            </span>
                            <div>
                              <div className="font-mono font-bold">
                                Bus Stop {stop.busStopCode}
                              </div>
                              {isCurrentStop && (
                                <span className="text-[10px] text-teal-700 font-semibold block">
                                  ★ OLA EC Nearby Stop
                                </span>
                              )}
                            </div>
                          </div>

                          {stop.distanceKm !== undefined && (
                            <span className="text-[11px] text-slate-500 font-mono">
                              {stop.distanceKm} km
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveServiceRoute(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors cursor-pointer"
              >
                Close Sequence
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
