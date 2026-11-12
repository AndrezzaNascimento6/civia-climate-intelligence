export type City = {
  id: string;
  name: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
};

export type ClimateHour = {
  time: string;
  temperature: number | null;
  rainChance: number | null;
  airQuality: number | null;
  uv: number | null;
};

export type ClimateDay = {
  date: string;
  high: number;
  low: number;
  weatherCode: number;
};

export type ClimateSnapshot = {
  city: City;
  source: "live" | "sample";
  updatedAt: string;
  timezone: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  wind: number;
  weatherCode: number;
  isDay: boolean;
  aqi: number | null;
  pm25: number | null;
  pm10: number | null;
  uv: number | null;
  rainChance: number | null;
  hourly: ClimateHour[];
  daily: ClimateDay[];
};

export const CITIES: City[] = [
  { id: "sao-paulo", name: "São Paulo", region: "SP", country: "Brazil", latitude: -23.5505, longitude: -46.6333 },
  { id: "montreal", name: "Montréal", region: "QC", country: "Canada", latitude: 45.5019, longitude: -73.5674 },
  { id: "lisbon", name: "Lisbon", region: "Lisbon", country: "Portugal", latitude: 38.7223, longitude: -9.1393 },
  { id: "vancouver", name: "Vancouver", region: "BC", country: "Canada", latitude: 49.2827, longitude: -123.1207 },
  { id: "london", name: "London", region: "England", country: "UK", latitude: 51.5072, longitude: -0.1276 },
  { id: "tokyo", name: "Tokyo", region: "Tokyo", country: "Japan", latitude: 35.6762, longitude: 139.6503 }
];

export const START_CITY = CITIES[0];
export const STORAGE_KEY = "civia.preferences.v1";

type WeatherResponse = {
  timezone?: string;
  current?: {
    time?: string;
    temperature_2m?: number;
    apparent_temperature?: number;
    relative_humidity_2m?: number;
    wind_speed_10m?: number;
    weather_code?: number;
    is_day?: number;
  };
  hourly?: {
    time?: string[];
    temperature_2m?: number[];
    precipitation_probability?: number[];
    uv_index?: number[];
  };
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    weather_code?: number[];
  };
};

type AirResponse = {
  current?: { us_aqi?: number; pm2_5?: number; pm10?: number };
  hourly?: { time?: string[]; us_aqi?: number[] };
};

function numeric(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal, cache: "no-store" });
  if (!response.ok) throw new Error("Data provider returned an error (" + response.status + ").");
  const data: unknown = await response.json();
  if (!data || typeof data !== "object" || ("error" in data && data.error === true)) {
    throw new Error("No environmental data was returned for this location.");
  }
  return data as T;
}

