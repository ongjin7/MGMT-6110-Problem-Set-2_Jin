/**
 * Serverless API: /api/health
 * Reports health of each external integration separately:
 * - whether required credentials are configured (keyConfigured)
 * - whether the upstream service answered (upstreamAnswered)
 * - the HTTP status returned by the upstream (httpStatus)
 * - whether the service is healthy (healthy)
 *
 * CRITICAL SECURITY GUARDRAIL:
 * NEVER return, print, or log credentials, email, password, tokens, or any substring/transformed representation.
 */

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Content-Type', 'application/json');

  const ltaKey = process.env.LTA_ACCOUNT_KEY;
  const ltaConfigured = Boolean(ltaKey && ltaKey.trim() !== '' && ltaKey !== 'undefined');

  const onemapEmail = process.env.ONEMAP_API_EMAIL;
  const onemapPass = process.env.ONEMAP_API_PASSWORD;
  const onemapConfigured = Boolean(
    onemapEmail && onemapEmail.trim() !== '' && onemapEmail !== 'undefined' &&
    onemapPass && onemapPass.trim() !== '' && onemapPass !== 'undefined'
  );

  // 1. Check LTA DataMall
  let ltaStatus = {
    keyConfigured: ltaConfigured,
    upstreamAnswered: false,
    httpStatus: null,
    healthy: false,
    message: ltaConfigured ? 'Pending check' : 'LTA_ACCOUNT_KEY is not configured'
  };

  if (ltaConfigured) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const upstreamRes = await fetch('https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=67429', {
        headers: {
          'AccountKey': ltaKey,
          'accept': 'application/json'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      ltaStatus.upstreamAnswered = true;
      ltaStatus.httpStatus = upstreamRes.status;
      ltaStatus.healthy = upstreamRes.ok;
      ltaStatus.message = upstreamRes.ok ? 'Service operational' : `Upstream returned status ${upstreamRes.status}`;
    } catch (err) {
      ltaStatus.upstreamAnswered = false;
      ltaStatus.healthy = false;
      ltaStatus.message = 'Upstream unreachable or timed out';
    }
  }

  // 2. Check OneMap
  let onemapStatus = {
    keyConfigured: onemapConfigured,
    upstreamAnswered: false,
    httpStatus: null,
    healthy: false,
    message: onemapConfigured ? 'Pending check' : 'ONEMAP_API_EMAIL or ONEMAP_API_PASSWORD is not configured'
  };

  if (onemapConfigured) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const upstreamRes = await fetch('https://www.onemap.gov.sg/api/auth/post/getToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: onemapEmail, password: onemapPass }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      onemapStatus.upstreamAnswered = true;
      onemapStatus.httpStatus = upstreamRes.status;
      onemapStatus.healthy = upstreamRes.ok;
      onemapStatus.message = upstreamRes.ok ? 'Service operational' : `OneMap auth returned status ${upstreamRes.status}`;
    } catch (err) {
      onemapStatus.upstreamAnswered = false;
      onemapStatus.healthy = false;
      onemapStatus.message = 'Upstream unreachable or timed out';
    }
  }

  // 3. Check data.gov.sg 2-hour weather forecast (public, no key required)
  let weatherStatus = {
    keyConfigured: true,
    upstreamAnswered: false,
    httpStatus: null,
    healthy: false,
    message: 'Pending check'
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const weatherRes = await fetch('https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    weatherStatus.upstreamAnswered = true;
    weatherStatus.httpStatus = weatherRes.status;
    weatherStatus.healthy = weatherRes.ok;
    weatherStatus.message = weatherRes.ok ? 'Service operational' : `data.gov.sg returned status ${weatherRes.status}`;
  } catch (err) {
    weatherStatus.upstreamAnswered = false;
    weatherStatus.healthy = false;
    weatherStatus.message = 'Upstream unreachable or timed out';
  }

  // 4. Check data.gov.sg air temperature (public, no key required)
  let temperatureStatus = {
    keyConfigured: true,
    upstreamAnswered: false,
    httpStatus: null,
    healthy: false,
    message: 'Pending check'
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const tempRes = await fetch('https://api-open.data.gov.sg/v2/real-time/api/air-temperature', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    temperatureStatus.upstreamAnswered = true;
    temperatureStatus.httpStatus = tempRes.status;
    temperatureStatus.healthy = tempRes.ok;
    temperatureStatus.message = tempRes.ok ? 'Service operational' : `data.gov.sg returned status ${tempRes.status}`;
  } catch (err) {
    temperatureStatus.upstreamAnswered = false;
    temperatureStatus.healthy = false;
    temperatureStatus.message = 'Upstream unreachable or timed out';
  }

  const allHealthy = weatherStatus.healthy && temperatureStatus.healthy &&
    (!ltaConfigured || ltaStatus.healthy) &&
    (!onemapConfigured || onemapStatus.healthy);

  res.statusCode = 200;
  return res.end(JSON.stringify({
    status: allHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    integrations: {
      lta_datamall: ltaStatus,
      onemap: onemapStatus,
      data_gov_sg_weather: weatherStatus,
      data_gov_sg_temperature: temperatureStatus
    }
  }));
}
