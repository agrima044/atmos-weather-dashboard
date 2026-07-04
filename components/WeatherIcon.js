/**
 * ATMOS — Weather Icon Component
 * Animated SVG icons for weather conditions
 * Author: Agrima Vijayvargiya
 */
'use client';

export default function WeatherIcon({ type, size = 64, isDay = true }) {
  const s = size;
  const icons = {
    sun: (
      <svg width={s} height={s} viewBox="0 0 64 64" className="weather-icon icon-sun">
        <circle cx="32" cy="32" r="14" fill="#FBBF24" className="sun-core"/>
        {[0,45,90,135,180,225,270,315].map((deg, i) => (
          <line
            key={i}
            x1="32" y1="10" x2="32" y2="4"
            stroke="#FBBF24" strokeWidth="3" strokeLinecap="round"
            transform={`rotate(${deg} 32 32)`}
            className="sun-ray"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </svg>
    ),
    'sun-cloud': (
      <svg width={s} height={s} viewBox="0 0 64 64" className="weather-icon">
        <circle cx="22" cy="22" r="10" fill="#FBBF24" className="sun-core-small"/>
        {[0,60,120,180,240,300].map((deg, i) => (
          <line key={i} x1="22" y1="8" x2="22" y2="4" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round"
            transform={`rotate(${deg} 22 22)`} className="sun-ray"/>
        ))}
        <ellipse cx="36" cy="38" rx="14" ry="9" fill="currentColor" opacity="0.9"/>
        <ellipse cx="26" cy="40" rx="10" ry="7" fill="currentColor" opacity="0.9"/>
        <ellipse cx="42" cy="41" rx="9" ry="7" fill="currentColor"/>
      </svg>
    ),
    'cloud-sun': (
      <svg width={s} height={s} viewBox="0 0 64 64" className="weather-icon">
        <circle cx="20" cy="20" r="9" fill="#FBBF24" className="sun-core-small"/>
        {[0,60,120,180,240,300].map((deg, i) => (
          <line key={i} x1="20" y1="8" x2="20" y2="4" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round"
            transform={`rotate(${deg} 20 20)`}/>
        ))}
        <ellipse cx="35" cy="40" rx="16" ry="10" fill="currentColor" opacity="0.85"/>
        <ellipse cx="24" cy="43" rx="11" ry="8" fill="currentColor" opacity="0.85"/>
        <ellipse cx="45" cy="43" rx="10" ry="8" fill="currentColor"/>
      </svg>
    ),
    cloud: (
      <svg width={s} height={s} viewBox="0 0 64 64" className="weather-icon icon-cloud">
        <ellipse cx="32" cy="36" rx="20" ry="12" fill="currentColor"/>
        <circle cx="22" cy="30" r="10" fill="currentColor"/>
        <circle cx="36" cy="28" r="13" fill="currentColor"/>
      </svg>
    ),
    fog: (
      <svg width={s} height={s} viewBox="0 0 64 64" className="weather-icon">
        <ellipse cx="32" cy="22" rx="20" ry="10" fill="currentColor" opacity="0.6"/>
        <circle cx="22" cy="18" r="9" fill="currentColor" opacity="0.6"/>
        <circle cx="36" cy="16" r="11" fill="currentColor" opacity="0.6"/>
        {[28,36,44].map((y, i) => (
          <line key={i} x1="12" y1={y} x2="52" y2={y} stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.5"
            className="fog-line" style={{ animationDelay: `${i * 0.3}s` }}/>
        ))}
      </svg>
    ),
    rain: (
      <svg width={s} height={s} viewBox="0 0 64 64" className="weather-icon">
        <ellipse cx="32" cy="22" rx="18" ry="10" fill="currentColor" opacity="0.8"/>
        <circle cx="24" cy="18" r="9" fill="currentColor" opacity="0.8"/>
        <circle cx="36" cy="16" r="11" fill="currentColor" opacity="0.8"/>
        {[[22,36,46],[30,38,50],[38,36,47],[26,42,54],[34,40,52]].map(([x,y1,y2], i) => (
          <line key={i} x1={x} y1={y1} x2={x-4} y2={y2} stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round"
            className="rain-drop" style={{ animationDelay: `${i * 0.15}s` }}/>
        ))}
      </svg>
    ),
    drizzle: (
      <svg width={s} height={s} viewBox="0 0 64 64" className="weather-icon">
        <ellipse cx="32" cy="22" rx="16" ry="9" fill="currentColor" opacity="0.7"/>
        <circle cx="24" cy="18" r="8" fill="currentColor" opacity="0.7"/>
        <circle cx="36" cy="16" r="10" fill="currentColor" opacity="0.7"/>
        {[[20,36,42],[28,38,45],[36,36,42],[24,42,48],[32,41,47]].map(([x,y1,y2], i) => (
          <line key={i} x1={x} y1={y1} x2={x-2} y2={y2} stroke="#2DD4BF" strokeWidth="2" strokeLinecap="round"
            className="rain-drop" style={{ animationDelay: `${i * 0.2}s` }}/>
        ))}
      </svg>
    ),
    shower: (
      <svg width={s} height={s} viewBox="0 0 64 64" className="weather-icon">
        <circle cx="20" cy="16" r="8" fill="#FBBF24"/>
        <ellipse cx="36" cy="24" rx="18" ry="10" fill="currentColor" opacity="0.85"/>
        <circle cx="26" cy="20" r="10" fill="currentColor" opacity="0.85"/>
        {[[22,36,48],[30,34,46],[38,36,48],[26,42,54],[34,40,52]].map(([x,y1,y2], i) => (
          <line key={i} x1={x} y1={y1} x2={x-5} y2={y2} stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round"
            className="rain-drop" style={{ animationDelay: `${i * 0.12}s` }}/>
        ))}
      </svg>
    ),
    snow: (
      <svg width={s} height={s} viewBox="0 0 64 64" className="weather-icon">
        <ellipse cx="32" cy="20" rx="18" ry="10" fill="currentColor" opacity="0.8"/>
        <circle cx="24" cy="16" r="9" fill="currentColor" opacity="0.8"/>
        <circle cx="36" cy="14" r="11" fill="currentColor" opacity="0.8"/>
        {[[20,38],[30,42],[40,38],[24,50],[36,48]].map(([x,y], i) => (
          <g key={i} className="snowflake" style={{ animationDelay: `${i * 0.2}s` }}>
            <circle cx={x} cy={y} r="3" fill="#93C5FD"/>
            <line x1={x} y1={y-4} x2={x} y2={y+4} stroke="#93C5FD" strokeWidth="1.5"/>
            <line x1={x-4} y1={y} x2={x+4} y2={y} stroke="#93C5FD" strokeWidth="1.5"/>
          </g>
        ))}
      </svg>
    ),
    thunder: (
      <svg width={s} height={s} viewBox="0 0 64 64" className="weather-icon">
        <ellipse cx="32" cy="18" rx="20" ry="11" fill="currentColor" opacity="0.9"/>
        <circle cx="22" cy="14" r="10" fill="currentColor" opacity="0.9"/>
        <circle cx="38" cy="12" r="13" fill="currentColor" opacity="0.9"/>
        <polygon points="35,30 26,44 32,44 28,58 44,38 36,38 42,30" fill="#FBBF24" className="lightning-bolt"/>
      </svg>
    ),
  };

  return (
    <span className="weather-icon-wrapper" aria-hidden="true">
      {icons[type] || icons['sun']}
    </span>
  );
}
