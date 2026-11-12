import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, ChartNoAxesCombined, Eye, Leaf, ShieldCheck, SlidersHorizontal, Sparkles } from "lucide-react";
import "./process.css";

export const metadata: Metadata = {
  title: "Inside the decisions — CIVIA product design case",
  description: "The product reasoning, trade-offs, proposed research and measurement framework behind CIVIA, an independent mobile-first climate intelligence concept."
};

const principles = [
  { number:"01", label:"MEANING BEFORE METRICS", title:"Start with the question, not the dashboard.", body:"The first screen pairs conditions with a plain-language summary. The full forecast, units and methodology remain discoverable when someone wants to go deeper." },
  { number:"02", label:"EXPLAINABILITY BY DESIGN", title:"Don't ask users to trust a black box.", body:"Each suggestion reveals its inputs, thresholds and limitations. The current experience is explicitly rules-based, rather than a generative model presented as fact." },
  { number:"03", label:"CONTROL OVER ASSUMPTIONS", title:"Let people define what matters.", body:"Air quality, UV and rain are user-controlled interests. A city is enough to explore; precise location is optional and isn't persisted as coordinates." },
  { number:"04", label:"HONEST FAILURE STATES", title:"When the model can't answer, say so.", body:"Network failures don't silently become fake conditions. A visitor can retry or deliberately opt into clearly labeled fictional sample data." }
];

const tests = [
  { task:"Interpret a condition", question:"Can a new visitor identify the most relevant environmental signal without understanding AQI terminology?", metric:"Comprehension and task success" },
  { task:"Inspect a recommendation", question:"Can they explain why CIVIA suggested an action, and distinguish a forecast from a measured reading?", metric:"Reasoning recall and calibration" },
  { task:"Personalize their experience", question:"Can they change interests, move between cities, and understand what is saved locally?", metric:"Completion, errors and confidence" }
];

