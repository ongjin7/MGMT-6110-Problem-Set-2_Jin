/**
 * Serverless API: /api/bus
 * Accepts BusStopCode query parameter.
 * Calls https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival
 * Returns simplified list: ServiceNo, and minutes until each of the next buses
 */

function calculateMinutes(estimatedArrivalStr) {
  if (!estimatedArrivalStr) return null;
  const arrivalTime = new Date(estimatedArrivalStr).getTime();
  if (isNaN(arrivalTime)) return null;
  const now = Date.now();
  const diffMs = arrivalTime - now;
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes <= 0) return 0; // Arr
  return diffMinutes;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
  res.setHeader('Content-Type', 'application/json');

  const url = new URL(req.url, 'http://localhost');
  const busStopCode = url.searchParams.get('BusStopCode') || url.searchParams.get('busStopCode');

  if (!busStopCode) {
    res.statusCode = 400;
    return res.end(JSON.stringify({
      error: 'Missing query parameter',
      message: 'BusStopCode query parameter is required'
    }));
  }

  // BEFORE the fetch, if the credential is missing or empty, return 503
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
    const upstreamUrl = `https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=${encodeURIComponent(busStopCode)}`;
    const upstreamRes = await fetch(upstreamUrl, {
      headers: {
        'AccountKey': accountKey,
        'accept': 'application/json'
      }
    });

    // AFTER the fetch, check response.ok before reading the body
    if (!upstreamRes.ok) {
      res.statusCode = upstreamRes.status;
      return res.end(JSON.stringify({
        error: 'Upstream refused the request',
        upstreamStatus: upstreamRes.status,
        reason: `LTA DataMall Bus Arrival API returned HTTP ${upstreamRes.status}`
      }));
    }

    const data = await upstreamRes.json();
    const rawServices = data.Services || [];

    const simplifiedServices = rawServices.map(svc => {
      const nextBus1 = svc.NextBus || {};
      const nextBus2 = svc.NextBus2 || {};
      const nextBus3 = svc.NextBus3 || {};

      const min1 = calculateMinutes(nextBus1.EstimatedArrival);
      const min2 = calculateMinutes(nextBus2.EstimatedArrival);
      const min3 = calculateMinutes(nextBus3.EstimatedArrival);

      return {
        serviceNo: svc.ServiceNo,
        operator: svc.Operator,
        nextBus: min1 !== null ? {
          minutes: min1,
          load: nextBus1.Load || '', // SEA = Seats Available, SDA = Standing Available, LSD = Limited Standing
          feature: nextBus1.Feature || '', // WAB = Wheelchair Accessible Bus
          type: nextBus1.Type || '', // SD = Single Deck, DD = Double Deck, BD = Bendy
          estimatedArrival: nextBus1.EstimatedArrival
        } : null,
        nextBus2: min2 !== null ? {
          minutes: min2,
          load: nextBus2.Load || '',
          feature: nextBus2.Feature || '',
          type: nextBus2.Type || '',
          estimatedArrival: nextBus2.EstimatedArrival
        } : null,
        nextBus3: min3 !== null ? {
          minutes: min3,
          load: nextBus3.Load || '',
          feature: nextBus3.Feature || '',
          type: nextBus3.Type || '',
          estimatedArrival: nextBus3.EstimatedArrival
        } : null
      };
    });

    res.statusCode = 200;
    return res.end(JSON.stringify({
      busStopCode: data.BusStopCode || busStopCode,
      services: simplifiedServices
    }));
  } catch (err) {
    res.statusCode = 503;
    return res.end(JSON.stringify({
      error: 'Upstream is unreachable',
      reason: 'Failed to connect to LTA DataMall Bus Arrival upstream service'
    }));
  }
}
