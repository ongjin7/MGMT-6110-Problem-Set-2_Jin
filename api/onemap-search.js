/**
 * Serverless API: /api/onemap-search
 * Calls OneMap Search API: https://www.onemap.gov.sg/api/common/elastic/search
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
  // Reuse token if still valid for at least 5 minutes
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
      // Default 3 days if not parsed, or parse expiry_timestamp
      tokenExpiryTime = now + 72 * 3600 * 1000;
      return { token: cachedToken };
    }

    return { error: 'Invalid token response from OneMap', code: 502 };
  } catch (err) {
    return { error: 'OneMap authentication upstream is unreachable', code: 503 };
  }
}

export default async function handler(req, res) {
  // Set cache headers
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
  res.setHeader('Content-Type', 'application/json');

  // Extract query
  const url = new URL(req.url, 'http://localhost');
  const searchVal = url.searchParams.get('searchVal') || url.searchParams.get('q');

  if (!searchVal || searchVal.trim() === '') {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: 'Missing searchVal query parameter' }));
  }

  // Check credentials before calling upstream
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

  // Obtain token
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
    const upstreamUrl = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(searchVal)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
    const upstreamRes = await fetch(upstreamUrl, {
      headers: {
        'Authorization': `Bearer ${tokenResult.token}`
      }
    });

    if (!upstreamRes.ok) {
      res.statusCode = upstreamRes.status;
      return res.end(JSON.stringify({
        error: 'Upstream refused the request',
        upstreamStatus: upstreamRes.status,
        reason: `OneMap Search API returned HTTP ${upstreamRes.status}`
      }));
    }

    const data = await upstreamRes.json();
    const rawResults = data.results || [];

    // Return only the fields the screen needs
    const simplifiedResults = rawResults.map(r => ({
      name: r.SEARCHVAL || r.BUILDING || r.ROAD_NAME,
      address: r.ADDRESS || '',
      postalCode: r.POSTAL && r.POSTAL !== 'NIL' ? r.POSTAL : '',
      latitude: parseFloat(r.LATITUDE),
      longitude: parseFloat(r.LONGITUDE),
      building: r.BUILDING && r.BUILDING !== 'NIL' ? r.BUILDING : '',
      road: r.ROAD_NAME && r.ROAD_NAME !== 'NIL' ? r.ROAD_NAME : '',
      block: r.BLK_NO && r.BLK_NO !== 'NIL' ? r.BLK_NO : ''
    }));

    res.statusCode = 200;
    return res.end(JSON.stringify({
      found: data.found || simplifiedResults.length,
      results: simplifiedResults
    }));
  } catch (err) {
    res.statusCode = 503;
    return res.end(JSON.stringify({
      error: 'Upstream is unreachable',
      reason: 'Failed to connect to OneMap search upstream service'
    }));
  }
}
