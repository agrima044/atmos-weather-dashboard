/**
 * ATMOS — Weather Alerts Component
 * Displays active weather alerts and warnings
 * Author: Agrima Vijayvargiya
 */
'use client';

import { WMO_CODES } from '@/lib/weatherUtils';

function generateAlerts(weatherCode, uvIndex, aqi, windSpeed, temp) {
  const alerts = [];
  const cat = WMO_CODES[weatherCode]?.category || 'clear';

  if (cat === 'storm') {
    alerts.push({ level: 'danger', title: 'Thunderstorm Warning', message: 'Severe thunderstorm activity detected. Stay indoors, unplug electronics, avoid elevated areas.', icon: '⚡' });
  }
  if (windSpeed > 70) {
    alerts.push({ level: 'danger', title: 'High Wind Alert', message: `Wind speeds of ${Math.round(windSpeed)} km/h. Secure loose objects outdoors.`, icon: '🌬️' });
  } else if (windSpeed > 50) {
    alerts.push({ level: 'warning', title: 'Strong Wind Advisory', message: `Wind gusts up to ${Math.round(windSpeed)} km/h. Exercise caution outdoors.`, icon: '💨' });
  }
  if (uvIndex >= 8) {
    alerts.push({ level: 'warning', title: 'High UV Alert', message: `UV Index of ${Math.round(uvIndex)} — very high radiation. Apply SPF 50+ and seek shade.`, icon: '☀️' });
  }
  if (aqi > 80) {
    alerts.push({ level: 'warning', title: 'Air Quality Warning', message: `AQI is ${aqi}. Sensitive groups should reduce outdoor exposure.`, icon: '😷' });
  }
  if (temp >= 40) {
    alerts.push({ level: 'danger', title: 'Extreme Heat Warning', message: `Temperature of ${Math.round(temp)}°C is dangerous. Stay hydrated, avoid direct sun.`, icon: '🔥' });
  } else if (temp >= 35) {
    alerts.push({ level: 'warning', title: 'Heat Advisory', message: `High temperature of ${Math.round(temp)}°C. Drink water and stay in cool areas.`, icon: '🌡️' });
  }
  if (temp <= -5) {
    alerts.push({ level: 'warning', title: 'Freezing Temperature Alert', message: `Temperature at ${Math.round(temp)}°C. Risk of frostbite. Cover extremities.`, icon: '🧊' });
  }
  if ((cat === 'rain' || cat === 'storm') && temp < 5) {
    alerts.push({ level: 'info', title: 'Rain & Cold Advisory', message: 'Cold rain conditions. Risk of hypothermia in prolonged exposure.', icon: '🌧️' });
  }

  return alerts;
}

const levelStyles = {
  danger: { bg: 'rgba(239,68,68,0.12)', border: '#ef4444', icon: '🚨' },
  warning: { bg: 'rgba(251,191,36,0.12)', border: '#FBBF24', icon: '⚠️' },
  info: { bg: 'rgba(56,189,248,0.12)', border: '#38BDF8', icon: 'ℹ️' },
};

export default function WeatherAlerts({ weatherCode, uvIndex, aqi, windSpeed, temp }) {
  const alerts = generateAlerts(weatherCode, uvIndex, aqi, windSpeed, temp);

  if (!alerts.length) {
    return (
      <div className="alerts-card glass-card" aria-label="Weather alerts">
        <div className="card-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <h2>Weather Alerts</h2>
        </div>
        <div className="alerts-clear">
          <span className="clear-icon">✅</span>
          <p>No active weather alerts for this location. Conditions look good!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="alerts-card glass-card" aria-label="Weather alerts">
      <div className="card-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FBBF24" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <h2>Weather Alerts</h2>
        <span className="alerts-count-badge">{alerts.length}</span>
      </div>

      <ul className="alerts-list" role="list" aria-label="Active weather alerts">
        {alerts.map((alert, i) => {
          const style = levelStyles[alert.level];
          return (
            <li
              key={i}
              className={`alert-item alert-${alert.level}`}
              role="listitem"
              style={{
                background: style.bg,
                borderLeft: `3px solid ${style.border}`,
                animationDelay: `${i * 0.1}s`,
              }}
              aria-label={`${alert.level} alert: ${alert.title}`}
            >
              <div className="alert-header">
                <span className="alert-icon" aria-hidden="true">{alert.icon}</span>
                <strong className="alert-title">{alert.title}</strong>
                <span className="alert-level-badge" style={{ background: style.border }}>{alert.level}</span>
              </div>
              <p className="alert-message">{alert.message}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
