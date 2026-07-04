/**
 * ATMOS — Air Quality Component
 * AQI gauge with pollutant breakdown
 * Author: Agrima Vijayvargiya
 */
'use client';

import { getAQICategory } from '@/lib/weatherUtils';

export default function AirQuality({ data }) {
  if (!data?.current) return null;

  const { pm2_5, pm10, carbon_monoxide, european_aqi } = data.current;
  const category = getAQICategory(european_aqi || 0);

  const pollutants = [
    { name: 'PM2.5', value: pm2_5, unit: 'μg/m³', max: 75, color: '#38BDF8' },
    { name: 'PM10', value: pm10, unit: 'μg/m³', max: 150, color: '#2DD4BF' },
    { name: 'CO', value: carbon_monoxide ? (carbon_monoxide / 1000).toFixed(2) : 0, unit: 'mg/m³', max: 4, color: '#8B5CF6' },
  ];

  // Gauge arc SVG
  const aqiPercent = Math.min((european_aqi || 0) / 100, 1);
  const gaugeAngle = aqiPercent * 180; // 0 to 180 degrees
  const r = 54;
  const cx = 70, cy = 70;
  const toRad = (deg) => (deg - 180) * (Math.PI / 180);
  const arcX = cx + r * Math.cos(toRad(gaugeAngle));
  const arcY = cy + r * Math.sin(toRad(gaugeAngle));

  return (
    <div className="aqi-card glass-card" aria-label="Air quality index">
      <div className="card-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 2h8l4 10H4L8 2z"/><path d="M4 12a8 8 0 0 0 16 0"/>
        </svg>
        <h2>Air Quality</h2>
      </div>

      <div className="aqi-content">
        {/* Gauge */}
        <div className="aqi-gauge-wrapper" aria-label={`AQI: ${european_aqi}, ${category.label}`}>
          <svg viewBox="0 0 140 80" className="aqi-gauge-svg" aria-hidden="true">
            {/* Track */}
            <path
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
              fill="none" stroke="var(--glass-border)" strokeWidth="10" strokeLinecap="round"
            />
            {/* Colored fill */}
            <path
              d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${arcX} ${arcY}`}
              fill="none" stroke={category.color} strokeWidth="10" strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 8px ${category.color}60)` }}
            />
            {/* Center text */}
            <text x={cx} y={cy - 8} textAnchor="middle" fontSize="22" fontWeight="700" fill={category.color} fontFamily="Inter">
              {european_aqi || 0}
            </text>
            <text x={cx} y={cy + 8} textAnchor="middle" fontSize="10" fill="var(--text-secondary)" fontFamily="Inter">
              {category.label}
            </text>
            {/* Scale labels */}
            <text x={cx - r - 4} y={cy + 14} fontSize="8" fill="var(--text-muted)" fontFamily="Inter">Good</text>
            <text x={cx + r - 16} y={cy + 14} fontSize="8" fill="var(--text-muted)" fontFamily="Inter">Hazard</text>
          </svg>
        </div>

        {/* Pollutant bars */}
        <div className="pollutants-list" role="list" aria-label="Pollutant levels">
          {pollutants.map((p) => {
            const val = parseFloat(p.value) || 0;
            const pct = Math.min((val / p.max) * 100, 100);
            return (
              <div key={p.name} className="pollutant-item" role="listitem">
                <div className="pollutant-header">
                  <span className="pollutant-name">{p.name}</span>
                  <span className="pollutant-value">{typeof p.value === 'number' ? p.value?.toFixed(1) : p.value} {p.unit}</span>
                </div>
                <div className="pollutant-bar-track" aria-label={`${p.name}: ${pct.toFixed(0)}%`}>
                  <div
                    className="pollutant-bar-fill"
                    style={{ width: `${pct}%`, background: p.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="aqi-footer">
        <span>Source: Open-Meteo Air Quality API</span>
      </div>
    </div>
  );
}
