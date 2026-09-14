/**
 * Serverless API: /api/psi
 * Calls: https://api-open.data.gov.sg/v2/real-time/api/psi
 * Retrieves official 24-hour PSI and air quality data for Singapore and Sengkang (OLA EC).
 */

function getPsiCategory(psi) {
  if (psi === null || psi === undefined || isNaN(psi)) return 'Moderate';
  if (psi <= 50) return 'Good';
  if (psi <= 100) return 'Moderate';
  if (psi <= 200) return 'Unhealthy';
  if (psi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

function getExerciseRecommendation(category) {
  switch (category) {
    case 'Good':
      return {
        recommendation: 'Yes, safe for all outdoor activities & exercise.',
        shortAdvice: 'Safe for all outdoor exercise',
        exerciseAllowed: true,
        alertLevel: 'normal',
      };
    case 'Moderate':
      return {
        recommendation: 'Yes, normal outdoor physical activities can proceed.',
        shortAdvice: 'Safe for normal outdoor exercise',
        exerciseAllowed: true,
        alertLevel: 'normal',
      };
    case 'Unhealthy':
      return {
        recommendation: 'Reduce strenuous outdoor exertion. Vulnerable groups should avoid outdoor exercise.',
        shortAdvice: 'Reduce strenuous outdoor exertion',
        exerciseAllowed: false,
        alertLevel: 'warning',
      };
    case 'Very Unhealthy':
      return {
        recommendation: 'Avoid outdoor exercise. Keep windows closed and stay indoors.',
        shortAdvice: 'Avoid outdoor exercise',
        exerciseAllowed: false,
        alertLevel: 'danger',
      };
    case 'Hazardous':
      return {
        recommendation: 'Avoid all outdoor activity. Remain indoors with air purifiers on.',
        shortAdvice: 'Avoid all outdoor activity',
        exerciseAllowed: false,
        alertLevel: 'critical',
      };
    default:
      return {
        recommendation: 'Normal outdoor activities can proceed.',
        shortAdvice: 'Safe for normal outdoor exercise',
        exerciseAllowed: true,
        alertLevel: 'normal',
      };
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');
  res.setHeader('Content-Type', 'application/json');

  try {
    const upstreamUrl = 'https://api-open.data.gov.sg/v2/real-time/api/psi';
    const upstreamRes = await fetch(upstreamUrl);

    if (!upstreamRes.ok) {
      res.statusCode = upstreamRes.status;
      return res.end(JSON.stringify({
        error: 'Upstream refused the request',
        upstreamStatus: upstreamRes.status,
        reason: `data.gov.sg PSI API returned HTTP ${upstreamRes.status}`
      }));
    }

    const data = await upstreamRes.json();
    const items = data.data?.items || [];
    const firstItem = items[0] || {};
    const readings = firstItem.readings || {};

    const psi24HReadings = readings.psi_twenty_four_hourly || {};
    // Sengkang is in North-East / North region
    const northPsi = psi24HReadings.north;
    const eastPsi = psi24HReadings.east;
    const targetPsi = (typeof northPsi === 'number' ? northPsi : (typeof eastPsi === 'number' ? eastPsi : (psi24HReadings.central ?? null)));

    const category = getPsiCategory(targetPsi);
    const exerciseInfo = getExerciseRecommendation(category);

    res.statusCode = 200;
    return res.end(JSON.stringify({
      targetLocation: 'OLA Executive Condominium (S544651)',
      region: 'North (covering Sengkang)',
      psi24Hourly: targetPsi,
      category: category,
      exerciseRecommendation: exerciseInfo.recommendation,
      shortAdvice: exerciseInfo.shortAdvice,
      exerciseAllowed: exerciseInfo.exerciseAllowed,
      alertLevel: exerciseInfo.alertLevel,
      timestamp: firstItem.timestamp || null,
      updatedTimestamp: firstItem.updatedTimestamp || null,
      regionalPsi: {
        north: psi24HReadings.north ?? null,
        east: psi24HReadings.east ?? null,
        central: psi24HReadings.central ?? null,
        west: psi24HReadings.west ?? null,
        south: psi24HReadings.south ?? null,
      },
      source: 'National Environment Agency (NEA) via data.gov.sg'
    }));
  } catch (err) {
    res.statusCode = 503;
    return res.end(JSON.stringify({
      error: 'Upstream is unreachable',
      reason: 'Failed to connect to data.gov.sg PSI air quality service'
    }));
  }
}
