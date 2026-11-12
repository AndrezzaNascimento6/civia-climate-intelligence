import { ArrowRight, ArrowUpRight, CheckCircle2, Droplets, Heart, Info, Leaf, MapPin, SlidersHorizontal, Sparkles, Sun, Wind } from "lucide-react";
import type { CSSProperties } from "react";
import { aqiCategory, formatHour, weatherLabel, type ClimateSnapshot } from "@/lib/climate";
import { deriveInsights, type Priorities } from "@/lib/insights";

type Props = {
  data: ClimateSnapshot;
  priorities: Priorities;
  onExplore: () => void;
  onInsights: () => void;
  onPreferences: () => void;
};

type Tone = "good" | "moderate" | "sensitive" | "unhealthy" | "very-unhealthy" | "hazardous" | "unknown";
function describeAir(value: number | null): { tone: Tone; label: string; headline: string; subheading: string } {
  if (value === null) return { tone: "unknown", label: "Not available", headline: "Stay curious about your city.", subheading: "The air-quality estimate is unavailable right now. Other weather information may still be ready." };
  if (value <= 50) return { tone: "good", label: "Good", headline: "A little more room to breathe.", subheading: "Air quality is in the good range today. Check the forecast before your next outdoor plan." };
  if (value <= 100) return { tone: "moderate", label: "Moderate", headline: "A mindful day ahead.", subheading: "Air quality is moderate. Especially sensitive people may want to check the next hours." };
  if (value <= 150) return { tone: "sensitive", label: "Unhealthy for sensitive groups", headline: "Choose a gentler moment.", subheading: "Air quality is elevated for sensitive groups. Look for a better time for demanding outdoor activities." };
  if (value <= 200) return { tone: "unhealthy", label: "Unhealthy", headline: "Take care of your breathing space.", subheading: "Air quality is unhealthy. Consider reducing prolonged outdoor exertion and checking official local guidance." };
  if (value <= 300) return { tone: "very-unhealthy", label: "Very unhealthy", headline: "Today calls for extra care.", subheading: "Air quality is very unhealthy. Check official advice for your area before outdoor activities." };
  return { tone: "hazardous", label: "Hazardous", headline: "Put your wellbeing first.", subheading: "Hazardous air-quality estimates deserve attention. Follow official local air-quality advice." };
}

const AQI_LEGEND = [
  ["0–50", "Good", "good"],
  ["51–100", "Moderate", "moderate"],
  ["101–150", "Sensitive", "sensitive"],
  ["151–200", "Unhealthy", "unhealthy"],
  ["201–300", "Very unhealthy", "very-unhealthy"],
  ["301+", "Hazardous", "hazardous"]
] as const;

function Pollutant({ short, name, value }: { short: string; name: string; value: number | null }) {
  return <div className="breathe-pollutant">
    <div className="breathe-pollutant-heading"><span className="breathe-chemical">{short}</span><span className="breathe-pollutant-unit">µg/m³</span></div>
    <strong>{value === null ? "—" : Math.round(value)}</strong>
    <span className="breathe-pollutant-name">{name}</span>
  </div>;
}

function HourlyTrend({ data, onExplore }: { data: ClimateSnapshot; onExplore: () => void }) {
  const hours = data.hourly.slice(0, 12);
  const known = hours.filter(hour => hour.airQuality !== null);
  const max = Math.max(110, ...known.map(hour => hour.airQuality ?? 0));
  return <section className="breathe-card breathe-trend">
    <div className="breathe-card-heading">
      <div><span className="breathe-overline">THE NEXT HOURS</span><h2>How the air could <em>change.</em></h2></div>
      <button type="button" className="breathe-icon-button" onClick={onExplore} aria-label="Explore detailed hourly forecast"><ArrowUpRight size={23}/></button>
    </div>
    {known.length < 2 ? <p className="breathe-trend-empty">Hourly air-quality forecasts aren't available for this location.</p> :
      <div className="breathe-bars" role="img" aria-label={"Twelve-hour US AQI forecast. " + hours.map(hour => formatHour(hour.time)+": "+(hour.airQuality ?? "unavailable")).join("; ")}>
        {hours.map((hour,index) => {
          const n=hour.airQuality;
          const height=n === null ? 6 : Math.max(16, (n/max)*100);
          const category = describeAir(n);
          return <div className="breathe-bar-column" key={hour.time}>
            <span className="breathe-bar-value">{index % 3 === 0 && n !== null ? Math.round(n) : ""}</span>
            <span className={"breathe-bar breathe-bar--"+category.tone} style={{height:height+"%"}}/>
            <span className="breathe-bar-hour">{index % 3 === 0 || index === hours.length-1 ? formatHour(hour.time).replace(" ","") : ""}</span>
          </div>;
        })}
      </div>}
    <div className="breathe-chart-footer"><span><span className="breathe-live-dot"/> US AQI forecast · Model estimates</span><button type="button" onClick={onExplore}>See full forecast <ArrowRight size={17}/></button></div>
  </section>;
}