export async function loadClimate(city: City, signal?: AbortSignal): Promise<ClimateSnapshot> {
  const coords = "latitude=" + city.latitude + "&longitude=" + city.longitude;
  const weatherUrl = "https://api.open-meteo.com/v1/forecast?" + coords +
    "&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day" +
    "&hourly=temperature_2m,precipitation_probability,uv_index" +
    "&daily=temperature_2m_max,temperature_2m_min,weather_code" +
    "&forecast_days=4&timezone=auto";
  const airUrl = "https://air-quality-api.open-meteo.com/v1/air-quality?" + coords +
    "&current=us_aqi,pm2_5,pm10&hourly=us_aqi&forecast_days=4&timezone=auto";

  const [weatherResult, airResult] = await Promise.allSettled([
    getJson<WeatherResponse>(weatherUrl, signal),
    getJson<AirResponse>(airUrl, signal)
  ]);
  if (weatherResult.status === "rejected") throw weatherResult.reason;
  const weather = weatherResult.value;
  const air = airResult.status === "fulfilled" ? airResult.value : null;
  const current = weather.current;
  if (!current || numeric(current.temperature_2m) === null) {
    throw new Error("The weather provider did not return current conditions.");
  }

  const weatherTimes = weather.hourly?.time ?? [];
  const start = Math.max(0, weatherTimes.findIndex(time => time >= (current.time ?? "")));
  const airLookup = new Map(
    (air?.hourly?.time ?? []).map((time, index) => [time, numeric(air?.hourly?.us_aqi?.[index])])
  );
  const hours: ClimateHour[] = weatherTimes.slice(start, start + 24).map((time, i) => {
    const index = start + i;
    return {
      time,
      temperature: numeric(weather.hourly?.temperature_2m?.[index]),
      rainChance: numeric(weather.hourly?.precipitation_probability?.[index]),
      uv: numeric(weather.hourly?.uv_index?.[index]),
      airQuality: airLookup.get(time) ?? null
    };
  });
  const days = (weather.daily?.time ?? []).slice(0, 4).map((date, index) => ({
    date,
    high: numeric(weather.daily?.temperature_2m_max?.[index]) ?? 0,
    low: numeric(weather.daily?.temperature_2m_min?.[index]) ?? 0,
    weatherCode: numeric(weather.daily?.weather_code?.[index]) ?? 0
  }));

  return {
    city,
    source: "live",
    updatedAt: current.time ?? new Date().toISOString(),
    timezone: weather.timezone ?? "auto",
    temperature: current.temperature_2m as number,
    feelsLike: numeric(current.apparent_temperature) ?? (current.temperature_2m as number),
    humidity: numeric(current.relative_humidity_2m) ?? 0,
    wind: numeric(current.wind_speed_10m) ?? 0,
    weatherCode: numeric(current.weather_code) ?? 0,
    isDay: current.is_day !== 0,
    aqi: numeric(air?.current?.us_aqi),
    pm25: numeric(air?.current?.pm2_5),
    pm10: numeric(air?.current?.pm10),
    uv: hours[0]?.uv ?? null,
    rainChance: hours[0]?.rainChance ?? null,
    hourly: hours,
    daily: days
  };
}

/** Explicitly fictional fallback: available only after the visitor chooses demo mode. */
export function createSample(city: City): ClimateSnapshot {
  const base = new Date();
  const hourly: ClimateHour[] = Array.from({ length: 24 }, (_, index) => {
    const time = new Date(base.getTime() + index * 3600000);
    const temperature = 23 + Math.sin((index + 1) / 4) * 4;
    return {
      time: time.toISOString().slice(0, 13) + ":00",
      temperature: Math.round(temperature),
      rainChance: Math.round(10 + Math.max(0, Math.sin(index / 3)) * 45),
      airQuality: Math.round(44 + Math.sin(index / 5) * 17),
      uv: Math.max(0, Math.round(6 * Math.sin((index + 2) / 9)))
    };
  });
  const daily: ClimateDay[] = Array.from({ length: 4 }, (_, i) => {
    const date = new Date(base.getTime() + i * 86400000);
    return { date: date.toISOString().slice(0, 10), high: 27 - i, low: 18 + i, weatherCode: [2, 3, 1, 0][i] };
  });
  return {
    city, source: "sample", updatedAt: base.toISOString(), timezone: "Demo time",
    temperature: 24, feelsLike: 26, humidity: 63, wind: 12,
    weatherCode: 2, isDay: true, aqi: 44, pm25: 9.8, pm10: 18.2, uv: 5,
    rainChance: 25, hourly, daily
  };
}

export function weatherLabel(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code >= 45 && code <= 48) return "Foggy";
  if (code >= 51 && code <= 67) return "Rainy";
  if (code >= 71 && code <= 77) return "Snowy";
  if (code >= 80 && code <= 82) return "Showers";
  if (code >= 95) return "Thunderstorms";
  return "Variable skies";
}

export function aqiCategory(value: number | null): { label: string; tone: "good" | "moderate" | "poor" | "unknown" } {
  if (value === null) return { label: "Unavailable", tone: "unknown" };
  if (value <= 50) return { label: "Good", tone: "good" };
  if (value <= 100) return { label: "Moderate", tone: "moderate" };
  if (value <= 150) return { label: "Unhealthy for sensitive groups", tone: "poor" };
  return { label: "Unhealthy air", tone: "poor" };
}

export function formatDay(date: string): string {
  const value = new Date(date.slice(0, 10) + "T12:00:00Z");
  return new Intl.DateTimeFormat("en", { weekday: "short", timeZone: "UTC" }).format(value);
}

export function formatHour(time: string): string {
  const hours = Number(time.slice(11, 13));
  if (!Number.isFinite(hours)) return time;
  return (hours % 12 || 12) + (hours >= 12 ? " PM" : " AM");
}
