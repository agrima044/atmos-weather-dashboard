# ATMOS — Project Setup Guide

ATMOS is a premium, full-stack weather dashboard built with Next.js 16, complete with a clean UI, live weather APIs, sub-city geocoding, custom SVG charts, and database-backed Supabase authentication.

---

## 🎨 Implemented Features & Architecture

### Frontend UI/UX
- **Adaptive gradients:** The background theme dynamically matches the fetched weather code (sun, overcast, rain, snow, storm, fog, or night) using smooth HSL CSS gradients.
- **Glassmorphism design:** backdrop filter blur borders with customized drop shadows to create a premium feel in both **Light** and **Dark** modes.
- **Interactive canvas chart:** Custom 24-hour temperature & precipitation forecast rendered on an HTML5 `<canvas>` without heavy chart dependencies.
- **Custom animated SVG weather icons:** Sun rotation, rain-drops falling, cloud drifting, fog lines fading, and lightning flashing.

### Full-Stack System
- **API Proxy Caching Layer:** All client-side requests fetch from `/api/weather`, `/api/airquality`, and `/api/geocode`. These API routes query the public weather/geocoding endpoints server-side and cache results in memory (10-15 minutes) to protect against API limits.
- **Supabase Authentication:** Passwordless magic link sign-in configuration.
- **Supabase DB Synchronization:** Once signed in, user favorites, preferences (units, theme), and search history sync to Supabase tables. When logged out, the dashboard falls back to localStorage.

---

## 📂 Project Structure

```
weather/
├── app/
│   ├── api/
│   │   ├── weather/route.js     # Weather API proxy (10m caching)
│   │   ├── airquality/route.js  # AQI API proxy (15m caching)
│   │   └── geocode/route.js     # Geocoding search & reverse geocoding proxy
│   ├── globals.css              # Glassmorphism + light/dark design system
│   ├── layout.js                # Apple-mobile settings, Inter font, PWA manifest
│   └── page.js                  # Global state, geolocation, and search orchestration
├── components/
│   ├── AuthModal.js             # Magic link login modal
│   ├── UserMenu.js              # Dropdown with avatar, email, theme/unit select
│   ├── SearchBar.js             # Autocomplete area search with Nominatim
│   ├── CurrentWeather.js        # Main hero card
│   ├── WeatherForecast.js       # 7-day forecast with daily range bars
│   ├── HourlyChart.js           # Bezier curve temperature canvas chart
│   ├── AirQuality.js            # European AQI arc gauge
│   ├── UVIndex.js               # Circle-ring progress gauge with advice
│   ├── SunriseSunset.js         # Realtime sun trajectory arc
│   ├── WeatherAlerts.js         # Heavy wind, storm, UV warning panel
│   ├── Recommendations.js       # Smart daily advice
│   ├── FavoriteCities.js        # Saved cities list with current weather
│   └── WeatherIcon.js           # Custom animated weather icon SVGs
├── lib/
│   ├── api.js                   # Client-side fetch helpers targeting API proxies
│   ├── db.js                    # Favorites & preferences query handler
│   ├── supabase.js              # Supabase Client setup
│   └── weatherUtils.js          # WMO translations, gradients, AQI, recommendations
├── public/
│   ├── manifest.json            # PWA support file
│   └── icons/                   # App launcher icons
├── supabase/
│   └── schema.sql               # Database schema with RLS security policies
└── README.md                    # Professional GitHub showcase profile
```

---

## 🛠️ Step-by-Step Launch & Setup

### 1. Database Configuration (Supabase)
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In the left navigation, click **SQL Editor** -> **New Query**.
3. Copy and paste the contents of the `supabase/schema.sql` file included in this repository and click **Run**.
4. Copy your **Project URL** and **Anon API Key** from project settings.

### 2. Configure Environment Variables
Create a file named `.env.local` in your root project folder:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Launch App Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see your live dashboard.

### 4. Push to GitHub
Run the following in your terminal to initialize and push your repository:
```bash
git init
git add .
git commit -m "feat: initial release of ATMOS weather app"
git branch -M main
git remote add origin https://github.com/agrima044/atmos-weather-dashboard.git
git push -u origin main
```

### 5. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and log in using GitHub.
2. Click **Add New** -> **Project**.
3. Import your `atmos-weather-dashboard` repository.
4. Add your **Environment Variables** (`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the setup panel.
5. Click **Deploy**. Your app is live!
