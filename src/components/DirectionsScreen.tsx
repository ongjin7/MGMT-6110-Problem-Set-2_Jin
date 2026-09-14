import React, { useState, useEffect, useRef } from 'react';
import { LocationItem, TravelMode, RouteResult, BusStopItem, TrainStationItem, FetchState } from '../types';
import { SingaporeMap } from './SingaporeMap';
import { BusArrivalSection } from './BusArrivalSection';
import { DataStateNotice } from './DataStateNotice';
import {
  Search,
  MapPin,
  Navigation,
  Bus,
  Car,
  Footprints,
  Bike,
  Clock,
  Compass,
  ArrowRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface DirectionsScreenProps {
  initialDestination?: LocationItem | null;
}

// Fixed Origin: OLA Executive Condominium (S544651)
const OLA_ORIGIN = {
  name: 'OLA Executive Condominium',
  address: '70 Anchorvale Crescent, Singapore 544651',
  postalCode: '544651',
  latitude: 1.3966,
  longitude: 103.8886,
};

// Common destinations for S544651 residents
const QUICK_DESTINATIONS = [
  { name: 'Compass One & Sengkang MRT', query: 'Compass One' },
  { name: 'Jewel Changi Airport (Direct Bus 110)', query: 'Jewel Changi Airport' },
  { name: 'Sengkang General Hospital', query: 'Sengkang General Hospital' },
  { name: 'Waterway Point Punggol', query: 'Waterway Point' },
  { name: 'Raffles Place (CBD)', query: 'Raffles Place MRT' },
  { name: 'Orchard Road', query: 'ION Orchard' },
];

export const DirectionsScreen: React.FC<DirectionsScreenProps> = ({
  initialDestination = null,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<LocationItem[]>([]);
  const [searchState, setSearchState] = useState<FetchState>('idle');
  const [searchUpstreamStatus, setSearchUpstreamStatus] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [selectedDestination, setSelectedDestination] = useState<LocationItem | null>(initialDestination);
  const [travelMode, setTravelMode] = useState<TravelMode>('pt');

  // Route calculation state
  const [routeState, setRouteState] = useState<FetchState>('idle');
  const [routeUpstreamStatus, setRouteUpstreamStatus] = useState<number | null>(null);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);

  // Nearby transport state (stops around OLA EC extending to Sengkang MRT)
  const [nearbyBusStops, setNearbyBusStops] = useState<BusStopItem[]>([
    {
      busStopCode: '67429',
      roadName: 'Anchorvale St',
      description: 'Cheng Lim Stn Exit B (Outside OLA)',
      latitude: 1.3965,
      longitude: 103.8935,
      distanceM: 140,
      type: 'BUS',
    },
    {
      busStopCode: '67421',
      roadName: 'Anchorvale St',
      description: 'Opp Cheng Lim Stn',
      latitude: 1.3961,
      longitude: 103.8932,
      distanceM: 190,
      type: 'BUS',
    },
    {
      busStopCode: '67609',
      roadName: 'Anchorvale Cres',
      description: 'Blk 286B (Anchorvale Cres)',
      latitude: 1.3972,
      longitude: 103.8868,
      distanceM: 220,
      type: 'BUS',
    },
    {
      busStopCode: '67601',
      roadName: 'Anchorvale Cres',
      description: 'Blk 261C (Anchorvale Cres)',
      latitude: 1.3958,
      longitude: 103.8872,
      distanceM: 240,
      type: 'BUS',
    },
    {
      busStopCode: '67439',
      roadName: 'Compassvale Rd',
      description: 'Sengkang Community Hub',
      latitude: 1.3934,
      longitude: 103.8942,
      distanceM: 520,
      type: 'BUS',
    },
    {
      busStopCode: '67409',
      roadName: 'Compassvale Rd',
      description: 'Sengkang Stn Exit C',
      latitude: 1.3920,
      longitude: 103.8950,
      distanceM: 740,
      type: 'BUS',
    },
    {
      busStopCode: '67009',
      roadName: 'Compassvale Rd',
      description: 'Sengkang Bus Interchange',
      latitude: 1.3912,
      longitude: 103.8955,
      distanceM: 810,
      type: 'BUS',
    },
  ]);

  const [nearbyTrainStations] = useState<TrainStationItem[]>([
    {
      code: 'SW1',
      name: 'Cheng Lim LRT',
      type: 'LRT',
      line: 'Sengkang West LRT Loop',
      latitude: 1.3963,
      longitude: 103.8937,
      distanceM: 180,
      services: ['Sengkang West LRT'],
    },
    {
      code: 'NE16 / STC',
      name: 'Sengkang MRT / LRT & Compass One',
      type: 'MRT/LRT',
      line: 'North East Line & Sengkang LRT',
      latitude: 1.3916,
      longitude: 103.8954,
      distanceM: 780,
      services: ['North East Line', 'East Loop', 'West Loop'],
    },
    {
      code: 'SW2',
      name: 'Farmway LRT',
      type: 'LRT',
      line: 'Sengkang West LRT Loop',
      latitude: 1.3975,
      longitude: 103.8892,
      distanceM: 450,
      services: ['Sengkang West LRT'],
    },
    {
      code: 'SE1',
      name: 'Compassvale LRT',
      type: 'LRT',
      line: 'Sengkang East LRT Loop',
      latitude: 1.3945,
      longitude: 103.9005,
      distanceM: 850,
      services: ['Sengkang East LRT'],
    },
  ]);

  const [selectedBusStopCode, setSelectedBusStopCode] = useState<string>('67429');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // If initialDestination passed, set it
  useEffect(() => {
    if (initialDestination) {
      setSelectedDestination(initialDestination);
      setSearchTerm(initialDestination.name);
    }
  }, [initialDestination]);

  // Execute OneMap Search
  const handleSearch = async (term: string) => {
    if (!term || term.trim() === '') return;

    setSearchState('loading');
    setSearchUpstreamStatus(null);
    setIsDropdownOpen(true);

    try {
      const res = await fetch(`/api/onemap-search?searchVal=${encodeURIComponent(term)}`);
      if (!res.ok) {
        setSearchUpstreamStatus(res.status);
        if (res.status === 401 || res.status === 403 || res.status === 503) {
          setSearchState('refused');
        } else {
          setSearchState('unreachable');
        }
        return;
      }

      const data = await res.json();
      if (!data.results || data.results.length === 0) {
        setSearchResults([]);
        setSearchState('empty');
      } else {
        setSearchResults(data.results);
        setSearchState('success');
      }
    } catch (err) {
      setSearchState('unreachable');
    }
  };

  // Debounced search when user types 3+ chars
  useEffect(() => {
    if (searchTerm.trim().length < 3) {
      setSearchResults([]);
      setSearchState('idle');
      return;
    }

    const timer = setTimeout(() => {
      handleSearch(searchTerm);
    }, 450);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Calculate Route whenever selectedDestination or travelMode changes
  useEffect(() => {
    if (!selectedDestination) return;

    let isMounted = true;
    const calculateRoute = async () => {
      setRouteState('loading');
      setRouteUpstreamStatus(null);

      try {
        const queryParams = new URLSearchParams({
          destLat: selectedDestination.latitude.toString(),
          destLng: selectedDestination.longitude.toString(),
          routeType: travelMode,
        });

        const res = await fetch(`/api/onemap-route?${queryParams.toString()}`);
        if (!isMounted) return;

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
        if (!isMounted) return;

        setRouteResult({
          origin: {
            name: OLA_ORIGIN.name,
            postalCode: OLA_ORIGIN.postalCode,
            coordinates: [OLA_ORIGIN.latitude, OLA_ORIGIN.longitude],
          },
          destination: {
            coordinates: [selectedDestination.latitude, selectedDestination.longitude],
            name: selectedDestination.name,
          },
          routeType: travelMode,
          routeData: data.routeData,
        });
        setRouteState('success');
      } catch (err) {
        if (!isMounted) return;
        setRouteState('unreachable');
      }
    };

    calculateRoute();

    return () => {
      isMounted = false;
    };
  }, [selectedDestination, travelMode]);

  // Select a destination from dropdown
  const handleSelectLocation = (loc: LocationItem) => {
    setSelectedDestination(loc);
    setSearchTerm(loc.name);
    setIsDropdownOpen(false);
  };

  // Estimate distance and travel time based on coordinates if routing upstream is pending credentials
  const getFallbackEstimates = () => {
    if (!selectedDestination) return null;
    const R = 6371;
    const dLat = (selectedDestination.latitude - OLA_ORIGIN.latitude) * Math.PI / 180;
    const dLon = (selectedDestination.longitude - OLA_ORIGIN.longitude) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(OLA_ORIGIN.latitude * Math.PI / 180) * Math.cos(selectedDestination.latitude * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const straightDistKm = R * c;
    const roadDistKm = parseFloat((straightDistKm * 1.35).toFixed(1));

    let timeMins = 0;
    if (travelMode === 'pt') timeMins = Math.round(roadDistKm * 3.2 + 8);
    else if (travelMode === 'drive') timeMins = Math.round(roadDistKm * 1.6 + 4);
    else if (travelMode === 'cycle') timeMins = Math.round(roadDistKm * 4.0);
    else if (travelMode === 'walk') timeMins = Math.round(roadDistKm * 12.5);

    return {
      distanceKm: roadDistKm,
      timeMins: Math.max(3, timeMins),
    };
  };

  const fallback = getFallbackEstimates();

  return (
    <div id="directions-screen-container" className="space-y-8 pb-10">
      {/* Starting Point & Destination Search Section */}
      <section className="space-y-4">
        {/* Origin Card (Starting point is ALWAYS OLA Executive Condominium) */}
        <div
          id="origin-ola-card"
          className="p-4 rounded-2xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-teal-700/50"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <MapPin className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                OLA Executive Condominium
              </h2>
              <p className="text-xs text-teal-200/80 mt-0.5">
                70 Anchorvale Crescent • Sengkang, Singapore <span className="font-mono text-teal-300 font-semibold">(S544651)</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-teal-100/80 bg-teal-950/50 px-3 py-1.5 rounded-xl border border-teal-700/40 shrink-0">
            <Compass className="w-3.5 h-3.5 text-teal-400" />
            <span>Cheng Lim LRT (SW1) • 150m</span>
          </div>
        </div>

        {/* Destination Search Box */}
        <div className="relative" id="destination-search-wrapper">
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3">
            <label
              htmlFor="destination-search-input"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700"
            >
              Where would you like to go from OLA?
            </label>

            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                id="destination-search-input"
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setIsDropdownOpen(true);
                }}
                placeholder="Search any Singapore destination, building, MRT or postal code..."
                className="w-full pl-11 pr-24 py-3 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 outline-hidden text-sm sm:text-base text-slate-900 transition-all placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => handleSearch(searchTerm)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              >
                Search
              </button>
            </div>

            {/* Quick destination tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Popular from OLA:
              </span>
              {QUICK_DESTINATIONS.map(q => (
                <button
                  key={q.name}
                  type="button"
                  onClick={() => {
                    setSearchTerm(q.query);
                    handleSearch(q.query);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 border border-slate-200/70 transition-colors cursor-pointer"
                >
                  {q.name}
                </button>
              ))}
            </div>
          </div>

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && (
            <div
              id="destination-search-dropdown"
              className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white rounded-2xl border border-slate-200 shadow-xl max-h-80 overflow-y-auto p-2 space-y-1"
            >
              {/* Search State Notice for 4 distinct sentences */}
              <DataStateNotice
                id="search-state-notice"
                state={searchState}
                upstreamStatus={searchUpstreamStatus}
                customContext="OneMap Search API"
                onRetry={() => handleSearch(searchTerm)}
                compact
              />

              {searchState === 'success' &&
                searchResults.map((loc, idx) => (
                  <button
                    key={`${loc.name}-${loc.latitude}-${idx}`}
                    type="button"
                    onClick={() => handleSelectLocation(loc)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-teal-50/70 transition-colors flex items-start gap-3 border border-transparent hover:border-teal-200 cursor-pointer"
                  >
                    <div className="p-1.5 rounded-lg bg-teal-100 text-teal-800 shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-900 truncate">
                        {loc.name}
                      </div>
                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        {loc.address}
                      </div>
                      {loc.postalCode && (
                        <span className="inline-block mt-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          Postal {loc.postalCode}
                        </span>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 self-center shrink-0" />
                  </button>
                ))}
            </div>
          )}
        </div>
      </section>

      {/* Selected Destination, Mode Selector & Route Card */}
      {selectedDestination && (
        <section id="selected-route-section" className="space-y-4">
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4">
            {/* Destination Summary & Mode Selection */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                  Target Destination
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  {selectedDestination.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedDestination.address} {selectedDestination.postalCode ? `• S(${selectedDestination.postalCode})` : ''}
                </p>
              </div>

              {/* Travel Mode Pills */}
              <div
                id="travel-mode-selector"
                className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start lg:self-auto"
              >
                <button
                  type="button"
                  onClick={() => setTravelMode('pt')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    travelMode === 'pt'
                      ? 'bg-teal-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Bus className="w-3.5 h-3.5" />
                  <span>Transit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTravelMode('drive')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    travelMode === 'drive'
                      ? 'bg-teal-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Drive</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTravelMode('cycle')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    travelMode === 'cycle'
                      ? 'bg-teal-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span>Cycle</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTravelMode('walk')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    travelMode === 'walk'
                      ? 'bg-teal-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Footprints className="w-3.5 h-3.5" />
                  <span>Walk</span>
                </button>
              </div>
            </div>

            {/* 4 Distinct Sentences for Route State */}
            <DataStateNotice
              id="route-state-notice"
              state={routeState}
              upstreamStatus={routeUpstreamStatus}
              customContext="OneMap Routing API"
              onRetry={() => {
                if (selectedDestination) setSelectedDestination({ ...selectedDestination });
              }}
            />

            {/* Route Stats & Timing Info */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                  Est. Travel Time
                </span>
                <div className="text-xl font-black text-slate-900 mt-1 flex items-baseline gap-1">
                  {routeResult?.routeData?.route_summary?.total_time
                    ? `${Math.round(routeResult.routeData.route_summary.total_time / 60)} min`
                    : fallback
                    ? `~${fallback.timeMins} min`
                    : '--'}
                </div>
                <span className="text-[10px] text-teal-700 font-medium">From OLA EC</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                  Distance
                </span>
                <div className="text-xl font-black text-slate-900 mt-1 flex items-baseline gap-1">
                  {routeResult?.routeData?.route_summary?.total_distance
                    ? `${(routeResult.routeData.route_summary.total_distance / 1000).toFixed(1)} km`
                    : fallback
                    ? `${fallback.distanceKm} km`
                    : '--'}
                </div>
                <span className="text-[10px] text-slate-500 font-medium">Singapore Route</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                  Recommended First Step
                </span>
                <div className="text-xs font-bold text-slate-800 mt-1 line-clamp-2">
                  {travelMode === 'pt'
                    ? 'Cheng Lim LRT or Bus 110/43 outside OLA'
                    : travelMode === 'drive'
                    ? 'Exit to TPE via Anchorvale St'
                    : 'Punggol River Park Connector'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                  Routing Engine
                </span>
                <div className="text-xs font-bold text-teal-800 mt-1">
                  OneMap Routing API
                </div>
                <span className="text-[10px] text-slate-500">Singapore Land Authority</span>
              </div>
            </div>

            {/* Interactive Singapore Route Map */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span className="font-bold flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-teal-700" />
                  Route Geometry & Corridor Overview
                </span>
                <span className="text-slate-400 text-[11px]">
                  Origin [1.3966, 103.8886] → Target
                </span>
              </div>

              <SingaporeMap
                originCoords={[OLA_ORIGIN.latitude, OLA_ORIGIN.longitude]}
                destCoords={[selectedDestination.latitude, selectedDestination.longitude]}
                destName={selectedDestination.name}
                travelMode={travelMode}
                routeData={routeResult?.routeData}
                viewMode="route"
                heightClass="h-[340px] sm:h-[400px]"
              />
            </div>
          </div>
        </section>
      )}

      {/* Nearby Public Transport Section */}
      <section className="space-y-4 pt-2">
        <div className="rounded-2xl bg-white border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                Public Transport Network
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                Neighborhood Transit Map
              </h3>
            </div>
            <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              Radius: ~1.2 km
            </span>
          </div>

          {/* Local Sengkang Detail Map */}
          <SingaporeMap
            originCoords={[OLA_ORIGIN.latitude, OLA_ORIGIN.longitude]}
            nearbyBusStops={nearbyBusStops}
            nearbyTrainStations={nearbyTrainStations}
            selectedBusStopCode={selectedBusStopCode}
            onSelectBusStop={code => setSelectedBusStopCode(code)}
            viewMode="transit"
            heightClass="h-[320px] sm:h-[380px]"
          />
        </div>

        {/* Live Bus Arrival Timings Component */}
        <BusArrivalSection
          nearbyBusStops={nearbyBusStops}
          nearbyTrainStations={nearbyTrainStations}
          selectedBusStopCode={selectedBusStopCode}
          onSelectBusStop={code => setSelectedBusStopCode(code)}
        />
      </section>
    </div>
  );
};
