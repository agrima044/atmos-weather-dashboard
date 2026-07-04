/**
 * ATMOS — Database Operations
 * Favorites, Search History & Preferences via Supabase
 * Falls back to localStorage when Supabase is not configured / user not logged in
 * Author: Agrima Vijayvargiya
 */
import { supabase, isSupabaseConfigured } from './supabase';

/* ─────────────────────────────────────────
   FAVORITES
   ───────────────────────────────────────── */

export async function getFavorites(userId) {
  if (!isSupabaseConfigured || !userId) return null;
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) { console.error('getFavorites:', error.message); return null; }
  return data.map(normalizeDbCity);
}

export async function addFavorite(userId, city) {
  if (!isSupabaseConfigured || !userId) return false;
  const { error } = await supabase.from('favorites').upsert(
    {
      user_id: userId,
      city_name: city.name,
      country: city.country || '',
      country_code: city.country_code || '',
      admin1: city.admin1 || '',
      latitude: city.latitude,
      longitude: city.longitude,
    },
    { onConflict: 'user_id,latitude,longitude' }
  );
  if (error) { console.error('addFavorite:', error.message); return false; }
  return true;
}

export async function removeFavorite(userId, city) {
  if (!isSupabaseConfigured || !userId) return false;
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('latitude', city.latitude)
    .eq('longitude', city.longitude);
  if (error) { console.error('removeFavorite:', error.message); return false; }
  return true;
}

/* ─────────────────────────────────────────
   SEARCH HISTORY
   ───────────────────────────────────────── */

export async function getSearchHistory(userId, limit = 5) {
  if (!isSupabaseConfigured || !userId) return null;
  const { data, error } = await supabase
    .from('search_history')
    .select('*')
    .eq('user_id', userId)
    .order('searched_at', { ascending: false })
    .limit(limit * 3); // fetch extra, deduplicate below
  if (error) { console.error('getSearchHistory:', error.message); return null; }

  // Deduplicate by lat/lon
  const seen = new Set();
  return data
    .filter((r) => {
      const key = `${r.latitude},${r.longitude}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit)
    .map(normalizeDbCity);
}

export async function addSearchHistory(userId, city) {
  if (!isSupabaseConfigured || !userId) return false;
  const { error } = await supabase.from('search_history').insert({
    user_id: userId,
    city_name: city.name,
    country: city.country || '',
    country_code: city.country_code || '',
    admin1: city.admin1 || '',
    latitude: city.latitude,
    longitude: city.longitude,
  });
  if (error) { console.error('addSearchHistory:', error.message); return false; }
  return true;
}

export async function clearSearchHistory(userId) {
  if (!isSupabaseConfigured || !userId) return false;
  const { error } = await supabase
    .from('search_history')
    .delete()
    .eq('user_id', userId);
  if (error) { console.error('clearSearchHistory:', error.message); return false; }
  return true;
}

/* ─────────────────────────────────────────
   PREFERENCES
   ───────────────────────────────────────── */

export async function getPreferences(userId) {
  if (!isSupabaseConfigured || !userId) return null;
  const { data, error } = await supabase
    .from('preferences')
    .select('unit, theme')
    .eq('user_id', userId)
    .single();
  if (error) return null; // row might not exist yet — that's fine
  return data;
}

export async function savePreferences(userId, prefs) {
  if (!isSupabaseConfigured || !userId) return false;
  const { error } = await supabase.from('preferences').upsert(
    { user_id: userId, ...prefs, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  );
  if (error) { console.error('savePreferences:', error.message); return false; }
  return true;
}

/* ─────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────── */

function normalizeDbCity(row) {
  return {
    name: row.city_name,
    country: row.country,
    country_code: row.country_code,
    admin1: row.admin1,
    latitude: row.latitude,
    longitude: row.longitude,
  };
}
