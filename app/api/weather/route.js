/**
 * ATMOS — Server-side Weather API Proxy
 * Caches Open-Meteo responses for 10 minutes on the server.
 * Hides external API calls from client; allows future key injection.
 * Author: Agrima Vijayvargiya
 */

// In-memory cache (survives across requests in the same server instance)
const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

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

  const cacheKey = `weather:${parseFloat(lat).toFixed(3)},${parseFloat(lon).toFixed(3)}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return Response.json(cached, {
      headers: { 'X-Cache': 'HIT', 'Cache-Control': 'public, max-age=600' },
    });
  }

  try {
    const params = new URLSearchParams({
      latitude: lat,
      longitude: lon,
      current: [
        'temperature_2m', 'apparent_temperature', 'relative_humidity_2m',
        'precipitation', 'weather_code', 'wind_speed_10m', 'wind_direction_10m',
        'surface_pressure', 'visibility', 'uv_index', 'is_day',
      ].join(','),
      hourly: [
        'temperature_2m', 'precipitation_probability',
        'precipitation', 'weather_code', 'apparent_temperature',
      ].join(','),
      daily: [
        'temperature_2m_max', 'temperature_2m_min', 'weather_code',
        'sunrise', 'sunset', 'uv_index_max', 'precipitation_sum', 'wind_speed_10m_max',
      ].join(','),
      forecast_days: 7,
      timezone: 'auto',
      wind_speed_unit: 'kmh',
    });

    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
      next: { revalidate: 600 },
    });

    if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);
    const data = await res.json();
    setCache(cacheKey, data);

    return Response.json(data, {
      headers: { 'X-Cache': 'MISS', 'Cache-Control': 'public, max-age=600' },
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 502 });
  }
}
