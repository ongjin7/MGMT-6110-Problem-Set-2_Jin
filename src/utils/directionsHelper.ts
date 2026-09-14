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

export function generateDetailedDirections(
  dest: LocationItem
): Record<TravelMode, ModeDirections> {
  const straightDist = calculateDistanceKm(
    OLA_ORIGIN.latitude,
    OLA_ORIGIN.longitude,
    dest.latitude,
    dest.longitude
  );
  const roadDist = parseFloat((straightDist * 1.32).toFixed(1));
  const nameLower = (dest.name + ' ' + dest.address).toLowerCase();

  // Known location flags
  const isSengkangMRT = nameLower.includes('sengkang mrt') || nameLower.includes('compass one');
  const isChangiOrJewel = nameLower.includes('jewel') || nameLower.includes('changi airport');
  const isSKGH = nameLower.includes('sengkang general hospital') || nameLower.includes('sengkang hospital') || nameLower.includes('skgh');
  const isWaterway = nameLower.includes('waterway point') || nameLower.includes('punggol');
  const isOrchard = nameLower.includes('orchard') || nameLower.includes('somerset');
  const isCBD = nameLower.includes('raffles place') || nameLower.includes('marina bay') || nameLower.includes('tanjong pagar') || nameLower.includes('shenton');

  // --- 1. PUBLIC TRANSPORT ---
  let ptTime = Math.max(5, Math.round(roadDist * 2.8 + 6));
  let ptDist = roadDist;
  let ptSummary = 'Cheng Lim LRT / Bus to MRT North East Line (NEL)';
  let ptHighlights = ['Cheng Lim LRT (SW1) 150m away', 'Direct sheltered linkways'];
  let ptSteps: DirectionStep[] = [];
  let ptTips = 'OLA side gate along Anchorvale Crescent offers the quickest sheltered access to Cheng Lim LRT.';
  let ptFare = 'Est. ~$1.09 - $2.15 (SimplyGo / EZ-Link)';

  if (isSengkangMRT) {
    ptTime = 5;
    ptDist = 0.9;
    ptSummary = 'Sengkang West LRT (1 stop) or sheltered scenic linkway';
    ptHighlights = ['1 stop on LRT (~2 mins ride)', 'Direct sheltered access to Compass One'];
    ptSteps = [
      {
        stepNumber: 1,
        instruction: 'Walk 150m from OLA side gate to Cheng Lim LRT Station (SW1)',
        detail: 'Cross the sheltered pedestrian crossing on Anchorvale Street.',
        distanceOrTime: '2 mins (150 m)',
        iconType: 'walk',
        badge: 'Sheltered',
      },
      {
        stepNumber: 2,
        instruction: 'Board Sengkang West LRT towards Sengkang Town Centre',
        detail: 'Platform 1 (via Compassvale). Runs every 3–4 minutes during peak hours.',
        distanceOrTime: '2 mins (1 stop)',
        iconType: 'lrt',
        badge: 'SW1 → NE16/STC',
      },
      {
        stepNumber: 3,
        instruction: 'Alight at Sengkang Town Centre Station (SW0 / NE16)',
        detail: 'Direct seamless connection into Compass One Mall and Sengkang MRT concourse.',
        distanceOrTime: '1 min',
        iconType: 'flag',
        badge: 'Arrival',
      },
    ];
    ptTips = 'Alternative: On cool days, a gentle 8-minute sheltered walk through Sengkang General Hospital linkway is often just as quick as waiting for the LRT!';
    ptFare = '~$0.99 (LRT fare)';
  } else if (isChangiOrJewel) {
    ptTime = 28;
    ptDist = 16.5;
    ptSummary = 'Direct Bus 110 outside OLA straight into Jewel & Changi Airport';
    ptHighlights = ['No train transfers required', 'Express route via Tampines Expressway (TPE)'];
    ptSteps = [
      {
        stepNumber: 1,
        instruction: 'Walk 140m to Bus Stop 67429 (Cheng Lim Stn Exit B) on Anchorvale St',
        detail: 'Directly across the road from OLA main entrance.',
        distanceOrTime: '2 mins (140 m)',
        iconType: 'walk',
        badge: 'Outside OLA',
      },
      {
        stepNumber: 2,
        instruction: 'Board SBS Transit Bus 110 towards Changi Airport',
        detail: 'Bus 110 enters TPE Expressway immediately and travels express to Airport Boulevard.',
        distanceOrTime: '22 mins (6 express stops)',
        iconType: 'bus',
        badge: 'Bus 110 Express',
      },
      {
        stepNumber: 3,
        instruction: 'Alight directly at Jewel Changi Airport / Terminal 1 Basement Bus Bay',
        detail: 'Step into Jewel Canopy Park, retail atrium, and Terminal 1 check-in.',
        distanceOrTime: '4 mins walk',
        iconType: 'flag',
        badge: 'Jewel Atrium',
      },
    ];
    ptTips = 'Bus 110 is a resident favourite: highly reliable, wheelchair accessible with dedicated luggage racks for holiday travellers!';
    ptFare = '~$1.95 (SimplyGo / contactless)';
  } else if (isSKGH) {
    ptTime = 3;
    ptDist = 0.4;
    ptSummary = 'Direct sheltered linkway walk across Anchorvale Street';
    ptHighlights = ['100% weather-protected linkway', 'Under 4 minutes door-to-door'];
    ptSteps = [
      {
        stepNumber: 1,
        instruction: 'Exit OLA pedestrian gate onto Anchorvale Crescent',
        detail: 'Follow the covered walkway towards Anchorvale Street.',
        distanceOrTime: '1 min (80 m)',
        iconType: 'walk',
        badge: 'Sheltered',
      },
      {
        stepNumber: 2,
        instruction: 'Cross at the signalised pedestrian linkway to Sengkang General Hospital',
        detail: 'Enter via Medical Centre Tower A or Emergency/Inpatient building.',
        distanceOrTime: '2 mins (250 m)',
        iconType: 'walk',
        badge: 'Hospital Campus',
      },
    ];
    ptTips = 'Fully wheelchair and stroller friendly with signalised pedestrian crossings and continuous shelter.';
    ptFare = 'Free (Walk)';
  } else if (isWaterway) {
    ptTime = 12;
    ptDist = 2.4;
    ptSummary = 'Cheng Lim LRT to Sengkang MRT, then 1 stop to Punggol MRT';
    ptHighlights = ['1 stop on North East Line', 'Direct indoor bridge to Waterway Point'];
    ptSteps = [
      {
        stepNumber: 1,
        instruction: 'Walk 150m to Cheng Lim LRT (SW1) and take LRT to Sengkang Station',
        detail: 'Sengkang West loop (1 stop, 2 mins).',
        distanceOrTime: '4 mins',
        iconType: 'lrt',
        badge: 'LRT SW1',
      },
      {
        stepNumber: 2,
        instruction: 'Transfer to North East Line (NEL) Northbound towards Punggol',
        detail: 'Board train at Platform B towards Punggol terminal.',
        distanceOrTime: '3 mins (1 stop)',
        iconType: 'mrt',
        badge: 'NEL (Purple)',
      },
      {
        stepNumber: 3,
        instruction: 'Alight at Punggol MRT (NE17) - Exit A',
        detail: 'Direct basement and bridge entrances into Waterway Point East/West wings.',
        distanceOrTime: '2 mins',
        iconType: 'flag',
        badge: 'Arrival',
      },
    ];
    ptTips = 'Alternative: Bus 43 or 43M from Sengkang East Road also connects directly into Punggol Central.';
    ptFare = '~$1.09 (SimplyGo)';
  } else {
    // Dynamic Singapore Public Transport steps
    ptSteps = [
      {
        stepNumber: 1,
        instruction: 'Walk 150m from OLA side gate to Cheng Lim LRT Station (SW1)',
        detail: 'Sheltered walkway via Anchorvale Crescent.',
        distanceOrTime: '2 mins (150 m)',
        iconType: 'walk',
        badge: 'OLA Gate',
      },
      {
        stepNumber: 2,
        instruction: 'Board Sengkang West LRT to Sengkang Town Centre (SW0 / NE16)',
        detail: 'Quick 1-stop transfer to the North East Line (NEL).',
        distanceOrTime: '3 mins (1 stop)',
        iconType: 'lrt',
        badge: 'LRT SW1 → Sengkang',
      },
      {
        stepNumber: 3,
        instruction: 'Board North East Line (Purple Line) towards ' + (dest.latitude < 1.39 ? 'HarbourFront' : 'Punggol'),
        detail: isOrchard
          ? 'Alight at Dhoby Ghaut (NE6), transfer to North South Line (Red) 1 stop to Orchard (NS22).'
          : isCBD
          ? 'Direct train to Chinatown / Outram Park or transfer to Downtown Line at Little India.'
          : `Travel on the MRT network towards ${dest.name}. Connect via Circle Line at Serangoon (NE12) if needed.`,
        distanceOrTime: `${Math.round(roadDist * 1.8 + 4)} mins`,
        iconType: 'mrt',
        badge: 'MRT Network',
      },
      {
        stepNumber: 4,
        instruction: `Alight at the nearest station and walk to ${dest.name}`,
        detail: `Follow station directional signs towards ${dest.address || dest.name}.`,
        distanceOrTime: '3–5 mins',
        iconType: 'flag',
        badge: 'Destination',
      },
    ];
  }

  // --- 2. CAR / DRIVING ---
  let carTime = Math.max(4, Math.round(roadDist * 1.4 + 3));
  let carDist = roadDist;
  let carSummary = 'Via Anchorvale St & TPE Expressway';
  let carHighlights = ['Immediate access to TPE Exit 10', 'Direct highway arterial corridors'];
  let carSteps: DirectionStep[] = [
    {
      stepNumber: 1,
      instruction: 'Exit OLA EC basement or surface carpark onto Anchorvale Crescent',
      detail: 'Turn right at the exit towards Anchorvale Street.',
      distanceOrTime: '1 min (200 m)',
      iconType: 'car',
      badge: 'OLA Exit',
    },
    {
      stepNumber: 2,
      instruction: 'Turn right onto Anchorvale Street towards Sengkang East Road',
      detail: 'Follow road signs towards Tampines Expressway (TPE).',
      distanceOrTime: '2 mins (500 m)',
      iconType: 'car',
      badge: 'Anchorvale St',
    },
    {
      stepNumber: 3,
      instruction: isChangiOrJewel
        ? 'Merge onto Tampines Expressway (TPE) Eastbound towards Changi Airport / PIE'
        : dest.latitude < 1.35
        ? 'Merge onto TPE (Westbound) and take CTE exit towards City / CBD / SLE'
        : 'Follow Sengkang East Road / Punggol Road towards destination corridor',
      detail: isChangiOrJewel
        ? 'Follow TPE for 14 km straight to Airport Boulevard. Enter Jewel Carpark B2–B5.'
        : dest.latitude < 1.35
        ? 'Cruising on Central Expressway (CTE). Watch for peak-hour electronic road pricing (ERP).'
        : `Continue along the arterial roads towards ${dest.name}.`,
      distanceOrTime: `${carTime - 3} mins`,
      iconType: 'car',
      badge: 'Expressway',
    },
    {
      stepNumber: 4,
      instruction: `Arrive at ${dest.name} parking facility / passenger drop-off`,
      detail: dest.address ? `Destination: ${dest.address}` : 'Follow destination carpark signage.',
      distanceOrTime: '1 min',
      iconType: 'flag',
      badge: 'Arrival',
    },
  ];
  let carTips = 'TPE Exit 10 on Anchorvale Street gives OLA residents one of the fastest expressway on-ramps in Sengkang!';

  if (isSengkangMRT) {
    carTime = 4;
    carDist = 1.0;
    carSummary = 'Anchorvale Cres → Anchorvale St → Sengkang Square';
    carHighlights = ['Under 5 minutes drive', 'Carpark available at Compass One'];
    carSteps = [
      {
        stepNumber: 1,
        instruction: 'Exit OLA EC carpark onto Anchorvale Crescent',
        detail: 'Head towards Anchorvale Street.',
        distanceOrTime: '1 min (200 m)',
        iconType: 'car',
        badge: 'Start',
      },
      {
        stepNumber: 2,
        instruction: 'Turn onto Anchorvale Street and continue onto Compassvale Road',
        detail: 'Follow road signs to Sengkang Town Centre.',
        distanceOrTime: '2 mins (600 m)',
        iconType: 'car',
        badge: 'Town Centre',
      },
      {
        stepNumber: 3,
        instruction: 'Turn into Compass One basement carpark or Sengkang Square drop-off',
        detail: 'Ample basement parking with EV charging stations.',
        distanceOrTime: '1 min',
        iconType: 'flag',
        badge: 'Carpark',
      },
    ];
    carTips = 'Compass One carpark offers 10 minutes grace period for passenger pick-up and drop-off.';
  }

  // --- 3. BIKE / CYCLING ---
  let bikeTime = Math.max(3, Math.round(roadDist * 3.4));
  let bikeDist = parseFloat((straightDist * 1.15).toFixed(1));
  let bikeSummary = 'Via Punggol River Park Connector Network (PCN)';
  let bikeHighlights = ['Dedicated off-road cycling paths', 'Scenic waterfront green corridor'];
  let bikeSteps: DirectionStep[] = [
    {
      stepNumber: 1,
      instruction: 'Exit OLA EC gate and join the adjacent Punggol River Park Connector (PCN)',
      detail: 'Paved, wide cycling path directly behind Anchorvale Crescent.',
      distanceOrTime: '1 min (100 m)',
      iconType: 'bike',
      badge: 'PCN Entry',
    },
    {
      stepNumber: 2,
      instruction: isWaterway
        ? 'Ride North along Sungei Punggol PCN towards Sengkang Riverside Park & Punggol Waterway'
        : isSengkangMRT
        ? 'Ride along Anchorvale Street intra-town cycling path towards Sengkang Town Centre'
        : 'Follow the designated National Parks Park Connector Network (PCN) path',
      detail: isWaterway
        ? 'Seamless, car-free scenic route alongside the waterfront all the way to Waterway Point boardwalk.'
        : 'Wide paths with clear pedestrian/cyclist lane markings and street lamps.',
      distanceOrTime: `${bikeTime - 2} mins`,
      iconType: 'bike',
      badge: 'Cycling Track',
    },
    {
      stepNumber: 3,
      instruction: `Arrive at ${dest.name} bicycle parking zone`,
      detail: 'Park at yellow-box bicycle bays or sheltered public bike racks.',
      distanceOrTime: '1 min',
      iconType: 'flag',
      badge: 'Bike Parking',
    },
  ];
  let bikeTips = 'Keep speeds under 25 km/h on shared paths. Use front white and rear red lights when cycling after dusk.';

  if (isSengkangMRT) {
    bikeTime = 4;
    bikeDist = 0.9;
    bikeSummary = 'Anchorvale St Dedicated Cycling Path to MRT Bicycle Station';
    bikeHighlights = ['Completely flat terrain', 'Over 200 sheltered bike racks at MRT'];
  } else if (isWaterway) {
    bikeTime = 10;
    bikeDist = 2.3;
    bikeSummary = 'Waterfront Punggol River PCN straight to mall boardwalk';
    bikeHighlights = ['100% car-free path', 'Connects into Coast-to-Coast Central Trail'];
  }

  // --- 4. WALKING ---
  let walkTime = Math.max(3, Math.round(roadDist * 12.0));
  let walkDist = roadDist;
  let walkSummary = 'Via Sengkang town sheltered walkway network';
  let walkHighlights = ['Continuous sheltered linkways', 'Wheelchair and pram accessible'];
  let walkSteps: DirectionStep[] = [
    {
      stepNumber: 1,
      instruction: 'Exit OLA EC via sheltered pedestrian gate onto Anchorvale Crescent',
      detail: 'Turn towards Cheng Lim LRT / Anchorvale Street.',
      distanceOrTime: '1 min (80 m)',
      iconType: 'walk',
      badge: 'OLA Gate',
    },
    {
      stepNumber: 2,
      instruction: isSKGH
        ? 'Cross at the covered linkway signal directly into Sengkang General Hospital campus'
        : isSengkangMRT
        ? 'Follow continuous sheltered linkways past SKGH campus towards Sengkang Square'
        : `Walk along the paved pedestrian pavement towards ${dest.name}`,
      detail: 'Equipped with ramps, tactile paving, and rain protection.',
      distanceOrTime: `${walkTime - 2} mins`,
      iconType: 'walk',
      badge: 'Sheltered Link',
    },
    {
      stepNumber: 3,
      instruction: `Arrive at ${dest.name}`,
      detail: `Entrance on ${dest.address || dest.name}.`,
      distanceOrTime: '1 min',
      iconType: 'flag',
      badge: 'Arrival',
    },
  ];
  let walkTips = 'Singapore weather tip: OLA features sheltered walkway access to Cheng Lim LRT and SKGH, keeping you dry on rainy days.';

  if (isSengkangMRT) {
    walkTime = 9;
    walkDist = 0.8;
    walkSummary = '100% sheltered linkway through SKGH into Sengkang MRT Exit A';
    walkHighlights = ['Zero rain exposure', 'Air-conditioned hospital concourse shortcut'];
    walkSteps = [
      {
        stepNumber: 1,
        instruction: 'Exit OLA pedestrian gate onto Anchorvale Crescent covered linkway',
        detail: 'Walk 100m to the signalised crossing at Anchorvale Street.',
        distanceOrTime: '2 mins (120 m)',
        iconType: 'walk',
        badge: 'Covered Walk',
      },
      {
        stepNumber: 2,
        instruction: 'Enter Sengkang General Hospital sheltered connector corridor',
        detail: 'Walk through the pleasant, shaded hospital campus linkway alongside Sengkang East Way.',
        distanceOrTime: '5 mins (450 m)',
        iconType: 'walk',
        badge: 'Hospital Linkway',
      },
      {
        stepNumber: 3,
        instruction: 'Arrive at Sengkang MRT Station (Exit A) & Compass One entrance',
        detail: 'Direct access to train gantries, taxi stand, and Compass One retail.',
        distanceOrTime: '2 mins (150 m)',
        iconType: 'flag',
        badge: 'Sengkang MRT',
      },
    ];
    walkTips = 'Resident Pro-tip: This 9-minute walk is fully sheltered from rain and tropical sun!';
  } else if (isSKGH) {
    walkTime = 4;
    walkDist = 0.35;
    walkSummary = 'Direct covered walkway across Anchorvale St';
    walkHighlights = ['350m door-to-door', 'Full rain shelter'];
  }

  return {
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
      residentTips: carTips,
      fareOrCost: isChangiOrJewel ? 'TPE (No ERP during off-peak)' : 'ERP rates vary by time',
    },
    cycle: {
      mode: 'cycle',
      modeLabel: 'Bike / Cycling',
      timeMins: bikeTime,
      distanceKm: bikeDist,
      summary: bikeSummary,
      highlights: bikeHighlights,
      steps: bikeSteps,
      residentTips: bikeTips,
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
      residentTips: walkTips,
      fareOrCost: 'Free & healthy',
    },
  };
}
