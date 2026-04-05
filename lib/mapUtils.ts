export type Bounds = {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
};

export type MapPaths = {
  roads: {
    motorway: string[];
    primary: string[];
    secondary: string[];
    tertiary: string[];
    residential: string[];
    other: string[];
  };
  water: string[];
  parks: string[];
};

export function getBounds(lat: number, lon: number, radius = 4000): Bounds {
  const delta = (radius / 111000) * 1.4;
  return {
    minLat: lat - delta,
    maxLat: lat + delta,
    minLon: lon - delta * 1.3,
    maxLon: lon + delta * 1.3,
  };
}

export function project(
  lat: number,
  lon: number,
  bounds: Bounds,
  W: number,
  H: number
): [number, number] {
  const x = ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * W;
  const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * H;
  return [x, y];
}

export function coordsToPath(
  coords: { lat: number; lon: number }[],
  bounds: Bounds,
  W: number,
  H: number
): string {
  if (!coords || coords.length < 2) return "";
  return coords
    .map((n, i) => {
      const [x, y] = project(n.lat, n.lon, bounds, W, H);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function polygonToPath(
  coords: { lat: number; lon: number }[],
  bounds: Bounds,
  W: number,
  H: number
): string {
  if (!coords || coords.length < 3) return "";
  return coordsToPath(coords, bounds, W, H) + " Z";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseOSM(elements: any[], bounds: Bounds, W: number, H: number): MapPaths {
  const roads: MapPaths["roads"] = {
    motorway: [], primary: [], secondary: [],
    tertiary: [], residential: [], other: [],
  };
  const water: string[] = [];
  const parks: string[] = [];

  for (const el of elements) {
    if (!el.geometry) continue;
    const coords = el.geometry as { lat: number; lon: number }[];

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
      } else if (h === "tertiary" || h === "tertiary_link") {
        roads.tertiary.push(path);
      } else if (h === "residential" || h === "living_street" || h === "pedestrian") {
        roads.residential.push(path);
      } else {
        roads.other.push(path);
      }
    } else if (el.tags?.natural === "water" || el.tags?.waterway) {
      const path = polygonToPath(coords, bounds, W, H);
      if (path) water.push(path);
    } else if (el.tags?.leisure === "park" || el.tags?.leisure === "garden" || el.tags?.landuse === "grass") {
      const path = polygonToPath(coords, bounds, W, H);
      if (path) parks.push(path);
    }
  }

  return { roads, water, parks };
}

export function buildOverpassQuery(bounds: Bounds): string {
  const { minLat, minLon, maxLat, maxLon } = bounds;
  return `
[out:json][timeout:25];
(
  way["highway"~"motorway|motorway_link|trunk|trunk_link|primary|primary_link|secondary|secondary_link|tertiary|tertiary_link|residential|living_street|pedestrian|footway"](${minLat},${minLon},${maxLat},${maxLon});
  way["waterway"~"river|canal|stream"](${minLat},${minLon},${maxLat},${maxLon});
  way["natural"="water"](${minLat},${minLon},${maxLat},${maxLon});
  way["leisure"~"park|garden"](${minLat},${minLon},${maxLat},${maxLon});
  way["landuse"="grass"](${minLat},${minLon},${maxLat},${maxLon});
);
out geom;
  `.trim();
}
