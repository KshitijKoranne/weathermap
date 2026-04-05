"use client";
import { Theme, SVGPaths } from "@/lib/types";
import { MAP_W, MAP_H } from "@/lib/map";

const ROAD_WIDTH: Record<string, number> = {
  motorway: 1.8, primary: 1.2, secondary: 0.8,
  tertiary: 0.5, residential: 0.3, other: 0.18,
};
const ROAD_OPACITY: Record<string, number> = {
  motorway: 1, primary: 0.9, secondary: 0.7,
  tertiary: 0.55, residential: 0.4, other: 0.2,
};
const ROAD_ORDER = ["other", "residential", "tertiary", "secondary", "primary", "motorway"];

interface Props {
  paths: SVGPaths | null;
  theme: Theme;
  hasCity: boolean;
}

export default function MapSVG({ paths, theme, hasCity }: Props) {
  return (
    <svg
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transition: "all 1.4s ease" }}
    >
      <defs>
        <linearGradient id="topFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.bg} stopOpacity="0.97" />
          <stop offset="30%" stopColor={theme.bg} stopOpacity="0.25" />
          <stop offset="70%" stopColor={theme.bg} stopOpacity="0.1" />
          <stop offset="100%" stopColor={theme.bg} stopOpacity="0.92" />
        </linearGradient>
        <filter id="roadGlow">
          <feGaussianBlur stdDeviation="1.2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <radialGradient id="centerPulse" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={theme.accent} stopOpacity="0.25" />
          <stop offset="100%" stopColor={theme.accent} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width={MAP_W} height={MAP_H} fill={theme.bg} />

      {/* Parks */}
      {paths?.parks.map((d, i) => (
        <path key={`pk${i}`} d={d} fill={theme.park} opacity={0.9} />
      ))}

      {/* Water */}
      {paths?.water.map((d, i) => (
        <path key={`w${i}`} d={d} fill={theme.water} stroke={theme.water} strokeWidth={0.5} opacity={0.95} />
      ))}

      {/* Roads */}
      {ROAD_ORDER.map(type =>
        paths?.roads[type]?.map((d, i) => {
          const color = type === "motorway" ? theme.motorway
            : type === "primary" ? theme.primary
            : type === "secondary" ? theme.secondary
            : type === "tertiary" ? theme.tertiary
            : theme.residential;
          return (
            <path
              key={`${type}${i}`}
              d={d}
              fill="none"
              stroke={color}
              strokeWidth={ROAD_WIDTH[type] || 0.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={ROAD_OPACITY[type] || 0.2}
              filter={type === "motorway" ? "url(#roadGlow)" : undefined}
            />
          );
        })
      )}

      {/* Center crosshair */}
      {hasCity && (
        <>
          <rect x={MAP_W/2 - 60} y={MAP_H/2 - 60} width={120} height={120} fill="url(#centerPulse)" />
          <circle cx={MAP_W/2} cy={MAP_H/2} r={14} fill={theme.accent} opacity={0.1} />
          <circle cx={MAP_W/2} cy={MAP_H/2} r={5} fill={theme.accent} opacity={0.45} />
          <circle cx={MAP_W/2} cy={MAP_H/2} r={2.2} fill={theme.accent} />
          <line x1={MAP_W/2} y1={MAP_H/2 - 18} x2={MAP_W/2} y2={MAP_H/2 - 10} stroke={theme.accent} strokeWidth={0.8} opacity={0.6} />
          <line x1={MAP_W/2} y1={MAP_H/2 + 10} x2={MAP_W/2} y2={MAP_H/2 + 18} stroke={theme.accent} strokeWidth={0.8} opacity={0.6} />
          <line x1={MAP_W/2 - 18} y1={MAP_H/2} x2={MAP_W/2 - 10} y2={MAP_H/2} stroke={theme.accent} strokeWidth={0.8} opacity={0.6} />
          <line x1={MAP_W/2 + 10} y1={MAP_H/2} x2={MAP_W/2 + 18} y2={MAP_H/2} stroke={theme.accent} strokeWidth={0.8} opacity={0.6} />
        </>
      )}

      {/* Vignette overlay */}
      <rect width={MAP_W} height={MAP_H} fill="url(#topFade)" />
    </svg>
  );
}
