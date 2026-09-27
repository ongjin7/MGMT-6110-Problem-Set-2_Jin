import React, { useState, useEffect } from 'react';
import { WeatherData, TemperatureData, PsiData, ActivityRecommendation, OperatingHoursSpec, FetchState, LocationItem } from '../types';
import { DataStateNotice } from './DataStateNotice';
import {
  CloudSun,
  Thermometer,
  CloudRain,
  Sun,
  Compass,
  ArrowRight,
  ShieldCheck,
  Building2,
  TreePine,
  Dumbbell,
  Coffee,
  Sparkles,
  MapPin,
  Clock,
  Wind,
  Activity,
  HeartPulse,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface WeatherScreenProps {
  onSelectPlaceForDirections: (place: LocationItem) => void;
}

// Curated verified places around OLA Executive Condominium (S544651) with fun visuals
const ALL_NEARBY_PLACES: ActivityRecommendation[] = [
  // Indoor
  {
    id: 'compass-one',
    name: 'Compass One & Sengkang Central',
    category: 'Indoor Shopping & Dining',
    type: 'indoor',
    weatherFit: 'all',
    description: 'Premier air-conditioned mall with 180+ retail shops, Cold Storage supermarket, food court, and Sengkang Public Library.',
    distanceKm: 0.8,
    travelTimeMins: 4,
    suggestedTransit: '1 stop on LRT from Cheng Lim (SW1) to Sengkang, or sheltered 9-min walk',
    destinationCoords: { latitude: 1.3916, longitude: 103.8954 },
    highlight: 'Air-conditioned dining, shopping & public library',
    imageUrl: 'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=700&auto=format&fit=crop&q=80',
    emoji: '🛍️',
    cuteTag: 'Mall & Cafes',
    themeColor: 'from-purple-500 to-indigo-600',
    operatingHours: {
      openTime: '10:00',
      closeTime: '22:00',
      label: '10:00 AM – 10:00 PM SGT',
    },
  },
  {
    id: 'sengkang-sports-indoor',
    name: 'Sengkang Sports Centre (Indoor Complex)',
    category: 'Indoor Recreation & Fitness',
    type: 'indoor',
    weatherFit: 'rain',
    description: 'Multi-storey community sports hub offering an ActiveSG gym, 12 indoor badminton courts, and dance studios.',
    distanceKm: 0.5,
    travelTimeMins: 5,
    suggestedTransit: 'Short 5-min walk across Anchorvale Street',
    destinationCoords: { latitude: 1.3968, longitude: 103.8860 },
    highlight: 'Indoor ActiveSG Gym & Badminton Hall',
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=700&auto=format&fit=crop&q=80',
    emoji: '🏸',
    cuteTag: 'Smash & Gym',
    themeColor: 'from-amber-500 to-orange-600',
    operatingHours: {
      openTime: '07:00',
      closeTime: '22:00',
      label: '7:00 AM – 10:00 PM SGT',
    },
  },
  {
    id: 'sengkang-grand-mall',
    name: 'Sengkang Grand Mall',
    category: 'Indoor Shopping & Dining',
    type: 'indoor',
    weatherFit: 'all',
    description: 'Modern integrated hub featuring FairPrice Finest, hawker centre, child enrichment, and cafes right at Buangkok MRT.',
    distanceKm: 2.1,
    travelTimeMins: 10,
    suggestedTransit: 'Take North East Line 1 stop from Sengkang to Buangkok MRT',
    destinationCoords: { latitude: 1.3827, longitude: 103.8930 },
    highlight: 'Modern air-conditioned hawker centre & specialty shops',
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=700&auto=format&fit=crop&q=80',
    emoji: '🍜',
    cuteTag: 'Food & Chill',
    themeColor: 'from-rose-500 to-pink-600',
    operatingHours: {
      openTime: '10:00',
      closeTime: '22:00',
      label: '10:00 AM – 10:00 PM SGT',
    },
  },
  {
    id: 'jewel-changi',
    name: 'Jewel Changi Airport (Direct Bus 110)',
    category: 'Indoor Shopping & Dining',
    type: 'indoor',
    weatherFit: 'rain',
    description: 'World-famous indoor destination featuring the Rain Vortex, Canopy Park, and 280+ dining & lifestyle boutiques.',
    distanceKm: 14.5,
    travelTimeMins: 28,
    suggestedTransit: 'Direct express Bus 110 from Cheng Lim Stn Exit B (right outside OLA EC!)',
    destinationCoords: { latitude: 1.3602, longitude: 103.9897 },
    highlight: 'Direct express bus connection right at OLA doorstep',
    imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=700&auto=format&fit=crop&q=80',
    emoji: '✨',
    cuteTag: 'Rain Vortex Icon',
    themeColor: 'from-teal-500 to-emerald-600',
    operatingHours: {
      openTime: '10:00',
      closeTime: '22:00',
      label: '10:00 AM – 10:00 PM SGT',
    },
  },

  // Outdoor
  {
    id: 'sengkang-riverside-park',
    name: 'Sengkang Riverside Park & Floating Wetland',
    category: 'Nature & Parks',
    type: 'outdoor',
    weatherFit: 'sun',
    description: '21-hectare tranquil park along Sungei Punggol featuring Singapore’s largest man-made wetland, fruit tree trail, and cycling paths.',
    distanceKm: 0.4,
    travelTimeMins: 5,
    suggestedTransit: 'Walk 4 mins west across Anchorvale Street to park entrance',
    destinationCoords: { latitude: 1.3995, longitude: 103.8850 },
    highlight: 'Man-made wetlands, biodiverse fauna & breezy riverside paths',
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=700&auto=format&fit=crop&q=80',
    emoji: '🌿',
    cuteTag: 'Wetland Walks',
    themeColor: 'from-emerald-500 to-teal-600',
    operatingHours: {
      is24Hours: true,
      label: 'Open 24 Hours (Park Lighting 7:00 PM – 7:00 AM)',
    },
  },
  {
    id: 'punggol-waterway-connector',
    name: 'Punggol Waterway Park & Park Connector',
    category: 'Outdoor Sports & Cycling',
    type: 'outdoor',
    weatherFit: 'sun',
    description: 'Scenic continuous cycling and running corridor connecting Sengkang Riverside to Punggol Promenade and Coney Island.',
    distanceKm: 1.8,
    travelTimeMins: 8,
    suggestedTransit: 'Cycle directly from OLA via Anchorvale Park Connector',
    destinationCoords: { latitude: 1.4082, longitude: 103.9022 },
    highlight: 'Scenic waterfront jogging and cycling trail',
    imageUrl: 'https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?w=700&auto=format&fit=crop&q=80',
    emoji: '🚴',
    cuteTag: 'Breezy Cycling',
    themeColor: 'from-cyan-500 to-blue-600',
    operatingHours: {
      is24Hours: true,
      label: 'Open 24 Hours (Lighted PCN Corridor)',
    },
  },
  {
    id: 'coney-island',
    name: 'Coney Island Nature Reserve',
    category: 'Outdoor Sports & Cycling',
    type: 'outdoor',
    weatherFit: 'sun',
    description: 'Rustic coastal nature park home to coastal forests, casuarina woodlands, mangrove boardwalks, and cycling tracks.',
    distanceKm: 5.2,
    travelTimeMins: 22,
    suggestedTransit: 'Cycle along North Eastern Riverine Loop or take Bus 83 to Punggol Coast',
    destinationCoords: { latitude: 1.4111, longitude: 103.9214 },
    highlight: 'Rustic nature trails, bird-watching and coastal sea views',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700&auto=format&fit=crop&q=80',
    emoji: '🏝️',
    cuteTag: 'Rustic Nature',
    themeColor: 'from-lime-600 to-emerald-700',
    operatingHours: {
      openTime: '07:00',
      closeTime: '19:00',
      label: '7:00 AM – 7:00 PM SGT',
    },
  },

  // Sheltered / Warm weather
  {
    id: 'sengkang-sheltered-pool',
    name: 'Sengkang Swimming Complex (Sheltered Pools)',
    category: 'Indoor Recreation & Fitness',
    type: 'sheltered',
    weatherFit: 'warm',
    description: 'Features a large sheltered competition pool and sheltered learner pools, shielded from direct sun.',
    distanceKm: 0.6,
    travelTimeMins: 6,
    suggestedTransit: '6-min walk to Anchorvale Community Club complex',
    destinationCoords: { latitude: 1.3963, longitude: 103.8865 },
    highlight: 'Covered swimming pools shielded from intense heat & UV',
    imageUrl: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=700&auto=format&fit=crop&q=80',
    emoji: '🏊',
    cuteTag: 'Covered Pool',
    themeColor: 'from-sky-500 to-cyan-600',
    operatingHours: {
      openTime: '08:00',
      closeTime: '21:30',
      label: '8:00 AM – 9:30 PM SGT',
    },
  },
  {
    id: 'waterway-point',
    name: 'Waterway Point Mall (Punggol)',
    category: 'Indoor Shopping & Dining',
    type: 'indoor',
    weatherFit: 'all',
    description: 'Four-level suburban shopping and lifestyle hub directly along Punggol Waterway with Shaw Theatres cinema.',
    distanceKm: 2.4,
    travelTimeMins: 12,
    suggestedTransit: 'Take North East Line 1 stop from Sengkang to Punggol MRT',
    destinationCoords: { latitude: 1.4068, longitude: 103.9018 },
    highlight: 'Sheltered cinema, waterfront dining and air-conditioned retail',
    imageUrl: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=700&auto=format&fit=crop&q=80',
    emoji: '🎬',
    cuteTag: 'Cinema & Dining',
    themeColor: 'from-violet-500 to-fuchsia-600',
    operatingHours: {
      openTime: '10:00',
      closeTime: '22:00',
      label: '10:00 AM – 10:00 PM SGT',
    },
  }
];

function parseHhMmToMinutes(hhmm: string): number {
  const [hStr, mStr] = hhmm.split(':');
  return (parseInt(hStr, 10) || 0) * 60 + (parseInt(mStr, 10) || 0);
}

function getSingaporeTime(now: Date = new Date()): {
  hours: number;
  minutes: number;
  totalMinutes: number;
  formattedTime: string;
} {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Singapore',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
    }).formatToParts(now);

    const hourVal = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0', 10) % 24;
    const minVal = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0', 10);

    const formattedTime = new Intl.DateTimeFormat('en-SG', {
      timeZone: 'Asia/Singapore',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(now);

    return {
      hours: hourVal,
      minutes: minVal,
      totalMinutes: hourVal * 60 + minVal,
      formattedTime,
    };
  } catch {
    const sgt = new Date(now.getTime() + 8 * 3600 * 1000);
    const hours = sgt.getUTCHours();
    const minutes = sgt.getUTCMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    return {
      hours,
      minutes,
      totalMinutes: hours * 60 + minutes,
      formattedTime: `${hour12}:${String(minutes).padStart(2, '0')} ${period}`,
    };
  }
}

