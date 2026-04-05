import { MapBounds, SVGPaths } from "./types";

export const MAP_W = 800;
export const MAP_H = 600;
export const DEFAULT_RADIUS = 8000;

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

export function getBounds(lat: number, lon: number, radius: number): MapBounds {
  const latDelta = (radius / 111000) * 1.5;
  const lonDelta = latDelta * 1.4;
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLon: lon - lonDelta,
    maxLon: lon + lonDelta,
  };
}

export async function fetchMapData(lat: number, lon: number, radius = DEFAULT_RADIUS): Promise<{ data: any; bounds: MapBounds }> {
  const bounds = getBounds(lat, lon, radius);
  const b = `${bounds.minLat},${bounds.minLon},${bounds.maxLat},${bounds.maxLon}`;

  const query = `[out:json][timeout:45];
(
  way["highway"~"motorway|motorway_link|trunk|trunk_link|primary|primary_link|secondary|secondary_link|tertiary|tertiary_link|unclassified|residential|living_street|service|pedestrian|footway|cycleway|path|steps|track"](${b});
  way["natural"="water"](${b});
  way["natural"="coastline"](${b});
  way["waterway"~"river|canal|stream|drain"](${b});
  relation["natural"="water"](${b});
  way["leisure"~"park|garden|pitch|playground"](${b});
  way["landuse"~"park|forest|grass|meadow|recreation_ground|cemetery|farmland"](${b});
  way["building"](${b});
  way["railway"~"rail|subway|light_rail|tram"](${b});
);
out geom;`;

  const res = await fetch("/api/map", { method: "POST", body: query });
  const data = await res.json();
  return { data, bounds };
}

export function parseOSM(data: any, bounds: MapBounds, W: number, H: number): SVGPaths {
  const roads: Record<string, string[]> = {
    motorway: [], primary: [], secondary: [], tertiary: [],
    residential: [], service: [], path: [], other: [], railway: [],
  };
  const water: string[] = [];
  const parks: string[] = [];
  const buildings: string[] = [];

  for (const el of data.elements || []) {
    if (!el.geometry) continue;
    const coords: [number, number][] = el.geometry.map((n: any) => [n.lon, n.lat]);

    if (el.tags?.railway) {
      const path = coordsToPath(coords, bounds, W, H);
      if (path) roads.railway.push(path);
      continue;
    }

    if (el.tags?.highway) {
      const h: string = el.tags.highway;
      const path = coordsToPath(coords, bounds, W, H);
      if (!path) continue;
      if (h === "motorway" || h === "motorway_link" || h === "trunk" || h === "trunk_link") {
        roads.motorway.push(path);
      } else if (h === "primary" || h === "primary_link") {
        roads.primary.push(path);
      } else if (h === "secondary" || h === "secondary_link") {
        roads.secondary.push(path);
      } else if (h === "tertiary" || h === "tertiary_link" || h === "unclassified") {
        roads.tertiary.push(path);
      } else if (h === "residential" || h === "living_street" || h === "pedestrian") {
        roads.residential.push(path);
      } else if (h === "service") {
        roads.service.push(path);
      } else if (h === "footway" || h === "cycleway" || h === "path" || h === "steps" || h === "track") {
        roads.path.push(path);
      } else {
        roads.other.push(path);
      }
      continue;
    }

    if (el.tags?.building) {
      const path = polygonToPath(coords, bounds, W, H);
      if (path) buildings.push(path);
      continue;
    }

    if (el.tags?.natural === "water" || el.tags?.natural === "coastline" || el.tags?.waterway) {
      const path = el.tags?.natural === "coastline"
        ? coordsToPath(coords, bounds, W, H)
        : polygonToPath(coords, bounds, W, H);
      if (path) water.push(path);
      continue;
    }

    if (el.tags?.leisure || el.tags?.landuse) {
      const path = polygonToPath(coords, bounds, W, H);
      if (path) parks.push(path);
    }
  }

  return { roads, water, parks, buildings };
}
