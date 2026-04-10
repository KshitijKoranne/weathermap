export interface Theme {
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
}

export const THEMES: Record<string, Theme> = {
  sunny: {
    name: "GOLDEN HOUR", label: "☀️",
    bg: "#120900", water: "#7a3800", park: "#2d1600",
    motorway: "#ffaa44", primary: "#e07828", secondary: "#b05818",
    tertiary: "#7a3a10", residential: "#4a2208",
    text: "#fff0d8", accent: "#ffaa44", sub: "#b07040",
    gradient: ["#ff6b00", "#ff9d3d", "#ffcc80"],
  },
  rain: {
    name: "MONSOON", label: "🌧️",
    bg: "#010810", water: "#083460", park: "#030e18",
    motorway: "#48b8f0", primary: "#0280c8", secondary: "#014f90",
    tertiary: "#013260", residential: "#011e40",
    text: "#b0e0f8", accent: "#48b8f0", sub: "#5aaad8",
    gradient: ["#0a1628", "#1565c0", "#4fc3f7"],
  },
  storm: {
    name: "ELECTRIC", label: "⛈️",
    bg: "#030008", water: "#180028", park: "#080010",
    motorway: "#d838f0", primary: "#9800e0", secondary: "#6800b0",
    tertiary: "#420070", residential: "#280045",
    text: "#e878ff", accent: "#d838f0", sub: "#c060e0",
    gradient: ["#0d001a", "#4a0080", "#e040fb"],
  },
  fog: {
    name: "PHANTOM", label: "🌫️",
    bg: "#0a0a10", water: "#181828", park: "#0f0f18",
    motorway: "#98aac0", primary: "#687888", secondary: "#485868",
    tertiary: "#344050", residential: "#222c38",
    text: "#c8d8e8", accent: "#98aac0", sub: "#8098b0",
    gradient: ["#0a0a10", "#2a3040", "#98aac0"],
  },
  cloudy: {
    name: "OVERCAST", label: "☁️",
    bg: "#070b0f", water: "#121e28", park: "#0b1218",
    motorway: "#88a0b8", primary: "#586878", secondary: "#404e5e",
    tertiary: "#2c3840", residential: "#1e2830",
    text: "#c0d0e0", accent: "#88a0b8", sub: "#7a9ab8",
    gradient: ["#070b0f", "#1a2430", "#88a0b8"],
  },
  night: {
    name: "MIDNIGHT", label: "🌙",
    bg: "#010208", water: "#04081a", park: "#020508",
    motorway: "#f0f0f8", primary: "#c0c0d0", secondary: "#808090",
    tertiary: "#505060", residential: "#303040",
    text: "#f0f0f8", accent: "#f0f0f8", sub: "#808090",
    gradient: ["#010208", "#080f1a", "#f0f0f8"],
  },
  snow: {
    name: "SNOWFALL", label: "❄️",
    bg: "#050910", water: "#182240", park: "#0a1020",
    motorway: "#e0f0ff", primary: "#a8c8e8", secondary: "#7090b0",
    tertiary: "#486080", residential: "#2c4058",
    text: "#e8f4ff", accent: "#c8e0ff", sub: "#7090b0",
    gradient: ["#050910", "#182240", "#e0f0ff"],
  },
};

export function getTheme(weatherCode: number, isNight: boolean): Theme {
  if (isNight) return THEMES.night;
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

export interface City {
  name: string;
  lat: number;
  lon: number;
}

export interface WeatherData {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    weathercode: number;
    is_day: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weathercode: number[];
    precipitation_probability: number[];
  };
  daily: {
    sunrise: string[];
    sunset: string[];
  };
}

export interface MapBounds {
  minLat: number; maxLat: number;
  minLon: number; maxLon: number;
}

export interface SVGPaths {
  roads: Record<string, string[]>;
  water: string[];
  parks: string[];
  buildings: string[];
}

