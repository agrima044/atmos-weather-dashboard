/**
 * ATMOS — Search Bar Component
 * City search with autocomplete, geolocation, and recent searches
 * Author: Agrima Vijayvargiya
 */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { searchCities } from '@/lib/api';

export default function SearchBar({ onCitySelect, recentSearches, onClearRecent }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  const fetchSuggestions = useCallback(async (q) => {
    if (!q || q.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const results = await searchCities(q);
      setSuggestions(results);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 350);
    return () => clearTimeout(debounceRef.current);
  }, [query, fetchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!dropdownRef.current?.contains(e.target) && !inputRef.current?.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (city) => {
    onCitySelect(city);
    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);
    setActiveIndex(-1);
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onCitySelect({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, name: 'My Location', fromGeo: true });
        setGeoLoading(false);
      },
      () => setGeoLoading(false)
    );
  };

  const handleKeyDown = (e) => {
    const items = suggestions.length ? suggestions : [];
    if (e.key === 'ArrowDown') {
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      handleSelect(items[activeIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const showRecents = !query && recentSearches?.length > 0;

  return (
    <div className="search-container" role="search">
      <div className="search-input-wrapper">
        <span className="search-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </span>

        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Search city, town or location…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); setActiveIndex(-1); }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          aria-label="Search for a city"
          aria-autocomplete="list"
          aria-controls="search-dropdown"
          aria-expanded={showDropdown}
          id="city-search-input"
          autoComplete="off"
        />

        {query && (
          <button
            className="search-clear-btn"
            onClick={() => { setQuery(''); setSuggestions([]); inputRef.current?.focus(); }}
            aria-label="Clear search"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        )}

        {loading && (
          <span className="search-spinner" aria-label="Loading suggestions">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          </span>
        )}

        <button
          className="geo-btn"
          onClick={handleGeolocate}
          disabled={geoLoading}
          aria-label="Use my location"
          title="Detect my location"
          id="geo-location-btn"
        >
          {geoLoading ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
            </svg>
          )}
        </button>
      </div>

      {showDropdown && (suggestions.length > 0 || showRecents) && (
        <div
          id="search-dropdown"
          ref={dropdownRef}
          className="search-dropdown"
          role="listbox"
          aria-label="City suggestions"
        >
          {showRecents && (
            <div className="dropdown-section">
              <div className="dropdown-section-header">
                <span>Recent Searches</span>
                <button className="clear-recents-btn" onClick={onClearRecent}>Clear</button>
              </div>
              {recentSearches.map((city, i) => (
                <button
                  key={`recent-${i}`}
                  className="dropdown-item dropdown-item-recent"
                  onClick={() => handleSelect(city)}
                  role="option"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="item-icon">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span className="item-name">{city.name}</span>
                  <span className="item-country">
                    {[city.admin1, city.country_code].filter(Boolean).join(', ') || city.country || ''}
                  </span>
                </button>
              ))}
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="dropdown-section">
              {showRecents && <div className="dropdown-divider"/>}
              {suggestions.map((city, i) => (
                <button
                  key={`${city.id || i}`}
                  className={`dropdown-item ${activeIndex === i ? 'active' : ''}`}
                  onClick={() => handleSelect(city)}
                  role="option"
                  aria-selected={activeIndex === i}
                  title={city.display_name || ''}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="item-icon">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span className="item-name">{city.name}</span>
                  <span className="item-meta">{[city.admin1, city.country_code].filter(Boolean).join(', ')}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
