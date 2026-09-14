import React, { useState, useEffect, useRef } from 'react';
import { LocationItem, TravelMode, RouteResult, BusStopItem, TrainStationItem, FetchState } from '../types';
import { SingaporeMap } from './SingaporeMap';
import { BusArrivalSection } from './BusArrivalSection';
import { DataStateNotice } from './DataStateNotice';
import { DetailedDirections } from './DetailedDirections';
import {
  Search,
  MapPin,
  Navigation,
  ArrowRight,
  Sparkles,
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

// Standardised single locations that work with OneMap without brackets after name
const QUICK_DESTINATIONS = [
  {
    name: 'Sengkang MRT',
    query: 'Sengkang MRT',
    location: {
      name: 'Sengkang MRT',
      address: '5 Sengkang Square, Singapore 545062',
      postalCode: '545062',
      latitude: 1.39169,
      longitude: 103.89548,
    },
  },
  {
    name: 'Jewel Changi Airport',
    query: 'Jewel Changi Airport',
    location: {
      name: 'Jewel Changi Airport',
      address: '78 Airport Boulevard, Singapore 819666',
      postalCode: '819666',
      latitude: 1.36034,
      longitude: 103.98907,
    },
  },
  {
    name: 'Compass One',
    query: 'Compass One',
    location: {
      name: 'Compass One',
      address: '1 Sengkang Square, Singapore 545078',
      postalCode: '545078',
      latitude: 1.3924,
      longitude: 103.8946,
    },
  },
  {
    name: 'Sengkang General Hospital',
    query: 'Sengkang General Hospital',
    location: {
      name: 'Sengkang General Hospital',
      address: '110 Sengkang East Way, Singapore 544886',
      postalCode: '544886',
      latitude: 1.3942,
      longitude: 103.8931,
    },
  },
  {
    name: 'Waterway Point',
    query: 'Waterway Point',
    location: {
      name: 'Waterway Point',
      address: '83 Punggol Central, Singapore 828761',
      postalCode: '828761',
      latitude: 1.4068,
      longitude: 103.9018,
    },
  },
  {
    name: 'ION Orchard',
    query: 'ION Orchard',
    location: {
      name: 'ION Orchard',
      address: '2 Orchard Turn, Singapore 238801',
      postalCode: '238801',
      latitude: 1.304,
      longitude: 103.8318,
    },
  },
  {
    name: 'Raffles Place MRT',
    query: 'Raffles Place MRT',
    location: {
      name: 'Raffles Place MRT',
      address: '5 Raffles Place, Singapore 048618',
      postalCode: '048618',
      latitude: 1.283,
      longitude: 103.8519,
    },
  },
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
  const searchWrapperRef = useRef<HTMLDivElement>(null);
  const isSelectingRef = useRef<boolean>(false);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // If initialDestination passed, set it
  useEffect(() => {
    if (initialDestination) {
      isSelectingRef.current = true;
      setSelectedDestination(initialDestination);
      setSearchTerm(initialDestination.name);
      setIsDropdownOpen(false);
    }
  }, [initialDestination]);

  // Execute OneMap Search
  const handleSearch = async (term: string, autoSelectFirst: boolean = false) => {
    if (!term || term.trim() === '') return;

    if (autoSelectFirst) {
      setIsDropdownOpen(false);
    } else {
      setIsDropdownOpen(true);
    }
    setSearchState('loading');
    setSearchUpstreamStatus(null);

    try {
      const res = await fetch(`/api/onemap-search?searchVal=${encodeURIComponent(term)}`);
      if (!res.ok) {
        setSearchUpstreamStatus(res.status);
        if (res.status === 401 || res.status === 403 || res.status === 503) {
          setSearchState('refused');
        } else {
          setSearchState('unreachable');
        }
        if (!autoSelectFirst) setIsDropdownOpen(true);
        return;
      }

      const data = await res.json();
      if (!data.results || data.results.length === 0) {
        setSearchResults([]);
        setSearchState('empty');
        if (!autoSelectFirst) setIsDropdownOpen(true);
      } else {
        setSearchResults(data.results);
        setSearchState('success');
        if (autoSelectFirst && data.results.length > 0) {
          handleSelectLocation(data.results[0]);
        } else if (!autoSelectFirst) {
          setIsDropdownOpen(true);
        }
      }
    } catch (err) {
      setSearchState('unreachable');
      if (!autoSelectFirst) setIsDropdownOpen(true);
    }
  };

  // Debounced search when user types 3+ chars
  useEffect(() => {
    if (isSelectingRef.current) {
      isSelectingRef.current = false;
      return;
    }

    if (selectedDestination && searchTerm.trim().toLowerCase() === selectedDestination.name.trim().toLowerCase()) {
      setIsDropdownOpen(false);
      return;
    }

    if (searchTerm.trim().length < 3) {
      setSearchResults([]);
      setSearchState('idle');
      setIsDropdownOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      handleSearch(searchTerm, false);
    }, 450);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedDestination]);

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
    isSelectingRef.current = true;
    setSelectedDestination(loc);
    setSearchTerm(loc.name);
    setIsDropdownOpen(false);
    setSearchResults([]);
    setSearchState('idle');
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
          className="p-4 rounded-2xl bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white shadow-md flex items-center gap-3 border border-teal-700/50"
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
        </div>

        {/* Destination Search Box */}
        <div className="relative" id="destination-search-wrapper" ref={searchWrapperRef}>
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
                name="ola_destination_query_search"
                type="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                data-lpignore="true"
                data-form-type="other"
                value={searchTerm}
                onChange={e => {
                  isSelectingRef.current = false;
                  const val = e.target.value;
                  if (
                    val.toLowerCase().includes('singapore management university') &&
                    !searchTerm
                  ) {
                    return;
                  }
                  setSearchTerm(val);
                }}
                onClick={e => {
                  const target = e.target as HTMLInputElement;
                  if (target.value.toLowerCase().includes('singapore management university')) {
                    target.value = '';
                    setSearchTerm('');
                  }
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch(searchTerm, true);
                  }
                }}
                onFocus={e => {
                  if (e.target.value.toLowerCase().includes('singapore management university')) {
                    e.target.value = '';
                    setSearchTerm('');
                  }
                  if (
                    searchResults.length > 0 &&
                    (!selectedDestination ||
                      searchTerm.trim().toLowerCase() !==
                        selectedDestination.name.trim().toLowerCase())
                  ) {
                    setIsDropdownOpen(true);
                  }
                }}
                placeholder="Search any Singapore destination, building, MRT or postal code..."
                className="w-full pl-11 pr-24 py-3 rounded-xl border border-slate-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 outline-hidden text-sm sm:text-base text-slate-900 transition-all placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => handleSearch(searchTerm, true)}
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
                    isSelectingRef.current = true;
                    setSearchTerm(q.name);
                    setSelectedDestination(q.location);
                    setIsDropdownOpen(false);
                    setSearchResults([]);
                    setSearchState('idle');
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

      {/* Selected Destination, Mode Selector & Detailed Directions */}
      {selectedDestination && (
        <section id="selected-route-section" className="space-y-4">
          <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-5">
            {/* Destination Summary */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
                  Target Destination
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  {selectedDestination.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedDestination.address} {selectedDestination.postalCode ? `• S(${selectedDestination.postalCode})` : ''}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedDestination(null);
                  setSearchTerm('');
                }}
                className="self-start sm:self-auto text-xs text-slate-500 hover:text-slate-800 underline underline-offset-2 cursor-pointer"
              >
                Clear Destination
              </button>
            </div>

            {/* Detailed Directions for Public Transport, Car, Bike, and Walking */}
            <DetailedDirections
              destination={selectedDestination}
              initialMode={travelMode}
              onModeChange={(mode) => setTravelMode(mode)}
            />
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
