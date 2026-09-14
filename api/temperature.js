/**
 * Serverless API: /api/temperature
 * Calls: https://api-open.data.gov.sg/v2/real-time/api/air-temperature
 * Retrieves latest available air-temperature readings from official Singapore meteorological stations.
 */

// Coordinates of OLA Executive Condominium, Anchorvale Crescent S544651
const OLA_LAT = 1.3966;
const OLA_LNG = 103.8886;

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
  res.setHeader('Content-Type', 'application/json');

  try {
    const upstreamUrl = 'https://api-open.data.gov.sg/v2/real-time/api/air-temperature';
    const upstreamRes = await fetch(upstreamUrl);

    if (!upstreamRes.ok) {
      res.statusCode = upstreamRes.status;
      return res.end(JSON.stringify({
        error: 'Upstream refused the request',
        upstreamStatus: upstreamRes.status,
        reason: `data.gov.sg Temperature API returned HTTP ${upstreamRes.status}`
      }));
    }

    const data = await upstreamRes.json();
    const stations = data.data?.stations || [];
    const readings = data.data?.readings?.[0]?.data || [];
    const timestamp = data.data?.readings?.[0]?.timestamp || null;

    // Create map of readings by stationId
    const readingMap = new Map();
    readings.forEach(r => {
      readingMap.set(r.stationId, r.value);
    });

    // Find stations with readings and calculate distance from OLA EC
    const activeStations = stations
      .filter(s => readingMap.has(s.id))
      .map(s => {
        const distKm = getDistanceKm(
          OLA_LAT,
          OLA_LNG,
          s.location?.latitude,
          s.location?.longitude
        );
        return {
          id: s.id,
          name: s.name,
          temperature: readingMap.get(s.id),
          latitude: s.location?.latitude,
          longitude: s.location?.longitude,
          distanceKm: parseFloat(distKm.toFixed(2))
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);

    const closestStation = activeStations[0] || null;

    res.statusCode = 200;
    return res.end(JSON.stringify({
      targetLocation: 'OLA Executive Condominium (S544651)',
      temperature: closestStation ? closestStation.temperature : null,
      unit: '°C',
      station: closestStation ? {
        id: closestStation.id,
        name: closestStation.name,
        distanceKm: closestStation.distanceKm
      } : null,
      timestamp: timestamp,
      nearbyStations: activeStations.slice(0, 4),
      source: 'Meteorological Service Singapore via data.gov.sg'
    }));
  } catch (err) {
    res.statusCode = 503;
    return res.end(JSON.stringify({
      error: 'Upstream is unreachable',
      reason: 'Failed to connect to data.gov.sg air temperature upstream service'
    }));
  }
}
