"use client";
import { useEffect, useRef, useCallback } from "react";
import type { Map as MapLibreMap, StyleSpecification } from "maplibre-gl";
import type { Theme } from "@/lib/types";
import { applyThemeToStyle } from "@/lib/mapStyle";

interface Props {
  theme: Theme;
  center: [number, number] | null; // [lng, lat]
  hasCity: boolean;
}

const LIBERTY_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
const DEFAULT_ZOOM = 13;

export default function MapLibreMapComponent({ theme, center, hasCity }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const baseStyleRef = useRef<StyleSpecification | null>(null);
  const loadingStyleRef = useRef(false);

  // Fetch and cache the base liberty style once
  const getBaseStyle = useCallback(async (): Promise<StyleSpecification> => {
    if (baseStyleRef.current) return baseStyleRef.current;
    const res = await fetch(LIBERTY_STYLE_URL);
    const style = await res.json();
    baseStyleRef.current = style;
    return style;
  }, []);

  // Initialize map on mount
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let map: MapLibreMap;

    (async () => {
      const maplibregl = (await import("maplibre-gl")).default;
      await import("maplibre-gl/dist/maplibre-gl.css");

      const baseStyle = await getBaseStyle();
      const themedStyle = applyThemeToStyle(baseStyle, theme);

      map = new maplibregl.Map({
        container: containerRef.current!,
        style: themedStyle,
        center: center ?? [72.8777, 19.076], // Mumbai fallback
        zoom: DEFAULT_ZOOM,
        interactive: false, // poster aesthetic — no drag/zoom
        attributionControl: false,
        logoPosition: "bottom-right",
      });

      mapRef.current = map;
    })();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fly to new city center when it changes
  useEffect(() => {
    if (!mapRef.current || !center) return;
    mapRef.current.flyTo({
      center,
      zoom: DEFAULT_ZOOM,
      duration: 1400,
      easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    });
  }, [center]);

  // Update map style when theme changes
  useEffect(() => {
    if (!mapRef.current || loadingStyleRef.current) return;

    (async () => {
      loadingStyleRef.current = true;
      try {
        const baseStyle = await getBaseStyle();
        const themedStyle = applyThemeToStyle(baseStyle, theme);
        mapRef.current?.setStyle(themedStyle);
      } finally {
        loadingStyleRef.current = false;
      }
    })();
  }, [theme, getBaseStyle]);

  return (
    <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      {/* MapLibre canvas container */}
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />

      {/* Vignette overlay — CSS inset shadows replace SVG topFade gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 2,
          boxShadow: `inset 0 0 120px 60px ${theme.bg}`,
          transition: "box-shadow 1.2s ease",
        }}
      />

      {/* Crosshair at center */}
      {hasCity && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Radial glow */}
          <div style={{
            position: "absolute",
            width: 140, height: 140,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${theme.accent}33 0%, transparent 70%)`,
            transition: "background 1.2s ease",
          }} />
          {/* Outer ring */}
          <div style={{
            position: "absolute",
            width: 28, height: 28,
            borderRadius: "50%",
            border: `1px solid ${theme.accent}40`,
            transition: "border-color 1.2s ease",
          }} />
          {/* Inner dot */}
          <div style={{
            position: "absolute",
            width: 6, height: 6,
            borderRadius: "50%",
            background: theme.accent,
            opacity: 0.85,
            transition: "background 1.2s ease",
          }} />
          {/* Center dot */}
          <div style={{
            position: "absolute",
            width: 2.5, height: 2.5,
            borderRadius: "50%",
            background: theme.accent,
            transition: "background 1.2s ease",
          }} />
          {/* Crosshair lines */}
          {[
            { top: "calc(50% - 20px)", left: "50%", width: 1, height: 9, transform: "translateX(-50%)" },
            { top: "calc(50% + 11px)", left: "50%", width: 1, height: 9, transform: "translateX(-50%)" },
            { top: "50%", left: "calc(50% - 20px)", width: 9, height: 1, transform: "translateY(-50%)" },
            { top: "50%", left: "calc(50% + 11px)", width: 9, height: 1, transform: "translateY(-50%)" },
          ].map((style, i) => (
            <div key={i} style={{
              position: "absolute",
              background: theme.accent,
              opacity: 0.6,
              transition: "background 1.2s ease",
              ...style,
            }} />
          ))}
        </div>
      )}
    </div>
  );
}
