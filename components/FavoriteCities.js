/**
 * ATMOS — Favorite Cities Component
 * Saved cities grid with quick-access weather
 * Author: Agrima Vijayvargiya
 */
'use client';

import WeatherIcon from './WeatherIcon';
import { WMO_CODES, formatTemp } from '@/lib/weatherUtils';

export default function FavoriteCities({ favorites, onSelect, onRemove, citiesData, unit }) {
  if (!favorites?.length) return null;

  return (
    <div className="favorites-card glass-card" aria-label="Saved favorite cities">
      <div className="card-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
        <h2>Favorite Cities</h2>
      </div>

      <div className="favorites-grid" role="list">
        {favorites.map((city) => {
          const data = citiesData?.[`${city.latitude},${city.longitude}`];
          const wmo = data ? WMO_CODES[data.current?.weather_code] || WMO_CODES[0] : null;
          const temp = data ? formatTemp(data.current?.temperature_2m, unit) : '—';

          return (
            <div key={`${city.latitude},${city.longitude}`} className="favorite-city-item" role="listitem">
              <button
                className="favorite-city-btn"
                onClick={() => onSelect(city)}
                aria-label={`View weather for ${city.name}`}
                id={`fav-city-${city.name?.replace(/\s+/g, '-').toLowerCase()}`}
              >
                <div className="fav-city-icon">
                  {wmo ? <WeatherIcon type={wmo.icon} size={36}/> : (
                    <div className="fav-city-loading-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="5"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="fav-city-info">
                  <span className="fav-city-name">{city.name}</span>
                  <span className="fav-city-country">{city.country || ''}</span>
                </div>
                <div className="fav-city-temp">
                  <span className="fav-temp-value">{temp}</span>
                  {wmo && <span className="fav-condition">{wmo.label}</span>}
                </div>
              </button>
              <button
                className="fav-remove-btn"
                onClick={(e) => { e.stopPropagation(); onRemove(city); }}
                aria-label={`Remove ${city.name} from favorites`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
