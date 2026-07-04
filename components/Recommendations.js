/**
 * ATMOS — Weather Recommendations Component
 * Smart, context-aware weather advice cards
 * Author: Agrima Vijayvargiya
 */
'use client';

import { getRecommendations } from '@/lib/weatherUtils';

export default function Recommendations({ weatherCode, uvIndex, aqi, temp }) {
  const recs = getRecommendations(weatherCode, uvIndex, aqi, temp);

  if (!recs.length) return null;

  return (
    <div className="recs-card glass-card" aria-label="Weather recommendations">
      <div className="card-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
          <path d="M12 8v4M12 16h.01"/>
        </svg>
        <h2>Today&apos;s Recommendations</h2>
      </div>

      <ul className="recs-list" role="list" aria-label="Weather advice">
        {recs.map((rec, i) => (
          <li
            key={i}
            className="rec-item"
            role="listitem"
            style={{ animationDelay: `${i * 0.08}s` }}
          >
            <span className="rec-emoji" aria-hidden="true">{rec.icon}</span>
            <span className="rec-text">{rec.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
