import { LocationItem, TravelMode } from '../types';

export interface DirectionStep {
  stepNumber: number;
  instruction: string;
  detail?: string;
  distanceOrTime?: string;
  badge?: string;
  iconType?: 'walk' | 'lrt' | 'mrt' | 'bus' | 'car' | 'bike' | 'flag';
}

export interface ModeDirections {
  mode: TravelMode;
  modeLabel: string;
  timeMins: number;
  distanceKm: number;
  summary: string;
  highlights: string[];
  steps: DirectionStep[];
  residentTips: string;
  fareOrCost?: string;
}

export const OLA_ORIGIN = {
  name: 'OLA Executive Condominium',
  address: '70 Anchorvale Crescent, Singapore 544651',
  postalCode: '544651',
  latitude: 1.3966,
  longitude: 103.8886,
};

// Calculate Haversine distance in km
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}

const UPPERCASE_TOKENS = new Set([
  'MRT',
  'LRT',
  'TPE',
  'CTE',
  'PIE',
  'SLE',
  'KPE',
  'ECP',
  'AYE',
  'BKE',
  'KJE',
  'MCE',
  'OLA',
  'EC',
  'HDB',
  'SKGH',
  'CBD',
  'ION',
  'SMU',
  'NUS',
  'NTU',
  'SUTD',
  'PCN',
  'NEL',
  'NSL',
  'EWL',
  'CCL',
  'DTL',
  'TEL',
  'STC',
  'PTC',
  'II',
  'III',
]);

