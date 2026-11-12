"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ExposureDashboard from "@/components/ExposureDashboard";
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Check, ChevronDown,
  ChevronLeft, ChevronRight, Cloud, CloudFog, CloudLightning, CloudRain,
  CloudSnow, CloudSun, Compass, Droplets, ExternalLink, Eye, House, Info,
  Leaf, LocateFixed, MapPin, RefreshCw, Search, Settings2, ShieldCheck,
  SlidersHorizontal, Sparkles, Sun, Thermometer, Wind, X
} from "lucide-react";
import {
  CITIES, START_CITY, STORAGE_KEY, aqiCategory, createSample, formatDay,
  formatHour, loadClimate, weatherLabel,
  type City, type ClimateHour, type ClimateSnapshot
} from "@/lib/climate";
import {
  DEFAULT_PRIORITIES, deriveInsights, type Insight, type Priorities
} from "@/lib/insights";

type View = "today" | "forecast" | "insights" | "preferences";
type Metric = "temperature" | "airQuality" | "rainChance";

const NAVIGATION = [
  { id: "today" as View, label: "Today", icon: House },
  { id: "forecast" as View, label: "Exposure", icon: Compass },
  { id: "insights" as View, label: "Insights", icon: Sparkles },
  { id: "preferences" as View, label: "Settings", icon: SlidersHorizontal }
];

function WeatherIcon({ code, size = 26 }: { code: number; size?: number }) {
  if (code === 0) return <Sun size={size} strokeWidth={1.5} aria-hidden="true"/>;
  if (code >= 45 && code <= 48) return <CloudFog size={size} strokeWidth={1.5} aria-hidden="true"/>;
  if (code >= 51 && code <= 67 || code >= 80 && code <= 82) return <CloudRain size={size} strokeWidth={1.5} aria-hidden="true"/>;
  if (code >= 71 && code <= 77) return <CloudSnow size={size} strokeWidth={1.5} aria-hidden="true"/>;
  if (code >= 95) return <CloudLightning size={size} strokeWidth={1.5} aria-hidden="true"/>;
  if (code === 3) return <Cloud size={size} strokeWidth={1.5} aria-hidden="true"/>;
  return <CloudSun size={size} strokeWidth={1.5} aria-hidden="true"/>;
}

function Mark({ compact = false }: { compact?: boolean }) {
  return <div className={"brand-lockup" + (compact ? " brand-lockup--compact" : "")}>
    <div className="brand-symbol" aria-hidden="true"><span/><i/></div>
    <div className="brand-name">civia<span className="brand-dot">.</span></div>
  </div>;
}

function StatusPill({ snapshot }: { snapshot: ClimateSnapshot }) {
  return <span className={"status-pill" + (snapshot.source === "sample" ? " status-pill--sample" : "")}>
    <span className="status-dot"/>
    {snapshot.source === "live" ? "LIVE MODEL DATA" : "SAMPLE DATA · DEMO"}
  </span>;
}

function SurfaceTitle({ eyebrow, title, description }: { eyebrow: string; title: React.ReactNode; description?: string }) {
  return <div className="view-title">
    <div className="eyebrow"><span className="eyebrow-mark"/> {eyebrow}</div>
    <h1>{title}</h1>
    {description && <p>{description}</p>}
  </div>;
}

