/**
 * ATMOS — Server-side Air Quality API Proxy
 * Caches Open-Meteo Air Quality responses for 15 minutes
 * Author: Agrima Vijayvargiya
 */

const cache = new Map();
const CACHE_TTL_MS = 15 * 60 * 1000;

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) { cache.delete(key); return null; }
  return entry.data;
}
function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return Response.json({ error: 'lat and lon are required' }, { status: 400 });
  }

  const cacheKey = `aqi:${parseFloat(lat).toFixed(3)},${parseFloat(lon).toFixed(3)}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return Response.json(cached, {
      headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, max-age=900' },
    });
  }

  try {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current: ['pm10', 'pm2_5', 'carbon_monoxide', 'european_aqi'].join(','),
      timezone: 'auto',
    });

    const res = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?${params}`,
      { next: { revalidate: 900 } }
    );
    if (!res.ok) throw new Error(`AQI error: ${res.status}`);
    const data = await res.json();
    setCache(cacheKey, data);

    return Response.json(data, {
      headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, max-age=900' },
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 502 });
  }
}
