/**
 * ATMOS — Sunrise/Sunset Component
 * Arc visualization with current sun position
 * Author: Agrima Vijayvargiya
 */
'use client';

import { formatTime, getSunProgress } from '@/lib/weatherUtils';

export default function SunriseSunset({ daily }) {
  if (!daily?.sunrise?.[0]) return null;

  const sunrise = daily.sunrise[0];
  const sunset = daily.sunset[0];
  const progress = getSunProgress(sunrise, sunset);

  // SVG arc math
  const W = 260, H = 140;
  const cx = W / 2, cy = H - 20;
  const r = 100;

  // Arc from left (sunrise) to right (sunset), semicircle
  const startAngle = Math.PI; // left
  const endAngle = 0; // right

  const arcStart = { x: cx + r * Math.cos(startAngle), y: cy + r * Math.sin(startAngle) };
  const arcEnd = { x: cx + r * Math.cos(endAngle), y: cy + r * Math.sin(endAngle) };

  // Sun position along arc
  const sunAngle = Math.PI - progress * Math.PI;
  const sunX = cx + r * Math.cos(sunAngle);
  const sunY = cy + r * Math.sin(sunAngle);

  // Duration
  const riseMs = new Date(sunrise).getTime();
  const setMs = new Date(sunset).getTime();
  const durationH = Math.floor((setMs - riseMs) / 3600000);
  const durationM = Math.floor(((setMs - riseMs) % 3600000) / 60000);

  const isNight = progress <= 0 || progress >= 1;

  return (
    <div className="sun-card glass-card" aria-label="Sunrise and sunset times">
      <div className="card-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v8M12 12a4 4 0 0 0 0 8M4.93 10.93l1.41 1.41M17.66 10.93l-1.41 1.41M2 18h2M20 18h2M6 18a6 6 0 0 1 12 0"/>
        </svg>
        <h2>Sunrise & Sunset</h2>
      </div>

      <div className="sun-content">
        {/* Arc SVG */}
        <div className="sun-arc-wrapper" aria-hidden="true">
          <svg viewBox={`0 0 ${W} ${H}`} className="sun-arc-svg">
            {/* Gradient sky */}
            <defs>
              <linearGradient id="skyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.3"/>
                <stop offset="50%" stopColor="#FBBF24" stopOpacity="0.15"/>
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.3"/>
              </linearGradient>
              <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#FBBF24" stopOpacity="0"/>
              </radialGradient>
            </defs>

            {/* Ground line */}
            <line x1="10" y1={cy} x2={W - 10} y2={cy} stroke="var(--glass-border)" strokeWidth="1.5"/>

            {/* Track arc */}
            <path
              d={`M ${arcStart.x} ${arcStart.y} A ${r} ${r} 0 0 1 ${arcEnd.x} ${arcEnd.y}`}
              fill="url(#skyGrad)" stroke="var(--glass-border)" strokeWidth="1.5" strokeDasharray="4 3"
            />

            {/* Progress arc */}
            {progress > 0 && progress < 1 && (
              <path
                d={`M ${arcStart.x} ${arcStart.y} A ${r} ${r} 0 0 1 ${sunX} ${sunY}`}
                fill="none" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round"
              />
            )}

            {/* Sun glow */}
            {!isNight && (
              <circle cx={sunX} cy={sunY} r="18" fill="url(#sunGlow)" opacity="0.5"/>
            )}

            {/* Sun */}
            <circle
              cx={sunX} cy={sunY} r={isNight ? 6 : 10}
              fill={isNight ? '#94a3b8' : '#FBBF24'}
              style={{ filter: isNight ? 'none' : 'drop-shadow(0 0 10px #FBBF24)' }}
            />

            {/* Sunrise label */}
            <text x={arcStart.x} y={cy + 18} textAnchor="middle" fontSize="9" fill="var(--text-secondary)" fontFamily="Inter">Sunrise</text>
            {/* Sunset label */}
            <text x={arcEnd.x} y={cy + 18} textAnchor="middle" fontSize="9" fill="var(--text-secondary)" fontFamily="Inter">Sunset</text>
          </svg>
        </div>

        {/* Times */}
        <div className="sun-times">
          <div className="sun-time-item">
            <span className="sun-time-icon">🌅</span>
            <div>
              <span className="sun-time-label">Sunrise</span>
              <span className="sun-time-value">{formatTime(sunrise)}</span>
            </div>
          </div>
          <div className="sun-duration">
            <span className="sun-duration-text">{durationH}h {durationM}m of daylight</span>
          </div>
          <div className="sun-time-item">
            <span className="sun-time-icon">🌇</span>
            <div>
              <span className="sun-time-label">Sunset</span>
              <span className="sun-time-value">{formatTime(sunset)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