function ClimateChart({ hours, metric }: { hours: ClimateHour[]; metric: Metric }) {
  const values = hours.map(item => item[metric]);
  const nonEmpty = values.filter((value): value is number => value !== null && Number.isFinite(value));
  if (nonEmpty.length < 2) {
    return <div className="chart-empty">No hourly data is available for this signal.</div>;
  }
  const min = Math.min(...nonEmpty);
  const max = Math.max(...nonEmpty);
  const spread = Math.max(4, max - min);
  const points = hours.map((hour, index) => {
    const value = hour[metric];
    if (value === null) return null;
    const x = 24 + index * (652 / Math.max(1, hours.length - 1));
    const y = 180 - ((value - min) / spread) * 130;
    return { x, y };
  });
  const segments: { x: number; y: number }[][] = [];
  points.forEach(point => {
    if (!point) return;
    if (!segments.length || points[points.indexOf(point) - 1] === null) segments.push([]);
    segments[segments.length - 1].push(point);
  });
  const line = points.filter((point): point is { x: number; y: number } => Boolean(point))
    .map((point, index) => (index === 0 ? "M " : " L ") + point.x + " " + point.y).join("");
  const first = points.find((point): point is { x: number; y: number } => Boolean(point));
  const last = [...points].reverse().find((point): point is { x: number; y: number } => Boolean(point));
  const area = first && last ? line + " L " + last.x + " 198 L " + first.x + " 198 Z" : "";
  const labels = [0, Math.floor((hours.length - 1) / 3), Math.floor((hours.length - 1) * 2 / 3), hours.length - 1];
  return <div className="chart-wrapper">
    <svg viewBox="0 0 700 230" role="img" aria-label={"Next " + hours.length + " hours. " + (metric === "temperature" ? "Temperature" : metric === "rainChance" ? "Rain probability" : "US air quality index") + " from " + Math.round(min) + " to " + Math.round(max) + "."} preserveAspectRatio="none">
      <defs>
        <linearGradient id="civia-area-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#abcfa3" stopOpacity=".52"/>
          <stop offset="100%" stopColor="#abcfa3" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[50, 93, 136, 180].map(y => <line key={y} x1="18" x2="682" y1={y} y2={y} stroke="#dce5d6" strokeDasharray="3 8"/>)}
      {area && <path d={area} fill="url(#civia-area-gradient)"/>}
      {line && <path d={line} fill="none" stroke="#194d3e" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round"/>}
      {points.filter((_, i) => i % Math.max(1, Math.round(hours.length / 6)) === 0).map((point, i) => point && <circle key={i} cx={point.x} cy={point.y} r="4.5" fill="#f7f7f0" stroke="#194d3e" strokeWidth="2.8"/>)}
      {labels.map((index, i) => <text key={i} x={24 + index * (652 / Math.max(1, hours.length - 1))} y="225" fontSize="13" fill="#63766b" textAnchor={i === 0 ? "start" : i === labels.length - 1 ? "end" : "middle"}>{formatHour(hours[index]?.time ?? "")}</text>)}
    </svg>
    <div className="chart-summary">
      <span><i className="chart-legend-dot"/> Model forecast</span>
      <span>Range: {Math.round(min)}–{Math.round(max)}{metric === "temperature" ? "°C" : metric === "rainChance" ? "%" : " US AQI"}</span>
    </div>
  </div>;
}

function InsightExplanation({ insight, snapshot, expanded, onToggle }: { insight: Insight; snapshot: ClimateSnapshot; expanded: boolean; onToggle: () => void }) {
  return <article className={"insight-explainer" + (expanded ? " is-open" : "")}>
    <button type="button" onClick={onToggle} aria-expanded={expanded} className="insight-explainer-trigger">
      <span className={"insight-explainer-icon insight-explainer-icon--" + insight.level}><Sparkles size={21} aria-hidden="true"/></span>
      <span className="insight-explainer-label">
        <span>{insight.category}</span>
        <strong>{insight.title}</strong>
      </span>
      <span className="insight-explainer-plus">{expanded ? <X size={17}/> : <ArrowUpRight size={18}/>}</span>
    </button>
    {expanded && <div className="insight-explainer-detail">
      <p>{insight.summary}</p>
      <div className="evidence-list">
        {insight.evidence.map(signal => <div key={signal.label} className="evidence-item">
          <div className="evidence-item-top"><span>{signal.label}</span><strong>{signal.value}</strong></div>
          <p>{signal.context}</p>
        </div>)}
      </div>
      <div className="insight-action"><span>CONSIDER THIS</span><p>{insight.recommendation}</p></div>
      <small>Based on {snapshot.source === "live" ? "Open-Meteo model estimates" : "fictional sample data"} and visible rules. Not medical or safety advice.</small>
    </div>}
  </article>;
}

function MiniFooter({ snapshot }: { snapshot: ClimateSnapshot | null }) {
  return <footer className="main-footer">
    <span>© 2026 CIVIA · A PRODUCT DESIGN CONCEPT</span>
    <span>{snapshot?.source === "sample" ? "SAMPLE DATA — NOT LIVE" : "WEATHER & AIR QUALITY BY OPEN-METEO"}</span>
    <span className="footer-links"><a href="/process">Design decisions <ArrowUpRight size={12} aria-hidden="true"/></a><a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Data source <ExternalLink size={12} aria-hidden="true"/></a></span>
  </footer>;
}

