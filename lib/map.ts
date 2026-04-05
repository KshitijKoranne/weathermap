import { MapBounds, SVGPaths } from "./types";

export const MAP_W = 800;
export const MAP_H = 600;

export function project(lat: number, lon: number, bounds: MapBounds, W: number, H: number): [number, number] {
  const x = ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * W;
  const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * H;
  return [x, y];
}

export function coordsToPath(coords: [number, number][], bounds: MapBounds, W: number, H: number): string {
  if (!coords || coords.length < 2) return "";
  return coords.map(([lon, lat], i) => {
    const [x, y] = project(lat, lon, bounds, W, H);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

export function polygonToPath(coords: [number, number][], bounds: MapBounds, W: number, H: number): string {
  if (!coords || coords.length < 3) return "";
  return coordsToPath(coords, bounds, W, H) + " Z";
}

export async function fetchMapData(lat: number, lon: number, radius = 4000): Promise<{ data: any; bounds: MapBounds }> {
  const delta = (radius / 111000) * 1.4;
  const bounds: MapBounds = {
    minLat: lat - delta, maxLat: lat + delta,
    minLon: lon - delta * 1.3, maxLon: lon + delta * 1.3,
  };
  const query = `
    [out:json][timeout:28];
    (
      way["highway"~"motorway|trunk|primary|secondary|tertiary|residential|living_street"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      way["natural"="water"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      way["waterway"~"river|canal"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
      way["leisure"~"park|garden"](${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon});
    );
    out geom;
  `;
  const res = await fetch("/api/map", { method: "POST", body: query });
  const data = await res.json();
  return { data, bounds };
}

export function parseOSM(data: any, bounds: MapBounds, W: number, H: number): SVGPaths {
  const roads: Record<string, string[]> = {
    motorway: [], primary: [], secondary: [], tertiary: [], residential: [], other: [],
  };
  const water: string[] = [];
  const parks: string[] = [];

  for (const el of data.elements || []) {
    if (!el.geometry) continue;
    const coords: [number, number][] = el.geometry.map((n: any) => [n.lon, n.lat]);
    if (el.tags?.highway) {
      const h = el.tags.highway;
      const path = coordsToPath(coords, bounds, W, H);
      if (!path) continue;
      if (h === "motorway" || h === "motorway_link" || h === "trunk") roads.motorway.push(path);
      else if (h === "primary" || h === "primary_link") roads.primary.push(path);
      else if (h === "secondary" || h === "secondary_link") roads.secondary.push(path);
      else if (h === "tertiary" || h === "tertiary_link") roads.tertiary.push(path);
      else if (h === "residential" || h === "living_street") roads.residential.push(path);
      else roads.other.push(path);
    } else if (el.tags?.natural === "water" || el.tags?.waterway) {
      const path = polygonToPath(coords, bounds, W, H);
      if (path) water.push(path);
    } else if (el.tags?.leisure === "park" || el.tags?.leisure === "garden") {
      const path = polygonToPath(coords, bounds, W, H);
      if (path) parks.push(path);
    }
  }
  return { roads, water, parks };
}