export default function ProcessPage() {
  return <div className="process-page">
    <header className="process-header">
      <Link className="process-wordmark" href="/" aria-label="Return to CIVIA">civia<span>.</span></Link>
      <span>PRODUCT DESIGN / PROCESS NOTES</span>
      <Link className="process-back-top" href="/">Open the app <ArrowUpRight size={17} aria-hidden="true"/></Link>
    </header>
    <main>
      <section className="process-hero">
        <div className="process-hero-copy">
          <span className="process-eyebrow"><span/> AN INDEPENDENT PRODUCT CONCEPT / 2026</span>
          <h1>Making complex signals <em>feel human.</em></h1>
          <p>CIVIA explores a simple design question: how might we help people understand their environment and make everyday decisions, without overstating what forecasts or algorithms really know?</p>
          <Link href="/" className="process-hero-cta">Experience CIVIA <ArrowUpRight size={19}/></Link>
        </div>
        <div className="process-hero-visual" aria-hidden="true">
          <div className="process-planet"><div className="process-planet-core"/><div className="process-planet-line"/></div>
          <div className="process-planet-label">SIGNAL → CONTEXT → CHOICE</div>
        </div>
      </section>

      <div className="process-facts">
        <div><span>ROLE</span><strong>Product Design · UX · Front-end</strong></div>
        <div><span>DISCIPLINES</span><strong>Research framing · Interaction · Data UX</strong></div>
        <div><span>PRODUCT</span><strong>Mobile-first responsive web app</strong></div>
        <div><span>STATUS</span><strong>Exploratory concept · Not validated</strong></div>
      </div>

      <section className="process-section process-challenge" id="challenge">
        <div className="process-section-index">01 / PROBLEM FRAMING</div>
        <div className="process-section-main">
          <h2>More information isn't always <em>more understanding.</em></h2>
          <p className="process-big-text">Weather, pollution and UV often appear as separate numbers. Reading those numbers is one job; knowing what they mean for your actual day is another.</p>
          <p>The hypothesis for CIVIA is that a contextual, inspectable summary could reduce interpretation effort while preserving access to the underlying data. This is a **design hypothesis**, not a result from conducted user research.</p>
          <div className="process-question">
            <span>THE PRODUCT QUESTION</span>
            <p>“Can we turn environmental signals into understandable choices — without turning uncertainty into false confidence?”</p>
          </div>
        </div>
      </section>

      <section className="process-benchmark" id="benchmark">
        <div className="process-benchmark-heading">
          <span>COMPETITIVE BENCHMARK / SECONDARY RESEARCH</span>
          <h2>Less dashboard. <em>More everyday clarity.</em></h2>
          <p>A review of existing air-quality and weather experiences helped establish the direction for CIVIA's consumer-first interface. These are product observations and design hypotheses, not findings from user tests.</p>
        </div>
        <div className="process-benchmark-grid">
          <article><span>01 / IQAIR AIRVISUAL</span><h3>One clear signal first.</h3><p>Lead with a location-aware AQI reading, severity label, forecast and pollutant details. Don't require someone to understand chemistry before they can interpret their day.</p><a href="https://www.iqair.com/air-quality-monitors/air-quality-app" target="_blank" rel="noreferrer">View source <ArrowUpRight size={15}/></a></article>
          <article><span>02 / AIRNOW (US EPA)</span><h3>Color must mean something.</h3><p>Use standard US AQI categories and plain-language status text together. Color supports interpretation, rather than replacing it.</p><a href="https://www.airnow.gov/airnow-mobile-app/" target="_blank" rel="noreferrer">View source <ArrowUpRight size={15}/></a></article>
          <article><span>03 / PLUME LABS</span><h3>Timing changes decisions.</h3><p>A simple hourly forecast turns a static measurement into a way to plan a walk, commute or outdoor activity.</p><a href="https://apps.apple.com/us/app/plume-labs-air-quality-app/id950289243" target="_blank" rel="noreferrer">View source <ArrowUpRight size={15}/></a></article>
          <article><span>04 / APPLE WEATHER</span><h3>Depth on demand.</h3><p>Keep the high-level view calm and let people explore extra layers when needed. More detail should be one clear interaction away.</p><a href="https://support.apple.com/en-lamr/guide/iphone/iph1ac0b35f/27/ios/27" target="_blank" rel="noreferrer">View source <ArrowUpRight size={15}/></a></article>
        </div>
        <div className="process-benchmark-decision">
          <span>DESIGN DECISION</span>
          <p>I moved away from a dark, cloud-dashboard aesthetic and toward <strong>a warmer, legible consumer experience</strong>: a single dominant AQI story, readable supporting cards, practical trends and explicit model limitations.</p>
        </div>
      </section>

      <section className="process-section" id="journey">
        <div className="process-section-index">02 / EXPERIENCE STRATEGY</div>
        <div className="process-section-main">
          <h2>One connected journey. <em>Not four disconnected widgets.</em></h2>
          <p>Designed for the everyday moment before a commute, walk or outdoor plan: select a place, scan the conditions, understand the implication, then explore only when more detail is useful.</p>
          <div className="process-journey" aria-label="Proposed experience journey">
            {[
              ["01","LOCATE","Choose a city without needing an account."],
              ["02","UNDERSTAND","See a concise climate and air-quality snapshot."],
              ["03","EXPLORE","Inspect hourly trends and the next four days."],
              ["04","DECIDE","Open a suggestion, its evidence and controls."]
            ].map(([number,title,description])=><div className="process-journey-step" key={number}>
              <span>{number}</span><strong>{title}</strong><p>{description}</p><ArrowRight size={17} aria-hidden="true"/>
            </div>)}
          </div>
        </div>
      </section>

      <section className="process-section" id="decisions">
        <div className="process-section-index">03 / SENIOR-LEVEL TRADE-OFFS</div>
        <div className="process-section-main">
          <h2>The interface is the outcome. <em>The decisions are the work.</em></h2>
          <p>Four choices shaped the product's scope, information architecture and behavior.</p>
          <div className="process-principles">
            {principles.map(item=><article key={item.number}>
              <div className="process-principle-number">{item.number}</div>
              <span>{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>)}
          </div>
          <div className="process-boundary">
            <Sparkles size={24} strokeWidth={1.5} aria-hidden="true"/>
            <div><span>THE AI BOUNDARY</span><h3>Explainable guidance now. An evaluated model later.</h3><p>A language model is not deployed in this prototype. Before integrating one, I would evaluate grounding, unsupported claims, sensitivity to prompt wording, privacy, failure handling, and whether a generative response actually improves comprehension over a simpler rule.</p></div>
          </div>
        </div>
      </section>

      <section className="process-section" id="evaluation">
        <div className="process-section-index">04 / RESEARCH & EVALUATION PLAN</div>
        <div className="process-section-main">
          <h2>A good hypothesis <em>needs to be challenged.</em></h2>
          <p>This is the proposed research plan for a future validation round. No participants have been recruited or tested, so there are no claimed usability rates, performance uplift percentages, or study findings.</p>
          <div className="process-research-intro">
            <div><span>PROPOSED METHOD</span><strong>5 moderated sessions</strong></div>
            <div><span>RECRUITMENT</span><strong>Mix of AQI-familiar and AQI-unfamiliar participants</strong></div>
            <div><span>COMPARISON</span><strong>Raw-metrics view vs. contextual guidance</strong></div>
          </div>
          <div className="process-test-list">
            {tests.map((test,index)=><article key={test.task}>
              <div className="process-test-index">0{index+1}</div>
              <div><h3>{test.task}</h3><p>{test.question}</p></div>
              <span>{test.metric}</span>
            </article>)}
          </div>
          <div className="process-metrics">
            <span className="process-metrics-top">PROPOSED SUCCESS SIGNALS — NOT MEASURED RESULTS</span>
            <div><ChartNoAxesCombined size={25}/><strong>Comprehension</strong><p>Can people correctly explain what the numbers mean?</p></div>
            <div><Eye size={25}/><strong>Calibrated trust</strong><p>Can they separate estimated data from certain outcomes?</p></div>
            <div><SlidersHorizontal size={25}/><strong>Control</strong><p>Can they tailor the experience without confusion?</p></div>
          </div>
        </div>
      </section>

      <section className="process-section" id="responsibility">
        <div className="process-section-index">05 / RESPONSIBLE IMPLEMENTATION</div>
        <div className="process-section-main">
          <h2>Beautiful is easy to claim. <em>Responsible takes intention.</em></h2>
          <div className="process-responsibility">
            <div><ShieldCheck size={27}/><h3>Be precise about data.</h3><p>Live values come from Open-Meteo forecast services, not city-block sensors. Air quality uses US AQI. Missing signals stay missing; fictional data is opt-in and labeled.</p></div>
            <div><Leaf size={27}/><h3>Reduce the burden.</h3><p>Semantic controls, keyboard navigation, responsive layouts, visible focus states and reduced-motion support are part of the implementation, not late-stage polish.</p></div>
          </div>
          <p className="process-disclaimer">This is an independent design-and-engineering case exercise. It is not affiliated with a government body, and it does not provide medical, emergency, or public-health alerts.</p>
        </div>
      </section>
      <section className="process-closing">
        <span>FROM COMPLEXITY TO CLARITY</span>
        <h2>The most important design decision is <em>what not to pretend to know.</em></h2>
        <div className="process-closing-links">
          <Link href="/">Explore the interactive app <ArrowUpRight size={19}/></Link>
          <a href="https://github.com/AndrezzaNascimento6/civia-climate-intelligence" target="_blank" rel="noreferrer">Inspect the source <ArrowUpRight size={19}/></a>
        </div>
      </section>
    </main>
    <footer className="process-footer"><span>CIVIA / © 2026</span><span>Designed & developed by Andrezza Nascimento</span><Link href="/">Back to app <ArrowLeft size={15}/></Link></footer>
  </div>;
}
