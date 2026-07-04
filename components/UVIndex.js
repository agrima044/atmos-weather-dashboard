/**
 * ATMOS — UV Index Component
 * Circular ring showing UV index with risk level
 * Author: Agrima Vijayvargiya
 */
'use client';

import { getUVCategory } from '@/lib/weatherUtils';

export default function UVIndex({ uvIndex }) {
  if (uvIndex === undefined || uvIndex === null) return null;

  const category = getUVCategory(uvIndex);
  const maxUV = 12;
  const pct = Math.min(uvIndex / maxUV, 1);

  // SVG ring
  const r = 42;
  const circumference = 2 * Math.PI * r;
  const strokeDash = pct * circumference * 0.75; // 3/4 circle
  const strokeOffset = circumference * 0.125; // start at 7 o'clock

  const protectionTips = [
    { min: 0, max: 2, tip: 'No protection needed', emoji: '😎' },
    { min: 3, max: 5, tip: 'Wear sunglasses & SPF 15+', emoji: '🕶️' },
    { min: 6, max: 7, tip: 'SPF 30+, seek shade midday', emoji: '☀️' },
    { min: 8, max: 10, tip: 'SPF 50+, hat & protective clothing', emoji: '🧴' },
    { min: 11, max: 99, tip: 'Avoid sun 10am–4pm, stay covered', emoji: '⚠️' },
  ];
  const tip = protectionTips.find((t) => uvIndex >= t.min && uvIndex <= t.max) || protectionTips[0];

  return (
    <div className="uv-card glass-card" aria-label={`UV Index: ${uvIndex}, ${category.label}`}>
      <div className="card-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <h2>UV Index</h2>
      </div>

      <div className="uv-content">
        <div className="uv-ring-wrapper" aria-hidden="true">
          <svg viewBox="0 0 100 100" className="uv-ring-svg">
            {/* Track */}
            <circle
              cx="50" cy="50" r={r}
              fill="none"
              stroke="var(--glass-border)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${circumference * 0.75} ${circumference}`}
              strokeDashoffset={-strokeOffset}
              transform="rotate(135 50 50)"
            />
            {/* Fill */}
            <circle
              cx="50" cy="50" r={r}
              fill="none"
              stroke={category.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${strokeDash} ${circumference}`}
              strokeDashoffset={-strokeOffset}
              transform="rotate(135 50 50)"
              style={{
                filter: `drop-shadow(0 0 8px ${category.color}80)`,
                transition: 'stroke-dasharray 1s ease',
              }}
            />
            {/* Index */}
            <text x="50" y="46" textAnchor="middle" fontSize="22" fontWeight="700" fill={category.color} fontFamily="Inter">
              {Math.round(uvIndex)}
            </text>
            <text x="50" y="60" textAnchor="middle" fontSize="9" fill="var(--text-secondary)" fontFamily="Inter">
              {category.label}
            </text>
          </svg>
        </div>

        <div className="uv-info">
          <div className="uv-tip">
            <span className="uv-tip-emoji">{tip.emoji}</span>
            <p className="uv-tip-text">{tip.tip}</p>
          </div>

          {/* UV scale */}
          <div className="uv-scale" aria-label="UV index scale">
            {['Low', 'Mod', 'High', 'V.High', 'Extreme'].map((label, i) => {
              const colors = ['#22c55e', '#eab308', '#f97316', '#ef4444', '#7c3aed'];
              const active = i === category.level - 1 || (i === 4 && category.level >= 5);
              return (
                <div key={label} className={`uv-scale-item ${active ? 'active' : ''}`}>
                  <div className="uv-scale-dot" style={{ background: colors[i], opacity: active ? 1 : 0.35 }}/>
                  <span className="uv-scale-label">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
