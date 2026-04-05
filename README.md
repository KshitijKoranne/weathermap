# WeatherMap

A map-poster style weather webapp — search any city in the world and see its real road network rendered as a stylized art poster, with live weather data overlaid on top.

Built by [KJR Labs](https://kjrlabs.in).

![WeatherMap](https://img.shields.io/badge/Next.js-16-black?style=flat-square) ![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)

## Features

- 🗺️ **Real OSM road maps** — every city on Earth via OpenStreetMap + Overpass API
- 🌦️ **7 auto-switching themes** — Golden Hour, Monsoon, Electric, Phantom, Overcast, Midnight, Snowfall
- 📍 **Auto-detect location** — loads your city on first visit
- 🔍 **Live city search** — Nominatim autocomplete for any city worldwide
- 📊 **Full weather data** — temp, feels like, humidity, wind + 24h hourly forecast bar
- 🆓 **Fully free** — Open-Meteo (no key), OSM/Overpass (no key), Nominatim (no key)

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Inline styles + Tailwind |
| Map data | OpenStreetMap via Overpass API |
| Weather | Open-Meteo API |
| Geocoding | Nominatim |
| Fonts | Bebas Neue + DM Mono (Google Fonts) |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy

One-click deploy to Vercel — no environment variables needed:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/KshitijKoranne/weathermap)

## Architecture

```
app/
├── page.tsx              # Main weather map UI
├── api/
│   ├── map/route.ts      # Overpass API proxy (CORS fix)
│   ├── search/route.ts   # Nominatim search proxy
│   └── reverse/route.ts  # Reverse geocoding proxy
components/
├── MapSVG.tsx            # SVG road map renderer
├── SearchBar.tsx         # City search with autocomplete
└── HourlyBar.tsx         # 24h forecast bar chart
lib/
├── types.ts              # Themes, types, weather utils
└── map.ts                # OSM parsing + SVG projection
```

## Weather Themes

| Condition | Theme | Palette |
|---|---|---|
| Clear sky (day) | Golden Hour | Deep orange + amber roads |
| Partly cloudy | Overcast | Steel blue-grey |
| Fog / mist | Phantom | Slate grey |
| Rain / drizzle | Monsoon | Deep navy + cyan roads |
| Snow | Snowfall | Dark navy + ice white |
| Thunderstorm | Electric | Black + neon purple |
| Night (any) | Midnight | Pure noir + white roads |

## Credits

- Map data © [OpenStreetMap](https://www.openstreetmap.org/) contributors
- Weather data by [Open-Meteo](https://open-meteo.com/)
- Geocoding by [Nominatim](https://nominatim.org/)