export function formatPlaceName(raw?: string | null): string {
  if (!raw) return '';
  const trimmed = String(raw).trim();
  if (!trimmed) return '';

  return trimmed
    .split(/\s+/)
    .map((word) => {
      const clean = word.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
      if (UPPERCASE_TOKENS.has(clean) || /^(SW|SE|PW|PE|NE|NS|EW|CC|CE|DT|TE|BP|CG)\d{1,2}[A-Z]?$/.test(clean)) {
        return word.toUpperCase();
      }
      if (/^\d+[A-Za-z]+$/.test(word)) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

function extractStopCode(stop: any): string {
  if (!stop) return '';
  if (stop.stopCode && String(stop.stopCode).trim()) {
    return String(stop.stopCode).trim().toUpperCase();
  }
  if (stop.stopId && String(stop.stopId).includes(':')) {
    const code = String(stop.stopId).split(':').pop()?.trim() || '';
    return code.toUpperCase();
  }
  return '';
}

function formatStopLocation(
  stop: any,
  dest: LocationItem,
  isOrigin: boolean = false,
  isDestination: boolean = false
): string {
  const rawName = String(stop?.name || '').trim();
  if (isOrigin || !rawName || rawName.toUpperCase() === 'ORIGIN') {
    return `${OLA_ORIGIN.name} (70 Anchorvale Crescent)`;
  }
  if (isDestination || rawName.toUpperCase() === 'DESTINATION') {
    return dest.name;
  }

  const formattedName = formatPlaceName(rawName);
  const code = extractStopCode(stop);

  if (!code) return formattedName;
  if (formattedName.toUpperCase().includes(code)) return formattedName;

  if (/^\d{5}$/.test(code)) {
    return `${formattedName} (Bus Stop ${code})`;
  }
  return `${formattedName} (${code})`;
}

function formatTransitService(leg: any): {
  serviceName: string;
  badge: string;
  iconType: 'lrt' | 'mrt' | 'bus';
} {
  const mode = String(leg?.mode || '').toUpperCase();
  const routeCode = String(leg?.routeShortName || leg?.route || '').trim().toUpperCase();
  const routeLong = String(leg?.routeLongName || '').trim();

  if (mode === 'BUS') {
    const busNo = routeCode || formatPlaceName(routeLong) || 'Service';
    return {
      serviceName: `Bus ${busNo}`,
      badge: `Bus ${busNo}`,
      iconType: 'bus',
    };
  }

  const fromToNames = `${leg?.from?.name || ''} ${leg?.to?.name || ''}`.toUpperCase();
  const isLrt =
    mode === 'TRAM' ||
    mode === 'LRT' ||
    /^(SW|SE|PW|PE|BP|STC|PTC)$/.test(routeCode) ||
    fromToNames.includes('LRT');

  const lineNamesByCode: Record<string, string> = {
    SW: 'Sengkang West LRT (SW)',
    SE: 'Sengkang East LRT (SE)',
    STC: 'Sengkang LRT (STC)',
    PW: 'Punggol West LRT (PW)',
    PE: 'Punggol East LRT (PE)',
    PTC: 'Punggol LRT (PTC)',
    BP: 'Bukit Panjang LRT (BP)',
    NE: 'North East Line (NEL)',
    NS: 'North South Line (NSL)',
    EW: 'East West Line (EWL)',
    CG: 'East West Line Changi Branch (CG)',
    CC: 'Circle Line (CCL)',
    CE: 'Circle Line Extension (CE)',
    DT: 'Downtown Line (DTL)',
    TE: 'Thomson-East Coast Line (TEL)',
  };

  const resolvedLineName =
    lineNamesByCode[routeCode] ||
    (routeLong ? formatPlaceName(routeLong) : '') ||
    (isLrt ? `LRT Line (${routeCode || 'LRT'})` : `MRT Line (${routeCode || 'MRT'})`);

  return {
    serviceName: resolvedLineName,
    badge: routeCode || (isLrt ? 'LRT' : 'MRT'),
    iconType: isLrt ? 'lrt' : 'mrt',
  };
}

function formatDistanceMeters(meters: number): string {
  const m = Math.max(0, Math.round(meters));
  if (m >= 1000) {
    return `${(m / 1000).toFixed(1)} km`;
  }
  return `${m} m`;
}

function extractRoadFromAddress(address?: string): string {
  if (!address) return '';
  const cleaned = address
    .replace(/,?\s*Singapore\s*\d{6}/i, '')
    .replace(/^\d+[A-Za-z]?\s+/, '')
    .trim();
  return cleaned;
}

function buildPublicTransportFromApi(dest: LocationItem, routeData: any): ModeDirections | null {
  const itineraries = routeData?.plan?.itineraries;
  if (!Array.isArray(itineraries) || itineraries.length === 0) {
    return null;
  }

  // Prefer the first itinerary that has transit legs if available, otherwise first itinerary
  const itinerary =
    itineraries.find(
      (it: any) =>
        Array.isArray(it?.legs) &&
        it.legs.some((l: any) => String(l?.mode || '').toUpperCase() !== 'WALK')
    ) || itineraries[0];

  const legs: any[] = Array.isArray(itinerary?.legs) ? itinerary.legs : [];
  if (legs.length === 0) return null;

  const totalDurationMins = Math.max(1, Math.round((Number(itinerary.duration) || 60) / 60));
  const totalDistanceMeters = legs.reduce((sum, leg) => sum + (Number(leg?.distance) || 0), 0);
  const totalDistanceKm = Math.max(0.1, parseFloat((totalDistanceMeters / 1000).toFixed(2)));

  const steps: DirectionStep[] = [];
  const transitServicesUsed: string[] = [];

  legs.forEach((leg, idx) => {
    const mode = String(leg?.mode || '').toUpperCase();
    const isFirst = idx === 0;
    const isLast = idx === legs.length - 1;
    const legMins = Math.max(1, Math.round((Number(leg?.duration) || 60) / 60));
    const legDistMeters = Number(leg?.distance) || 0;

    if (mode === 'WALK') {
      const fromLocation = isFirst
        ? `${OLA_ORIGIN.name} (70 Anchorvale Crescent)`
        : formatStopLocation(leg.from, dest, false, false);

      // If next leg is transit, ensure toLocation matches the next leg's boarding stop
      const nextLeg = idx + 1 < legs.length ? legs[idx + 1] : null;
      const toLocation = isLast
        ? dest.name
        : nextLeg?.from
        ? formatStopLocation(nextLeg.from, dest, false, false)
        : formatStopLocation(leg.to, dest, false, false);

      // Extract real street names from OneMap walking sub-steps
      const rawSubSteps: any[] = Array.isArray(leg.steps) ? leg.steps : [];
      const namedStepSegments: string[] = [];
      const seenStreets = new Set<string>();

      rawSubSteps.forEach((s) => {
        const rawStreet = String(s?.streetName || '').trim();
        const lower = rawStreet.toLowerCase();
        if (
          !rawStreet ||
          s?.bogusName ||
          lower === 'origin' ||
          lower === 'destination' ||
          lower === 'walkway' ||
          lower === 'path' ||
          lower === 'footpath' ||
          lower === 'sidewalk' ||
          lower === 'unnamed' ||
          lower === 'linkway' ||
          lower === 'footbridge' ||
          lower === 'steps'
        ) {
          return;
        }
        const niceStreet = formatPlaceName(rawStreet);
        if (!seenStreets.has(niceStreet.toUpperCase())) {
          seenStreets.add(niceStreet.toUpperCase());
          const subDist = Math.round(Number(s?.distance) || 0);
          namedStepSegments.push(subDist > 0 ? `${niceStreet} (${subDist} m)` : niceStreet);
        }
      });

      const destRoad = extractRoadFromAddress(dest.address);
      let instruction = '';
      if (isFirst && isLast) {
        instruction = `Walk from ${OLA_ORIGIN.name} (70 Anchorvale Crescent) to ${dest.name}`;
      } else if (isFirst) {
        instruction = `Walk from ${OLA_ORIGIN.name} (70 Anchorvale Crescent) to ${toLocation}`;
      } else if (isLast) {
        instruction = `Walk from ${fromLocation} to ${dest.name}${destRoad ? ` (${destRoad})` : ''}`;
      } else {
        instruction = `Transfer on foot from ${fromLocation} to ${toLocation}`;
      }

      let detail = '';
      if (namedStepSegments.length > 0) {
        if (isLast) {
          detail = `Proceed along ${namedStepSegments.join(' → ')} to arrive at ${dest.name}${dest.address ? `, ${dest.address}` : ''}.`;
        } else {
          detail = `Proceed along ${namedStepSegments.join(' → ')} to reach ${toLocation}.`;
        }
      } else if (isFirst) {
        detail = `Walk ${formatDistanceMeters(legDistMeters)} from ${OLA_ORIGIN.name} along Anchorvale Crescent to ${toLocation}.`;
      } else if (isLast) {
        detail = `Walk ${formatDistanceMeters(legDistMeters)} from ${fromLocation} to ${dest.name}${dest.address ? ` at ${dest.address}` : ''}.`;
      } else {
        detail = `Follow the pedestrian transfer linkway (${formatDistanceMeters(legDistMeters)}) from ${fromLocation} to ${toLocation}.`;
      }

      steps.push({
        stepNumber: steps.length + 1,
        instruction,
        detail,
        distanceOrTime: `${legMins} min (${formatDistanceMeters(legDistMeters)})`,
        badge: isLast ? 'Destination' : isFirst ? 'Origin Walk' : 'Transfer Walk',
        iconType: isLast ? 'flag' : 'walk',
      });
    } else {
      const fromLocation = formatStopLocation(leg.from, dest, false, false);
      const toLocation = formatStopLocation(leg.to, dest, false, false);
      const { serviceName, badge, iconType } = formatTransitService(leg);

      if (!transitServicesUsed.includes(serviceName)) {
        transitServicesUsed.push(serviceName);
      }

      const intermediateRaw: any[] = Array.isArray(leg.intermediateStops)
        ? leg.intermediateStops
        : [];
      const intermediateNames = intermediateRaw
        .map((st) => formatStopLocation(st, dest, false, false))
        .filter(Boolean);

      const stopCount =
        intermediateRaw.length > 0
          ? intermediateRaw.length + 1
          : typeof leg.numIntermediateStops === 'number' && leg.numIntermediateStops > 0
          ? leg.numIntermediateStops
          : null;

      const fromCode = extractStopCode(leg.from);
      const toCode = extractStopCode(leg.to);

      const instruction = `Board ${serviceName} at ${fromLocation} and alight at ${toLocation}`;

      let detail = '';
      if (intermediateNames.length > 0) {
        detail = `Ride ${stopCount} ${stopCount === 1 ? 'stop' : 'stops'} via ${intermediateNames.join(' → ')} and alight at ${toLocation}.`;
      } else if (stopCount === 1) {
        detail = `Ride 1 stop directly from ${fromLocation} and alight at ${toLocation}.`;
      } else if (stopCount && stopCount > 1) {
        detail = `Ride ${stopCount} stops from ${fromLocation} and alight at ${toLocation}.`;
      } else {
        detail = `Travel on ${serviceName} from ${fromLocation} and alight at ${toLocation}.`;
      }

      if (isLast) {
        detail += ` Destination ${dest.name}${dest.address ? ` (${dest.address})` : ''} is right at ${toLocation}.`;
      }

      steps.push({
        stepNumber: steps.length + 1,
        instruction,
        detail,
        distanceOrTime: `${legMins} min (${formatDistanceMeters(legDistMeters)}${stopCount ? ` • ${stopCount} stop${stopCount === 1 ? '' : 's'}` : ''})`,
        badge: fromCode && toCode ? `${badge}: ${fromCode} → ${toCode}` : badge,
        iconType,
      });
    }
  });

  const firstTransitLeg = legs.find((l) => String(l?.mode || '').toUpperCase() !== 'WALK');
  const lastTransitLeg = [...legs]
    .reverse()
    .find((l) => String(l?.mode || '').toUpperCase() !== 'WALK');

  const summary =
    transitServicesUsed.length > 0
      ? `${transitServicesUsed.join(' → ')} to ${dest.name}`
      : `Direct pedestrian walk from ${OLA_ORIGIN.name} to ${dest.name}`;

  const highlights: string[] = [];
  if (firstTransitLeg) {
    highlights.push(`Board at ${formatStopLocation(firstTransitLeg.from, dest)}`);
  }
  if (lastTransitLeg) {
    highlights.push(`Alight at ${formatStopLocation(lastTransitLeg.to, dest)}`);
  }
  if (typeof itinerary.walkDistance === 'number') {
    highlights.push(`${Math.round(itinerary.walkDistance)} m total walking`);
  }

  const fareStr = itinerary.fare
    ? `Fare: $${itinerary.fare} (SimplyGo / EZ-Link)`
    : transitServicesUsed.length === 0
    ? 'Free (Walk)'
    : 'Standard SimplyGo fare';

  const residentTips =
    firstTransitLeg && lastTransitLeg
      ? `OneMap live transit route: Start from ${OLA_ORIGIN.name} (70 Anchorvale Crescent), board at ${formatStopLocation(firstTransitLeg.from, dest)}, and alight at ${formatStopLocation(lastTransitLeg.to, dest)} for ${dest.name}.`
      : `Direct pedestrian route from ${OLA_ORIGIN.name} (70 Anchorvale Crescent) to ${dest.name}.`;

  return {
    mode: 'pt',
    modeLabel: 'Public Transport',
    timeMins: totalDurationMins,
    distanceKm: totalDistanceKm,
    summary,
    highlights,
    steps,
    residentTips,
    fareOrCost: fareStr,
  };
}

function cleanInstructionText(
  rawText: string,
  maneuver: string,
  resolvedStreet: string
): string {
  const text = String(rawText || '').trim();
  if (!text) {
    return `${formatPlaceName(maneuver || 'Continue')} onto ${resolvedStreet}`;
  }

  // Replace uppercase road names in OneMap instruction text with formatted place names
  let formatted = text
    .replace(/\b([A-Z]{2,}(?:\s+[A-Z0-9]{2,})*)\b/g, (match) => formatPlaceName(match))
    .replace(/\s+/g, ' ')
    .trim();

  if (!formatted.toLowerCase().includes(resolvedStreet.toLowerCase())) {
    formatted = `${formatted} on ${resolvedStreet}`;
  }

  return formatted;
}

function buildStreetRouteFromApi(
  mode: 'drive' | 'cycle' | 'walk',
  dest: LocationItem,
  routeData: any
): ModeDirections | null {
  const rawInstructions: any[] = Array.isArray(routeData?.route_instructions)
    ? routeData.route_instructions
    : [];
  if (rawInstructions.length === 0) {
    return null;
  }

  const routeSummary = routeData?.route_summary || {};
  const totalTimeMins = Math.max(
    1,
    Math.round((Number(routeSummary.total_time) || 60) / 60)
  );
  const totalDistanceKm = Math.max(
    0.1,
    parseFloat(((Number(routeSummary.total_distance) || 100) / 1000).toFixed(2))
  );

  const startStreet =
    formatPlaceName(routeSummary.start_point) || 'Anchorvale Crescent';
  const endStreet =
    formatPlaceName(routeSummary.end_point) ||
    extractRoadFromAddress(dest.address) ||
    dest.name;

  // First pass: extract raw street names for each row
  const rawStreets = rawInstructions.map((inst) => {
    const candidate = String(inst?.[1] || '').trim();
    if (
      !candidate ||
      candidate.toLowerCase() === 'unnamed' ||
      candidate.toLowerCase() === 'road' ||
      candidate.toLowerCase() === 'walkway' ||
      candidate.toLowerCase() === 'path' ||
      candidate.toLowerCase() === 'cycling path'
    ) {
      return '';
    }
    return formatPlaceName(candidate);
  });

  // Second pass: resolve every row's location so no step has an empty or vague street name
  const resolvedStreets = rawStreets.map((st, idx) => {
    if (st) return st;
    if (idx === 0) return startStreet;
    if (idx === rawInstructions.length - 1) return endStreet;

    let prevNamed = startStreet;
    for (let p = idx - 1; p >= 0; p--) {
      if (rawStreets[p]) {
        prevNamed = rawStreets[p];
        break;
      }
    }

    let nextNamed = endStreet;
    for (let n = idx + 1; n < rawInstructions.length; n++) {
      if (rawStreets[n]) {
        nextNamed = rawStreets[n];
        break;
      }
    }

    if (prevNamed.toUpperCase() === nextNamed.toUpperCase()) {
      return prevNamed;
    }
    const connectorWord =
      mode === 'drive'
        ? 'Slip Road'
        : mode === 'cycle'
        ? 'Park Connector Link'
        : 'Pedestrian Linkway';
    return `${prevNamed} → ${nextNamed} ${connectorWord}`;
  });

  interface GroupedSegment {
    streetName: string;
    maneuver: string;
    firstText: string;
    compass: string;
    distMeters: number;
    timeSecs: number;
    subManeuvers: string[];
    isDestination: boolean;
  }

  const grouped: GroupedSegment[] = [];

  rawInstructions.forEach((inst, idx) => {
    const maneuver = String(inst?.[0] || 'Continue').trim();
    const distMeters = Number(inst?.[2]) || 0;
    const timeSecs = Number(inst?.[4]) || 0;
    const compass = String(inst?.[6] || '').trim();
    const rawText = String(inst?.[9] || '').trim();
    const streetName = resolvedStreets[idx];
    const isDest =
      idx === rawInstructions.length - 1 ||
      maneuver.toLowerCase().includes('destination') ||
      rawText.toLowerCase().includes('arrived at your destination');

    if (isDest) {
      grouped.push({
        streetName: endStreet,
        maneuver: 'Destination',
        firstText: rawText,
        compass,
        distMeters,
        timeSecs,
        subManeuvers: [],
        isDestination: true,
      });
      return;
    }

    const prevGroup = grouped.length > 0 ? grouped[grouped.length - 1] : null;
    if (
      prevGroup &&
      !prevGroup.isDestination &&
      prevGroup.streetName.toUpperCase() === streetName.toUpperCase()
    ) {
      prevGroup.distMeters += distMeters;
      prevGroup.timeSecs += timeSecs;
      const cleanedSub = cleanInstructionText(rawText, maneuver, streetName);
      if (
        distMeters > 0 &&
        !prevGroup.subManeuvers.includes(cleanedSub) &&
        cleanedSub !== prevGroup.firstText
      ) {
        prevGroup.subManeuvers.push(`${cleanedSub} (${formatDistanceMeters(distMeters)})`);
      }
    } else {
      grouped.push({
        streetName,
        maneuver,
        firstText: cleanInstructionText(rawText, maneuver, streetName),
        compass,
        distMeters,
        timeSecs,
        subManeuvers: [],
        isDestination: false,
      });
    }
  });

  const iconType: 'car' | 'bike' | 'walk' =
    mode === 'drive' ? 'car' : mode === 'cycle' ? 'bike' : 'walk';

  const steps: DirectionStep[] = grouped.map((seg, idx) => {
    if (seg.isDestination) {
      return {
        stepNumber: idx + 1,
        instruction: `Arrive at ${dest.name} on ${seg.streetName}`,
        detail: `Destination reached at ${dest.name}${dest.address ? `, ${dest.address}` : ''}${dest.postalCode ? ` (S${dest.postalCode})` : ''}.`,
        distanceOrTime: 'Arrival',
        badge: 'Destination',
        iconType: 'flag',
      };
    }

    const nextSeg = idx + 1 < grouped.length ? grouped[idx + 1] : null;
    const nextTargetName =
      nextSeg && !nextSeg.isDestination ? nextSeg.streetName : `${dest.name} (${endStreet})`;

    const stepMins = Math.max(1, Math.round(seg.timeSecs / 60));
    const timeOrDistLabel =
      seg.timeSecs >= 45
        ? `${stepMins} min (${formatDistanceMeters(seg.distMeters)})`
        : formatDistanceMeters(seg.distMeters);

    const instruction =
      idx === 0
        ? `Depart ${OLA_ORIGIN.name} (70 Anchorvale Crescent) onto ${seg.streetName}`
        : seg.firstText;

    let detail = `Follow ${seg.streetName} for ${formatDistanceMeters(seg.distMeters)}${
      seg.compass ? ` heading ${seg.compass}` : ''
    } to connect onto ${nextTargetName}.`;

    if (seg.subManeuvers.length > 0) {
      detail += ` Along ${seg.streetName}: ${seg.subManeuvers.slice(0, 3).join('; ')}.`;
    }

    return {
      stepNumber: idx + 1,
      instruction,
      detail,
      distanceOrTime: timeOrDistLabel,
      badge: seg.streetName,
      iconType,
    };
  });

  const routeNamesRaw: string[] = Array.isArray(routeData?.route_name)
    ? routeData.route_name
        .map((n: any) => formatPlaceName(String(n || '')))
        .filter(Boolean)
    : [];

  const distinctMajorRoads =
    routeNamesRaw.length > 0
      ? routeNamesRaw
      : Array.from(
          new Set(
            grouped
              .filter((g) => !g.isDestination)
              .map((g) => g.streetName)
              .filter((name) => !name.includes('→'))
          )
        ).slice(0, 3);

  const summary =
    distinctMajorRoads.length > 0
      ? `Via ${distinctMajorRoads.join(' → ')} to ${dest.name}`
      : `${startStreet} → ${endStreet} to ${dest.name}`;

  const highlights: string[] = [
    `Start: ${startStreet}`,
    `End: ${endStreet}`,
  ];
  if (distinctMajorRoads.length > 0) {
    highlights.push(`Main corridor: ${distinctMajorRoads[0]}`);
  }

  const modeLabels: Record<'drive' | 'cycle' | 'walk', string> = {
    drive: 'Car / Taxi',
    cycle: 'Bike / Cycling',
    walk: 'Walking',
  };

  const residentTipsByMode: Record<'drive' | 'cycle' | 'walk', string> = {
    drive: `OneMap live driving route from ${OLA_ORIGIN.name} via ${startStreet} and ${distinctMajorRoads.join(', ') || endStreet} directly to ${dest.name} (${endStreet}).`,
    cycle: `OneMap live cycling route from ${OLA_ORIGIN.name} starting on ${startStreet} and connecting to ${endStreet} at ${dest.name}.`,
    walk: `OneMap live walking route from ${OLA_ORIGIN.name} starting on ${startStreet} and arriving at ${dest.name} via ${endStreet}.`,
  };

  const fareByMode: Record<'drive' | 'cycle' | 'walk', string> = {
    drive: 'ERP & carpark rates apply',
    cycle: 'Zero emissions',
    walk: 'Free & healthy',
  };

  return {
    mode,
    modeLabel: modeLabels[mode],
    timeMins: totalTimeMins,
    distanceKm: totalDistanceKm,
    summary,
    highlights,
    steps,
    residentTips: residentTipsByMode[mode],
    fareOrCost: fareByMode[mode],
  };
}

// Coordinate-indexed real Singapore MRT stations for pre-API synchronous fallback
interface SgStationRef {
  name: string;
  code: string;
  line: string;
  lat: number;
  lng: number;
  transferStation: string;
  transferLine: string;
}

const SG_MRT_STATIONS: SgStationRef[] = [
  { name: 'Sengkang MRT Station', code: 'NE16', line: 'North East Line (NEL)', lat: 1.39169, lng: 103.89548, transferStation: 'Sengkang MRT Station (NE16)', transferLine: 'North East Line (NEL)' },
  { name: 'Punggol MRT Station', code: 'NE17', line: 'North East Line (NEL)', lat: 1.4052, lng: 103.9023, transferStation: 'Sengkang MRT Station (NE16)', transferLine: 'North East Line (NEL) towards Punggol' },
  { name: 'Buangkok MRT Station', code: 'NE15', line: 'North East Line (NEL)', lat: 1.3829, lng: 103.8931, transferStation: 'Sengkang MRT Station (NE16)', transferLine: 'North East Line (NEL) towards HarbourFront' },
  { name: 'Hougang MRT Station', code: 'NE14', line: 'North East Line (NEL)', lat: 1.3712, lng: 103.8924, transferStation: 'Sengkang MRT Station (NE16)', transferLine: 'North East Line (NEL) towards HarbourFront' },
  { name: 'Kovan MRT Station', code: 'NE13', line: 'North East Line (NEL)', lat: 1.3602, lng: 103.8851, transferStation: 'Sengkang MRT Station (NE16)', transferLine: 'North East Line (NEL) towards HarbourFront' },
  { name: 'Serangoon MRT Station', code: 'NE12 / CC13', line: 'North East Line (NEL)', lat: 1.3497, lng: 103.8737, transferStation: 'Sengkang MRT Station (NE16)', transferLine: 'North East Line (NEL) towards HarbourFront' },
  { name: 'Woodleigh MRT Station', code: 'NE11', line: 'North East Line (NEL)', lat: 1.3392, lng: 103.8708, transferStation: 'Sengkang MRT Station (NE16)', transferLine: 'North East Line (NEL) towards HarbourFront' },
  { name: 'Potong Pasir MRT Station', code: 'NE10', line: 'North East Line (NEL)', lat: 1.3314, lng: 103.8691, transferStation: 'Sengkang MRT Station (NE16)', transferLine: 'North East Line (NEL) towards HarbourFront' },
  { name: 'Boon Keng MRT Station', code: 'NE9', line: 'North East Line (NEL)', lat: 1.3193, lng: 103.8616, transferStation: 'Sengkang MRT Station (NE16)', transferLine: 'North East Line (NEL) towards HarbourFront' },
  { name: 'Farrer Park MRT Station', code: 'NE8', line: 'North East Line (NEL)', lat: 1.3124, lng: 103.8542, transferStation: 'Sengkang MRT Station (NE16)', transferLine: 'North East Line (NEL) towards HarbourFront' },
  { name: 'Little India MRT Station', code: 'NE7 / DT12', line: 'North East Line (NEL)', lat: 1.3068, lng: 103.8496, transferStation: 'Sengkang MRT Station (NE16)', transferLine: 'North East Line (NEL) towards HarbourFront' },
  { name: 'Dhoby Ghaut MRT Station', code: 'NE6 / NS24 / CC1', line: 'North East Line (NEL)', lat: 1.2993, lng: 103.8458, transferStation: 'Sengkang MRT Station (NE16)', transferLine: 'North East Line (NEL) towards HarbourFront' },
  { name: 'Clarke Quay MRT Station', code: 'NE5', line: 'North East Line (NEL)', lat: 1.2884, lng: 103.8465, transferStation: 'Sengkang MRT Station (NE16)', transferLine: 'North East Line (NEL) towards HarbourFront' },
  { name: 'Chinatown MRT Station', code: 'NE4 / DT19', line: 'North East Line (NEL)', lat: 1.2844, lng: 103.844, transferStation: 'Sengkang MRT Station (NE16)', transferLine: 'North East Line (NEL) towards HarbourFront' },
  { name: 'Outram Park MRT Station', code: 'NE3 / EW16 / TE17', line: 'North East Line (NEL)', lat: 1.2802, lng: 103.8395, transferStation: 'Sengkang MRT Station (NE16)', transferLine: 'North East Line (NEL) towards HarbourFront' },
  { name: 'HarbourFront MRT Station', code: 'NE1 / CC29', line: 'North East Line (NEL)', lat: 1.2653, lng: 103.8215, transferStation: 'Sengkang MRT Station (NE16)', transferLine: 'North East Line (NEL) towards HarbourFront' },
  { name: 'Orchard MRT Station', code: 'NS22 / TE14', line: 'North South Line (NSL)', lat: 1.304, lng: 103.8318, transferStation: 'Dhoby Ghaut MRT Station (NE6 / NS24)', transferLine: 'North South Line (NSL) towards Jurong East' },
  { name: 'Somerset MRT Station', code: 'NS23', line: 'North South Line (NSL)', lat: 1.3003, lng: 103.839, transferStation: 'Dhoby Ghaut MRT Station (NE6 / NS24)', transferLine: 'North South Line (NSL) towards Jurong East' },
  { name: 'City Hall MRT Station', code: 'NS25 / EW13', line: 'North South Line (NSL)', lat: 1.2931, lng: 103.852, transferStation: 'Dhoby Ghaut MRT Station (NE6 / NS24)', transferLine: 'North South Line (NSL) towards Marina South Pier' },
  { name: 'Raffles Place MRT Station', code: 'NS26 / EW14', line: 'North South Line (NSL)', lat: 1.283, lng: 103.8519, transferStation: 'Dhoby Ghaut MRT Station (NE6 / NS24)', transferLine: 'North South Line (NSL) towards Marina South Pier' },
  { name: 'Marina Bay MRT Station', code: 'NS27 / CE2 / TE20', line: 'North South Line (NSL)', lat: 1.2764, lng: 103.8546, transferStation: 'Dhoby Ghaut MRT Station (NE6 / NS24)', transferLine: 'North South Line (NSL) towards Marina South Pier' },
  { name: 'Bayfront MRT Station', code: 'CE1 / DT16', line: 'Downtown Line (DTL)', lat: 1.2819, lng: 103.8591, transferStation: 'Little India MRT Station (NE7 / DT12)', transferLine: 'Downtown Line (DTL) towards Expo' },
  { name: 'Bugis MRT Station', code: 'EW12 / DT14', line: 'Downtown Line (DTL)', lat: 1.3005, lng: 103.856, transferStation: 'Little India MRT Station (NE7 / DT12)', transferLine: 'Downtown Line (DTL) towards Expo' },
  { name: 'Promenade MRT Station', code: 'CC4 / DT15', line: 'Downtown Line (DTL)', lat: 1.2932, lng: 103.8611, transferStation: 'Little India MRT Station (NE7 / DT12)', transferLine: 'Downtown Line (DTL) towards Expo' },
  { name: 'Bishan MRT Station', code: 'NS17 / CC15', line: 'Circle Line (CCL)', lat: 1.3508, lng: 103.8482, transferStation: 'Serangoon MRT Station (NE12 / CC13)', transferLine: 'Circle Line (CCL) towards HarbourFront' },
  { name: 'Ang Mo Kio MRT Station', code: 'NS16', line: 'North South Line (NSL)', lat: 1.37, lng: 103.8495, transferStation: 'Bishan MRT Station (CC15 / NS17)', transferLine: 'North South Line (NSL) towards Jurong East' },
  { name: 'Yishun MRT Station', code: 'NS13', line: 'North South Line (NSL)', lat: 1.4294, lng: 103.835, transferStation: 'Bishan MRT Station (CC15 / NS17)', transferLine: 'North South Line (NSL) towards Jurong East' },
  { name: 'Woodlands MRT Station', code: 'NS9 / TE2', line: 'North South Line (NSL)', lat: 1.4369, lng: 103.7865, transferStation: 'Bishan MRT Station (CC15 / NS17)', transferLine: 'North South Line (NSL) towards Jurong East' },
  { name: 'Paya Lebar MRT Station', code: 'EW8 / CC9', line: 'Circle Line (CCL)', lat: 1.3177, lng: 103.8924, transferStation: 'Serangoon MRT Station (NE12 / CC13)', transferLine: 'Circle Line (CCL) towards Dhoby Ghaut / Marina Bay' },
  { name: 'Tampines MRT Station', code: 'EW2 / DT32', line: 'Downtown Line (DTL)', lat: 1.3533, lng: 103.9452, transferStation: 'MacPherson MRT Station (CC10 / DT26)', transferLine: 'Downtown Line (DTL) towards Expo' },
  { name: 'Changi Airport MRT Station', code: 'CG2', line: 'East West Line Changi Branch', lat: 1.3573, lng: 103.9888, transferStation: 'Cheng Lim Stn Exit B (Bus Stop 67429)', transferLine: 'Bus 110 Express via Tampines Expressway (TPE)' },
  { name: 'Jurong East MRT Station', code: 'NS1 / EW24', line: 'East West Line (EWL)', lat: 1.3331, lng: 103.7422, transferStation: 'Outram Park MRT Station (NE3 / EW16)', transferLine: 'East West Line (EWL) towards Tuas Link' },
  { name: 'Buona Vista MRT Station', code: 'EW21 / CC22', line: 'Circle Line (CCL)', lat: 1.3072, lng: 103.7902, transferStation: 'Serangoon MRT Station (NE12 / CC13)', transferLine: 'Circle Line (CCL) towards HarbourFront' },
  { name: 'Botanic Gardens MRT Station', code: 'CC19 / DT9', line: 'Circle Line (CCL)', lat: 1.3224, lng: 103.8154, transferStation: 'Serangoon MRT Station (NE12 / CC13)', transferLine: 'Circle Line (CCL) towards HarbourFront' },
];

function findClosestStation(lat: number, lng: number): SgStationRef {
  let best = SG_MRT_STATIONS[0];
  let bestDist = Infinity;
  for (const st of SG_MRT_STATIONS) {
    const d = calculateDistanceKm(lat, lng, st.lat, st.lng);
    if (d < bestDist) {
      bestDist = d;
      best = st;
    }
  }
  return best;
}

export function generateDetailedDirections(
  dest: LocationItem,
  routeDataByMode?: Partial<Record<TravelMode, any>>
): Record<TravelMode, ModeDirections> {
  const straightDist = calculateDistanceKm(
    OLA_ORIGIN.latitude,
    OLA_ORIGIN.longitude,
    dest.latitude,
    dest.longitude
  );
  const roadDist = Math.max(0.2, parseFloat((straightDist * 1.32).toFixed(1)));
  const nameLower = (dest.name + ' ' + dest.address).toLowerCase();
  const destRoad = extractRoadFromAddress(dest.address) || dest.name;

  // Known location flags for synchronous initial render before API resolves
  const isSengkangMRT = nameLower.includes('sengkang mrt') || nameLower.includes('compass one');
  const isChangiOrJewel = nameLower.includes('jewel') || nameLower.includes('changi airport');
  const isSKGH =
    nameLower.includes('sengkang general hospital') ||
    nameLower.includes('sengkang hospital') ||
    nameLower.includes('skgh');
  const isWaterway = nameLower.includes('waterway point') || nameLower.includes('punggol');

  const closestStation = findClosestStation(dest.latitude, dest.longitude);

  // --- 1. PUBLIC TRANSPORT (Fallback if routeDataByMode.pt not yet loaded) ---
  let ptTime = Math.max(5, Math.round(roadDist * 2.8 + 6));
  let ptDist = roadDist;
  let ptSummary = `Cheng Lim LRT (SW1) → Sengkang MRT (NE16) → ${closestStation.name} (${closestStation.code})`;
  let ptHighlights = [
    'Board at Cheng Lim LRT Station (SW1)',
    `Alight at ${closestStation.name} (${closestStation.code})`,
  ];
  let ptSteps: DirectionStep[] = [];
  let ptTips =
    'OLA side gate along 70 Anchorvale Crescent connects via sheltered linkway to Cheng Lim LRT Station (SW1).';
  let ptFare = 'Est. ~$1.09 - $2.15 (SimplyGo / EZ-Link)';

  if (isSengkangMRT) {
    ptTime = 5;
    ptDist = 0.9;
    ptSummary = 'Sengkang West LRT from Cheng Lim LRT Station (SW1) to Sengkang MRT Station (NE16)';
    ptHighlights = ['Board at Cheng Lim LRT (SW1)', 'Alight at Sengkang MRT (NE16)'];
    ptSteps = [
      {
        stepNumber: 1,
        instruction: 'Walk from OLA Executive Condominium (70 Anchorvale Crescent) to Cheng Lim LRT Station (SW1)',
        detail: 'Proceed 150 m along Anchorvale Crescent and cross Anchorvale Street to Cheng Lim LRT Station (SW1).',
        distanceOrTime: '2 min (150 m)',
        iconType: 'walk',
        badge: 'Origin Walk',
      },
      {
        stepNumber: 2,
        instruction: 'Board Sengkang West LRT (SW) at Cheng Lim LRT Station (SW1) and alight at Sengkang MRT Station (STC / NE16)',
        detail: 'Ride 1 stop directly from Cheng Lim LRT Station (SW1) and alight at Sengkang MRT Station (STC / NE16).',
        distanceOrTime: '2 min (0.8 km • 1 stop)',
        iconType: 'lrt',
        badge: 'SW: SW1 → NE16',
      },
      {
        stepNumber: 3,
        instruction: `Walk from Sengkang MRT Station (NE16) to ${dest.name} (${destRoad})`,
        detail: `Proceed along Sengkang Square to arrive at ${dest.name}, ${dest.address}.`,
        distanceOrTime: '1 min (90 m)',
        iconType: 'flag',
        badge: 'Destination',
      },
    ];
    ptFare = '$1.09 (SimplyGo / EZ-Link)';
  } else if (isChangiOrJewel) {
    ptTime = 28;
    ptDist = 16.5;
    ptSummary = 'Bus 110 from Cheng Lim Stn Exit B (Bus Stop 67429) to Changi Airport PTB1 (Bus Stop 95029)';
    ptHighlights = ['Board at Cheng Lim Stn Exit B (67429)', 'Express via Tampines Expressway (TPE)'];
    ptSteps = [
      {
        stepNumber: 1,
        instruction: 'Walk from OLA Executive Condominium (70 Anchorvale Crescent) to Cheng Lim Stn Exit B (Bus Stop 67429)',
        detail: 'Proceed 140 m along Anchorvale Crescent onto Anchorvale Street to reach Cheng Lim Stn Exit B (Bus Stop 67429).',
        distanceOrTime: '2 min (140 m)',
        iconType: 'walk',
        badge: 'Origin Walk',
      },
      {
        stepNumber: 2,
        instruction: 'Board Bus 110 at Cheng Lim Stn Exit B (Bus Stop 67429) and alight at Changi Airport PTB1 (Bus Stop 95029)',
        detail: 'Ride Bus 110 along Anchorvale Street and Tampines Expressway (TPE) onto Airport Boulevard and alight at Changi Airport PTB1 (Bus Stop 95029).',
        distanceOrTime: '22 min (16.1 km)',
        iconType: 'bus',
        badge: 'Bus 110: 67429 → 95029',
      },
      {
        stepNumber: 3,
        instruction: `Walk from Changi Airport PTB1 (Bus Stop 95029) to ${dest.name} (${destRoad})`,
        detail: `Proceed along Airport Boulevard to arrive at ${dest.name}, ${dest.address}.`,
        distanceOrTime: '4 min (250 m)',
        iconType: 'flag',
        badge: 'Destination',
      },
    ];
    ptFare = '$1.95 (SimplyGo / EZ-Link)';
  } else if (isSKGH) {
    ptTime = 4;
    ptDist = 0.4;
    ptSummary = 'Direct walk via Anchorvale Crescent & Anchorvale Street to Sengkang General Hospital';
    ptHighlights = ['Start: 70 Anchorvale Crescent', 'End: 110 Sengkang East Way'];
    ptSteps = [
      {
        stepNumber: 1,
        instruction: 'Walk from OLA Executive Condominium (70 Anchorvale Crescent) to Anchorvale Street crossing',
        detail: 'Proceed 120 m along Anchorvale Crescent covered linkway to the signalised pedestrian crossing at Anchorvale Street.',
        distanceOrTime: '2 min (120 m)',
        iconType: 'walk',
        badge: 'Anchorvale Crescent',
      },
      {
        stepNumber: 2,
        instruction: `Walk across Anchorvale Street onto Sengkang East Way to ${dest.name}`,
        detail: `Proceed 250 m along Sengkang East Way to arrive at ${dest.name}, ${dest.address}.`,
        distanceOrTime: '2 min (250 m)',
        iconType: 'flag',
        badge: 'Destination',
      },
    ];
    ptFare = 'Free (Walk)';
  } else if (isWaterway) {
    ptTime = 12;
    ptDist = 2.4;
    ptSummary = 'Cheng Lim LRT (SW1) → Sengkang MRT (NE16) → Punggol MRT (NE17)';
    ptHighlights = ['Board at Cheng Lim LRT (SW1)', 'Alight at Punggol MRT (NE17)'];
    ptSteps = [
      {
        stepNumber: 1,
        instruction: 'Walk from OLA Executive Condominium (70 Anchorvale Crescent) to Cheng Lim LRT Station (SW1)',
        detail: 'Proceed 150 m along Anchorvale Crescent and Anchorvale Street to Cheng Lim LRT Station (SW1).',
        distanceOrTime: '2 min (150 m)',
        iconType: 'walk',
        badge: 'Origin Walk',
      },
      {
        stepNumber: 2,
        instruction: 'Board Sengkang West LRT (SW) at Cheng Lim LRT Station (SW1) and alight at Sengkang MRT Station (NE16)',
        detail: 'Ride 1 stop directly from Cheng Lim LRT Station (SW1) and alight at Sengkang MRT Station (NE16).',
        distanceOrTime: '3 min (0.8 km • 1 stop)',
        iconType: 'lrt',
        badge: 'SW: SW1 → NE16',
      },
      {
        stepNumber: 3,
        instruction: 'Board North East Line (NEL) at Sengkang MRT Station (NE16) and alight at Punggol MRT Station (NE17)',
        detail: 'Ride 1 stop on the North East Line (NEL) from Sengkang MRT Station (NE16) and alight at Punggol MRT Station (NE17).',
        distanceOrTime: '4 min (1.4 km • 1 stop)',
        iconType: 'mrt',
        badge: 'NE: NE16 → NE17',
      },
      {
        stepNumber: 4,
        instruction: `Walk from Punggol MRT Station (NE17) to ${dest.name} (${destRoad})`,
        detail: `Proceed along Punggol Central to arrive at ${dest.name}, ${dest.address}.`,
        distanceOrTime: '3 min (180 m)',
        iconType: 'flag',
        badge: 'Destination',
      },
    ];
    ptFare = '$1.09 (SimplyGo / EZ-Link)';
  } else {
    const requiresTransfer = !closestStation.code.startsWith('NE');
    ptSteps = [
      {
        stepNumber: 1,
        instruction: 'Walk from OLA Executive Condominium (70 Anchorvale Crescent) to Cheng Lim LRT Station (SW1)',
        detail: 'Proceed 150 m along Anchorvale Crescent and Anchorvale Street to Cheng Lim LRT Station (SW1).',
        distanceOrTime: '2 min (150 m)',
        iconType: 'walk',
        badge: 'Origin Walk',
      },
      {
        stepNumber: 2,
        instruction: 'Board Sengkang West LRT (SW) at Cheng Lim LRT Station (SW1) and alight at Sengkang MRT Station (NE16)',
        detail: 'Ride 1 stop from Cheng Lim LRT Station (SW1) and alight at Sengkang MRT Station (NE16).',
        distanceOrTime: '3 min (0.8 km • 1 stop)',
        iconType: 'lrt',
        badge: 'SW: SW1 → NE16',
      },
      ...(requiresTransfer
        ? [
            {
              stepNumber: 3,
              instruction: `Board North East Line (NEL) at Sengkang MRT Station (NE16) and alight at ${closestStation.transferStation}`,
              detail: `Travel on the North East Line (NEL) from Sengkang MRT Station (NE16) and alight at ${closestStation.transferStation} to transfer.`,
              distanceOrTime: `${Math.max(4, Math.round(roadDist * 1.1))} min`,
              iconType: 'mrt' as const,
              badge: 'North East Line',
            },
            {
              stepNumber: 4,
              instruction: `Board ${closestStation.line} at ${closestStation.transferStation} and alight at ${closestStation.name} (${closestStation.code})`,
              detail: `Follow ${closestStation.transferLine} and alight at ${closestStation.name} (${closestStation.code}).`,
              distanceOrTime: `${Math.max(3, Math.round(roadDist * 0.7))} min`,
              iconType: 'mrt' as const,
              badge: closestStation.code,
            },
          ]
        : [
            {
              stepNumber: 3,
              instruction: `Board North East Line (NEL) at Sengkang MRT Station (NE16) and alight at ${closestStation.name} (${closestStation.code})`,
              detail: `Travel directly on the North East Line (NEL) from Sengkang MRT Station (NE16) and alight at ${closestStation.name} (${closestStation.code}).`,
              distanceOrTime: `${Math.max(4, Math.round(roadDist * 1.6))} min`,
              iconType: 'mrt' as const,
              badge: `NE16 → ${closestStation.code}`,
            },
          ]),
      {
        stepNumber: requiresTransfer ? 5 : 4,
        instruction: `Walk from ${closestStation.name} (${closestStation.code}) to ${dest.name} (${destRoad})`,
        detail: `Proceed from ${closestStation.name} (${closestStation.code}) along ${destRoad} to arrive at ${dest.name}${dest.address ? `, ${dest.address}` : ''}.`,
        distanceOrTime: '4 min (300 m)',
        iconType: 'flag',
        badge: 'Destination',
      },
    ];
  }

  // --- 2. CAR / DRIVING (Fallback if routeDataByMode.drive not yet loaded) ---
  const carTime = Math.max(4, Math.round(roadDist * 1.4 + 3));
  const carDist = roadDist;
  const mainHighway = isChangiOrJewel
    ? 'Tampines Expressway (TPE)'
    : dest.latitude < 1.35
    ? 'Tampines Expressway (TPE) & Central Expressway (CTE)'
    : 'Sengkang East Road';
  const carSummary = `Via Anchorvale Street → ${mainHighway} → ${destRoad}`;
  const carHighlights = [`Start: Anchorvale Crescent`, `End: ${destRoad}`];
  const carSteps: DirectionStep[] = [
    {
      stepNumber: 1,
      instruction: 'Depart OLA Executive Condominium (70 Anchorvale Crescent) onto Anchorvale Crescent',
      detail: 'Follow Anchorvale Crescent for 200 m to connect onto Anchorvale Street.',
      distanceOrTime: '1 min (200 m)',
      iconType: 'car',
      badge: 'Anchorvale Crescent',
    },
    {
      stepNumber: 2,
      instruction: `Turn right onto Anchorvale Street towards ${mainHighway}`,
      detail: `Follow Anchorvale Street for 500 m to connect onto ${mainHighway}.`,
      distanceOrTime: '2 min (500 m)',
      iconType: 'car',
      badge: 'Anchorvale Street',
    },
    {
      stepNumber: 3,
      instruction: `Continue along ${mainHighway} and turn onto ${destRoad}`,
      detail: `Follow ${mainHighway} for ${Math.max(0.5, parseFloat((roadDist - 0.7).toFixed(1)))} km to connect onto ${destRoad}.`,
      distanceOrTime: `${Math.max(1, carTime - 3)} min`,
      iconType: 'car',
      badge: destRoad,
    },
    {
      stepNumber: 4,
      instruction: `Arrive at ${dest.name} on ${destRoad}`,
      detail: `Destination reached at ${dest.name}${dest.address ? `, ${dest.address}` : ''}.`,
      distanceOrTime: 'Arrival',
      iconType: 'flag',
      badge: 'Destination',
    },
  ];

  // --- 3. BIKE / CYCLING (Fallback if routeDataByMode.cycle not yet loaded) ---
  const bikeTime = Math.max(3, Math.round(roadDist * 3.4));
  const bikeDist = Math.max(0.2, parseFloat((straightDist * 1.15).toFixed(1)));
  const bikeSummary = `Via Anchorvale Crescent → Anchorvale Street → ${destRoad}`;
  const bikeHighlights = ['Start: Anchorvale Crescent', `End: ${destRoad}`];
  const bikeSteps: DirectionStep[] = [
    {
      stepNumber: 1,
      instruction: 'Depart OLA Executive Condominium (70 Anchorvale Crescent) onto Anchorvale Crescent',
      detail: 'Follow Anchorvale Crescent cycling path for 150 m to connect onto Anchorvale Street.',
      distanceOrTime: '1 min (150 m)',
      iconType: 'bike',
      badge: 'Anchorvale Crescent',
    },
    {
      stepNumber: 2,
      instruction: `Cycle along Anchorvale Street and connect onto ${destRoad}`,
      detail: `Follow Anchorvale Street and Punggol River Park Connector for ${Math.max(0.2, parseFloat((bikeDist - 0.15).toFixed(1)))} km to connect onto ${destRoad}.`,
      distanceOrTime: `${Math.max(1, bikeTime - 2)} min`,
      iconType: 'bike',
      badge: destRoad,
    },
    {
      stepNumber: 3,
      instruction: `Arrive at ${dest.name} on ${destRoad}`,
      detail: `Destination reached at ${dest.name}${dest.address ? `, ${dest.address}` : ''}.`,
      distanceOrTime: 'Arrival',
      iconType: 'flag',
      badge: 'Destination',
    },
  ];

  // --- 4. WALKING (Fallback if routeDataByMode.walk not yet loaded) ---
  const walkTime = Math.max(3, Math.round(roadDist * 12.0));
  const walkDist = roadDist;
  const walkSummary = `Via Anchorvale Crescent → Anchorvale Street → ${destRoad}`;
  const walkHighlights = ['Start: Anchorvale Crescent', `End: ${destRoad}`];
  const walkSteps: DirectionStep[] = [
    {
      stepNumber: 1,
      instruction: 'Depart OLA Executive Condominium (70 Anchorvale Crescent) onto Anchorvale Crescent',
      detail: 'Follow Anchorvale Crescent walkway for 120 m to connect onto Anchorvale Street.',
      distanceOrTime: '2 min (120 m)',
      iconType: 'walk',
      badge: 'Anchorvale Crescent',
    },
    {
      stepNumber: 2,
      instruction: `Walk along Anchorvale Street and connect onto ${destRoad}`,
      detail: `Follow Anchorvale Street pedestrian walkway for ${Math.max(0.2, parseFloat((walkDist - 0.12).toFixed(1)))} km to connect onto ${destRoad}.`,
      distanceOrTime: `${Math.max(1, walkTime - 2)} min`,
      iconType: 'walk',
      badge: destRoad,
    },
    {
      stepNumber: 3,
      instruction: `Arrive at ${dest.name} on ${destRoad}`,
      detail: `Destination reached at ${dest.name}${dest.address ? `, ${dest.address}` : ''}.`,
      distanceOrTime: 'Arrival',
      iconType: 'flag',
      badge: 'Destination',
    },
  ];

  const fallbackMap: Record<TravelMode, ModeDirections> = {
    pt: {
      mode: 'pt',
      modeLabel: 'Public Transport',
      timeMins: ptTime,
      distanceKm: ptDist,
      summary: ptSummary,
      highlights: ptHighlights,
      steps: ptSteps,
      residentTips: ptTips,
      fareOrCost: ptFare,
    },
    drive: {
      mode: 'drive',
      modeLabel: 'Car / Taxi',
      timeMins: carTime,
      distanceKm: carDist,
      summary: carSummary,
      highlights: carHighlights,
      steps: carSteps,
      residentTips: `Route from OLA Executive Condominium (70 Anchorvale Crescent) via Anchorvale Street to ${dest.name} (${destRoad}).`,
      fareOrCost: 'ERP & carpark rates apply',
    },
    cycle: {
      mode: 'cycle',
      modeLabel: 'Bike / Cycling',
      timeMins: bikeTime,
      distanceKm: bikeDist,
      summary: bikeSummary,
      highlights: bikeHighlights,
      steps: bikeSteps,
      residentTips: `Cycle from OLA Executive Condominium (70 Anchorvale Crescent) via Anchorvale Street to ${dest.name} (${destRoad}).`,
      fareOrCost: 'Zero emissions',
    },
    walk: {
      mode: 'walk',
      modeLabel: 'Walking',
      timeMins: walkTime,
      distanceKm: walkDist,
      summary: walkSummary,
      highlights: walkHighlights,
      steps: walkSteps,
      residentTips: `Walk from OLA Executive Condominium (70 Anchorvale Crescent) via Anchorvale Street to ${dest.name} (${destRoad}).`,
      fareOrCost: 'Free & healthy',
    },
  };

  // Override with live backend API data from /api/onemap-route whenever available
  const apiPt = routeDataByMode?.pt
    ? buildPublicTransportFromApi(dest, routeDataByMode.pt)
    : null;
  const apiDrive = routeDataByMode?.drive
    ? buildStreetRouteFromApi('drive', dest, routeDataByMode.drive)
    : null;
  const apiCycle = routeDataByMode?.cycle
    ? buildStreetRouteFromApi('cycle', dest, routeDataByMode.cycle)
    : null;
  const apiWalk = routeDataByMode?.walk
    ? buildStreetRouteFromApi('walk', dest, routeDataByMode.walk)
    : null;

  return {
    pt: apiPt || fallbackMap.pt,
    drive: apiDrive || fallbackMap.drive,
    cycle: apiCycle || fallbackMap.cycle,
    walk: apiWalk || fallbackMap.walk,
  };
}
