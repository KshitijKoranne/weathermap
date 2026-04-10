"use client";
import { Theme, WeatherData } from "@/lib/types";

interface Props {
  hourly: WeatherData["hourly"];
  theme: Theme;
  useFahrenheit?: boolean;
}

export default function HourlyBar({ hourly, theme, useFahrenheit = false }: Props) {
  const toF = (c: number) => Math.round(c * 9 / 5 + 32);
  const fmtT = (c: number) => useFahrenheit ? `${toF(c)}°` : `${Math.round(c)}°`;
  const now = new Date();
  const hours = hourly.time.slice(0, 24).map((t, i) => ({
    time: new Date(t),
    temp: hourly.temperature_2m[i],
    code: hourly.weathercode[i],
    precip: hourly.precipitation_probability?.[i] || 0,
  }));
  const temps = hours.map(h => h.temp);
  const minT = Math.min(...temps);
  const maxT = Math.max(...temps);

  return (
    <div style={{ display: "flex", gap: 0, alignItems: "flex-end", height: 88, overflowX: "auto", scrollbarWidth: "none" }}>
      {hours.map((h, i) => {
        const isNow = Math.abs(h.time.getTime() - now.getTime()) < 3600000;
        // BAR_MIN/MAX chosen so tallest bar + label (9px) + gap (3px) fits within 88px container
        const BAR_MIN = 14;
        const BAR_MAX = 44;
        const heightPct = maxT === minT ? BAR_MIN : ((h.temp - minT) / (maxT - minT)) * (BAR_MAX - BAR_MIN) + BAR_MIN;
        const label = h.time.getHours().toString().padStart(2, "0") + "h";
        return (
          <div key={i} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            minWidth: 38, gap: 3,
            transition: "opacity 0.3s",
          }}>
            <div style={{
              fontSize: 9, color: isNow ? theme.accent : `${theme.sub}bb`,
              fontFamily: "'DM Mono', monospace", letterSpacing: 0,
            }}>
              {fmtT(h.temp)}
            </div>
            <div style={{
              width: isNow ? 3 : 2, height: heightPct,
              background: isNow
                ? theme.accent
                : `linear-gradient(to top, ${theme.secondary}, ${theme.tertiary})`,
              borderRadius: 2,
              boxShadow: isNow ? `0 0 8px ${theme.accent}88` : "none",
              transition: "height 0.5s ease",
            }} />
            {h.precip > 30 && (
              <div style={{ fontSize: 7, color: `${theme.sub}bb`, marginTop: -2 }}>
                {h.precip}%
              </div>
            )}
            <div style={{
              fontSize: 8,
              color: isNow ? theme.accent : `${theme.sub}bb`,
              fontFamily: "'DM Mono', monospace",
            }}>
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
