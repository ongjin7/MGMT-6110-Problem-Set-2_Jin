import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BusStopItem, TrainStationItem, BusServiceArrival, BusRouteStop, FetchState, BusArrivalTiming } from '../types';
import { DataStateNotice } from './DataStateNotice';
import { StationRouteDetails } from './StationRouteDetails';
import { STATION_ROUTE_DETAILS } from '../data/trainStationRoutes';
import { Bus, Train, Clock, Users, Accessibility, ArrowRight, X, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

function formatSgtTimeHhMmSs(date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Singapore',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    const sgt = new Date(date.getTime() + 8 * 3600 * 1000);
    const hh = String(sgt.getUTCHours()).padStart(2, '0');
    const mm = String(sgt.getUTCMinutes()).padStart(2, '0');
    const ss = String(sgt.getUTCSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }
}

function formatArrivalClockTime(isoString?: string): string | null {
  if (!isoString) return null;
  const parsed = new Date(isoString);
  if (isNaN(parsed.getTime())) return null;
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Singapore',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(parsed);
  } catch {
    const sgt = new Date(parsed.getTime() + 8 * 3600 * 1000);
    const hh = String(sgt.getUTCHours()).padStart(2, '0');
    const mm = String(sgt.getUTCMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }
}

function refreshTimingCountdown(timing: BusArrivalTiming | null): BusArrivalTiming | null {
  if (!timing) return null;
  if (!timing.estimatedArrival) return timing;
  const arrivalMs = new Date(timing.estimatedArrival).getTime();
  if (isNaN(arrivalMs)) return timing;
  const diffMins = Math.floor((arrivalMs - Date.now()) / 60000);
  return {
    ...timing,
    minutes: diffMins <= 0 ? 0 : diffMins,
  };
}

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
  const [servicesEnded, setServicesEnded] = useState<boolean>(false);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const isMountedRef = useRef<boolean>(true);
  const activeStopCodeRef = useRef<string | null>(selectedBusStopCode);
  const inFlightStopRef = useRef<string | null>(null);
  const autoRefreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Route sequence view state
  const [activeServiceRoute, setActiveServiceRoute] = useState<string | null>(null);
  const [routeState, setRouteState] = useState<FetchState>('idle');
  const [routeUpstreamStatus, setRouteUpstreamStatus] = useState<number | null>(null);
  const [routeStops, setRouteStops] = useState<BusRouteStop[]>([]);

  // Train station route details view state (hover or click)
  const [selectedStationCode, setSelectedStationCode] = useState<string | null>(null);
  const [hoveredStationCode, setHoveredStationCode] = useState<string | null>(null);

  const activeStationCode = hoveredStationCode || selectedStationCode;
  const activeStationDetail = activeStationCode ? STATION_ROUTE_DETAILS[activeStationCode] : null;

  const fetchBusArrivals = useCallback(
    async (stopCode: string, isBackgroundOrManual: boolean = false) => {
      if (!stopCode) return;
      // Avoid overlapping duplicate requests for the same bus stop
      if (inFlightStopRef.current === stopCode) return;

      inFlightStopRef.current = stopCode;
      if (isBackgroundOrManual) {
        setIsRefreshing(true);
      } else {
        setArrivalState('loading');
      }
      setUpstreamStatus(null);

      try {
        const res = await fetch(
          `/api/bus?BusStopCode=${encodeURIComponent(stopCode)}`,
          { cache: 'no-store' }
        );
        if (!isMountedRef.current || activeStopCodeRef.current !== stopCode) return;

        if (!res.ok) {
          setServicesEnded(false);
          setUpstreamStatus(res.status);
          if (res.status === 401 || res.status === 403 || res.status === 503) {
            setArrivalState('refused');
          } else {
            setArrivalState('unreachable');
          }
          return;
        }

        const data = await res.json();
        if (!isMountedRef.current || activeStopCodeRef.current !== stopCode) return;

        // Validate that response is a well-formed bus-stop arrival payload
        const isValidStopPayload =
          Boolean(data) &&
          typeof data === 'object' &&
          typeof data.busStopCode === 'string' &&
          data.busStopCode.trim() === stopCode.trim() &&
          Array.isArray(data.services) &&
          data.services.every(
            (svc: unknown) =>
              Boolean(svc) &&
              typeof svc === 'object' &&
              typeof (svc as BusServiceArrival).serviceNo === 'string'
          );

        if (!isValidStopPayload) {
          setServices([]);
          setServicesEnded(false);
          setArrivalState('empty');
          return;
        }

        const fetchedAt = formatSgtTimeHhMmSs(new Date());
        setLastUpdatedTime(fetchedAt);

        const updatedServices: BusServiceArrival[] = data.services.map(
          (svc: BusServiceArrival) => ({
            ...svc,
            nextBus: refreshTimingCountdown(svc.nextBus),
            nextBus2: refreshTimingCountdown(svc.nextBus2),
            nextBus3: refreshTimingCountdown(svc.nextBus3),
          })
        );

        const hasUpcomingArrivals = updatedServices.some(
          svc => Boolean(svc.nextBus || svc.nextBus2 || svc.nextBus3)
        );

        if (!hasUpcomingArrivals) {
          setServices([]);
          setServicesEnded(true);
          setArrivalState('empty');
        } else {
          setServices(updatedServices);
          setServicesEnded(false);
          setArrivalState('success');
        }
      } catch (err) {
        if (!isMountedRef.current || activeStopCodeRef.current !== stopCode) return;
        setServicesEnded(false);
        setArrivalState('unreachable');
      } finally {
        if (inFlightStopRef.current === stopCode) {
          inFlightStopRef.current = null;
        }
        if (isMountedRef.current && activeStopCodeRef.current === stopCode) {
          setIsRefreshing(false);
        }
      }
    },
    []
  );

  const resetAutoRefreshInterval = useCallback(
    (stopCode: string) => {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
      }
      autoRefreshTimerRef.current = setInterval(() => {
        fetchBusArrivals(stopCode, true);
      }, 60000);
    },
    [fetchBusArrivals]
  );

  // When selectedBusStopCode changes, fetch arrivals and manage 60s auto-refresh interval
  useEffect(() => {
    isMountedRef.current = true;
    activeStopCodeRef.current = selectedBusStopCode;
    inFlightStopRef.current = null;
    setIsRefreshing(false);

    if (!selectedBusStopCode) {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
        autoRefreshTimerRef.current = null;
      }
      return;
    }

    fetchBusArrivals(selectedBusStopCode, false);
    resetAutoRefreshInterval(selectedBusStopCode);

    return () => {
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
        autoRefreshTimerRef.current = null;
      }
    };
  }, [selectedBusStopCode, fetchBusArrivals, resetAutoRefreshInterval]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (autoRefreshTimerRef.current) {
        clearInterval(autoRefreshTimerRef.current);
        autoRefreshTimerRef.current = null;
      }
    };
  }, []);

  const handleManualRefresh = () => {
    if (!selectedBusStopCode) return;
    resetAutoRefreshInterval(selectedBusStopCode);
    fetchBusArrivals(selectedBusStopCode, true);
  };

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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            4 Nearest LRT & MRT Stations to OLA EC
          </label>
          <span className="text-[11px] text-teal-700 font-semibold hidden sm:inline">
            Hover or click station for route details
          </span>
        </div>

        <div id="nearby-train-stations-list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {nearbyTrainStations.map(station => {
            const isMRT = station.type.includes('MRT');
            const isActive = activeStationCode === station.code;
            const isPinned = selectedStationCode === station.code;

            return (
              <button
                key={station.code}
                type="button"
                onClick={() =>
                  setSelectedStationCode(prev => (prev === station.code ? null : station.code))
                }
                onMouseEnter={() => setHoveredStationCode(station.code)}
                onMouseLeave={() => setHoveredStationCode(null)}
                className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer relative group ${
                  isActive
                    ? isMRT
                      ? 'border-purple-500 bg-purple-50/40 ring-2 ring-purple-400/40 shadow-sm'
                      : 'border-teal-500 bg-teal-50/40 ring-2 ring-teal-400/40 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-teal-300 hover:bg-slate-50/70 shadow-2xs'
                }`}
                aria-label={`View route details for ${station.name}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isMRT ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
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
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 shrink-0">
                    {station.distanceM}m
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 line-clamp-1">
                  {station.line}
                </p>

                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span
                    className={`font-semibold transition-colors ${
                      isActive
                        ? isMRT
                          ? 'text-purple-700'
                          : 'text-teal-700'
                        : 'text-slate-400 group-hover:text-teal-700'
                    }`}
                  >
                    {isActive
                      ? isPinned
                        ? 'Route Details (Pinned)'
                        : 'Viewing Route Details'
                      : 'Click to pin Route Details'}
                  </span>
                  <ArrowRight
                    className={`w-3.5 h-3.5 transition-transform ${
                      isActive
                        ? 'translate-x-0.5 text-teal-600'
                        : 'text-slate-300 group-hover:text-teal-600 group-hover:translate-x-0.5'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Display LRT & MRT Route Details on hover or click */}
        {activeStationDetail && (
          <StationRouteDetails
            stationDetail={activeStationDetail}
            isPinned={selectedStationCode === activeStationDetail.stationCode}
            onClose={() => {
              setSelectedStationCode(null);
              setHoveredStationCode(null);
            }}
          />
        )}
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
              {arrivalState === 'success' || arrivalState === 'loading' || isRefreshing
                ? 'Live Arrival Timings'
                : 'Bus Arrival Timings'}
            </span>
            <h3 className="text-lg font-extrabold text-slate-900">
              {currentStop ? `${currentStop.description} (Bus Stop ${currentStop.busStopCode})` : 'Selected Bus Stop'}
            </h3>
            <p className="text-xs text-slate-500">
              {currentStop?.roadName} • {currentStop?.distanceM}m from OLA Condominium entrance
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {arrivalState === 'loading' || isRefreshing ? (
              <span className="text-xs text-teal-700 font-medium flex items-center gap-1.5 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                <RefreshCw className="w-3.5 h-3.5 text-teal-600 animate-spin" />
                Refreshing...
              </span>
            ) : arrivalState === 'success' ? (
              <span className="text-xs text-emerald-800 font-medium flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live • 60s Auto-Refresh
              </span>
            ) : (
              <span className="text-xs text-slate-500 flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {arrivalState === 'empty' ? 'No Active Services' : 'Status Offline'}
              </span>
            )}

            {lastUpdatedTime && (
              <span
                id="bus-arrivals-last-updated"
                className="text-xs text-slate-500 font-mono bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200"
              >
                Last updated at {lastUpdatedTime}
              </span>
            )}

            <button
              id="refresh-bus-arrivals-btn"
              type="button"
              onClick={handleManualRefresh}
              disabled={arrivalState === 'loading' || isRefreshing || !selectedBusStopCode}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-teal-800 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 shadow-2xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh bus arrival timings"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-teal-700 ${
                  arrivalState === 'loading' || isRefreshing ? 'animate-spin' : ''
                }`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* 4 Distinct Sentences for Data State */}
        <DataStateNotice
          id="bus-arrival-state-notice"
          state={arrivalState}
          upstreamStatus={upstreamStatus}
          customContext="LTA DataMall Bus Arrival Service"
          emptyMessage={
            servicesEnded
              ? 'Bus services have ended for the day. Please check again in the morning when services resume.'
              : undefined
          }
          onRetry={handleManualRefresh}
        />

        {/* Live Bus Services Grid */}
        {arrivalState === 'success' && services.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {services.map(svc => {
              const nextBusClock = formatArrivalClockTime(svc.nextBus?.estimatedArrival);
              const nextBus2Clock = formatArrivalClockTime(svc.nextBus2?.estimatedArrival);

              return (
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
                          <div className="flex items-baseline justify-between gap-1">
                            <span className="text-base font-black text-slate-900">
                              {svc.nextBus.minutes === 0 ? 'Arr' : `${svc.nextBus.minutes} min`}
                            </span>
                            {nextBusClock && (
                              <span className="text-[11px] font-mono font-semibold text-teal-700">
                                {nextBusClock}
                              </span>
                            )}
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
                          <div className="flex items-baseline justify-between gap-1">
                            <span className="text-base font-black text-slate-700">
                              {svc.nextBus2.minutes === 0 ? 'Arr' : `${svc.nextBus2.minutes} min`}
                            </span>
                            {nextBus2Clock && (
                              <span className="text-[11px] font-mono font-semibold text-slate-500">
                                {nextBus2Clock}
                              </span>
                            )}
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
              );
            })}
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
