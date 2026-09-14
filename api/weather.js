/**
 * Serverless API: /api/weather
 * Calls: https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast
 * Retrieves official 2-hour weather forecast for Singapore, focusing on Sengkang (OLA Executive Condominium).
 */

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
  res.setHeader('Content-Type', 'application/json');

  try {
    const upstreamUrl = 'https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast';
    const upstreamRes = await fetch(upstreamUrl);

    // AFTER the fetch, check response.ok before reading the body
    if (!upstreamRes.ok) {
      res.statusCode = upstreamRes.status;
      return res.end(JSON.stringify({
        error: 'Upstream refused the request',
        upstreamStatus: upstreamRes.status,
        reason: `data.gov.sg Weather API returned HTTP ${upstreamRes.status}`
      }));
    }

    const data = await upstreamRes.json();
    const items = data.data?.items || [];
    const firstItem = items[0] || {};
    const forecasts = firstItem.forecasts || [];

    // OLA Executive Condominium (S544651) is in Sengkang
    const sengkangForecast = forecasts.find(f => 
      f.area.toLowerCase().includes('sengkang')
    ) || null;

    // Nearby surrounding areas (Punggol, Hougang, Ang Mo Kio, Seletar)
    const surroundingAreas = forecasts.filter(f => 
      ['punggol', 'hougang', 'ang mo kio', 'seletar', 'pasir ris'].some(a => 
        f.area.toLowerCase().includes(a)
      )
    );

    res.statusCode = 200;
    return res.end(JSON.stringify({
      targetArea: 'Sengkang',
      targetLocation: 'OLA Executive Condominium (S544651)',
      forecast: sengkangForecast ? sengkangForecast.forecast : null,
      validPeriod: firstItem.valid_period || null,
      updateTimestamp: firstItem.timestamp || null,
      updateTimeText: firstItem.update_timestamp || firstItem.timestamp || null,
      allForecastsCount: forecasts.length,
      surroundingAreas: surroundingAreas,
      source: 'Meteorological Service Singapore via data.gov.sg'
    }));
  } catch (err) {
    res.statusCode = 503;
    return res.end(JSON.stringify({
      error: 'Upstream is unreachable',
      reason: 'Failed to connect to data.gov.sg weather forecast service'
    }));
  }
}
