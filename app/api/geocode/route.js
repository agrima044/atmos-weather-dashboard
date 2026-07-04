/**
 * ATMOS — Server-side Geocoding API Proxy
 * Proxies Nominatim requests (adds User-Agent server-side, required by Nominatim ToS)
 * Caches results for 1 hour
 * Author: Agrima Vijayvargiya
 */

const cache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) { cache.delete(key); return null; }
  return entry.data;
}
function setCache(key, data) {
  cache.set(key, { data, ts: Date.now() });
}

// Search endpoint
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  // Reverse geocode mode
  if (lat && lon) {
    const cacheKey = `reverse:${parseFloat(lat).toFixed(4)},${parseFloat(lon).toFixed(4)}`;
    const cached = getCached(cacheKey);
    if (cached) return Response.json(cached);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
        { headers: { 'User-Agent': 'ATMOS-WeatherApp/1.0 (github.com/agrima044)', 'Accept-Language': 'en' } }
      );
      if (!res.ok) throw new Error('Reverse geocode failed');
      const data = await res.json();
      const addr = data.address || {};
      const result = {
        name: addr.suburb || addr.neighbourhood || addr.city_district ||
              addr.city || addr.town || addr.village || addr.county || 'Unknown',
        country: addr.country || '',
        country_code: addr.country_code?.toUpperCase() || '',
        admin1: [addr.city || addr.town || addr.village || '', addr.state || ''].filter(Boolean).join(', '),
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
      };
      setCache(cacheKey, result);
      return Response.json(result);
    } catch (err) {
      return Response.json({ error: err.message }, { status: 502 });
    }
  }

  // Forward search mode
  if (!q || q.trim().length < 2) {
    return Response.json({ error: 'q is required' }, { status: 400 });
  }

  const cacheKey = `search:${q.trim().toLowerCase()}`;
  const cached = getCached(cacheKey);
  if (cached) return Response.json(cached);

  try {
    const params = new URLSearchParams({
      q: q.trim(),
      format: 'json',
      addressdetails: '1',
      limit: '8',
      'accept-language': 'en',
    });

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      { headers: { 'User-Agent': 'ATMOS-WeatherApp/1.0 (github.com/agrima044)', 'Accept-Language': 'en' } }
    );
    if (!res.ok) throw new Error('Geocoding failed');
    const raw = await res.json();

    const results = raw.map((r) => {
      const addr = r.address || {};
      const areaName = addr.suburb || addr.neighbourhood || addr.quarter ||
                       addr.village || addr.town || addr.city_district ||
                       addr.district || addr.city || addr.county ||
                       r.name || r.display_name?.split(',')[0];
      const city = addr.city || addr.town || addr.village || addr.county || '';
      const state = addr.state || '';
      return {
        id: r.place_id,
        name: areaName,
        admin1: [city, state].filter(Boolean).join(', '),
        country_code: addr.country_code?.toUpperCase() || '',
        country: addr.country || '',
        latitude: parseFloat(r.lat),
        longitude: parseFloat(r.lon),
        display_name: r.display_name,
      };
    });

    setCache(cacheKey, results);
    return Response.json(results);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 502 });
  }
}
