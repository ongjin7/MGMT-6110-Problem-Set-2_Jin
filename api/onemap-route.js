/**
 * Serverless API: /api/onemap-route
 * Calls OneMap Routing API: https://www.onemap.gov.sg/api/public/routingsvc/route
 * Start point is always OLA Executive Condominium (1.3966, 103.8886)
 */

let cachedToken = null;
let tokenExpiryTime = 0;

async function getOneMapToken() {
  const email = process.env.ONEMAP_API_EMAIL;
  const password = process.env.ONEMAP_API_PASSWORD;

  if (!email || !password) {
    return { error: 'ONEMAP_API_EMAIL or ONEMAP_API_PASSWORD is not configured', code: 503 };
  }

  const now = Date.now();
  if (cachedToken && tokenExpiryTime > now + 300000) {
    return { token: cachedToken };
  }

  try {
    const tokenRes = await fetch('https://www.onemap.gov.sg/api/auth/post/getToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!tokenRes.ok) {
      return {
        error: 'OneMap authentication refused',
        upstreamStatus: tokenRes.status,
        code: tokenRes.status
      };
    }

    const tokenData = await tokenRes.json();
    if (tokenData && tokenData.access_token) {
      cachedToken = tokenData.access_token;
      tokenExpiryTime = now + 72 * 3600 * 1000;
      return { token: cachedToken };
    }

    return { error: 'Invalid token response from OneMap', code: 502 };
  } catch (err) {
    return { error: 'OneMap authentication upstream is unreachable', code: 503 };
  }
}

const OLA_COORDS = '1.3966,103.8886'; // OLA Executive Condominium, Anchorvale Crescent

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
  res.setHeader('Content-Type', 'application/json');

  const url = new URL(req.url, 'http://localhost');
  const destLat = url.searchParams.get('destLat');
  const destLng = url.searchParams.get('destLng');
  const routeType = url.searchParams.get('routeType') || 'pt'; // pt, walk, drive, cycle

  if (!destLat || !destLng) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: 'destLat and destLng query parameters are required' }));
  }

  const email = process.env.ONEMAP_API_EMAIL;
  const password = process.env.ONEMAP_API_PASSWORD;

  if (!email || !password) {
    res.statusCode = 503;
    return res.end(JSON.stringify({
      error: 'Missing configuration',
      message: 'ONEMAP_API_EMAIL or ONEMAP_API_PASSWORD is not configured',
      status: 503
    }));
  }

  const tokenResult = await getOneMapToken();
  if (tokenResult.error) {
    res.statusCode = tokenResult.code || 503;
    return res.end(JSON.stringify({
      error: tokenResult.error,
      upstreamStatus: tokenResult.upstreamStatus || null,
      status: tokenResult.code || 503
    }));
  }

  try {
    const endCoords = `${destLat},${destLng}`;
    let routingUrl = `https://www.onemap.gov.sg/api/public/routingsvc/route?start=${OLA_COORDS}&end=${endCoords}&routeType=${routeType}`;

    if (routeType === 'pt') {
      const now = new Date();
      const dateStr = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${now.getFullYear()}`;
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`;
      routingUrl += `&date=${dateStr}&time=${timeStr}&mode=TRANSIT`;
    }

    const upstreamRes = await fetch(routingUrl, {
      headers: {
        'Authorization': `Bearer ${tokenResult.token}`
      }
    });

    if (!upstreamRes.ok) {
      res.statusCode = upstreamRes.status;
      return res.end(JSON.stringify({
        error: 'Upstream refused the request',
        upstreamStatus: upstreamRes.status,
        reason: `OneMap Routing API returned HTTP ${upstreamRes.status}`
      }));
    }

    const data = await upstreamRes.json();
    res.statusCode = 200;
    return res.end(JSON.stringify({
      origin: {
        name: 'OLA Executive Condominium',
        postalCode: '544651',
        coordinates: [1.3966, 103.8886]
      },
      destination: {
        coordinates: [parseFloat(destLat), parseFloat(destLng)]
      },
      routeType,
      routeData: data
    }));
  } catch (err) {
    res.statusCode = 503;
    return res.end(JSON.stringify({
      error: 'Upstream is unreachable',
      reason: 'Failed to connect to OneMap routing upstream service'
    }));
  }
}
