import {
  Activity, ArrowRight, ArrowUpRight, CloudSun, Droplets, Eye,
  Leaf, MapPin, ShieldCheck, Sparkles, Wind
} from "lucide-react";
import { aqiCategory, formatHour, type ClimateSnapshot } from "@/lib/climate";
import { deriveInsights, type Priorities } from "@/lib/insights";
import type { CSSProperties } from "react";

type Props = {
  data: ClimateSnapshot;
  priorities: Priorities;
  onExplore: () => void;
  onInsights: () => void;
  onPreferences: () => void;
};

function Pollutant({
  symbol, name, value
}: {
  symbol: string; name: string; value: number | null
}) {
  return <div className="air-pollutant">
    <span className="air-pollutant-symbol">{symbol}</span>
    <div className="air-pollutant-reading">
      <strong>{value === null ? "—" : Math.round(value)}</strong>
      <span>{value === null ? "" : "µg/m³"}</span>
    </div>
    <small>{name}</small>
    <i aria-hidden="true"/>
  </div>;
}

function AQISparkline({ data }: { data: ClimateSnapshot }) {
  const values = data.hourly.slice(0, 13).map(hour => hour.airQuality);
  const available = values.filter((value): value is number => value !== null);
  if (available.length < 2) return <span className="air-sparkline-empty">Hourly trend unavailable</span>;
  const min = Math.min(...available);
  const max = Math.max(...available);
  const range = Math.max(12, max - min);
  const points = values.map((value, index) => value === null ? null : {
    x: 3 + (index / (values.length - 1)) * 194,
    y: 43 - ((value - min) / range) * 31
  });
  const polyline = points.filter((point): point is { x: number; y: number } => point !== null)
    .map(point => point.x.toFixed(1) + "," + point.y.toFixed(1)).join(" ");
  return <svg className="air-sparkline" viewBox="0 0 200 51" role="img" aria-label={"Forecast AQI trend: " + Math.round(min) + " to " + Math.round(max) + " US AQI."}>
    <line x1="0" x2="200" y1="43" y2="43" stroke="currentColor" strokeOpacity=".18" strokeDasharray="2 5"/>
    <polyline points={polyline} fill="none" stroke="#9beb91" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    {points[0] && <circle cx={points[0].x} cy={points[0].y} r="3.5" fill="#d7f1d0"/>}
  </svg>;
}

function ForestOrb({ variant }: { variant: "forest" | "smoke" }) {
  return <div className={"air-scenic-orb air-scenic-orb--" + variant} aria-hidden="true">
    <svg viewBox="0 0 280 280" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={"air-sky-"+variant} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={variant === "forest" ? "#859e93" : "#798281"}/>
          <stop offset="1" stopColor={variant === "forest" ? "#263f3a" : "#202c2a"}/>
        </linearGradient>
      </defs>
      <rect width="280" height="280" fill={"url(#air-sky-"+variant+")"}/>
      {variant === "forest" ? <>
        <path d="M0 145 55 95 104 136 154 75 218 139 280 98 280 280H0Z" fill="#56766a"/>
        <path d="M0 170 65 118 128 164 196 102 280 158v122H0Z" fill="#345b4b"/>
        {Array.from({length:13},(_,i)=> {
          const x=i*26-16, height=75+(i*29)%75;
          return <g key={i} opacity={.6+(i%3)*.1}>
            <path d={"M"+x+" 270v-"+(height+4)} stroke="#142f29" strokeWidth="5"/>
            <path d={"M"+(x-26)+" "+(260-height/2)+" "+x+" "+(200-height)+" "+(x+26)+" "+(260-height/2)+"Z"} fill="#173d32"/>
            <path d={"M"+(x-20)+" "+(240-height/2)+" "+x+" "+(180-height)+" "+(x+20)+" "+(240-height/2)+"Z"} fill="#1b4236"/>
          </g>;
        })}
        <path d="M0 187q88-34 149 13t131-8" stroke="#c7d7ce" strokeWidth="16" opacity=".2" fill="none"/>
      </> : <>
        <path d="M0 234 79 207 155 216 222 193 280 207v73H0Z" fill="#1e2a29"/>
        <rect x="68" y="124" width="21" height="117" fill="#222828"/>
        <rect x="185" y="152" width="29" height="92" fill="#28312e"/>
        <path d="M80 125q-36-36-1-54 22-10 5-32 43 17 26 56t-30 30Z" fill="#e0e1d8" opacity=".35"/>
        <path d="M201 152q-42-47-12-69 28-22 2-49 65 34 35 83t-25 35Z" fill="#e1e0d5" opacity=".28"/>
      </>}
    </svg>
  </div>;
}