function isVenueOpenAtSgt(
  hoursSpec?: OperatingHoursSpec,
  currentTotalMinutes?: number
): boolean {
  if (!hoursSpec) return true;
  if (hoursSpec.is24Hours) return true;
  if (!hoursSpec.openTime || !hoursSpec.closeTime) return true;

  const nowMins =
    typeof currentTotalMinutes === 'number'
      ? currentTotalMinutes
      : getSingaporeTime().totalMinutes;

  const openMins = parseHhMmToMinutes(hoursSpec.openTime);
  const closeMins = parseHhMmToMinutes(hoursSpec.closeTime);

  if (openMins === closeMins) return true;

  // Normal daytime/evening operating hours (e.g. 10:00 to 22:00)
  if (openMins < closeMins) {
    return nowMins >= openMins && nowMins < closeMins;
  }

  // Operating hours that cross midnight (e.g. 18:00 to 02:00)
  return nowMins >= openMins || nowMins < closeMins;
}

export const WeatherScreen: React.FC<WeatherScreenProps> = ({
  onSelectPlaceForDirections,
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [weatherState, setWeatherState] = useState<FetchState>('loading');
  const [weatherUpstreamStatus, setWeatherUpstreamStatus] = useState<number | null>(null);

  const [temperatureData, setTemperatureData] = useState<TemperatureData | null>(null);
  const [temperatureState, setTemperatureState] = useState<FetchState>('loading');
  const [tempUpstreamStatus, setTempUpstreamStatus] = useState<number | null>(null);

  const [psiData, setPsiData] = useState<PsiData | null>(null);
  const [psiState, setPsiState] = useState<FetchState>('loading');
  const [psiUpstreamStatus, setPsiUpstreamStatus] = useState<number | null>(null);
  const [sgtNow, setSgtNow] = useState(() => getSingaporeTime());

  // Fetch live weather from /api/weather
  const fetchWeather = async () => {
    setWeatherState('loading');
    setWeatherUpstreamStatus(null);
    try {
      const res = await fetch('/api/weather');
      if (!res.ok) {
        setWeatherUpstreamStatus(res.status);
        if (res.status === 401 || res.status === 403 || res.status === 503) {
          setWeatherState('refused');
        } else {
          setWeatherState('unreachable');
        }
        return;
      }
      const data = await res.json();
      if (!data || !data.forecast) {
        setWeatherData(null);
        setWeatherState('empty');
      } else {
        setWeatherData(data);
        setWeatherState('success');
      }
    } catch (err) {
      setWeatherState('unreachable');
    }
  };

  // Fetch live temperature from /api/temperature
  const fetchTemperature = async () => {
    setTemperatureState('loading');
    setTempUpstreamStatus(null);
    try {
      const res = await fetch('/api/temperature');
      if (!res.ok) {
        setTempUpstreamStatus(res.status);
        if (res.status === 401 || res.status === 403 || res.status === 503) {
          setTemperatureState('refused');
        } else {
          setTemperatureState('unreachable');
        }
        return;
      }
      const data = await res.json();
      if (!data || data.temperature === null) {
        setTemperatureData(null);
        setTemperatureState('empty');
      } else {
        setTemperatureData(data);
        setTemperatureState('success');
      }
    } catch (err) {
      setTemperatureState('unreachable');
    }
  };

  // Fetch live 24-hour PSI from /api/psi
  const fetchPsi = async () => {
    setPsiState('loading');
    setPsiUpstreamStatus(null);
    try {
      const res = await fetch('/api/psi');
      if (!res.ok) {
        setPsiUpstreamStatus(res.status);
        if (res.status === 401 || res.status === 403 || res.status === 503) {
          setPsiState('refused');
        } else {
          setPsiState('unreachable');
        }
        return;
      }
      const data = await res.json();
      if (!data || data.psi24Hourly === null) {
        setPsiData(null);
        setPsiState('empty');
      } else {
        setPsiData(data);
        setPsiState('success');
      }
    } catch (err) {
      setPsiState('unreachable');
    }
  };

  useEffect(() => {
    fetchWeather();
    fetchTemperature();
    fetchPsi();

    const timer = setInterval(() => {
      setSgtNow(getSingaporeTime());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Determine rule-based recommendations strictly from live upstream weather and air-quality data
  const rawForecast = (weatherData?.forecast || '').toLowerCase();
  const currentTemp = temperatureData?.temperature ?? 30;
  const forecastLabel = weatherData?.forecast || 'Fair';
  const forecastLower = forecastLabel.toLowerCase();

  const isRain =
    rawForecast.includes('rain') ||
    rawForecast.includes('shower') ||
    rawForecast.includes('thunder') ||
    rawForecast.includes('storm') ||
    rawForecast.includes('heavy');

  const isWarm = currentTemp >= 31.5;
  const isPoorAirQuality = psiData ? !psiData.exerciseAllowed : false;
  const psiCategoryLower = psiData?.category ? psiData.category.toLowerCase() : 'good';
  const psiSummaryText = psiData
    ? `${psiCategoryLower} (24-hr PSI ${psiData.psi24Hourly})`
    : 'within normal range';

  // Combined outdoor exercise evaluation (considering both air quality and current weather)
  const canExerciseOutdoorsNow = Boolean(
    psiData && psiData.exerciseAllowed && !isRain && !isWarm
  );

  let exerciseHeadline = '';
  let exercisePrimaryAdvice = '';
  let exerciseSecondaryAdvice = '';
  let exerciseShortStatus = '';

  if (psiData) {
    if (!psiData.exerciseAllowed) {
      exerciseHeadline = 'Indoor Exercise Preferred (Air Quality Advisory)';
      exercisePrimaryAdvice = isRain
        ? `Air quality is ${psiSummaryText} and current ${forecastLower} in Sengkang makes indoor exercise strongly preferable.`
        : `Air quality is ${psiSummaryText} despite "${forecastLabel}" weather. ${psiData.exerciseRecommendation}`;
      exerciseSecondaryAdvice =
        'Vulnerable individuals (elderly, pregnant, children, or those with heart/lung conditions) should remain indoors.';
      exerciseShortStatus = `Air quality ${psiCategoryLower}${isRain ? ` & ${forecastLower}` : ''} — prefer indoor exercise`;
    } else if (isRain) {
      exerciseHeadline = 'Prefer Indoor or Sheltered Exercise';
      exercisePrimaryAdvice = `Air quality is ${psiSummaryText}, but current ${forecastLower} makes indoor or sheltered exercise preferable.`;
      exerciseSecondaryAdvice =
        'Hold off on open-air workouts along unsheltered park connectors until the rain clears; use indoor gyms, courts, or sheltered facilities instead.';
      exerciseShortStatus = `Air quality ${psiCategoryLower}, but ${forecastLower} makes indoor/sheltered exercise preferable`;
    } else if (isWarm) {
      exerciseHeadline = 'Prefer Shaded, Sheltered or Indoor Exercise';
      exercisePrimaryAdvice = `Air quality is ${psiSummaryText} with "${forecastLabel}" skies, but the warm ${currentTemp}°C temperature makes shaded, sheltered, or indoor exercise preferable.`;
      exerciseSecondaryAdvice =
        'Avoid strenuous open-sun workouts during peak heat; opt for sheltered pools, indoor gyms, or shaded riverside paths with frequent hydration.';
      exerciseShortStatus = `Air quality ${psiCategoryLower}, warm (${currentTemp}°C) — prefer shaded or indoor exercise`;
    } else {
      exerciseHeadline = 'Conditions Suitable for Outdoor Exercise';
      exercisePrimaryAdvice = `Air quality is ${psiSummaryText} and the current "${forecastLabel}" weather (${currentTemp}°C) is suitable for outdoor exercise.`;
      exerciseSecondaryAdvice =
        'Outdoor workouts, cycling, and jogging along Sengkang Riverside Park and Punggol Waterway can proceed comfortably.';
      exerciseShortStatus = `Air quality ${psiCategoryLower} & ${forecastLower} weather — suitable for outdoor exercise`;
    }
  }

  // Filter recommendations based on combined live weather, air-quality conditions, and current Singapore Time (SGT) operating hours
  let recommendedCategoryTitle = '';
  let conditionReason = '';
  let weatherMatchedPlaces: ActivityRecommendation[] = [];

  if (isRain) {
    recommendedCategoryTitle = 'Rainy Weather: Prioritising Indoor & Sheltered Activities';
    conditionReason = `Air quality is ${psiSummaryText}, but the official Sengkang forecast indicates "${weatherData?.forecast}". Indoor and sheltered venues with covered transit connections are recommended over outdoor workouts.`;
    weatherMatchedPlaces = ALL_NEARBY_PLACES.filter(p => p.type === 'indoor' || p.type === 'sheltered');
  } else if (isPoorAirQuality) {
    recommendedCategoryTitle = 'Air Quality Advisory: Prioritising Indoor Air-Conditioned Activities';
    conditionReason = `Although Sengkang weather is "${forecastLabel}", air quality is ${psiSummaryText}. Indoor air-conditioned activities are recommended instead of outdoor exercise.`;
    weatherMatchedPlaces = ALL_NEARBY_PLACES.filter(p => p.type === 'indoor');
  } else if (isWarm) {
    recommendedCategoryTitle = 'Warm Conditions: Shaded, Sheltered & Air-Conditioned Destinations';
    conditionReason = `Air quality is ${psiSummaryText}, while air temperature is ${currentTemp}°C from ${temperatureData?.station?.name || 'official station'}. Sheltered pools and air-conditioned venues are preferable to strenuous open-air exercise.`;
    weatherMatchedPlaces = ALL_NEARBY_PLACES.filter(p => p.weatherFit === 'warm' || p.type === 'indoor' || p.type === 'sheltered');
  } else {
    recommendedCategoryTitle = 'Pleasant Conditions: Outdoor Parks, Nature Trails & Walking';
    conditionReason = `Air quality is ${psiSummaryText} and the official Sengkang forecast is "${forecastLabel}" with a comfortable ${currentTemp}°C — suitable for outdoor riverside walking, cycling, or park workouts.`;
    weatherMatchedPlaces = ALL_NEARBY_PLACES.filter(p => p.type === 'outdoor' || p.weatherFit === 'all');
  }

  // Exclude venues that are closed at the current Singapore time (Asia/Singapore)
  let filteredPlaces = weatherMatchedPlaces.filter(p =>
    isVenueOpenAtSgt(p.operatingHours, sgtNow.totalMinutes)
  );
  const closedCount = weatherMatchedPlaces.length - filteredPlaces.length;

  // If primary category venues are closed and outdoor conditions are safe (!isRain && !isPoorAirQuality), prefer currently open alternatives
  if (filteredPlaces.length === 0 && !isRain && !isPoorAirQuality) {
    filteredPlaces = ALL_NEARBY_PLACES.filter(p =>
      isVenueOpenAtSgt(p.operatingHours, sgtNow.totalMinutes)
    );
  }

  if (filteredPlaces.length === 0) {
    conditionReason += ` At ${sgtNow.formattedTime} SGT, nearby malls, cafés, and indoor complexes are currently closed — at-home or sheltered resident activities within OLA are recommended until venues reopen.`;
  } else if (closedCount > 0) {
    conditionReason += ` Filtered for venues currently open at ${sgtNow.formattedTime} SGT (closed malls, cafés, and gated parks are excluded).`;
  }

  const getWeatherIcon = (forecastStr: string) => {
    const f = forecastStr.toLowerCase();
    if (f.includes('thunder')) return <CloudRain className="w-10 h-10 text-amber-500 animate-bounce" />;
    if (f.includes('shower') || f.includes('rain')) return <CloudRain className="w-10 h-10 text-teal-600" />;
    if (f.includes('partly')) return <CloudSun className="w-10 h-10 text-amber-500" />;
    return <Sun className="w-10 h-10 text-amber-500" />;
  };

  const getPsiBadgeClass = (category: string) => {
    switch (category) {
      case 'Good':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Moderate':
        return 'bg-sky-100 text-sky-800 border-sky-300';
      case 'Unhealthy':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Very Unhealthy':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Hazardous':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  const handleRouteToPlace = (place: ActivityRecommendation) => {
    const locItem: LocationItem = {
      name: place.name,
      address: `${place.distanceKm} km from OLA Executive Condominium`,
      postalCode: '',
      latitude: place.destinationCoords.latitude,
      longitude: place.destinationCoords.longitude,
    };
    onSelectPlaceForDirections(locItem);
  };

  return (
    <div id="weather-screen-container" className="space-y-8 pb-10">
      {/* Screen Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
          <CloudSun className="w-6 h-6 text-amber-600" />
          Sengkang Weather & Activity Recommendations
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Official real-time meteorological observations for Sengkang & OLA Executive Condominium (S544651)
        </p>
      </div>

      {/* Official Weather Section */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Official 2-Hour Weather Forecast for Sengkang */}
          <div
            id="sengkang-weather-card"
            className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                  Official 2-Hour Forecast
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200/60">
                  Area: Sengkang
                </span>
              </div>

              {/* Data State Notice for Weather */}
              <div className="mt-3">
                <DataStateNotice
                  id="weather-state-notice"
                  state={weatherState}
                  upstreamStatus={weatherUpstreamStatus}
                  customContext="Meteorological Service Singapore 2-Hour Forecast"
                  onRetry={fetchWeather}
                />
              </div>

              {weatherState === 'success' && weatherData && (
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 capitalize">
                      {weatherData.forecast}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Forecast area: <span className="font-semibold text-slate-800">Sengkang</span> (covering OLA EC)
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/50">
                    {getWeatherIcon(weatherData.forecast || '')}
                  </div>
                </div>
              )}
            </div>

            {/* Timestamps & Validity */}
            {weatherData && (
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-1 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>
                    Valid Period:{' '}
                    <span className="font-semibold text-slate-700">
                      {weatherData.validPeriod?.text || 'Next 2 hours'}
                    </span>
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Source: {weatherData.source} • Updated:{' '}
                  {weatherData.updateTimestamp
                    ? new Date(weatherData.updateTimestamp).toLocaleTimeString('en-SG', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Recent'}
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Official Air Temperature */}
          <div
            id="sengkang-temperature-card"
            className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                  Live Air Temperature
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60">
                  Meteorological Station
                </span>
              </div>

              {/* Data State Notice for Temperature */}
              <div className="mt-3">
                <DataStateNotice
                  id="temperature-state-notice"
                  state={temperatureState}
                  upstreamStatus={tempUpstreamStatus}
                  customContext="Official Singapore Weather Stations (data.gov.sg)"
                  onRetry={fetchTemperature}
                />
              </div>

              {temperatureState === 'success' && temperatureData && (
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-baseline gap-1">
                      <span>{temperatureData.temperature}</span>
                      <span className="text-xl sm:text-2xl font-bold text-amber-600">
                        {temperatureData.unit}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Reporting station:{' '}
                      <span className="font-semibold text-slate-800">
                        {temperatureData.station?.name || 'Nearest Sengkang Station'}
                      </span>{' '}
                      {temperatureData.station?.distanceKm !== undefined && (
                        <span className="text-slate-400">
                          ({temperatureData.station.distanceKm} km from OLA)
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-200/50">
                    <Thermometer className="w-10 h-10 text-teal-600" />
                  </div>
                </div>
              )}
            </div>

            {/* Reading Timestamp */}
            {temperatureData && (
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-1 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Verified Official Sensor Reading</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Station ID: {temperatureData.station?.id || 'Active'} • Source:{' '}
                  {temperatureData.source}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Surrounding Areas Forecast Strip */}
        {weatherData?.surroundingAreas && weatherData.surroundingAreas.length > 0 && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider block">
              Surrounding Northeast Townships:
            </span>
            <div className="flex flex-wrap gap-2">
              {weatherData.surroundingAreas.map(area => (
                <div
                  key={area.area}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/80 text-xs shadow-2xs flex items-center gap-2"
                >
                  <span className="font-semibold text-slate-800">{area.area}:</span>
                  <span className="text-teal-700 font-medium">{area.forecast}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Air Quality & Haze Section */}
      <section id="air-quality-haze-section" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wind className="w-5 h-5 text-teal-700" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Air Quality & Haze
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
            NEA 24-Hour PSI Reading
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Official 24-Hour PSI and Category */}
          <div
            id="sengkang-psi-card"
            className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
                  24-Hour PSI & Category
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200/60">
                  Region: North (Sengkang)
                </span>
              </div>

              {/* Data State Notice for PSI */}
              <div className="mt-3">
                <DataStateNotice
                  id="psi-state-notice"
                  state={psiState}
                  upstreamStatus={psiUpstreamStatus}
                  customContext="National Environment Agency (NEA) 24-Hour PSI"
                  onRetry={fetchPsi}
                />
              </div>

              {psiState === 'success' && psiData && (
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-baseline gap-2.5">
                      <span>{psiData.psi24Hourly}</span>
                      <span
                        className={`text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded-full border ${getPsiBadgeClass(
                          psiData.category
                        )}`}
                      >
                        {psiData.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Category:{' '}
                      <span className="font-semibold text-slate-800">{psiData.category}</span>{' '}
                      (0–50 Good, 51–100 Moderate, 101–200 Unhealthy)
                    </p>
                    {psiData.regionalPsi && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          North: {psiData.regionalPsi.north ?? '–'}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                          East: {psiData.regionalPsi.east ?? '–'}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                          Central: {psiData.regionalPsi.central ?? '–'}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                          West: {psiData.regionalPsi.west ?? '–'}
                        </span>
                        <span className="text-[10px] font-medium text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                          South: {psiData.regionalPsi.south ?? '–'}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 rounded-2xl bg-teal-50/70 border border-teal-200/50 shrink-0">
                    <Wind className="w-10 h-10 text-teal-600" />
                  </div>
                </div>
              )}
            </div>

            {/* Reading Timestamp */}
            {psiData && (
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-1 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Verified Official NEA Air Quality Reading</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Source: {psiData.source || 'National Environment Agency via data.gov.sg'} • Updated:{' '}
                  {psiData.updatedTimestamp
                    ? new Date(psiData.updatedTimestamp).toLocaleTimeString('en-SG', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Recent'}
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Should I exercise outdoors? Recommendation */}
          <div
            id="sengkang-exercise-card"
            className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                  Should I Exercise Outdoors?
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60">
                  Health Advisory
                </span>
              </div>

              {/* Data State Notice for Advisory */}
              <div className="mt-3">
                <DataStateNotice
                  id="exercise-state-notice"
                  state={psiState === 'loading' || weatherState === 'loading' ? 'loading' : psiState}
                  upstreamStatus={psiUpstreamStatus}
                  customContext="MOH / NEA Outdoor Exercise & Weather Guidance"
                  onRetry={() => {
                    fetchPsi();
                    fetchWeather();
                  }}
                />
              </div>

              {psiState === 'success' && weatherState !== 'loading' && psiData && (
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <div className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                      {canExerciseOutdoorsNow ? (
                        <span className="text-emerald-700 flex items-center gap-1.5">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          {exerciseHeadline}
                        </span>
                      ) : (
                        <span className="text-amber-700 flex items-center gap-1.5">
                          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                          {exerciseHeadline}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {exercisePrimaryAdvice}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      {exerciseSecondaryAdvice}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/50 shrink-0">
                    <Activity className="w-10 h-10 text-amber-600" />
                  </div>
                </div>
              )}
            </div>

            {/* Advisory Timestamp */}
            {psiData && weatherState !== 'loading' && (
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-1 text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>Combined Weather & Air Quality Exercise Guidance</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Target: OLA EC Residents & Outdoor Recreation • Status: {exerciseShortStatus}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Activity Recommendations Section (Rule-based based on official weather) */}
      <section id="activity-recommendations-section" className="space-y-4">
        {/* Banner with condition rule reasoning */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-800 to-slate-900 text-white shadow-xs space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-300">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Rule-Based Activity Advice for OLA Residents</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white">
            {recommendedCategoryTitle || 'Weather-Tailored Activities Around OLA'}
          </h2>
          <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
            {conditionReason || 'Recommendations adapt automatically according to official live weather forecasts for Sengkang.'}
          </p>
        </div>

        {/* Recommended Places Grid with Fun Visuals */}
        {filteredPlaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPlaces.map(place => (
              <div
                key={place.id}
                id={`place-card-${place.id}`}
                className="group rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:border-teal-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Card Visual Header Image & Cute Badge */}
                <div className="relative h-44 w-full overflow-hidden bg-slate-900">
                  {place.imageUrl && (
                    <img
                      src={place.imageUrl}
                      alt={place.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=700&auto=format&fit=crop&q=80';
                      }}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent pointer-events-none" />

                  {/* Floating Fun Visual Emblem/Logo */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-white/95 backdrop-blur-md shadow-md flex items-center justify-center text-xl border border-white/60 shrink-0 transform group-hover:scale-110 transition-transform">
                      <span role="img" aria-label={place.name}>
                        {place.emoji || '✨'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-300 drop-shadow-sm">
                        {place.category}
                      </span>
                      <span className="text-xs font-bold text-white drop-shadow-md">
                        {place.cuteTag || 'Recommended'}
                      </span>
                    </div>
                  </div>

                  {/* Floating Distance Badge */}
                  <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/20 shadow-xs flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-teal-400 shrink-0" />
                    <span>{place.distanceKm} km</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-teal-800 transition-colors">
                        {place.name}
                      </h3>
                    </div>

                    {place.operatingHours && (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-800">
                        <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Open now • {place.operatingHours.label}</span>
                      </div>
                    )}

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {place.description}
                    </p>

                    {/* Transit Route Hint */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700 flex items-start gap-2">
                      <Compass className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                      <span className="leading-snug">{place.suggestedTransit}</span>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      ~{place.travelTimeMins} mins
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRouteToPlace(place)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors cursor-pointer"
                    >
                      <span>Directions From OLA</span>
                      <ArrowRight className="w-3.5 h-3.5 text-teal-700" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            id="no-open-venues-recommendation"
            className="p-5 sm:p-6 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 shrink-0">
                <Clock className="w-5 h-5 text-teal-700" />
              </div>
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold">
                  Current Time: {sgtNow.formattedTime} SGT • Nearby Malls & Indoor Venues Closed
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Recommended Now: At-Home Indoor Wellness, Stretching & Rest at OLA
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Nearby malls, cafés, and indoor sports facilities (such as Compass One, Sengkang Grand Mall, Waterway Point, and Sengkang Sports Centre) are currently outside their operating hours, and current outdoor conditions make open-air workouts unsuitable. We recommend staying indoors at home for light stretching, yoga, reading, or rest until Sengkang Sports Centre reopens at 7:00 AM SGT and malls reopen at 10:00 AM SGT.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
