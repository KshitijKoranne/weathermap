export type Theme = {
  name: string;
  bg: string;
  water: string;
  park: string;
  motorway: string;
  primary: string;
  secondary: string;
  tertiary: string;
  residential: string;
  text: string;
  accent: string;
  sub: string;
  gradient: string[];
  label: string;
};

export const THEMES: Record<string, Theme> = {
  sunny: {
    name: "GOLDEN HOUR",
    bg: "#120900",
    water: "#7a3800",
    park: "#2d1400",
    motorway: "#ffaa44",
    primary: "#dd7722",
    secondary: "#aa5510",
    tertiary: "#7a3a08",
    residential: "#4a2200",
    text: "#fff0d8",
    accent: "#ffaa44",
    sub: "#aa6622",
    gradient: ["#ff6b00", "#ffaa44", "#ffdd99"],
    label: "☀️",
  },
  rain: {
    name: "MONSOON",
    bg: "#010810",
    water: "#083360",
    park: "#030e18",
    motorway: "#44bbee",
    primary: "#1a88cc",
    secondary: "#0d5599",
    tertiary: "#082d55",
    residential: "#051a33",
    text: "#aadfff",
    accent: "#44bbee",
    sub: "#336688",
    gradient: ["#010810", "#0d3366", "#44bbee"],
    label: "🌧️",
  },
  storm: {
    name: "ELECTRIC",
    bg: "#04000a",
    water: "#1a0033",
    park: "#0a0014",
    motorway: "#dd33ff",
    primary: "#9900ee",
    secondary: "#6600aa",
    tertiary: "#440077",
    residential: "#280044",
    text: "#ee99ff",
    accent: "#dd33ff",
    sub: "#883399",
    gradient: ["#0d001a", "#440077", "#dd33ff"],
    label: "⛈️",
  },
  fog: {
    name: "PHANTOM",
    bg: "#0a0a10",
    water: "#181828",
    park: "#0f0f18",
    motorway: "#99aabb",
    primary: "#6677880",
    secondary: "#445566",
    tertiary: "#334455",
    residential: "#222d38",
    text: "#ccd8e8",
    accent: "#99aabb",
    sub: "#556677",
    gradient: ["#0a0a10", "#222c38", "#99aabb"],
    label: "🌫️",
  },
  cloudy: {
    name: "OVERCAST",
    bg: "#06090d",
    water: "#101820",
    park: "#0a0f14",
    motorway: "#8899aa",
    primary: "#556677",
    secondary: "#3d5060",
    tertiary: "#2a3a48",
    residential: "#1a2530",
    text: "#bbccdd",
    accent: "#8899aa",
    sub: "#445566",
    gradient: ["#06090d", "#182030", "#8899aa"],
    label: "☁️",
  },
  night: {
    name: "MIDNIGHT",
    bg: "#010208",
    water: "#04091a",
    park: "#020408",
    motorway: "#eeeeee",
    primary: "#bbbbbb",
    secondary: "#777777",
    tertiary: "#444444",
    residential: "#272727",
    text: "#f0f0f0",
    accent: "#ffffff",
    sub: "#666666",
    gradient: ["#010208", "#080f1a", "#eeeeee"],
    label: "🌙",
  },
  snow: {
    name: "SNOWFALL",
    bg: "#04091a",
    water: "#0d1e40",
    park: "#070e20",
    motorway: "#ddeeff",
    primary: "#99bbdd",
    secondary: "#6688aa",
    tertiary: "#445566",
    residential: "#2a3a4a",
    text: "#ddeeff",
    accent: "#bbddff",
    sub: "#6688aa",
    gradient: ["#04091a", "#1a2a44", "#ddeeff"],
    label: "❄️",
  },
};

export function getTheme(weatherCode: number, isDay: number): Theme {
  if (isDay === 0) return THEMES.night;
  if (weatherCode <= 1) return THEMES.sunny;
  if (weatherCode <= 3) return THEMES.cloudy;
  if (weatherCode <= 49) return THEMES.fog;
  if (weatherCode <= 67) return THEMES.rain;
  if (weatherCode <= 77) return THEMES.snow;
  if (weatherCode <= 82) return THEMES.rain;
  return THEMES.storm;
}

export function weatherDesc(code: number): string {
  if (code === 0) return "Clear Sky";
  if (code <= 2) return "Partly Cloudy";
  if (code === 3) return "Overcast";
  if (code <= 49) return "Foggy";
  if (code <= 55) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}
