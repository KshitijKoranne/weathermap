"use client";
import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import HourlyBar from "@/components/HourlyBar";
import SearchBar from "@/components/SearchBar";
import { getTheme, weatherDesc, THEMES } from "@/lib/types";
import type { Theme, City, WeatherData } from "@/lib/types";

const MapLibreMap = dynamic(() => import("@/components/MapLibreMap"), { ssr: false });

function toF(c: number) { return Math.round(c * 9 / 5 + 32); }
function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

export default function Home() {
  const [city, setCity] = useState<City | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [theme, setTheme] = useState<Theme>(THEMES.night);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cityLabel, setCityLabel] = useState("");
  const [useFahrenheit, setUseFahrenheit] = useState(false);
  const [kbOpen, setKbOpen] = useState(false); // mobile keyboard state

  const fmt = useCallback((c: number) =>
    useFahrenheit ? `${toF(c)}°F` : `${Math.round(c)}°C`,
  [useFahrenheit]);

  const fmtBig = useCallback((c: number) =>
    useFahrenheit ? `${toF(c)}°` : `${Math.round(c)}°`,
  [useFahrenheit]);

  const loadCity = useCallback(async (c: City) => {
    setLoading(true);
    setError(null);
    setCityLabel(c.name);
    try {
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}` +
        `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weathercode,is_day` +
        `&hourly=temperature_2m,weathercode,precipitation_probability` +
        `&daily=sunrise,sunset` +
        `&forecast_days=1&timezone=auto`
      );
      const wData = await weatherRes.json();
      const cur = wData.current;
      const t = getTheme(cur.weathercode, cur.is_day === 0);
      setCity(c);
      setWeather({ current: cur, hourly: wData.hourly, daily: wData.daily });
      setTheme(t);
      setMapCenter([c.lon, c.lat]);
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

  // Mobile keyboard detection — listen for visualViewport resize
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const handler = () => {
      const ratio = vv.height / window.innerHeight;
      setKbOpen(ratio < 0.75);
    };
    vv.addEventListener("resize", handler);
    return () => vv.removeEventListener("resize", handler);
  }, []);

  const sunrise = weather?.daily?.sunrise?.[0];
  const sunset  = weather?.daily?.sunset?.[0];

  return (
    <main style={{
      width: "100vw",
      height: kbOpen ? "auto" : "100dvh",
      overflow: "hidden",
      background: theme.bg, position: "relative",
      fontFamily: "'DM Mono', monospace",
      transition: "background 1.2s ease",
    }}>
      <MapLibreMap theme={theme} center={mapCenter} hasCity={!!city} />

      {loading && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 25,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: `${theme.bg}99`, backdropFilter: "blur(4px)",
        }}>
          <div style={{ fontSize: 10, letterSpacing: 6, color: theme.sub, animation: "pulse 1.4s ease infinite" }}>
            {cityLabel ? `LOADING ${cityLabel.toUpperCase()}` : "LOCATING..."}
          </div>
        </div>
      )}

      {/* Search bar — slides up when keyboard opens on mobile */}
      <div style={{
        position: "absolute",
        top: kbOpen ? 12 : 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 30,
        width: "min(400px, 88vw)",
        transition: "top 0.2s ease",
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

      {/* Weather left panel — hidden when keyboard is open */}
      {weather && city && !loading && !kbOpen && (
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
            {fmtBig(weather.current.temperature_2m)}
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

      {/* Stats right panel — hidden when keyboard is open */}
      {weather && city && !loading && !kbOpen && (
        <div style={{
          position: "absolute", bottom: 148, right: 28,
          zIndex: 20, textAlign: "right",
          display: "flex", flexDirection: "column", gap: 10,
          animation: "fadeIn 0.7s ease 0.15s both",
        }}>
          {([
            ["FEELS LIKE", fmt(weather.current.apparent_temperature)],
            ["HUMIDITY",   `${weather.current.relative_humidity_2m}%`],
            ["WIND",       `${Math.round(weather.current.wind_speed_10m)} km/h`],
            ...(sunrise && sunset ? [
              ["SUNRISE", fmtTime(sunrise)],
              ["SUNSET",  fmtTime(sunset)],
            ] : []),
            ["COORDINATES", `${city.lat.toFixed(2)}° ${city.lon.toFixed(2)}°`],
          ] as [string, string][]).map(([label, value]) => (
            <div key={label}>
              <div style={{ fontSize: 8, letterSpacing: 3, color: theme.sub }}>{label}</div>
              <div style={{ fontSize: 14, letterSpacing: 2, color: theme.text, fontWeight: 500, marginTop: 1 }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Forecast bar — hidden when keyboard is open */}
      {weather && !loading && !kbOpen && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 20,
          background: `linear-gradient(to top, ${theme.bg}f5 55%, transparent)`,
          padding: "20px 24px 24px",
          animation: "fadeIn 0.7s ease 0.3s both",
        }}>
          <div style={{ height: 1, marginBottom: 12, background: `linear-gradient(90deg, transparent, ${theme.sub}44, transparent)` }} />
          <div style={{ fontSize: 8, letterSpacing: 4, color: theme.sub, marginBottom: 10 }}>24H FORECAST</div>
          <HourlyBar hourly={weather.hourly} theme={theme} useFahrenheit={useFahrenheit} />
        </div>
      )}

      {/* Top-right: attribution + °C/°F toggle */}
      {city && !loading && !kbOpen && (
        <div style={{ position: "absolute", top: 30, right: 24, zIndex: 20, textAlign: "right" }}>
          <div style={{ fontSize: 8, letterSpacing: 2, color: `${theme.sub}88` }}>OFM · OPEN-METEO</div>
          <div style={{ width: 20, height: 1, background: theme.accent, marginLeft: "auto", marginTop: 5, marginBottom: 10 }} />
          {/* °C / °F toggle */}
          <button
            onClick={() => setUseFahrenheit(f => !f)}
            style={{
              background: "transparent", border: `1px solid ${theme.sub}44`,
              color: theme.sub, fontSize: 9, letterSpacing: 2,
              padding: "4px 8px", cursor: "pointer",
              fontFamily: "'DM Mono', monospace",
              transition: "color 0.2s, border-color 0.2s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = theme.text;
              (e.currentTarget as HTMLButtonElement).style.borderColor = theme.sub;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = theme.sub;
              (e.currentTarget as HTMLButtonElement).style.borderColor = `${theme.sub}44`;
            }}
          >
            {useFahrenheit ? "°C" : "°F"}
          </button>
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
        .maplibregl-ctrl-bottom-right { display: none !important; }
        .maplibregl-ctrl-bottom-left  { display: none !important; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.35} }
      `}</style>
    </main>
  );
}
