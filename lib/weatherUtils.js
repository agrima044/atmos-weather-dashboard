/**
 * ATMOS Weather Dashboard
 * Weather utility functions — WMO codes, gradients, recommendations
 * Author: Agrima Vijayvargiya
 */

/**
 * WMO Weather Interpretation Codes → Label + Icon type
 */
export const WMO_CODES = {
  0: { label: 'Clear Sky', icon: 'sun', category: 'clear' },
  1: { label: 'Mostly Clear', icon: 'sun-cloud', category: 'clear' },
  2: { label: 'Partly Cloudy', icon: 'cloud-sun', category: 'cloudy' },
  3: { label: 'Overcast', icon: 'cloud', category: 'cloudy' },
  45: { label: 'Foggy', icon: 'fog', category: 'fog' },
  48: { label: 'Icy Fog', icon: 'fog', category: 'fog' },
  51: { label: 'Light Drizzle', icon: 'drizzle', category: 'rain' },
  53: { label: 'Drizzle', icon: 'drizzle', category: 'rain' },
  55: { label: 'Heavy Drizzle', icon: 'drizzle', category: 'rain' },
  61: { label: 'Light Rain', icon: 'rain', category: 'rain' },
  63: { label: 'Rain', icon: 'rain', category: 'rain' },
  65: { label: 'Heavy Rain', icon: 'rain', category: 'rain' },
  71: { label: 'Light Snow', icon: 'snow', category: 'snow' },
  73: { label: 'Snow', icon: 'snow', category: 'snow' },
  75: { label: 'Heavy Snow', icon: 'snow', category: 'snow' },
  77: { label: 'Snow Grains', icon: 'snow', category: 'snow' },
  80: { label: 'Light Showers', icon: 'shower', category: 'rain' },
  81: { label: 'Showers', icon: 'shower', category: 'rain' },
  82: { label: 'Heavy Showers', icon: 'shower', category: 'rain' },
  85: { label: 'Snow Showers', icon: 'snow', category: 'snow' },
  86: { label: 'Heavy Snow Showers', icon: 'snow', category: 'snow' },
  95: { label: 'Thunderstorm', icon: 'thunder', category: 'storm' },
  96: { label: 'Thunderstorm w/ Hail', icon: 'thunder', category: 'storm' },
  99: { label: 'Thunderstorm w/ Heavy Hail', icon: 'thunder', category: 'storm' },
};

/**
 * Get background gradient class based on weather code + day/night
 */
export function getWeatherGradient(weatherCode, isDay) {
  const cat = WMO_CODES[weatherCode]?.category || 'clear';
  if (!isDay) return 'gradient-night';
  const gradients = {
    clear: 'gradient-clear',
    cloudy: 'gradient-cloudy',
    rain: 'gradient-rain',
    snow: 'gradient-snow',
    fog: 'gradient-fog',
    storm: 'gradient-storm',
  };
  return gradients[cat] || 'gradient-clear';
}

/**
 * Format time string from ISO
 */
export function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format date from ISO to "Mon, Jul 4"
 */
export function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Convert Celsius to Fahrenheit
 */
export function toFahrenheit(celsius) {
  return Math.round((celsius * 9) / 5 + 32);
}

/**
 * Format temperature with unit
 */
export function formatTemp(celsius, unit = 'C') {
  const val = unit === 'F' ? toFahrenheit(celsius) : Math.round(celsius);
  return `${val}°${unit}`;
}

/**
 * Wind direction degrees → compass label
 */
export function windDirection(degrees) {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(degrees / 22.5) % 16];
}

/**
 * AQI category from European AQI value
 */
export function getAQICategory(aqi) {
  if (aqi <= 20) return { label: 'Good', color: '#0d9488', level: 1 };
  if (aqi <= 40) return { label: 'Fair', color: '#84cc16', level: 2 };
  if (aqi <= 60) return { label: 'Moderate', color: '#f59e0b', level: 3 };
  if (aqi <= 80) return { label: 'Poor', color: '#f97316', level: 4 };
  if (aqi <= 100) return { label: 'Very Poor', color: '#ef4444', level: 5 };
  return { label: 'Extremely Poor', color: '#b91c1c', level: 6 };
}

/**
 * UV Index category
 */
export function getUVCategory(uv) {
  if (uv <= 2) return { label: 'Low', color: '#0d9488', level: 1 }; // Teal
  if (uv <= 5) return { label: 'Moderate', color: '#0284c7', level: 2 }; // Blue
  if (uv <= 7) return { label: 'High', color: '#d97706', level: 3 }; // Amber
  if (uv <= 10) return { label: 'Very High', color: '#ef4444', level: 4 }; // Red
  return { label: 'Extreme', color: '#b91c1c', level: 5 }; // Crimson/Deep Red (no purple)
}

/**
 * Weather-based smart recommendations
 */
export function getRecommendations(weatherCode, uvIndex, aqi, temp) {
  const recs = [];
  const cat = WMO_CODES[weatherCode]?.category || 'clear';

  if (cat === 'rain' || cat === 'storm') recs.push({ icon: '☂️', text: 'Carry an umbrella today' });
  if (cat === 'storm') recs.push({ icon: '⚡', text: 'Avoid outdoor activities — thunderstorm risk' });
  if (cat === 'snow') recs.push({ icon: '🧤', text: 'Bundle up! Snow expected' });
  if (cat === 'fog') recs.push({ icon: '🚗', text: 'Drive carefully — low visibility due to fog' });
  if (uvIndex >= 6) recs.push({ icon: '🕶️', text: 'Wear sunscreen — UV index is high' });
  if (uvIndex >= 8) recs.push({ icon: '🌂', text: 'Seek shade between 10am–4pm' });
  if (aqi && aqi > 60) recs.push({ icon: '😷', text: 'Air quality is poor — consider a mask outdoors' });
  if (temp >= 35) recs.push({ icon: '💧', text: 'Stay hydrated — very hot conditions' });
  if (temp <= 0) recs.push({ icon: '🧥', text: 'Freezing conditions — dress in layers' });
  if (cat === 'clear' && temp > 15 && temp < 30 && uvIndex < 6) recs.push({ icon: '🌤️', text: 'Great day to be outdoors!' });

  return recs.slice(0, 4);
}

/**
 * Get today's hourly data (next 24 hours from current hour)
 */
export function getTodayHourly(hourlyData) {
  const now = new Date();
  const currentHour = now.getHours();
  const start = currentHour;
  const end = start + 24;
  return {
    times: hourlyData.time.slice(start, end),
    temps: hourlyData.temperature_2m.slice(start, end),
    precipitation: hourlyData.precipitation_probability.slice(start, end),
  };
}

/**
 * Sunrise/sunset progress (0–1)
 */
export function getSunProgress(sunrise, sunset) {
  const now = Date.now();
  const rise = new Date(sunrise).getTime();
  const set = new Date(sunset).getTime();
  if (now < rise) return 0;
  if (now > set) return 1;
  return (now - rise) / (set - rise);
}
