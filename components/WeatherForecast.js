/**
 * ATMOS — 7-Day Forecast Component
 * Daily weather forecast with high/low temps and icons
 * Author: Agrima Vijayvargiya
 */
'use client';

import WeatherIcon from './WeatherIcon';
import { WMO_CODES, formatTemp, formatDate } from '@/lib/weatherUtils';

export default function WeatherForecast({ data, unit }) {
  if (!data?.daily) return null;

  const { daily } = data;
  const days = daily.time.map((time, i) => ({
    date: time,
    weatherCode: daily.weather_code[i],
    maxTemp: daily.temperature_2m_max[i],
    minTemp: daily.temperature_2m_min[i],
    precipitation: daily.precipitation_sum[i],
    windMax: daily.wind_speed_10m_max[i],
    uvMax: daily.uv_index_max[i],
  }));

  // Find global min/max for bar scaling
  const allMaxTemps = days.map((d) => d.maxTemp);
  const allMinTemps = days.map((d) => d.minTemp);
  const globalMax = Math.max(...allMaxTemps);
  const globalMin = Math.min(...allMinTemps);
  const range = globalMax - globalMin || 1;

  return (
    <div className="forecast-card glass-card" aria-label="7-day weather forecast">
      <div className="card-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <h2>7-Day Forecast</h2>
      </div>

      <div className="forecast-list" role="list">
        {days.map((day, i) => {
          const wmo = WMO_CODES[day.weatherCode] || WMO_CODES[0];
          const isToday = i === 0;
          const barLeft = ((day.minTemp - globalMin) / range) * 100;
          const barWidth = ((day.maxTemp - day.minTemp) / range) * 100;

          return (
            <div
              key={day.date}
              className={`forecast-row ${isToday ? 'today' : ''}`}
              role="listitem"
              aria-label={`${isToday ? 'Today' : formatDate(day.date)}: ${wmo.label}, High ${formatTemp(day.maxTemp, unit)}, Low ${formatTemp(day.minTemp, unit)}`}
            >
              <span className="forecast-day">{isToday ? 'Today' : formatDate(day.date)}</span>

              <div className="forecast-icon-condition">
                <WeatherIcon type={wmo.icon} size={32}/>
                <span className="forecast-condition">{wmo.label}</span>
              </div>

              <div className="forecast-precip" title={`${day.precipitation} mm`}>
                {day.precipitation > 0 && (
                  <>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#38BDF8">
                      <path d="M12 2l-8 14h16L12 2z"/>
                    </svg>
                    <span>{day.precipitation.toFixed(1)}mm</span>
                  </>
                )}
              </div>

              <div className="forecast-temp-bar-container">
                <span className="forecast-temp-min">{formatTemp(day.minTemp, unit)}</span>
                <div className="forecast-bar-track">
                  <div
                    className="forecast-bar-fill"
                    style={{ left: `${barLeft}%`, width: `${Math.max(barWidth, 5)}%` }}
                    aria-hidden="true"
                  />
                </div>
                <span className="forecast-temp-max">{formatTemp(day.maxTemp, unit)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