export default function CiviaApp() {
  const [view, setView] = useState<View>("today");
  const [city, setCity] = useState<City>(START_CITY);
  const [priorities, setPriorities] = useState<Priorities>(DEFAULT_PRIORITIES);
  const [ready, setReady] = useState(false);
  const [snapshot, setSnapshot] = useState<ClimateSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [cityOpen, setCityOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [metric, setMetric] = useState<Metric>("temperature");
  const [horizon, setHorizon] = useState<12 | 24>(12);
  const [expandedInsight, setExpandedInsight] = useState<string | null>("air");
  const [showMethodology, setShowMethodology] = useState(false);
  const cityPanel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const value: { cityId?: string; priorities?: Partial<Priorities> } = JSON.parse(stored);
        const savedCity = CITIES.find(candidate => candidate.id === value.cityId);
        if (savedCity) setCity(savedCity);
        if (value.priorities) setPriorities({
          outdoor: value.priorities.outdoor !== false,
          air: value.priorities.air !== false,
          rain: value.priorities.rain !== false
        });
      }
    } catch { /* Storage is optional; app works without it. */ }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
        cityId: city.id === "precise-location" ? null : city.id,
        priorities
      }));
    } catch { /* Storage is optional. */ }
  }, [ready, city, priorities]);

  useEffect(() => {
    if (!ready) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    setSnapshot(null);
    loadClimate(city, controller.signal)
      .then(data => {
        if (!controller.signal.aborted) {
          setSnapshot(data);
          setLoading(false);
        }
      })
      .catch(reason => {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : "The data service is unavailable.");
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [ready, city, attempt]);

  useEffect(() => {
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") setCityOpen(false);
    };
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, []);

  const insights = useMemo(() => snapshot ? deriveInsights(snapshot, priorities) : [], [snapshot, priorities]);
  const mainInsight = insights[0];
  const category = aqiCategory(snapshot?.aqi ?? null);
  const filteredCities = CITIES.filter(option => (option.name + " " + option.country).toLowerCase().includes(query.trim().toLowerCase()));

  const selectCity = useCallback((next: City) => {
    setCity(next);
    setCityOpen(false);
    setLocationError(null);
    setQuery("");
    setView("today");
  }, []);

  const useLocation = () => {
    setLocationError(null);
    if (!("geolocation" in navigator)) {
      setLocationError("This browser does not support location access.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      position => {
        setLocating(false);
        selectCity({
          id: "precise-location", name: "Your location", region: "Device", country: "Selected by you",
          latitude: position.coords.latitude, longitude: position.coords.longitude
        });
      },
      () => {
        setLocating(false);
        setLocationError("Location wasn't available. You can select a city instead.");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  };

  const refresh = () => setAttempt(value => value + 1);

  const renderNavigation = (mobile = false) => (
    <nav className={mobile ? "mobile-tabs" : "side-nav"} aria-label={mobile ? "Mobile navigation" : "Main navigation"}>
      {NAVIGATION.map(item => {
        const Icon = item.icon;
        return <button key={item.id} type="button"
          className={"nav-item" + (view === item.id ? " nav-item--active" : "")}
          onClick={() => { setView(item.id); setCityOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          aria-current={view === item.id ? "page" : undefined}>
          <Icon size={mobile ? 21 : 20} strokeWidth={1.75} aria-hidden="true"/>
          <span>{item.label}</span>
          {!mobile && view === item.id && <ArrowUpRight size={16} strokeWidth={1.5} className="nav-active-arrow" aria-hidden="true"/>}
        </button>;
      })}
    </nav>
  );

  function renderToday(data: ClimateSnapshot) {
    return <ExposureDashboard
      data={data}
      priorities={priorities}
      onExplore={()=>{setMetric("airQuality");setView("forecast");window.scrollTo({top:0,behavior:"smooth"});}}
      onInsights={()=>{setExpandedInsight("air");setView("insights");window.scrollTo({top:0,behavior:"smooth"});}}
      onPreferences={()=>{setView("preferences");window.scrollTo({top:0,behavior:"smooth"});}}
    />;
  }

  function renderMethodology(data: ClimateSnapshot) {
    return <section className="methodology-panel" aria-label="Data and methodology">
      <div><strong>Transparent by design.</strong><p>Weather and air quality come from Open-Meteo forecasts. Air-quality estimates may be coarse by region and do not replace local sensor readings.</p></div>
      <div><strong>Guidance you can inspect.</strong><p>Suggestions are generated from visible conditions and simple thresholds. This demo does not call a language model.</p></div>
      <div><strong>Your choices stay yours.</strong><p>Preferences are stored in your browser. Precise location is requested only if you press “Use my location.”</p></div>
      <small>Current source: {data.source === "live" ? "live model estimates" : "explicitly fictional sample"}.</small>
    </section>;
  }

  function renderForecast(data: ClimateSnapshot) {
    const hours = data.hourly.slice(0, horizon);
    return <>
      <SurfaceTitle eyebrow="EXPLORE THE SIGNALS" title={<>The atmosphere <em>has a rhythm.</em></>} description="Move beyond a single number. Discover how the conditions around you could change through the day."/>
      <div className="forecast-tools">
        <div className="metric-switch" role="group" aria-label="Chart metric">
          {([
            ["temperature", "Temperature"],
            ["airQuality", "Air quality"],
            ["rainChance", "Rain"]
          ] as const).map(([id, label]) => <button key={id} type="button" className={metric === id ? "is-selected" : ""} onClick={() => setMetric(id)} aria-pressed={metric === id}>{label}</button>)}
        </div>
        <div className="horizon-switch" role="group" aria-label="Forecast window">
          <button type="button" className={horizon === 12 ? "is-selected" : ""} onClick={() => setHorizon(12)} aria-pressed={horizon === 12}>12H</button>
          <button type="button" className={horizon === 24 ? "is-selected" : ""} onClick={() => setHorizon(24)} aria-pressed={horizon === 24}>24H</button>
        </div>
      </div>
      <section className="forecast-chart-card surface" aria-label="Hourly conditions chart">
        <div className="forecast-chart-title">
          <div><span>MODEL FORECAST / HOURLY</span><h2>{metric === "temperature" ? "Temperature" : metric === "airQuality" ? "Air quality" : "Rain probability"} <em>over time.</em></h2></div>
          <span className="forecast-chart-unit">{metric === "temperature" ? "°C" : metric === "airQuality" ? "US AQI" : "%"}</span>
        </div>
        <ClimateChart hours={hours} metric={metric}/>
        <div className="forecast-notice"><Info size={17}/><p>Forecasts describe possible conditions. Actual weather and local air quality can differ.</p></div>
      </section>
      <div className="section-heading"><div><span className="section-kicker">THE DAYS AHEAD</span><h2>A closer look at <em>what's next.</em></h2></div></div>
      <div className="days-list">
        {data.daily.map((day, index) => <article className="day-row" key={day.date}>
          <div className="day-row-index">0{index + 1}</div>
          <div className="day-row-label"><strong>{index === 0 ? "Today" : formatDay(day.date)}</strong><span>{weatherLabel(day.weatherCode)}</span></div>
          <div className="day-row-weather"><WeatherIcon code={day.weatherCode} size={29}/></div>
          <div className="day-row-temp"><strong>{Math.round(day.high)}°</strong><span>{Math.round(day.low)}°</span></div>
          <span className="day-row-trail"><ArrowUpRight size={19}/></span>
        </article>)}
      </div>
      <section className="editorial-note"><div className="editorial-mark"><span/></div><div><span className="section-kicker">A LITTLE PERSPECTIVE</span><h3>Better data is useful.<br/><em>Better understanding is powerful.</em></h3><p>CIVIA puts environmental signals in context, so a forecast becomes a clearer choice.</p></div></section>
    </>;
  }

  function renderInsights(data: ClimateSnapshot) {
    return <>
      <SurfaceTitle eyebrow="EXPLAINABLE BY DESIGN" title={<>No black box. <em>Just clarity.</em></>} description="Personalized guidance based on the signals you chose to follow — with the reasoning in plain sight."/>
      <section className="insights-intro">
        <div className="insights-intro-top"><span><Sparkles size={15}/> THE GUIDANCE LAYER</span><span>01 — {String(insights.length).padStart(2, "0")} INSIGHTS</span></div>
        <h2>We connect the dots.<br/><em>You make the call.</em></h2>
        <p>Every insight is backed by inspectable environmental values, your preferences and simple rules — not a generative AI model.</p>
        <div className="insights-intro-art" aria-hidden="true"><span/><span/><span/></div>
      </section>
      <div className="section-heading"><div><span className="section-kicker">TAILORED TO YOUR PRIORITIES</span><h2>What the signals <em>suggest.</em></h2></div><button className="inline-settings-link" type="button" onClick={() => setView("preferences")}><Settings2 size={17}/> Adjust priorities</button></div>
      <div className="insights-list">
        {insights.map(insight => <InsightExplanation key={insight.id} insight={insight} snapshot={data} expanded={expandedInsight === insight.id} onToggle={() => setExpandedInsight(current => current === insight.id ? null : insight.id)}/>)}
      </div>
      <div className="insight-disclosure">
        <div className="insight-disclosure-icon"><Eye size={24}/></div>
        <div><h3>Intelligence should be understandable.</h3><p>This prototype uses transparent rules to transform API data into contextual guidance. An evaluated, grounded AI experience is a future product direction — not a capability claimed by this demo.</p></div>
        <button type="button" onClick={() => setShowMethodology(value => !value)} aria-expanded={showMethodology}>Read our approach <ArrowUpRight size={17}/></button>
      </div>
      {showMethodology && renderMethodology(data)}
    </>;
  }

  function renderPreferences() {
    const items: { id: keyof Priorities; label: string; detail: string; icon: typeof Sun }[] = [
      { id: "outdoor", label: "Outdoor & UV", detail: "Light, UV exposure and the conditions for time outside.", icon: Sun },
      { id: "air", label: "Air quality", detail: "Air-quality changes and what estimated pollution levels may mean.", icon: Wind },
      { id: "rain", label: "Rain & flexibility", detail: "The chance of precipitation when planning around the weather.", icon: CloudRain }
    ];
    return <>
      <SurfaceTitle eyebrow="MAKE IT YOURS" title={<>Your environment. <em>Your priorities.</em></>} description="Choose which signals deserve your attention. You can change your mind anytime."/>
      <section className="settings-card surface">
        <div className="settings-card-heading"><div><span>01 / PERSONALIZATION</span><h2>What matters to <em>you?</em></h2></div><Settings2 size={25} strokeWidth={1.4}/></div>
        <div className="priority-list">
          {items.map(item => {
            const Icon = item.icon;
            return <label key={item.id} className="priority-row">
              <span className="priority-icon"><Icon size={23} strokeWidth={1.5}/></span>
              <span className="priority-copy"><strong>{item.label}</strong><small>{item.detail}</small></span>
              <input className="sr-only" type="checkbox" checked={priorities[item.id]} onChange={event => setPriorities(current => ({ ...current, [item.id]: event.target.checked }))}/>
              <span className={"toggle" + (priorities[item.id] ? " toggle--on" : "")} aria-hidden="true"><i/></span>
            </label>;
          })}
        </div>
        <p className="settings-footnote"><Check size={15}/> Changes are saved in this browser only.</p>
      </section>
      <section className="settings-card settings-card--privacy surface">
        <div className="settings-card-heading"><div><span>02 / PRIVACY & CONTROL</span><h2>Trust is <em>a feature.</em></h2></div><ShieldCheck size={25} strokeWidth={1.4}/></div>
        <div className="privacy-grid">
          <div><span className="privacy-icon"><LocateFixed size={20}/></span><h3>Location is optional</h3><p>Choose a city or explicitly grant one-time browser location access. CIVIA does not save precise coordinates to local storage.</p></div>
          <div><span className="privacy-icon"><Eye size={20}/></span><h3>Understand every suggestion</h3><p>Insight factors are shown on demand. No opaque AI claims, invisible scoring or invented confidence percentages.</p></div>
          <div><span className="privacy-icon"><ShieldCheck size={20}/></span><h3>No account required</h3><p>This concept has no sign-in and no embedded analytics. It stores city choices and preferences locally.</p></div>
        </div>
        <button type="button" className="reset-link" onClick={() => {
          setPriorities(DEFAULT_PRIORITIES); selectCity(START_CITY);
          try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* optional */ }
        }}>Reset preferences <RefreshCw size={16}/></button>
      </section>
      <div className="settings-disclaimer"><Info size={19}/><p>CIVIA is a design prototype, not a medical, emergency, or public-health alert service. Forecasts are estimates and can change.</p></div>
    </>;
  }

  return <div className="app-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <aside className="sidebar">
      <div className="sidebar-top"><Mark/><span className="brand-subtitle">ENVIRONMENTAL INTELLIGENCE</span></div>
      <div className="sidebar-nav-label">YOUR SPACE <span>01 / 04</span></div>
      {renderNavigation()}
      <div className="sidebar-spacer"/>
      <div className="sidebar-promo"><div className="sidebar-promo-symbol"><Leaf size={25} strokeWidth={1.5}/></div><p>Make room for a<br/><em>clearer perspective.</em></p><small>DESIGNED FOR EVERYDAY LIFE</small></div>
      <div className="sidebar-bottom"><span className="sidebar-bottom-dot"/> A MORE HUMAN WAY TO READ THE WORLD</div>
    </aside>
    <div className="content-shell">
      <header className="topbar">
        <div className="mobile-brand"><Mark compact/></div>
        <div className="desktop-app-navigation">{renderNavigation()}</div>
        <div className="topbar-context"><span className="topbar-context-mark"/> A CALMER WAY TO UNDERSTAND THE WORLD</div>
        <div className="topbar-actions">
          {snapshot && <StatusPill snapshot={snapshot}/>}
          <div className="city-control" ref={cityPanel}>
            <button type="button" className="city-button" onClick={() => { setCityOpen(value => !value); setQuery(""); }} aria-expanded={cityOpen} aria-haspopup="dialog">
              <MapPin size={16} strokeWidth={1.8} aria-hidden="true"/><span>{city.name}</span><ChevronDown size={15} aria-hidden="true"/>
            </button>
            {cityOpen && <div className="city-popover" role="dialog" aria-label="Choose your city">
              <div className="city-popover-title"><div><span>SWITCH LOCATION</span><strong>Choose your city</strong></div><button type="button" onClick={() => setCityOpen(false)} aria-label="Close city selector"><X size={20}/></button></div>
              <label className="city-search"><Search size={18}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search available cities" aria-label="Search cities"/></label>
              <div className="city-options">
                {filteredCities.length ? filteredCities.map(option => <button className={"city-option" + (option.id === city.id ? " is-active" : "")} type="button" key={option.id} onClick={() => selectCity(option)}>
                  <span><strong>{option.name}</strong><small>{option.country}</small></span>{option.id === city.id ? <Check size={18}/> : <ArrowUpRight size={18}/>}
                </button>) : <p className="city-empty">No matching city in this concept demo.</p>}
              </div>
              <button type="button" className="city-detect" disabled={locating} onClick={useLocation}><LocateFixed size={18}/>{locating ? "Requesting permission…" : "Use my location (optional)"}</button>
              {locationError && <p className="city-location-error" role="status">{locationError}</p>}
            </div>}
          </div>
        </div>
      </header>
      <main id="main-content" className={"main-content"+(view==="today"?" main-content--exposure":"")}>
        {view !== "preferences" && view !== "today" && <div className="content-status">
          <span>THE CITY IS ALWAYS CHANGING</span>
          <span>{snapshot?.source === "sample" ? "DEMO MODE / FICTIONAL VALUES" : "MODEL FORECAST / NOT STREET-LEVEL MEASUREMENT"}</span>
        </div>}
        {view === "preferences" ? renderPreferences() : !ready || loading ? <div className="loading-state" role="status" aria-live="polite">
          <div className="loading-orbit"><span/><span/></div>
          <span>READING THE ATMOSPHERE</span>
          <h1>Finding your city's <em>rhythm.</em></h1>
          <p>Connecting weather and air-quality signals…</p>
        </div> : error && !snapshot ? <div className="error-state" role="alert">
          <div className="error-icon"><Cloud size={35}/></div>
          <span className="section-kicker">DATA TEMPORARILY UNAVAILABLE</span>
          <h1>A clearer picture is <em>on its way.</em></h1>
          <p>We couldn't retrieve live environmental data. {error}</p>
          <div className="error-actions">
            <button type="button" className="primary-button" onClick={refresh}><RefreshCw size={18}/> Try again</button>
            <button type="button" className="secondary-button" onClick={() => setSnapshot(createSample(city))}>Explore labeled sample data <ArrowRight size={18}/></button>
          </div>
          <small>Sample values are fictional and clearly labeled throughout the interface.</small>
        </div> : snapshot ? <>
          <div key={view} className="view-enter">
            {view === "today" && renderToday(snapshot)}
            {view === "forecast" && renderForecast(snapshot)}
            {view === "insights" && renderInsights(snapshot)}
          </div>
        </> : null}
        <MiniFooter snapshot={snapshot}/>
      </main>
    </div>
    {renderNavigation(true)}
  </div>;
}
