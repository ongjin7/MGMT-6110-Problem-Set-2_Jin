export type AppScreen = 'directions' | 'weather';

export type TravelMode = 'pt' | 'walk' | 'drive' | 'cycle';

export interface LocationItem {
  name: string;
  address: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  building?: string;
  road?: string;
  block?: string;
}

export interface RouteResult {
  origin: {
    name: string;
    postalCode: string;
    coordinates: [number, number];
  };
  destination: {
    coordinates: [number, number];
    name?: string;
  };
  routeType: TravelMode;
  routeData: any;
}

export interface BusArrivalTiming {
  minutes: number | string;
  load: string; // SEA, SDA, LSD
  feature: string; // WAB
  type: string; // SD, DD, BD
  estimatedArrival?: string;
}

export interface BusServiceArrival {
  serviceNo: string;
  operator?: string;
  nextBus: BusArrivalTiming | null;
  nextBus2: BusArrivalTiming | null;
  nextBus3: BusArrivalTiming | null;
}

export interface BusStopItem {
  busStopCode: string;
  roadName: string;
  description: string;
  latitude: number;
  longitude: number;
  distanceM: number;
  type: 'BUS';
}

export interface TrainStationItem {
  code: string;
  name: string;
  type: 'MRT' | 'LRT' | 'MRT/LRT';
  line: string;
  latitude: number;
  longitude: number;
  distanceM: number;
  services: string[];
}

export interface BusRouteStop {
  serviceNo: string;
  direction: number;
  stopSequence: number;
  busStopCode: string;
  distanceKm?: number;
  firstBus?: string;
  lastBus?: string;
}

export interface WeatherData {
  targetArea: string;
  targetLocation: string;
  forecast: string | null;
  validPeriod: {
    start: string;
    end: string;
    text: string;
  } | null;
  updateTimestamp: string | null;
  updateTimeText?: string | null;
  allForecastsCount?: number;
  surroundingAreas?: Array<{ area: string; forecast: string }>;
  source?: string;
}

export interface TemperatureData {
  targetLocation: string;
  temperature: number | null;
  unit: string;
  station: {
    id: string;
    name: string;
    distanceKm: number;
  } | null;
  timestamp: string | null;
  nearbyStations?: Array<{
    id: string;
    name: string;
    temperature: number;
    distanceKm: number;
  }>;
  source?: string;
}

export type PsiCategory = 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';

export interface PsiData {
  targetLocation: string;
  region: string;
  psi24Hourly: number | null;
  category: PsiCategory;
  exerciseRecommendation: string;
  shortAdvice: string;
  exerciseAllowed: boolean;
  alertLevel: 'normal' | 'warning' | 'danger' | 'critical';
  timestamp: string | null;
  updatedTimestamp: string | null;
  regionalPsi?: {
    north: number | null;
    east: number | null;
    central: number | null;
    west: number | null;
    south: number | null;
  };
  source?: string;
}

export interface IntegrationHealth {
  keyConfigured: boolean;
  upstreamAnswered: boolean;
  httpStatus: number | null;
  healthy: boolean;
  message: string;
}

export interface SystemHealth {
  status: 'ok' | 'degraded';
  timestamp: string;
  integrations: {
    lta_datamall: IntegrationHealth;
    onemap: IntegrationHealth;
    data_gov_sg_weather: IntegrationHealth;
    data_gov_sg_temperature: IntegrationHealth;
  };
}

export type FetchState = 'idle' | 'loading' | 'success' | 'empty' | 'refused' | 'unreachable';

export interface ActivityRecommendation {
  id: string;
  name: string;
  category: 'Indoor Shopping & Dining' | 'Indoor Recreation & Fitness' | 'Nature & Parks' | 'Outdoor Sports & Cycling' | 'Shaded & Cultural';
  type: 'indoor' | 'outdoor' | 'sheltered';
  weatherFit: 'rain' | 'sun' | 'warm' | 'all';
  description: string;
  distanceKm: number;
  travelTimeMins: number;
  suggestedTransit: string;
  destinationCoords: { latitude: number; longitude: number };
  highlight: string;
  imageUrl?: string;
  emoji?: string;
  cuteTag?: string;
  themeColor?: string;
}
