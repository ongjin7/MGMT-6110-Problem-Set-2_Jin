/**
 * Serverless API: /api/bus-routes
 * Calls LTA DataMall Bus Routes API: https://datamall2.mytransport.sg/ltaodataservice/BusRoutes
 * Returns the sequence of stops served by a specific bus service.
 */

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
  res.setHeader('Content-Type', 'application/json');

  const url = new URL(req.url, 'http://localhost');
  const serviceNo = url.searchParams.get('ServiceNo') || url.searchParams.get('serviceNo');

  if (!serviceNo) {
    res.statusCode = 400;
    return res.end(JSON.stringify({
      error: 'Missing query parameter',
      message: 'ServiceNo query parameter is required'
    }));
  }

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
    let allRouteStops = [];
    let skip = 0;
    let keepFetching = true;

    // Filter by ServiceNo in query or fetch
    while (keepFetching && skip <= 2000) {
      const upstreamRes = await fetch(`https://datamall2.mytransport.sg/ltaodataservice/BusRoutes?$skip=${skip}`, {
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
          reason: `LTA DataMall BusRoutes API returned HTTP ${upstreamRes.status}`
        }));
      }

      const data = await upstreamRes.json();
      const value = data.value || [];
      
      const matching = value.filter(r => r.ServiceNo.toUpperCase() === serviceNo.toUpperCase());
      allRouteStops = allRouteStops.concat(matching);

      if (value.length < 500) {
        keepFetching = false;
      } else {
        skip += 500;
        // If we found matching stops and subsequent page has none, we can check or continue
      }
    }

    // Sort by Direction and StopSequence
    allRouteStops.sort((a, b) => {
      if (a.Direction !== b.Direction) return a.Direction - b.Direction;
      return a.StopSequence - b.StopSequence;
    });

    res.statusCode = 200;
    return res.end(JSON.stringify({
      serviceNo: serviceNo.toUpperCase(),
      stopsCount: allRouteStops.length,
      route: allRouteStops.map(s => ({
        serviceNo: s.ServiceNo,
        direction: s.Direction,
        stopSequence: s.StopSequence,
        busStopCode: s.BusStopCode,
        distanceKm: s.Distance,
        firstBus: s.WD_FirstBus,
        lastBus: s.WD_LastBus
      }))
    }));
  } catch (err) {
    res.statusCode = 503;
    return res.end(JSON.stringify({
      error: 'Upstream is unreachable',
      reason: 'Failed to connect to LTA DataMall BusRoutes upstream service'
    }));
  }
}
