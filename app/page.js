/**
 * ATMOS — Main Dashboard Page
 * Full-stack: Supabase Auth + DB + API proxy + localStorage fallback
 * Author: Agrima Vijayvargiya
 */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import SearchBar from '@/components/SearchBar';
import CurrentWeather from '@/components/CurrentWeather';
import WeatherForecast from '@/components/WeatherForecast';
import HourlyChart from '@/components/HourlyChart';
import AirQuality from '@/components/AirQuality';
import UVIndex from '@/components/UVIndex';
import SunriseSunset from '@/components/SunriseSunset';
import Recommendations from '@/components/Recommendations';
import FavoriteCities from '@/components/FavoriteCities';
import WeatherAlerts from '@/components/WeatherAlerts';
import ThemeToggle from '@/components/ThemeToggle';
import AuthModal from '@/components/AuthModal';
import UserMenu from '@/components/UserMenu';
import { getWeatherData, getAirQuality, reverseGeocode } from '@/lib/api';
import { getWeatherGradient } from '@/lib/weatherUtils';
import { useAuth } from '@/hooks/useAuth';
import {
  getFavorites, addFavorite, removeFavorite,
  getSearchHistory, addSearchHistory, clearSearchHistory,
  getPreferences, savePreferences,
} from '@/lib/db';

const DEFAULT_CITY = { name: 'New Delhi', country: 'IN', latitude: 28.6139, longitude: 77.2090 };

/* ── localStorage helpers ── */
function lsGet(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* ignore */ }
}

