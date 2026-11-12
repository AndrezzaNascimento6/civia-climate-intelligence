import type { ClimateSnapshot } from "./climate";

export type Priorities = {
  outdoor: boolean;
  air: boolean;
  rain: boolean;
};

export const DEFAULT_PRIORITIES: Priorities = {
  outdoor: true,
  air: true,
  rain: true
};

export type Insight = {
  id: string;
  category: string;
  title: string;
  summary: string;
  recommendation: string;
  level: "positive" | "attention" | "neutral";
  evidence: { label: string; value: string; context: string }[];
};

/** Explainable, deterministic product logic — not generative AI. */
export function deriveInsights(snapshot: ClimateSnapshot, priorities: Priorities): Insight[] {
  const results: Insight[] = [];
  const q = snapshot.aqi;
  const uv = snapshot.uv;
  const rain = snapshot.rainChance;

  if (priorities.air && q !== null) {
    const high = q > 100;
    const moderate = q > 50 && q <= 100;
    results.push({
      id: "air", category: "AIR QUALITY", level: high ? "attention" : "positive",
      title: high ? "Make room for cleaner-air options." : moderate ? "A little more awareness goes a long way." : "A good moment to check in with your city.",
      summary: high ? "Today's air-quality index is elevated. Consider adjusting more strenuous outdoor plans, especially if you are sensitive to air pollution." :
        moderate ? "Air quality is moderate. Some people who are unusually sensitive to pollution may prefer lighter outdoor activity." :
        "The current model-based AQI sits in the good range. Air conditions can still vary by street and time of day.",
      recommendation: high ? "Consider a lower-intensity route or a different time for outdoor activity." : "Check the hourly trend before deciding when to head out.",
      evidence: [
        { label: "US Air Quality Index", value: String(Math.round(q)), context: "Model-based estimate; lower is generally better." },
        { label: "PM2.5", value: snapshot.pm25 === null ? "N/A" : snapshot.pm25.toFixed(1) + " µg/m³", context: "Fine particles estimated by the air-quality model." }
      ]
    });
  }

  if (priorities.outdoor && uv !== null) {
    const high = uv >= 6;
    results.push({
      id: "uv", category: "SUN EXPOSURE", level: high ? "attention" : "neutral",
      title: high ? "The sun is doing more than you think." : "Think about the light, not only the temperature.",
      summary: high ? "UV is currently elevated. For time outdoors, consider shade, sun protection and less exposed routes." :
        "UV is not currently in the high range. It can rise or fall through the day, so timing matters.",
      recommendation: high ? "Consider a shaded route and sun protection." : "Use the hourly forecast to plan around UV changes.",
      evidence: [
        { label: "UV index", value: String(Math.round(uv)), context: "Estimated UV index for the selected hour." },
        { label: "Current temperature", value: Math.round(snapshot.temperature) + "°C", context: "UV exposure is different from how warm it feels." }
      ]
    });
  }

  if (priorities.rain && rain !== null) {
    const likely = rain >= 50;
    results.push({
      id: "rain", category: "RAIN OUTLOOK", level: likely ? "attention" : "neutral",
      title: likely ? "A flexible plan might be the best one." : "Keep a little space for changing skies.",
      summary: likely ? "The hourly precipitation probability is relatively high. A flexible schedule could make an outdoor trip easier." :
        "Rain appears less likely for the current forecast hour, but conditions may change later.",
      recommendation: likely ? "Bring rain protection or check a later time window." : "Review the next hours before a longer trip.",
      evidence: [
        { label: "Rain probability", value: Math.round(rain) + "%", context: "Forecast probability for the selected hour, not the portion of the city affected." },
        { label: "Conditions", value: "Forecast", context: "A model prediction, not a guarantee." }
      ]
    });
  }

  if (results.length === 0) {
    results.push({
      id: "overview", category: "YOUR ENVIRONMENT", level: "neutral",
      title: "Start with the signals that matter to you.",
      summary: "Turn on an interest in Preferences to see guidance tied to weather, air and your priorities.",
      recommendation: "Open Preferences to personalize your CIVIA experience.",
      evidence: [{ label: "Conditions", value: "Available", context: "Data from the selected city." }]
    });
  }
  return results;
}
