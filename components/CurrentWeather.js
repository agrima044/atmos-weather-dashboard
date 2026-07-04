/**
 * ATMOS — Current Weather Component
 * Main hero card showing live weather conditions
 * Author: Agrima Vijayvargiya
 */
'use client';

import WeatherIcon from './WeatherIcon';
import { WMO_CODES, formatTemp, windDirection } from '@/lib/weatherUtils';

export default function CurrentWeather({ data, airQuality, city, unit, onUnitToggle, onAddFavorite, isFavorite }) {
  if (!data) return null;

  const { current } = data;
  const wmo = WMO_CODES[current.weather_code] || WMO_CODES[0];
  const temp = formatTemp(current.temperature_2m, unit);
  const feelsLike = formatTemp(current.apparent_temperature, unit);

  const stats = [
    { icon: '💧', label: 'Humidity', value: `${current.relative_humidity_2m}%` },
    { icon: '💨', label: 'Wind', value: `${Math.round(current.wind_speed_10m)} km/h ${windDirection(current.wind_direction_10m)}` },
    { icon: '🌡️', label: 'Pressure', value: `${Math.round(current.surface_pressure)} hPa` },
    { icon: '👁️', label: 'Visibility', value: `${Math.round((current.visibility || 10000) / 1000)} km` },
  ];

  return (
    <div className="current-weather-card glass-card" aria-label="Current weather conditions">
      {/* Header */}
      <div className="cw-header">
        <div className="cw-location">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <h1 className="city-name">{city?.name || 'Loading…'}</h1>
          {city?.country && <span className="city-country">{city.country}</span>}
          <span className="live-badge" title="Live data">
            <span className="live-dot"/>LIVE
          </span>
        </div>
        <div className="cw-actions">
          <button
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={onAddFavorite}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            title={isFavorite ? 'Saved' : 'Save city'}
            id="favorite-city-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </button>
          <button
            className="unit-toggle-btn"
            onClick={onUnitToggle}
            aria-label={`Switch to ${unit === 'C' ? 'Fahrenheit' : 'Celsius'}`}
            id="unit-toggle-btn"
          >
            °{unit === 'C' ? 'F' : 'C'}
          </button>
        </div>
      </div>

      {/* Main temp */}
      <div className="cw-main">
        <div className="cw-icon-temp">
          <WeatherIcon type={wmo.icon} size={96} isDay={current.is_day === 1}/>
          <div className="cw-temp-block">
            <span className="cw-temp" aria-label={`Temperature ${temp}`}>{temp}</span>
            <span className="cw-condition">{wmo.label}</span>
            <span className="cw-feels">Feels like {feelsLike}</span>
          </div>
        </div>

        {/* Precip if any */}
        {current.precipitation > 0 && (
          <div className="cw-precip-badge">
            🌧️ {current.precipitation} mm precipitation
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="cw-stats" role="list" aria-label="Weather statistics">
        {stats.map((stat) => (
          <div key={stat.label} className="cw-stat-item" role="listitem">
            <span className="stat-icon" aria-hidden="true">{stat.icon}</span>
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Date/time */}
      <div className="cw-datetime">
        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        &nbsp;·&nbsp;
        {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
      </div>
    </div>
  );
}
