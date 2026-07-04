-- ATMOS Weather Dashboard — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Paste & Run
-- Author: Agrima Vijayvargiya

-- ─────────────────────────────────────────────────────────────────
-- 1. FAVORITES TABLE
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  city_name    text        NOT NULL,
  country      text        NOT NULL DEFAULT '',
  country_code text        NOT NULL DEFAULT '',
  admin1       text        NOT NULL DEFAULT '',
  latitude     float8      NOT NULL,
  longitude    float8      NOT NULL,
  created_at   timestamptz DEFAULT now()
);

-- Prevent duplicate favorites per user
CREATE UNIQUE INDEX IF NOT EXISTS favorites_user_lat_lon
  ON favorites (user_id, latitude, longitude);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own favorites"    ON favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own favorites"  ON favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own favorites"  ON favorites FOR DELETE USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────
-- 2. SEARCH HISTORY TABLE
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS search_history (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  city_name    text        NOT NULL,
  country      text        NOT NULL DEFAULT '',
  country_code text        NOT NULL DEFAULT '',
  admin1       text        NOT NULL DEFAULT '',
  latitude     float8      NOT NULL,
  longitude    float8      NOT NULL,
  searched_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS search_history_user_time
  ON search_history (user_id, searched_at DESC);

ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own history"    ON search_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own history"  ON search_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own history"  ON search_history FOR DELETE USING (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────────────
-- 3. PREFERENCES TABLE
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS preferences (
  user_id    uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  unit       text        NOT NULL DEFAULT 'C'     CHECK (unit IN ('C', 'F')),
  theme      text        NOT NULL DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own prefs"   ON preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users upsert own prefs" ON preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own prefs" ON preferences FOR UPDATE USING (auth.uid() = user_id);
