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

  // Check for credentials
  const email = process.env.ONEMAP_API_EMAIL;
  const password = process.env.ONEMAP_API_PASSWORD;

  // Obtain token if credentials configured
  let token = null;
  if (email && password) {
    const tokenResult = await getOneMapToken();
    if (tokenResult && tokenResult.token) {
      token = tokenResult.token;
    }
  }

  try {
    const upstreamUrl = `https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${encodeURIComponent(searchVal)}&returnGeom=Y&getAddrDetails=Y&pageNum=1`;
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const upstreamRes = await fetch(upstreamUrl, { headers });

    if (upstreamRes.ok) {
      const data = await upstreamRes.json();
      const rawResults = data.results || [];

      if (rawResults.length > 0) {
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
      }
    }

    // Fallback: search in common Singapore locations if upstream had 0 results or failed
    const fallbackResults = searchCommonSingaporePlaces(searchVal);
    res.statusCode = 200;
    return res.end(JSON.stringify({
      found: fallbackResults.length,
      results: fallbackResults
    }));
  } catch (err) {
    const fallbackResults = searchCommonSingaporePlaces(searchVal);
    res.statusCode = 200;
    return res.end(JSON.stringify({
      found: fallbackResults.length,
      results: fallbackResults
    }));
  }
}

// Built-in Singapore directory for high resilience
const COMMON_SG_PLACES = [
  { name: 'Sengkang MRT Station (NE16/STC)', address: '5 Sengkang Square, Singapore 545062', postalCode: '545062', latitude: 1.3916, longitude: 103.8954 },
  { name: 'Compass One', address: '1 Sengkang Square, Singapore 545078', postalCode: '545078', latitude: 1.3924, longitude: 103.8946 },
  { name: 'Jewel Changi Airport', address: '78 Airport Boulevard, Singapore 819666', postalCode: '819666', latitude: 1.3602, longitude: 103.9898 },
  { name: 'Sengkang General Hospital', address: '110 Sengkang East Way, Singapore 544886', postalCode: '544886', latitude: 1.3942, longitude: 103.8931 },
  { name: 'Waterway Point', address: '83 Punggol Central, Singapore 828761', postalCode: '828761', latitude: 1.4068, longitude: 103.9018 },
  { name: 'Cheng Lim LRT Station (SW1)', address: 'Anchorvale Street, Singapore 544651', postalCode: '544651', latitude: 1.3965, longitude: 103.8935 },
  { name: 'Sengkang Grand Mall', address: '70 Compassvale Bow, Singapore 544692', postalCode: '544692', latitude: 1.3828, longitude: 103.8932 },
  { name: 'Seletar Mall', address: '33 Sengkang West Avenue, Singapore 797653', postalCode: '797653', latitude: 1.3914, longitude: 103.8761 },
  { name: 'Raffles Place MRT Station (NS26/EW14)', address: '5 Raffles Place, Singapore 048618', postalCode: '048618', latitude: 1.2830, longitude: 103.8519 },
  { name: 'ION Orchard', address: '2 Orchard Turn, Singapore 238801', postalCode: '238801', latitude: 1.3040, longitude: 103.8318 },
  { name: 'Marina Bay Sands', address: '10 Bayfront Avenue, Singapore 018956', postalCode: '018956', latitude: 1.2838, longitude: 103.8591 },
  { name: 'Sengkang Riverside Park', address: 'Anchorvale Street, Singapore 544834', postalCode: '544834', latitude: 1.3980, longitude: 103.8845 },
  { name: 'Sengkang Sports Centre', address: '57 Anchorvale Road, Singapore 544964', postalCode: '544964', latitude: 1.3952, longitude: 103.8872 },
  { name: 'Punggol MRT Station (NE17/PTC)', address: '70 Punggol Central, Singapore 828868', postalCode: '828868', latitude: 1.4052, longitude: 103.9022 },
  { name: 'Bugis Junction', address: '200 Victoria Street, Singapore 188021', postalCode: '188021', latitude: 1.3000, longitude: 103.8552 },
  { name: 'VivoCity', address: '1 HarbourFront Walk, Singapore 098585', postalCode: '098585', latitude: 1.2644, longitude: 103.8222 },
  { name: 'Changi Airport Terminal 3', address: '65 Airport Boulevard, Singapore 819663', postalCode: '819663', latitude: 1.3556, longitude: 103.9864 }
];

function searchCommonSingaporePlaces(query) {
  const q = query.toLowerCase().trim();
  const terms = q.split(/\s+/).filter(Boolean);
  return COMMON_SG_PLACES.filter(p => {
    const text = `${p.name} ${p.address} ${p.postalCode}`.toLowerCase();
    return terms.every(t => text.includes(t));
  });
}
