import type { StyleSpecification } from "maplibre-gl";
import type { Theme } from "./types";

/**
 * Takes an OpenFreeMap liberty base style and overrides all paint properties
 * to match the given weather theme. Road casings are hidden. Labels are hidden
 * for the poster aesthetic. Only geometry colors are changed.
 */
export function applyThemeToStyle(
  baseStyle: StyleSpecification,
  theme: Theme
): StyleSpecification {
  const layers = baseStyle.layers.map((layer) => {
    const id = layer.id;

    // --- Background ---
    if (id === "background") {
      return { ...layer, paint: { "background-color": theme.bg } };
    }

    // --- Water ---
    if (id === "water") {
      return { ...layer, paint: { "fill-color": theme.water, "fill-opacity": 0.95 } };
    }
    if (id === "waterway_river" || id === "waterway_other") {
      return { ...layer, paint: { "line-color": theme.water, "line-opacity": 0.7, "line-width": (layer as any).paint?.["line-width"] ?? 1 } };
    }
    if (id === "waterway_tunnel") {
      return { ...layer, paint: { "line-color": theme.water, "line-opacity": 0.3 } };
    }

    // --- Parks / landuse ---
    if (id === "park" || id === "park_outline") {
      if (layer.type === "fill") return { ...layer, paint: { "fill-color": theme.park, "fill-opacity": 0.9 } };
      if (layer.type === "line") return { ...layer, paint: { "line-color": theme.park, "line-opacity": 0.4 } };
    }
    if (
      id === "landuse_residential" || id === "landuse_pitch" ||
      id === "landuse_track" || id === "landuse_cemetery" ||
      id === "landuse_hospital" || id === "landuse_school"
    ) {
      return { ...layer, paint: { "fill-color": theme.park, "fill-opacity": 0.5 } };
    }

    // --- Buildings ---
    if (id === "building") {
      return { ...layer, paint: { "fill-color": theme.park, "fill-outline-color": theme.residential, "fill-opacity": 0.45 } };
    }
    if (id === "building-3d") {
      return { ...layer, layout: { ...((layer as any).layout ?? {}), visibility: "none" } };
    }

    // --- Roads: hide all casings (they break the dark poster look) ---
    if (id.includes("_casing")) {
      return { ...layer, layout: { ...((layer as any).layout ?? {}), visibility: "none" } };
    }

    // --- Roads: motorway (road + bridge + tunnel) ---
    if (id === "road_motorway" || id === "bridge_motorway" || id === "tunnel_motorway" ||
        id === "road_motorway_link" || id === "bridge_motorway_link" || id === "tunnel_motorway_link") {
      return { ...layer, paint: { "line-color": theme.motorway, "line-opacity": 1.0, "line-width": (layer as any).paint?.["line-width"] ?? 2 } };
    }

    // --- Roads: trunk + primary ---
    if (id === "road_trunk_primary" || id === "bridge_trunk_primary" || id === "tunnel_trunk_primary" ||
        id === "road_link" || id === "bridge_link" || id === "tunnel_link") {
      return { ...layer, paint: { "line-color": theme.primary, "line-opacity": 0.92, "line-width": (layer as any).paint?.["line-width"] ?? 1.5 } };
    }

    // --- Roads: secondary + tertiary ---
    if (id === "road_secondary_tertiary" || id === "bridge_secondary_tertiary" || id === "tunnel_secondary_tertiary") {
      return { ...layer, paint: { "line-color": theme.secondary, "line-opacity": 0.78, "line-width": (layer as any).paint?.["line-width"] ?? 1 } };
    }

    // --- Roads: minor (residential, living_street, unclassified) ---
    if (id === "road_minor" || id === "bridge_street" || id === "tunnel_minor") {
      return { ...layer, paint: { "line-color": theme.residential, "line-opacity": 0.48, "line-width": (layer as any).paint?.["line-width"] ?? 0.5 } };
    }

    // --- Roads: service + track ---
    if (id === "road_service_track" || id === "bridge_service_track" || id === "tunnel_service_track") {
      return { ...layer, paint: { "line-color": theme.residential, "line-opacity": 0.3, "line-width": (layer as any).paint?.["line-width"] ?? 0.3 } };
    }

    // --- Roads: path/pedestrian ---
    if (id === "road_path_pedestrian" || id === "bridge_path_pedestrian" || id === "tunnel_path_pedestrian") {
      return { ...layer, paint: { "line-color": theme.residential, "line-opacity": 0.22, "line-width": 0.5 } };
    }

    // --- Railway ---
    if (id === "road_major_rail" || id === "bridge_major_rail" || id === "tunnel_major_rail" ||
        id === "road_transit_rail" || id === "bridge_transit_rail" || id === "tunnel_transit_rail") {
      return { ...layer, paint: { "line-color": theme.accent, "line-opacity": 0.55, "line-dasharray": [3, 2] } };
    }

    // --- Railway hatching: hide (noisy on dark bg) ---
    if (id.includes("_hatching")) {
      return { ...layer, layout: { ...((layer as any).layout ?? {}), visibility: "none" } };
    }

    // --- Road area pattern: hide ---
    if (id === "road_area_pattern") {
      return { ...layer, layout: { ...((layer as any).layout ?? {}), visibility: "none" } };
    }

    // --- One-way arrows: hide ---
    if (id === "road_one_way_arrow" || id === "road_one_way_arrow_opposite") {
      return { ...layer, layout: { ...((layer as any).layout ?? {}), visibility: "none" } };
    }

    // --- All labels and symbols: hide for poster aesthetic ---
    if (layer.type === "symbol") {
      return { ...layer, layout: { ...((layer as any).layout ?? {}), visibility: "none" } };
    }

    return layer;
  });

  return { ...baseStyle, layers } as StyleSpecification;
}
