/**
 * Serverless API: /api/bus-stops
 * Calls LTA DataMall Bus Stops API: https://datamall2.mytransport.sg/ltaodataservice/BusStops
 * Returns real bus stops and stations around OLA Executive Condominium extending to Sengkang MRT.
 */

// Coordinates of OLA Executive Condominium, Anchorvale Crescent S544651
const OLA_LAT = 1.3966;
const OLA_LNG = 103.8886;

function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

// MRT / LRT stations around OLA EC (Cheng Lim SW1 is ~150m, Sengkang NE16/STC is ~750m)
const NEARBY_TRAIN_STATIONS = [
  {
    code: 'SW1',
    name: 'Cheng Lim LRT',
    type: 'LRT',
    line: 'Sengkang LRT (West Loop)',
    latitude: 1.3963,
    longitude: 103.8937,
    distanceM: 200,
    services: ['Sengkang West LRT']
  },
  {
    code: 'NE16 / STC',
    name: 'Sengkang MRT / LRT & Compass One',
    type: 'MRT/LRT',
    line: 'North East Line / Sengkang LRT',
    latitude: 1.3916,
    longitude: 103.8954,
    distanceM: 780,
    services: ['North East Line', 'East Loop LRT', 'West Loop LRT']
  },
  {
    code: 'SW2',
    name: 'Farmway LRT',
    type: 'LRT',
    line: 'Sengkang LRT (West Loop)',
    latitude: 1.3975,
    longitude: 103.8892,
    distanceM: 450,
    services: ['Sengkang West LRT']
  },
  {
    code: 'SE1',
    name: 'Compassvale LRT',
    type: 'LRT',
    line: 'Sengkang LRT (East Loop)',
    latitude: 1.3945,
    longitude: 103.9005,
    distanceM: 850,
    services: ['Sengkang East LRT']
  }
];

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
  res.setHeader('Content-Type', 'application/json');

  const accountKey = process.env.LTA_ACCOUNT_KEY;
  if (!accountKey || accountKey.trim() === '' || accountKey === 'undefined') {
    res.statusCode = 503;
    return res.end(JSON.stringify({
      error: 'Missing configuration',
      message: 'LTA_ACCOUNT_KEY is not configured',
      status: 503
    }));
  }

  try {
    // Fetch bus stops from LTA DataMall
    // In DataMall, we fetch stops and filter to radius ~1.2km around OLA
    let allStops = [];
    let skip = 0;
    let keepFetching = true;

    // We make parallel or sequential requests up to 2-3 pages if needed, or query DataMall
    while (keepFetching && skip <= 2000) {
      const upstreamRes = await fetch(`https://datamall2.mytransport.sg/ltaodataservice/BusStops?$skip=${skip}`, {
        headers: {
          'AccountKey': accountKey,
          'accept': 'application/json'
        }
      });

      if (!upstreamRes.ok) {
        res.statusCode = upstreamRes.status;
        return res.end(JSON.stringify({
          error: 'Upstream refused the request',
          upstreamStatus: upstreamRes.status,
          reason: `LTA DataMall BusStops API returned HTTP ${upstreamRes.status}`
        }));
      }

      const data = await upstreamRes.json();
      const value = data.value || [];
      allStops = allStops.concat(value);

      if (value.length < 500) {
        keepFetching = false;
      } else {
        skip += 500;
        // In practice for Sengkang stops (67xxx codes), let's check if we reached them
        // 67xxx stops usually appear within first 2000-2500 entries
        if (allStops.some(s => s.BusStopCode && s.BusStopCode.startsWith('67') && getDistanceMeters(OLA_LAT, OLA_LNG, s.Latitude, s.Longitude) <= 1200)) {
          // If we found stops nearby, limit further paging for fast response
          if (skip >= 1500) keepFetching = false;
        }
      }
    }

    // Filter to stops within ~1200m radius of OLA
    const nearbyBusStops = allStops
      .map(s => {
        const dist = getDistanceMeters(OLA_LAT, OLA_LNG, s.Latitude, s.Longitude);
        return {
          busStopCode: s.BusStopCode,
          roadName: s.RoadName,
          description: s.Description,
          latitude: s.Latitude,
          longitude: s.Longitude,
          distanceM: dist,
          type: 'BUS'
        };
      })
      .filter(s => s.distanceM <= 1200)
      .sort((a, b) => a.distanceM - b.distanceM);

    res.statusCode = 200;
    return res.end(JSON.stringify({
      origin: {
        name: 'OLA Executive Condominium',
        postalCode: '544651',
        latitude: OLA_LAT,
        longitude: OLA_LNG
      },
      busStops: nearbyBusStops,
      trainStations: NEARBY_TRAIN_STATIONS
    }));
  } catch (err) {
    res.statusCode = 503;
    return res.end(JSON.stringify({
      error: 'Upstream is unreachable',
      reason: 'Failed to connect to LTA DataMall BusStops upstream service'
    }));
  }
}