export default function HomePage() {
  /* ── Weather state ── */
  const [city, setCity]         = useState(null);
  const [weather, setWeather]   = useState(null);
  const [airQuality, setAQ]     = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  /* ── User preferences ── */
  const [unit, setUnitState]   = useState('C');
  const [theme, setThemeState] = useState('light');

  /* ── Auth ── */
  const { user, loading: authLoading, signInWithEmail, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  /* ── Social data ── */
  const [favorites, setFavoritesState]       = useState([]);
  const [recentSearches, setRecentsState]    = useState([]);
  const [favoritesData, setFavoritesData]    = useState({});

  /* ── Prevent double-loading on auth change ── */
  const prevUserRef = useRef(null);

  /* ─────────────────────────────────────────
     THEME
  ───────────────────────────────────────── */
  const applyTheme = useCallback((t) => {
    const resolved = t === 'auto'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : t;
    document.documentElement.setAttribute('data-theme', resolved);
  }, []);

  useEffect(() => { applyTheme(theme); }, [theme, applyTheme]);

  useEffect(() => {
    if (theme !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('auto');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme, applyTheme]);

  /* ─────────────────────────────────────────
     SET UNIT (saves to Supabase + localStorage)
  ───────────────────────────────────────── */
  const setUnit = useCallback((u) => {
    setUnitState(u);
    lsSet('atmos-unit', u);
    if (user) savePreferences(user.id, { unit: u, theme });
  }, [user, theme]);

  /* ─────────────────────────────────────────
     SET THEME (saves to Supabase + localStorage)
  ───────────────────────────────────────── */
  const setTheme = useCallback((t) => {
    setThemeState(t);
    lsSet('atmos-theme', t);
    if (user) savePreferences(user.id, { unit, theme: t });
  }, [user, unit]);

  /* ─────────────────────────────────────────
     LOAD USER DATA ON AUTH CHANGE
  ───────────────────────────────────────── */
  useEffect(() => {
    if (authLoading) return;

    const prevUser = prevUserRef.current;
    prevUserRef.current = user;

    if (user) {
      // Logged in — load everything from Supabase
      Promise.all([
        getPreferences(user.id),
        getFavorites(user.id),
        getSearchHistory(user.id, 5),
      ]).then(([prefs, favs, history]) => {
        if (prefs) {
          setUnitState(prefs.unit || 'C');
          setThemeState(prefs.theme || 'light');
        } else {
          // First login — migrate localStorage prefs to Supabase
          const lsUnit  = lsGet('atmos-unit', 'C');
          const lsTheme = lsGet('atmos-theme', 'light');
          setUnitState(lsUnit);
          setThemeState(lsTheme);
          savePreferences(user.id, { unit: lsUnit, theme: lsTheme });
        }
        if (favs)    setFavoritesState(favs);
        if (history) setRecentsState(history);
      });
    } else if (prevUser && !user) {
      // Logged out — fall back to localStorage
      setUnitState(lsGet('atmos-unit', 'C'));
      setThemeState(lsGet('atmos-theme', 'light'));
      setFavoritesState(lsGet('atmos-favorites', []));
      setRecentsState(lsGet('atmos-recent', []));
    } else if (!user) {
      // Not logged in on first load
      setUnitState(lsGet('atmos-unit', 'C'));
      setThemeState(lsGet('atmos-theme', 'light'));
      setFavoritesState(lsGet('atmos-favorites', []));
      setRecentsState(lsGet('atmos-recent', []));
    }
  }, [user, authLoading]);

  /* ─────────────────────────────────────────
     FETCH WEATHER
  ───────────────────────────────────────── */
  const fetchWeather = useCallback(async (selectedCity) => {
    setLoading(true);
    setError(null);
    try {
      const [weatherData, aqData] = await Promise.all([
        getWeatherData(selectedCity.latitude, selectedCity.longitude),
        getAirQuality(selectedCity.latitude, selectedCity.longitude).catch(() => null),
      ]);
      setWeather(weatherData);
      setAQ(aqData);
      setCity(selectedCity);
      if (weatherData?.current) {
        document.documentElement.setAttribute(
          'data-gradient',
          getWeatherGradient(weatherData.current.weather_code, weatherData.current.is_day)
        );
      }
    } catch (err) {
      setError('Failed to fetch weather data. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ─────────────────────────────────────────
     FETCH FAVORITES WEATHER DATA
  ───────────────────────────────────────── */
  useEffect(() => {
    if (!favorites.length) return;
    const run = async () => {
      const results = {};
      await Promise.all(favorites.map(async (fav) => {
        try {
          results[`${fav.latitude},${fav.longitude}`] = await getWeatherData(fav.latitude, fav.longitude);
        } catch { /* skip */ }
      }));
      setFavoritesData(results);
    };
    run();
  }, [favorites]);

  /* ─────────────────────────────────────────
     INITIAL CITY LOAD
  ───────────────────────────────────────── */
  useEffect(() => {
    if (authLoading) return;
    const lastCity = lsGet('atmos-last-city', null);
    fetchWeather(lastCity || DEFAULT_CITY);
  }, [authLoading, fetchWeather]);

  /* ─────────────────────────────────────────
     CITY SELECT HANDLER
  ───────────────────────────────────────── */
  const handleCitySelect = useCallback(async (selectedCity) => {
    let resolved = selectedCity;
    if (selectedCity.fromGeo) {
      try {
        const geo = await reverseGeocode(selectedCity.latitude, selectedCity.longitude);
        if (geo) resolved = { ...selectedCity, ...geo };
      } catch { /* use original */ }
    }

    // Save to recent searches
    if (user) {
      addSearchHistory(user.id, resolved);
      getSearchHistory(user.id, 5).then((h) => { if (h) setRecentsState(h); });
    } else {
      const filtered = recentSearches.filter(
        (c) => !(c.latitude === resolved.latitude && c.longitude === resolved.longitude)
      );
      const updated = [resolved, ...filtered].slice(0, 5);
      setRecentsState(updated);
      lsSet('atmos-recent', updated);
    }

    lsSet('atmos-last-city', resolved);
    fetchWeather(resolved);
  }, [user, recentSearches, fetchWeather]);

  /* ─────────────────────────────────────────
     CLEAR RECENT SEARCHES
  ───────────────────────────────────────── */
  const handleClearRecent = useCallback(async () => {
    setRecentsState([]);
    if (user) clearSearchHistory(user.id);
    else lsSet('atmos-recent', []);
  }, [user]);

  /* ─────────────────────────────────────────
     FAVORITES TOGGLE
  ───────────────────────────────────────── */
  const isFavorite = city
    ? favorites.some((f) => f.latitude === city.latitude && f.longitude === city.longitude)
    : false;

  const toggleFavorite = useCallback(async () => {
    if (!city) return;
    if (isFavorite) {
      const updated = favorites.filter(
        (f) => !(f.latitude === city.latitude && f.longitude === city.longitude)
      );
      setFavoritesState(updated);
      if (user) removeFavorite(user.id, city);
      else lsSet('atmos-favorites', updated);
    } else {
      const updated = [...favorites, city];
      setFavoritesState(updated);
      if (user) addFavorite(user.id, city);
      else lsSet('atmos-favorites', updated);
    }
  }, [city, isFavorite, favorites, user]);

  const handleRemoveFavorite = useCallback(async (c) => {
    const updated = favorites.filter(
      (f) => !(f.latitude === c.latitude && f.longitude === c.longitude)
    );
    setFavoritesState(updated);
    if (user) removeFavorite(user.id, c);
    else lsSet('atmos-favorites', updated);
  }, [favorites, user]);

  /* ─────────────────────────────────────────
     RENDER
  ───────────────────────────────────────── */
  const current = weather?.current;
  const gradientClass = current
    ? getWeatherGradient(current.weather_code, current.is_day)
    : 'gradient-clear';

  return (
    <div className={`atmos-app ${gradientClass}`} id="atmos-root">
      {/* Background particles */}
      <div className="bg-particles" aria-hidden="true">
        {[...Array(6)].map((_, i) => <div key={i} className={`particle particle-${i + 1}`}/>)}
      </div>

      {/* ── HEADER ── */}
      <header className="atmos-header" role="banner">
        <div className="header-brand">
          <div className="header-logo" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="15" fill="url(#logoGrad)" stroke="var(--accent-primary)" strokeWidth="1"/>
              {/* Sun */}
              <circle cx="20" cy="12" r="5" fill="#FBBF24" />
              {/* Cloud */}
              <path d="M10 21a3 3 0 0 1 0-6 3.5 3.5 0 0 1 6.5-1.5 4 4 0 0 1 6.5 3.5 3 3 0 0 1-1 5.8h-12z" fill="white" opacity="0.95" />
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32">
                  <stop offset="0%" stopColor="#38BDF8"/>
                  <stop offset="100%" stopColor="#8B5CF6"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <p className="header-title">ATMOS</p>
            <p className="header-tagline">Weather, Air Quality &amp; Forecasts</p>
          </div>
        </div>

        <SearchBar
          onCitySelect={handleCitySelect}
          recentSearches={recentSearches}
          onClearRecent={handleClearRecent}
        />

        <div className="header-controls">
          <ThemeToggle theme={theme} onChange={setTheme}/>
          <UserMenu
            user={user}
            onSignOut={signOut}
            onOpenAuth={() => setShowAuthModal(true)}
            unit={unit}
            onUnitToggle={setUnit}
            theme={theme}
            onThemeChange={setTheme}
          />
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="atmos-main" id="main-content" role="main">

        {/* Signed-in banner */}
        {user && (
          <div className="signed-in-banner" role="status" aria-live="polite">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            Signed in as <strong>{user.email}</strong> — favorites &amp; history are synced to the cloud ☁️
          </div>
        )}

        {/* Favorites */}
        {favorites.length > 0 && (
          <section className="section-favorites" aria-label="Favorite cities">
            <FavoriteCities
              favorites={favorites}
              onSelect={handleCitySelect}
              onRemove={handleRemoveFavorite}
              citiesData={favoritesData}
              unit={unit}
            />
          </section>
        )}

        {/* Error */}
        {error && (
          <div className="error-banner" role="alert" aria-live="polite">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {error}
            <button onClick={() => city && fetchWeather(city)} className="retry-btn">Retry</button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="loading-grid" aria-label="Loading weather data" aria-busy="true">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`skeleton-card ${i === 0 ? 'skeleton-main' : ''}`}>
                <div className="skeleton-line skeleton-line-long"/>
                <div className="skeleton-line skeleton-line-short"/>
                <div className="skeleton-line skeleton-line-medium"/>
              </div>
            ))}
          </div>
        )}

        {/* Dashboard grid */}
        {!loading && weather && (
          <div className="dashboard-grid">
            <section className="grid-area-current" aria-label="Current conditions">
              <CurrentWeather
                data={weather}
                city={city}
                unit={unit}
                onUnitToggle={() => setUnit(unit === 'C' ? 'F' : 'C')}
                onAddFavorite={toggleFavorite}
                isFavorite={isFavorite}
              />
            </section>

            <section className="grid-area-alerts" aria-label="Alerts and recommendations">
              <WeatherAlerts
                weatherCode={current?.weather_code}
                uvIndex={current?.uv_index}
                aqi={airQuality?.current?.european_aqi}
                windSpeed={current?.wind_speed_10m}
                temp={current?.temperature_2m}
              />
              <Recommendations
                weatherCode={current?.weather_code}
                uvIndex={current?.uv_index}
                aqi={airQuality?.current?.european_aqi}
                temp={current?.temperature_2m}
              />
            </section>

            <section className="grid-area-chart" aria-label="Hourly forecast chart">
              <HourlyChart data={weather} unit={unit} theme={theme}/>
            </section>

            <section className="grid-area-forecast" aria-label="7-day forecast">
              <WeatherForecast data={weather} unit={unit}/>
            </section>

            <section className="grid-area-aqi" aria-label="Air quality">
              <AirQuality data={airQuality}/>
            </section>
            <section className="grid-area-uv" aria-label="UV index">
              <UVIndex uvIndex={current?.uv_index}/>
            </section>
            <section className="grid-area-sun" aria-label="Sunrise and sunset">
              <SunriseSunset daily={weather?.daily}/>
            </section>
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="atmos-footer" role="contentinfo">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-logo">ATMOS</span>
            <span className="footer-sep">·</span>
            <span>Built by <strong>Agrima Vijayvargiya</strong></span>
          </div>
          <div className="footer-links">
            <a href="https://github.com/agrima044/atmos-weather-dashboard" target="_blank" rel="noopener noreferrer"
              className="footer-link" aria-label="View source on GitHub">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
            <a href="https://github.com/agrima044" target="_blank" rel="noopener noreferrer"
              className="footer-link">@agrima044</a>
          </div>
          <div className="footer-data-source">
            <span>Data: Open-Meteo API · Auth: Supabase</span>
          </div>
        </div>
      </footer>

      {/* ── AUTH MODAL ── */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSignIn={signInWithEmail}
        />
      )}
    </div>
  );
}
