"use client";
import { useState, useEffect, useCallback } from "react";
import MapSVG from "@/components/MapSVG";
import HourlyBar from "@/components/HourlyBar";
import SearchBar from "@/components/SearchBar";
import { getTheme, weatherDesc, THEMES } from "@/lib/types";
import { fetchMapData, parseOSM, MAP_W, MAP_H } from "@/lib/map";
import type { Theme, City, WeatherData, SVGPaths } from "@/lib/types";

export default function Home() {
  const [city, setCity] = useState<City | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [theme, setTheme] = useState<Theme>(THEMES.night);
  const [svgPaths, setSvgPaths] = useState<SVGPaths | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [cityLabel, setCityLabel] = useState("");

  const loadCity = useCallback(async (c: City) => {
    setLoading(true);
    setError(null);
    setMapError(null);
    setCityLabel(c.name);
    try {
      const [weatherRes, mapResult] = await Promise.all([
        fetch(`https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weathercode,is_day&hourly=temperature_2m,weathercode,precipitation_probability&forecast_days=1&timezone=auto`),
        fetchMapData(c.lat, c.lon),
      ]);
      const wData = await weatherRes.json();
      const cur = wData.current;
      const t = getTheme(cur.weathercode, cur.is_day === 0);
      setCity(c);
      setWeather({ current: cur, hourly: wData.hourly });
      setTheme(t);

      if (mapResult.data?.error) {
        setMapError("Map unavailable — sources busy. Weather data loaded.");
        setSvgPaths(null);
      } else {
        const paths = parseOSM(mapResult.data, mapResult.bounds, MAP_W, MAP_H);
        setSvgPaths(paths);
      }
    } catch {
      setError("Could not load weather data. Try another city.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fallback = () => loadCity({ name: "Mumbai", lat: 19.076, lon: 72.8777 });
    if (!navigator.geolocation) { fallback(); return; }
    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        const res = await fetch(`/api/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
        const data = await res.json();
        const name = data.address?.city || data.address?.town || data.address?.village || "Your Location";
        loadCity({ name, lat: pos.coords.latitude, lon: pos.coords.longitude });
      } catch { fallback(); }
    }, fallback, { timeout: 5000 });
  }, [loadCity]);

  return (
    <main style={{
      width: "100vw", height: "100dvh", overflow: "hidden",
      background: theme.bg, position: "relative",
      fontFamily: "'DM Mono', monospace",
      transition: "background 1.2s ease",
    }}>
      <MapSVG paths={svgPaths} theme={theme} hasCity={!!city} />

      {loading && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 25,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: `${theme.bg}99`, backdropFilter: "blur(4px)",
        }}>
          <div style={{ fontSize: 10, letterSpacing: 6, color: theme.sub, animation: "pulse 1.4s ease infinite" }}>
            {cityLabel ? `LOADING ${cityLabel.toUpperCase()}` : "LOCATING..."}
          </div>
        </div>
      )}

      <div style={{
        position: "absolute", top: 24, left: "50%",
        transform: "translateX(-50%)",
        zIndex: 30, width: "min(400px, 88vw)",
      }}>
        <SearchBar theme={theme} onSelect={loadCity} initialValue={cityLabel} />
      </div>

      {error && (
        <div style={{
          position: "absolute", top: 80, left: "50%", transform: "translateX(-50%)",
          zIndex: 30, background: `${theme.bg}dd`, border: "1px solid #ff444466",
          backdropFilter: "blur(8px)", padding: "10px 20px",
          color: "#ff8888", fontSize: 11, letterSpacing: 2,
        }}>{error}</div>
      )}

      {mapError && !error && (
        <div style={{
          position: "absolute", top: 80, left: "50%", transform: "translateX(-50%)",
          zIndex: 30, background: `${theme.bg}cc`, border: `1px solid ${theme.sub}33`,
          backdropFilter: "blur(8px)", padding: "8px 18px",
          color: theme.sub, fontSize: 10, letterSpacing: 2, whiteSpace: "nowrap",
        }}>{mapError}</div>
      )}

      {weather && city && !loading && (
        <div style={{ position: "absolute", bottom: 140, left: 28, zIndex: 20, animation: "fadeIn 0.7s ease" }}>
          <div style={{ fontSize: 9, letterSpacing: 5, color: theme.sub, marginBottom: 2, opacity: 0.6 }}>
            {theme.label} {theme.name}
          </div>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(68px, 13vw, 112px)",
            lineHeight: 0.88, color: theme.text,
            textShadow: `0 0 50px ${theme.accent}33`, letterSpacing: 1,
          }}>
            {Math.round(weather.current.temperature_2m)}°
          </div>
          <div style={{ fontSize: 11, letterSpacing: 4, color: theme.accent, marginTop: 6, textTransform: "uppercase" }}>
            {weatherDesc(weather.current.weathercode)}
          </div>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(18px, 3.5vw, 28px)",
            color: theme.sub, letterSpacing: 5, marginTop: 3,
          }}>
            {city.name.split(",")[0].toUpperCase()}
          </div>
        </div>
      )}

      {weather && city && !loading && (
        <div style={{
          position: "absolute", bottom: 148, right: 28,
          zIndex: 20, textAlign: "right",
          display: "flex", flexDirection: "column", gap: 10,
          animation: "fadeIn 0.7s ease 0.15s both",
        }}>
          {([
            ["FEELS LIKE", `${Math.round(weather.current.apparent_temperature)}°C`],
            ["HUMIDITY", `${weather.current.relative_humidity_2m}%`],
            ["WIND", `${Math.round(weather.current.wind_speed_10m)} km/h`],
            ["COORDINATES", `${city.lat.toFixed(2)}° ${city.lon.toFixed(2)}°`],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize: 8, letterSpacing: 3, color: theme.sub }}>{label}</div>
              <div style={{ fontSize: 14, letterSpacing: 2, color: theme.text, fontWeight: 500, marginTop: 1 }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {weather && !loading && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 20,
          background: `linear-gradient(to top, ${theme.bg}f5 55%, transparent)`,
          padding: "20px 24px 24px",
          animation: "fadeIn 0.7s ease 0.3s both",
        }}>
          <div style={{ height: 1, marginBottom: 12, background: `linear-gradient(90deg, transparent, ${theme.sub}44, transparent)` }} />
          <div style={{ fontSize: 8, letterSpacing: 4, color: theme.sub, marginBottom: 10 }}>24H FORECAST</div>
          <HourlyBar hourly={weather.hourly} theme={theme} />
        </div>
      )}

      {city && !loading && (
        <div style={{ position: "absolute", top: 30, right: 24, zIndex: 20, textAlign: "right" }}>
          <div style={{ fontSize: 8, letterSpacing: 2, color: `${theme.sub}88` }}>OSM · OPEN-METEO</div>
          <div style={{ width: 20, height: 1, background: theme.accent, marginLeft: "auto", marginTop: 5 }} />
        </div>
      )}

      {!city && !loading && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 10,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 14, textAlign: "center",
        }}>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(38px, 7vw, 68px)",
            color: theme.text, letterSpacing: 10,
            textShadow: `0 0 40px ${theme.accent}22`,
          }}>WEATHERMAP</div>
          <div style={{ fontSize: 10, letterSpacing: 5, color: theme.sub }}>ANY CITY · ANY WEATHER · ANYWHERE</div>
        </div>
      )}

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { display: none; }
        html, body { width: 100%; height: 100%; overflow: hidden; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
      `}</style>
    </main>
  );
}

