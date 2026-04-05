"use client";
import { Theme, SVGPaths } from "@/lib/types";
import { MAP_W, MAP_H } from "@/lib/map";

const ROAD_WIDTH: Record<string, number> = {
  motorway: 2.2,
  primary: 1.6,
  secondary: 1.1,
  tertiary: 0.75,
  residential: 0.5,
  service: 0.3,
  path: 0.22,
  other: 0.2,
  railway: 0.8,
};

const ROAD_OPACITY: Record<string, number> = {
  motorway: 1,
  primary: 0.92,
  secondary: 0.78,
  tertiary: 0.62,
  residential: 0.48,
  service: 0.32,
  path: 0.22,
  other: 0.18,
  railway: 0.55,
};

// Render order: bottom to top
const ROAD_ORDER = ["path", "other", "service", "residential", "tertiary", "secondary", "primary", "motorway", "railway"];

interface Props {
  paths: SVGPaths | null;
  theme: Theme;
  hasCity: boolean;
}

export default function MapSVG({ paths, theme, hasCity }: Props) {
  // Building fill — very subtle, just slightly lighter than bg
  const buildingFill = theme.park;
  const buildingStroke = theme.residential;
  const railColor = theme.accent;

  return (
    <svg
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      preserveAspectRatio="xMidYMid slice"
      style={{
        position: "absolute", inset: 0,
        width: "100%", height: "100%",
        transition: "all 1.4s ease",
      }}
    >
      <defs>
        <linearGradient id="topFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={theme.bg} stopOpacity="0.97" />
          <stop offset="28%"  stopColor={theme.bg} stopOpacity="0.22" />
          <stop offset="68%"  stopColor={theme.bg} stopOpacity="0.08" />
          <stop offset="100%" stopColor={theme.bg} stopOpacity="0.94" />
        </linearGradient>
        <filter id="roadGlow">
          <feGaussianBlur stdDeviation="1.0" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="centerPulse" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={theme.accent} stopOpacity="0.2" />
          <stop offset="100%" stopColor={theme.accent} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Base background */}
      <rect width={MAP_W} height={MAP_H} fill={theme.bg} />

      {/* Parks / green areas / landuse */}
      {paths?.parks.map((d, i) => (
        <path key={`pk${i}`} d={d} fill={theme.park} opacity={0.85} />
      ))}

      {/* Water bodies */}
      {paths?.water.map((d, i) => (
        <path key={`w${i}`} d={d} fill={theme.water} stroke={theme.water} strokeWidth={0.5} opacity={0.95} />
      ))}

      {/* Buildings — very subtle mass fill */}
      {paths?.buildings.map((d, i) => (
        <path
          key={`b${i}`}
          d={d}
          fill={buildingFill}
          stroke={buildingStroke}
          strokeWidth={0.15}
          opacity={0.45}
        />
      ))}

      {/* Roads — ordered low → high prominence */}
      {ROAD_ORDER.map(type =>
        paths?.roads[type]?.map((d, i) => {
          const isRailway = type === "railway";
          const color =
            type === "motorway"   ? theme.motorway   :
            type === "primary"    ? theme.primary     :
            type === "secondary"  ? theme.secondary   :
            type === "tertiary"   ? theme.tertiary    :
            type === "residential"? theme.residential :
            type === "service"    ? theme.residential :
            type === "railway"    ? railColor         :
            theme.residential;

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
              strokeDasharray={isRailway ? "3 2" : undefined}
              filter={type === "motorway" || type === "primary" ? "url(#roadGlow)" : undefined}
            />
          );
        })
      )}

      {/* Center crosshair */}
      {hasCity && (
        <>
          <rect
            x={MAP_W / 2 - 70} y={MAP_H / 2 - 70}
            width={140} height={140}
            fill="url(#centerPulse)"
          />
          <circle cx={MAP_W / 2} cy={MAP_H / 2} r={14} fill={theme.accent} opacity={0.1} />
          <circle cx={MAP_W / 2} cy={MAP_H / 2} r={5}  fill={theme.accent} opacity={0.4} />
          <circle cx={MAP_W / 2} cy={MAP_H / 2} r={2}  fill={theme.accent} />
          {/* Crosshair lines */}
          {[[-18,-10],[10,18],[-18,-10],[10,18]].map((_, idx) => {
            const isV = idx < 2;
            const y1 = isV ? MAP_H/2 - 18 : MAP_H/2;
            const y2 = isV ? MAP_H/2 - 10 : MAP_H/2;
            const x1 = isV ? MAP_W/2 : (idx === 2 ? MAP_W/2 - 18 : MAP_W/2 + 10);
            const x2 = isV ? MAP_W/2 : (idx === 2 ? MAP_W/2 - 10 : MAP_W/2 + 18);
            return null; // replaced below
          })}
          <line x1={MAP_W/2} y1={MAP_H/2-20} x2={MAP_W/2} y2={MAP_H/2-11} stroke={theme.accent} strokeWidth={0.8} opacity={0.6}/>
          <line x1={MAP_W/2} y1={MAP_H/2+11} x2={MAP_W/2} y2={MAP_H/2+20} stroke={theme.accent} strokeWidth={0.8} opacity={0.6}/>
          <line x1={MAP_W/2-20} y1={MAP_H/2} x2={MAP_W/2-11} y2={MAP_H/2} stroke={theme.accent} strokeWidth={0.8} opacity={0.6}/>
          <line x1={MAP_W/2+11} y1={MAP_H/2} x2={MAP_W/2+20} y2={MAP_H/2} stroke={theme.accent} strokeWidth={0.8} opacity={0.6}/>
        </>
      )}

      {/* Top/bottom vignette fade — keeps text readable */}
      <rect width={MAP_W} height={MAP_H} fill="url(#topFade)" />
    </svg>
  );
}