export default function ExposureDashboard({ data, priorities, onExplore, onInsights, onPreferences }: Props) {
  const air=describeAir(data.aqi);
  const selected = data.aqi === null ? null : Math.max(0,Math.min(100, data.aqi / 350 * 100));
  const highlighted=deriveInsights(data,priorities)[0];
  const localTime=data.updatedAt.includes("T") ? data.updatedAt.split("T")[1]?.slice(0,5) : null;
  const category=aqiCategory(data.aqi);
  const indicatorStyle=({"--breathe-indicator":(selected ?? 0)+"%"} as CSSProperties);
  const count=[data.pm25,data.pm10,data.ozone,data.nitrogenDioxide].filter(x=>x!==null).length;
  return <div className="breathe-app">
    <header className="breathe-welcome">
      <div className="breathe-welcome-copy">
        <span className="breathe-kicker"><span className="breathe-kicker-dot"/> YOUR CITY, A LITTLE CLEARER</span>
        <h1>Good to see <em>you here.</em></h1>
        <p>Let's make sense of the air around you.</p>
      </div>
      <div className="breathe-date">
        <span className="breathe-date-icon"><MapPin size={20} strokeWidth={1.8}/></span>
        <div><strong>{data.city.name}</strong><span>{data.city.region} · {data.city.country}</span></div>
      </div>
    </header>

    <section className={"breathe-hero breathe-hero--"+air.tone} aria-label="Current air-quality overview">
      <div className="breathe-hero-orbit breathe-hero-orbit--large" aria-hidden="true"/>
      <div className="breathe-hero-orbit breathe-hero-orbit--small" aria-hidden="true"/>
      <div className="breathe-hero-top">
        <div className="breathe-hero-top-eyebrow"><span className="breathe-little-sun"><Sun size={18}/></span><span>TODAY'S AIR</span></div>
        <span className="breathe-hero-source">{data.source === "sample" ? "FICTIONAL DEMO DATA" : "OPEN-METEO MODEL"}{localTime && data.source !== "sample" ? " · "+localTime : ""}</span>
      </div>
      <div className="breathe-hero-body">
        <div className="breathe-hero-message">
          <span className={"breathe-status breathe-status--"+air.tone}><span/>{air.label}</span>
          <h2>{air.headline}</h2>
          <p>{air.subheading}</p>
          <button type="button" className="breathe-hero-button" onClick={onInsights}>What does this mean? <ArrowUpRight size={19}/></button>
        </div>
        <div className="breathe-aqi-dial" aria-label={"US Air Quality Index: "+(data.aqi === null?"unavailable":Math.round(data.aqi)+", "+air.label)}>
          <div className="breathe-aqi-dial-inner">
            <span>US AQI</span>
            <strong>{data.aqi === null ? "—" : Math.round(data.aqi)}</strong>
            <small>{air.label}</small>
          </div>
        </div>
      </div>
      <div className="breathe-hero-bottom">
        <div className="breathe-scale-label"><span>AIR QUALITY INDEX</span><span>LOWER IS GENERALLY BETTER</span></div>
        <div className="breathe-aqi-scale" style={indicatorStyle} aria-hidden="true">
          {AQI_LEGEND.map(([range,label,tone])=><span key={tone} className={"breathe-scale-part breathe-scale-part--"+tone} title={range+" "+label}/>)}
          {selected!==null && <i className="breathe-scale-pointer"/>}
        </div>
        <div className="breathe-hero-scale-key"><span>Good</span><span>Moderate</span><span>Unhealthy</span><span>Hazardous</span></div>
      </div>
    </section>

    <div className="breathe-overview-grid">
      <section className="breathe-card breathe-weather-card">
        <div className="breathe-card-heading"><div><span className="breathe-overline">YOUR CONDITIONS</span><h2>A quick look <em>outside.</em></h2></div><Sun size={27} strokeWidth={1.6}/></div>
        <div className="breathe-weather-feature">
          <div className="breathe-weather-temp">{Math.round(data.temperature)}<span>°</span></div>
          <div className="breathe-weather-desc"><strong>{weatherLabel(data.weatherCode)}</strong><span>Feels like {Math.round(data.feelsLike)}°C</span></div>
        </div>
        <div className="breathe-weather-metrics">
          <div><Droplets size={19}/><span>Humidity</span><strong>{Math.round(data.humidity)}%</strong></div>
          <div><Wind size={19}/><span>Wind</span><strong>{Math.round(data.wind)} <small>km/h</small></strong></div>
          <div><Sun size={19}/><span>UV index</span><strong>{data.uv === null ? "—" : Math.round(data.uv)}</strong></div>
        </div>
      </section>
      <section className="breathe-card breathe-pollutants-card">
        <div className="breathe-card-heading"><div><span className="breathe-overline">BEYOND THE INDEX</span><h2>What's in <em>the air?</em></h2></div><Leaf size={26} strokeWidth={1.6}/></div>
        <p className="breathe-card-description">Concentrations estimated by the air-quality model — not sensor readings at your exact street.</p>
        <div className="breathe-pollutants-grid">
          <Pollutant short="PM₂.₅" name="Fine particles" value={data.pm25}/>
          <Pollutant short="PM₁₀" name="Particles" value={data.pm10}/>
          <Pollutant short="O₃" name="Ozone" value={data.ozone}/>
          <Pollutant short="NO₂" name="Nitrogen dioxide" value={data.nitrogenDioxide}/>
        </div>
        <div className="breathe-pollutants-footer"><span>{count} of 4 readings available</span><span className={"breathe-plain-status breathe-plain-status--"+air.tone}>{category.label}</span></div>
      </section>
    </div>

    <div className="breathe-overview-grid breathe-overview-grid--bottom">
      <HourlyTrend data={data} onExplore={onExplore}/>
      <section className="breathe-insight-card">
        <div className="breathe-insight-bloom" aria-hidden="true"><i/><i/><i/></div>
        <div className="breathe-insight-head"><Sparkles size={20}/><span>A THOUGHT FOR YOUR DAY</span></div>
        <h2>{highlighted ? highlighted.title : "Small steps, clearer choices."}</h2>
        <p>{highlighted ? highlighted.summary : "Explore the signals you care about and see where they lead."}</p>
        <button type="button" onClick={onInsights}>Understand the why <ArrowUpRight size={20}/></button>
      </section>
    </div>

    <section className="breathe-journey" aria-label="Explore CIVIA">
      <div className="breathe-journey-heading"><span className="breathe-overline">YOU'RE IN CONTROL</span><h2>Make it work <em>for you.</em></h2></div>
      <div className="breathe-journey-items">
        <button type="button" onClick={onExplore}><span className="breathe-journey-icon"><Wind size={23}/></span><span><strong>Explore the forecast</strong><small>See what could change next</small></span><ArrowUpRight size={21}/></button>
        <button type="button" onClick={onInsights}><span className="breathe-journey-icon"><Heart size={23}/></span><span><strong>Understand an insight</strong><small>Review the factors behind it</small></span><ArrowUpRight size={21}/></button>
        <button type="button" onClick={onPreferences}><span className="breathe-journey-icon"><SlidersHorizontal size={23}/></span><span><strong>Choose your priorities</strong><small>Make the experience yours</small></span><ArrowUpRight size={21}/></button>
      </div>
    </section>
    <div className="breathe-trust"><CheckCircle2 size={19}/><span>Transparent by design · All air-quality values are model estimates, not personal exposure measurements. CIVIA is a design concept, not a health-alert service.</span><button type="button" onClick={onInsights}>About our guidance <ArrowRight size={17}/></button></div>
  </div>;
}
