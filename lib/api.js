/**
 * ATMOS Weather Dashboard
 * API Utility Layer — routes through internal Next.js API proxies
 * Author: Agrima Vijayvargiya
 */

/**
 * Search for cities / areas (via server-side proxy → Nominatim)
 */
export async function searchCities(query) {
  if (!query || query.trim().length < 2) return [];
  const res = await fetch(`/api/geocode?q=${encodeURIComponent(query.trim())}`);
  if (!res.ok) return [];
  return res.json();
}

/**
 * Get full weather data for a lat/lon (via server-side proxy → Open-Meteo, cached 10 min)
 */
export async function getWeatherData(lat, lon) {
  const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error('Weather fetch failed');
  return res.json();
}

/**
 * Get air quality data (via server-side proxy → Open-Meteo AQI, cached 15 min)
 */
export async function getAirQuality(lat, lon) {
  const res = await fetch(`/api/airquality?lat=${lat}&lon=${lon}`);
  if (!res.ok) return null;
  return res.json();
}

/**
 * Reverse geocode lat/lon to location name (via server-side proxy → Nominatim)
 */
export async function reverseGeocode(lat, lon) {
  const res = await fetch(`/api/geocode?lat=${lat}&lon=${lon}`);
  if (!res.ok) return null;
  return res.json();
}