export default function ExposureDashboard({
  data, priorities, onExplore, onInsights, onPreferences
}: Props) {
  const category = aqiCategory(data.aqi);
  const aqi = data.aqi;
  const value = aqi === null ? "—" : String(Math.round(aqi));
  const status = aqi === null ? "Unavailable" : aqi <= 50 ? "Good" : aqi <= 100 ? "Moderate" : "Elevated";
  const angle = aqi === null ? 0 : Math.max(15,Math.min(300,aqi <= 50 ? 244 : aqi <= 100 ? 225 : 202));
  const color = category.tone === "poor" ? "#f4a078" : category.tone === "moderate" ? "#f4cb77" : "#8bea82";
  const gaugeStyle = {"--air-arc":angle+"deg","--air-accent":color} as CSSProperties;
  const insights = deriveInsights(data,priorities);
  const primaryInsight = insights[0];
  const isSample = data.source === "sample";

  return <>
    <div className="air-showcase">
      <div className="air-showcase-art" aria-hidden="true">
        <ForestOrb variant="forest"/>
        <ForestOrb variant="smoke"/>
      </div>
      <div className="air-showcase-stage">
        <div className="air-floating-map">
          <div className="air-map-contours" aria-hidden="true"><i/><i/><i/></div>
          <span className="air-map-marker"><span/></span>
          <div className="air-map-location"><MapPin size={13}/>{data.city.name}</div>
          <div className="air-map-strip">
            <span><CloudSun size={13}/>{Math.round(data.temperature)}°C</span>
            <span><Droplets size={13}/>{data.humidity}%</span>
            <span>AQI {value}</span>
          </div>
          <small>Illustrative map · not a local sensor</small>
        </div>

        <div className="air-float-readings">
          <span>POLLUTANTS <span className="air-float-live">{isSample ? "DEMO" : "MODEL"}</span></span>
          <div className="air-float-grid">
            <Pollutant symbol="O₃" name="Ozone" value={data.ozone}/>
            <Pollutant symbol="NO₂" name="Nitrogen dioxide" value={data.nitrogenDioxide}/>
            <Pollutant symbol="PM₂.₅" name="Fine particles" value={data.pm25}/>
            <Pollutant symbol="PM₁₀" name="Particles" value={data.pm10}/>
          </div>
        </div>

        <div className="air-phone-frame">
          <div className="air-phone">
            <div className="air-phone-system" aria-hidden="true">
              <span>9:41</span>
              <span className="air-phone-notch"/>
              <span className="air-phone-bars"><i/><i/><i/><i/></span>
            </div>
            <div className="air-phone-header">
              <span className="air-phone-avatar" aria-hidden="true">c</span>
              <strong>civia<span>.</span></strong>
              <div className="air-phone-header-pace"><span className="air-phone-signal"/>{isSample ? "DEMO" : "LIVE"}</div>
            </div>
            <div className="air-phone-tabs" aria-label="Exposure view">
              <span>Overview</span><strong>Exposure</strong><span>Activity</span><span>Rest</span>
            </div>
            <div className="air-phone-monitor">
              <div className="air-monitor-topline"><span>ENVIRONMENTAL EXPOSURE</span><span>{data.city.name}</span></div>
              <div className="air-orbit-wrap">
                <div className="air-ring-trail" style={gaugeStyle}>
                  <div className="air-ring-track"/>
                  <div className="air-ring-inner">
                    <div className="air-ring-caption">US AIR QUALITY INDEX</div>
                    <strong>{value}</strong>
                    <span style={{color}}>{status}</span>
                  </div>
                  <i className="air-ring-satellite" aria-hidden="true"/>
                </div>
              </div>
              <p className="air-phone-message">{primaryInsight ? primaryInsight.summary : "Explore your local environmental conditions."}</p>
              <div className="air-phone-meta"><span>{isSample?"FICTIONAL EXAMPLE":"MODEL ESTIMATES"}</span><span>{data.city.region}</span></div>
            </div>

            <button className="air-phone-aqi-card" type="button" onClick={onExplore}>
              <div className="air-aqi-card-head"><span>AIR QUALITY</span><ArrowUpRight size={16}/></div>
              <div className="air-aqi-card-body">
                <div><strong>{value}</strong><small>{category.label}</small></div>
                <AQISparkline data={data}/>
              </div>
              <span className="air-aqi-card-caption">12-HOUR MODEL FORECAST</span>
            </button>
            <div className="air-phone-pollutants-head"><strong>Pollutants</strong><span>µg/m³</span></div>
            <div className="air-phone-pollutants">
              <Pollutant symbol="O₃" name="Ozone" value={data.ozone}/>
              <Pollutant symbol="NO₂" name="Nitrogen dioxide" value={data.nitrogenDioxide}/>
              <Pollutant symbol="PM₂.₅" name="Fine particles" value={data.pm25}/>
              <Pollutant symbol="PM₁₀" name="Particles" value={data.pm10}/>
            </div>
            <div className="air-phone-actions">
              <button type="button" onClick={onInsights}><Sparkles size={16}/> Understand your exposure <ArrowRight size={15}/></button>
            </div>
            <div className="air-phone-footnote">Forecast models, not personal exposure measurements. {isSample ? "Sample values." : ""}</div>
          </div>
        </div>

        <div className="air-activity-float">
          <span><Leaf size={14}/> PLAN OUTDOORS</span>
          <div><strong>{Math.round(data.temperature)}°C</strong><strong>{data.wind.toFixed(0)} <small>km/h wind</small></strong></div>
          <button type="button" onClick={onExplore}>View conditions <ArrowUpRight size={14}/></button>
        </div>
      </div>

      <div className="air-showcase-editorial">
        <div className="air-editorial-eyebrow"><span/> AIR QUALITY / DATA WITH CONTEXT</div>
        <h1>Track the <em>air</em><br/>you breathe<span className="air-editorial-stop">.</span></h1>
        <p>CIVIA turns atmospheric data into clarity. Track air-quality forecasts, understand pollution signals and discover the context behind every recommendation.</p>
        <div className="air-editorial-actions">
          <button type="button" className="air-cta-main" onClick={onExplore}>Explore your exposure <ArrowUpRight size={17}/></button>
          <button type="button" className="air-cta-minor" onClick={onInsights}>See the insights <ArrowRight size={17}/></button>
        </div>
        <div className="air-editorial-rule"/>
        <div className="air-editorial-facts">
          <div><span>01</span><strong>Monitor</strong><small>Air + weather conditions</small></div>
          <div><span>02</span><strong>Understand</strong><small>Transparent data signals</small></div>
          <div><span>03</span><strong>Decide</strong><small>Guidance you can inspect</small></div>
        </div>
        <div className="air-editorial-disclaimer"><ShieldCheck size={17}/><span>Weather and air-quality forecasts by Open-Meteo. {isSample ? "This view uses clearly labeled fictional demo values." : "Forecast estimates—not hyperlocal sensor readings."}</span></div>
      </div>
    </div>

    <section className="air-aftershow" aria-label="The environment in context">
      <div className="air-after-heading">
        <div><span className="air-overline">YOUR ENVIRONMENT, MADE CLEARER</span><h2>More than a <em>number.</em></h2></div>
        <p>Look beyond a score. Understand the conditions around you, what may change next, and why a suggestion appears.</p>
      </div>
      <div className="air-after-grid">
        <button className="air-after-card" type="button" onClick={onExplore}>
          <span className="air-after-number">01 / CONDITIONS <ArrowUpRight size={17}/></span>
          <div className="air-after-icon"><Wind size={30} strokeWidth={1.3}/></div>
          <strong>{Math.round(data.temperature)}°<small>C</small></strong>
          <h3>{data.city.name}, in focus.</h3>
          <p>Explore temperature, rain probability and air trends across the next hours.</p>
        </button>
        <button className="air-after-card" type="button" onClick={onInsights}>
          <span className="air-after-number">02 / EXPLANATION <ArrowUpRight size={17}/></span>
          <div className="air-after-icon"><Eye size={30} strokeWidth={1.3}/></div>
          <strong className="air-after-word">Why?</strong>
          <h3>Every signal has a story.</h3>
          <p>Inspect the values and thresholds behind each contextual recommendation.</p>
        </button>
        <button className="air-after-card" type="button" onClick={onPreferences}>
          <span className="air-after-number">03 / PERSONALIZATION <ArrowUpRight size={17}/></span>
          <div className="air-after-icon"><Leaf size={30} strokeWidth={1.3}/></div>
          <strong className="air-after-word">Yours.</strong>
          <h3>Choose what matters.</h3>
          <p>Prioritize air quality, sun or rain without needing to create an account.</p>
        </button>
      </div>
    </section>
  </>;
}
