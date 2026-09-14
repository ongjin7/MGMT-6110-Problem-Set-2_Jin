export interface RouteStop {
  code: string;
  name: string;
  isCurrent?: boolean;
  isInterchange?: boolean;
  interchangeLines?: string[];
  landmark?: string;
}

export interface StationRouteDetail {
  stationCode: string;
  stationName: string;
  lineName: string;
  type: 'LRT' | 'MRT' | 'MRT/LRT';
  badgeColor: string;
  distanceFromOla: string;
  walkTimeFromOla: string;
  accessNotes: string;
  loopOrDirection: string;
  routeStops: RouteStop[];
  alternateLineStops?: {
    lineTitle: string;
    stops: RouteStop[];
  };
  keyInterchanges: {
    station: string;
    line: string;
    travelTime: string;
  }[];
  travelTimes: {
    destination: string;
    time: string;
    details: string;
  }[];
  operatingInfo: {
    firstTrain: string;
    lastTrain: string;
    frequency: string;
    platforms: string;
  };
  residentTips: string;
}

export const STATION_ROUTE_DETAILS: Record<string, StationRouteDetail> = {
  'SW1': {
    stationCode: 'SW1',
    stationName: 'Cheng Lim LRT',
    lineName: 'Sengkang West LRT Loop',
    type: 'LRT',
    badgeColor: 'bg-teal-700 text-white',
    distanceFromOla: '180m from OLA EC',
    walkTimeFromOla: '2–3 mins walk',
    accessNotes: 'Direct sheltered linkway from OLA side gate along Anchorvale Crescent. Zero road crossings required with full barrier-free ramp access.',
    loopOrDirection: 'Sengkang West LRT Loop • Bi-directional service (Platform 1 Route A Clockwise / Platform 2 Route B Counter-Clockwise)',
    routeStops: [
      { code: 'STC / NE16', name: 'Sengkang', isInterchange: true, interchangeLines: ['North East Line', 'East Loop', 'Bus Interchange'] },
      { code: 'SW1', name: 'Cheng Lim', isCurrent: true, landmark: 'Direct outside OLA EC / SKGH' },
      { code: 'SW2', name: 'Farmway', landmark: 'Sengkang Sports Centre' },
      { code: 'SW3', name: 'Kupang', landmark: 'Sungei Punggol' },
      { code: 'SW4', name: 'Thanggam', landmark: 'Jalan Kayu Eateries' },
      { code: 'SW5', name: 'Fernvale', isInterchange: false, landmark: 'The Seletar Mall' },
      { code: 'SW6', name: 'Layar', landmark: 'Anchorvale CC' },
      { code: 'SW7', name: 'Tongkang', landmark: 'Nan Chiau Primary' },
      { code: 'SW8', name: 'Renjong', landmark: 'Sengkang South' },
    ],
    keyInterchanges: [
      { station: 'Sengkang (STC / NE16)', line: 'North East Line (NEL)', travelTime: '1 stop (~2 mins)' },
      { station: 'Sengkang General Hospital', line: 'Overhead Link Bridge', travelTime: 'Direct 2-min walk' },
      { station: 'Fernvale (SW5)', line: 'The Seletar Mall / Greenwich V', travelTime: '4 stops (~7 mins)' },
    ],
    travelTimes: [
      { destination: 'Sengkang MRT / Compass One', time: '2 mins', details: '1 stop via Route B' },
      { destination: 'Sengkang General Hospital (SKGH)', time: '2 mins', details: 'Sheltered overhead bridge link' },
      { destination: 'The Seletar Mall (Fernvale)', time: '7 mins', details: '4 stops via Route B' },
      { destination: 'Dhoby Ghaut / Orchard (via NEL)', time: '25 mins', details: '1 stop to Sengkang, then 9 MRT stops' },
    ],
    operatingInfo: {
      firstTrain: '05:34 AM (Route B to Sengkang) / 05:31 AM (Route A)',
      lastTrain: '00:37 AM (Daily)',
      frequency: 'Peak: 2–3 mins • Off-Peak: 4–5 mins',
      platforms: 'Platform 1 (Route A Clockwise via Renjong) • Platform 2 (Route B Counter-Clockwise via Farmway)',
    },
    residentTips: 'OLA residents heading to Sengkang MRT / Compass One should take Platform 1 / Route A for a rapid 1-stop direct ride (under 2 minutes) into the town centre.',
  },

  'NE16 / STC': {
    stationCode: 'NE16 / STC',
    stationName: 'Sengkang MRT / LRT & Compass One',
    lineName: 'North East Line (NEL) & Sengkang LRT Interchange',
    type: 'MRT/LRT',
    badgeColor: 'bg-purple-800 text-white',
    distanceFromOla: '780m from OLA EC',
    walkTimeFromOla: '9–10 mins walk (or 1 LRT stop from SW1)',
    accessNotes: '1 stop on LRT from Cheng Lim (SW1), direct express bus (Bus 110/43 for 2 stops), or a sheltered 9-min stroll via Sengkang Sculpture Park and Compass One.',
    loopOrDirection: 'Major Multi-Modal Rail & Bus Interchange • North East Line (Purple) + West & East LRT Loops + Sengkang Bus Interchange',
    routeStops: [
      { code: 'NE17', name: 'Punggol', isInterchange: true, interchangeLines: ['Punggol LRT', 'Future Coast Line'] },
      { code: 'NE16 / STC', name: 'Sengkang', isCurrent: true, isInterchange: true, interchangeLines: ['LRT West & East Loops', 'Compass One', 'Bus Hub'] },
      { code: 'NE15', name: 'Buangkok', landmark: 'Sengkang Grand Mall' },
      { code: 'NE14', name: 'Hougang', isInterchange: true, interchangeLines: ['Future Cross Island Line (CRL)'] },
      { code: 'NE13', name: 'Kovan', landmark: 'Heartland Mall' },
      { code: 'NE12', name: 'Serangoon', isInterchange: true, interchangeLines: ['Circle Line (CCL)', 'NEX Mall'] },
      { code: 'NE11', name: 'Woodleigh', landmark: 'The Woodleigh Mall' },
      { code: 'NE10', name: 'Potong Pasir', landmark: 'The Poiz Centre' },
      { code: 'NE9', name: 'Boon Keng', landmark: 'Bendemeer' },
      { code: 'NE8', name: 'Farrer Park', landmark: 'City Square Mall' },
      { code: 'NE7', name: 'Little India', isInterchange: true, interchangeLines: ['Downtown Line (DTL)'] },
      { code: 'NE6', name: 'Dhoby Ghaut', isInterchange: true, interchangeLines: ['North South Line (NSL)', 'Circle Line (CCL)', 'Plaza Singapura'] },
      { code: 'NE5', name: 'Clarke Quay', landmark: 'Riverside / CBD' },
      { code: 'NE4', name: 'Chinatown', isInterchange: true, interchangeLines: ['Downtown Line (DTL)'] },
      { code: 'NE3', name: 'Outram Park', isInterchange: true, interchangeLines: ['East West Line (EWL)', 'Thomson-East Coast Line (TEL)'] },
      { code: 'NE1', name: 'HarbourFront', isInterchange: true, interchangeLines: ['Circle Line (CCL)', 'VivoCity / Sentosa Express'] },
    ],
    alternateLineStops: {
      lineTitle: 'Sengkang LRT West & East Loops (STC)',
      stops: [
        { code: 'STC', name: 'Sengkang', isCurrent: true, isInterchange: true },
        { code: 'SW1', name: 'Cheng Lim (OLA)', landmark: 'Outside OLA EC' },
        { code: 'SW2', name: 'Farmway', landmark: 'Sports Centre' },
        { code: 'SE1', name: 'Compassvale', landmark: 'East Way' },
        { code: 'SE2', name: 'Rumbia', landmark: 'Rivervale Mall' },
        { code: 'SE4', name: 'Kangkar', landmark: 'Rivervale Plaza' },
      ],
    },
    keyInterchanges: [
      { station: 'Serangoon (NE12 / CC13)', line: 'Circle Line (CCL) • Direct to Bishan, Botanic Gardens, One-North', travelTime: '4 stops (11 mins)' },
      { station: 'Little India (NE7 / DT12)', line: 'Downtown Line (DTL) • Direct to Bugis, Marina Bay Sands', travelTime: '8 stops (17 mins)' },
      { station: 'Dhoby Ghaut (NE6 / NS24 / CC1)', line: 'North South Line & Circle Line • Orchard Shopping Belt', travelTime: '9 stops (21 mins)' },
      { station: 'Outram Park (NE3 / EW16 / TE17)', line: 'East West Line & Thomson-East Coast Line', travelTime: '11 stops (26 mins)' },
      { station: 'HarbourFront (NE1 / CC29)', line: 'Circle Line • Sentosa Gateway & VivoCity', travelTime: '12 stops (32 mins)' },
    ],
    travelTimes: [
      { destination: 'Serangoon MRT (Circle Line)', time: '11 mins', details: '4 stops on NEL' },
      { destination: 'Little India (Downtown Line)', time: '17 mins', details: '8 stops on NEL' },
      { destination: 'Dhoby Ghaut / Orchard Belt', time: '21 mins', details: '9 stops on NEL' },
      { destination: 'Chinatown / CBD Financial District', time: '24 mins', details: '10 stops on NEL' },
      { destination: 'Outram Park (TEL / EWL)', time: '26 mins', details: '11 stops on NEL' },
      { destination: 'HarbourFront / Sentosa', time: '32 mins', details: '12 stops on NEL' },
    ],
    operatingInfo: {
      firstTrain: '05:45 AM (Southbound to HarbourFront) • 06:05 AM (Northbound to Punggol)',
      lastTrain: '23:44 PM (to HarbourFront) • 00:39 AM (to Punggol)',
      frequency: 'Peak: 2–3 mins • Off-Peak: 4–5 mins',
      platforms: 'Level 2 LRT Concourse (Platform A & B) • Level B1 MRT Platforms A & B (Island Platform)',
    },
    residentTips: 'Sengkang station seamlessly connects directly inside Compass One shopping mall and the air-conditioned Sengkang Bus Interchange. Express bus 110 at berth B3 offers direct, non-stop expressway express to Jewel Changi Airport in 22 mins.',
  },

  'SW2': {
    stationCode: 'SW2',
    stationName: 'Farmway LRT',
    lineName: 'Sengkang West LRT Loop',
    type: 'LRT',
    badgeColor: 'bg-teal-700 text-white',
    distanceFromOla: '450m from OLA EC',
    walkTimeFromOla: '5–6 mins walk',
    accessNotes: 'Short 450m walk west along Anchorvale Crescent. Stroller and wheelchair accessible along smooth park-side footpaths.',
    loopOrDirection: 'Sengkang West LRT Loop • Platform 1 (Route A Clockwise via Fernvale) / Platform 2 (Route B via Cheng Lim to Sengkang)',
    routeStops: [
      { code: 'STC / NE16', name: 'Sengkang', isInterchange: true, interchangeLines: ['North East Line', 'East Loop', 'Bus Interchange'] },
      { code: 'SW1', name: 'Cheng Lim', landmark: 'Outside OLA EC / SKGH' },
      { code: 'SW2', name: 'Farmway', isCurrent: true, landmark: 'Sengkang Sports Centre & Swimming Complex' },
      { code: 'SW3', name: 'Kupang', landmark: 'Sungei Punggol / PCN' },
      { code: 'SW4', name: 'Thanggam', landmark: 'Jalan Kayu Heritage Food' },
      { code: 'SW5', name: 'Fernvale', landmark: 'The Seletar Mall' },
      { code: 'SW6', name: 'Layar', landmark: 'Anchorvale CC' },
      { code: 'SW7', name: 'Tongkang', landmark: 'Nan Chiau Primary' },
      { code: 'SW8', name: 'Renjong', landmark: 'Sengkang South' },
    ],
    keyInterchanges: [
      { station: 'Sengkang (STC / NE16)', line: 'North East Line (NEL)', travelTime: '2 stops (~4 mins via SW1)' },
      { station: 'Cheng Lim (SW1)', line: 'OLA EC / Sengkang General Hospital', travelTime: '1 stop (~2 mins)' },
      { station: 'Fernvale (SW5)', line: 'The Seletar Mall', travelTime: '3 stops (~5 mins via Kupang)' },
    ],
    travelTimes: [
      { destination: 'Sengkang Sports Centre & Swimming Pools', time: '1 min', details: 'Immediate sheltered doorstep connection' },
      { destination: 'Sengkang Riverside Park & Floating Wetland', time: '3 mins', details: 'Direct stroll across Sungei Punggol' },
      { destination: 'Cheng Lim (SW1 - OLA EC)', time: '2 mins', details: '1 stop via Route A' },
      { destination: 'Sengkang MRT / Compass One', time: '4 mins', details: '2 stops via SW1' },
      { destination: 'The Seletar Mall (Fernvale)', time: '5 mins', details: '3 stops via Route B' },
    ],
    operatingInfo: {
      firstTrain: '05:36 AM (Route B to Sengkang via SW1) • 05:32 AM (Route A)',
      lastTrain: '00:35 AM (Daily)',
      frequency: 'Peak: 2–3 mins • Off-Peak: 4–5 mins',
      platforms: 'Platform 1 (Route A Clockwise) • Platform 2 (Route B Counter-Clockwise)',
    },
    residentTips: 'Farmway is the recreation gateway for OLA residents. The station has direct sheltered overhead access into the Sengkang Swimming Complex, stadium, sports halls, and Anchorvale Community Club.',
  },

  'SE1': {
    stationCode: 'SE1',
    stationName: 'Compassvale LRT',
    lineName: 'Sengkang East LRT Loop',
    type: 'LRT',
    badgeColor: 'bg-teal-700 text-white',
    distanceFromOla: '850m from OLA EC',
    walkTimeFromOla: '10–11 mins walk',
    accessNotes: 'East of Sengkang Central across Compassvale Road. Accessible via pedestrian crossings along Compassvale Drive or 1 LRT stop from Sengkang STC.',
    loopOrDirection: 'Sengkang East LRT Loop • Route C (Clockwise via Rumbia) & Route D (Counter-Clockwise via Ranggung)',
    routeStops: [
      { code: 'STC / NE16', name: 'Sengkang', isInterchange: true, interchangeLines: ['North East Line', 'West Loop', 'Bus Interchange'] },
      { code: 'SE1', name: 'Compassvale', isCurrent: true, landmark: 'Compassvale Primary / Sengkang East Way' },
      { code: 'SE2', name: 'Rumbia', landmark: 'Rivervale Mall' },
      { code: 'SE3', name: 'Bakau', landmark: 'Compassvale Secondary' },
      { code: 'SE4', name: 'Kangkar', landmark: 'Rivervale Plaza' },
      { code: 'SE5', name: 'Ranggung', landmark: 'Punggol Park Connector' },
    ],
    keyInterchanges: [
      { station: 'Sengkang (STC / NE16)', line: 'North East Line (NEL) & West Loop', travelTime: '1 stop (~2 mins)' },
      { station: 'Rumbia (SE2)', line: 'Rivervale Mall', travelTime: '1 stop (~2 mins)' },
      { station: 'Kangkar (SE4)', line: 'Rivervale Plaza', travelTime: '3 stops (~6 mins)' },
    ],
    travelTimes: [
      { destination: 'Sengkang MRT / Compass One', time: '2 mins', details: '1 stop via Route D' },
      { destination: 'Rivervale Mall (Rumbia SE2)', time: '2 mins', details: '1 stop via Route C' },
      { destination: 'Rivervale Plaza (Kangkar SE4)', time: '6 mins', details: '3 stops via Route C' },
      { destination: 'Compassvale Primary & Secondary', time: '3 mins', details: 'Direct pedestrian footpath' },
    ],
    operatingInfo: {
      firstTrain: '05:30 AM (Route C) • 05:32 AM (Route D)',
      lastTrain: '00:30 AM (Daily)',
      frequency: 'Peak: 2–3 mins • Off-Peak: 4–5 mins',
      platforms: 'Platform 1 (Route C Clockwise) • Platform 2 (Route D Counter-Clockwise)',
    },
    residentTips: 'Compassvale LRT provides rapid connectivity to the mature amenities of Sengkang East, including Rivervale Mall (Rumbia) and Rivervale Plaza (Kangkar wet market and food centres).',
  },
};
