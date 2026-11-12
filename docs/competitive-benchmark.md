# CIVIA — Competitive benchmark and redesign rationale

**Date:** November 2026  
**Method:** Desk research / public-product review, not interviews or an original usability test.  
**Scope:** Consumer mobile air-quality, pollution, and weather products. Source pages represent published descriptions and publicly shown interfaces, not an exhaustive hands-on product audit.

## The problem with V1

CIVIA initially used a dark, neon-green, highly technical interface with miniature labels, floating instrumentation and decorative atmospheric effects. It signaled a *cloud monitoring service* rather than a consumer-facing environmental app. Three UX risks followed:

- Users might read the screen as an engineer's monitoring dashboard, not a daily-life utility.
- Small typography and compact controls would make comprehension harder on mobile.
- Multiple equally emphasized metrics could obscure the question: **"How is the air, and what should I consider doing?"**

## What existing apps teach us

| Reference | Publicly observable strengths | CIVIA application | Differentiation |
|---|---|---|---|
| [IQAir AirVisual](https://www.iqair.com/air-quality-monitors/air-quality-app) | Location-aware US AQI, pollutants, forecast and guidance | Show one primary AQI reading and contextual category first; supporting concentrations below | Explicitly distinguish Open-Meteo model estimates from measured sensors |
| [AirNow mobile app, US EPA](https://www.airnow.gov/airnow-mobile-app/) and [US AQI basics](https://www.airnow.gov/aqi/aqi-basics/) | Consistent risk-color categories, local forecast, text descriptions | Use correct semantic AQI colors *plus* readable text, never color alone | Consumer editorial layout and optional non-personalized browsing |
| [Plume Labs](https://apps.apple.com/us/app/plume-labs-air-quality-app/id950289243) | Pollution forecasts and street-level context | Show hourly trends for planning and a clear path to a detailed forecast | Don't imply street-level accuracy from a coarse forecast grid |
| [Apple Weather](https://support.apple.com/en-lamr/guide/iphone/iph1ac0b35f/27/ios/27) | High-level overview with optional deep condition details, maps | Progressive disclosure: daily overview → forecast → reasons → preferences | Visible logic behind personalized insights rather than opaque scores |
| [AirCare](https://play.google.com/store/apps/details?id=com.gorjan.airquality) | AQI, pollen and UV in a consumer utility | Separate signals, familiar tabs, simple status reading | Do not imply pollen coverage globally when the prototype does not provide it |

## Resulting design decisions

1. **Change the visual vocabulary:** warm ivory, terracotta/coral, pale sage and muted charcoal. Use AQI risk colors only for semantic status and charts, not as decorative brand accents.
2. **Increase legibility:** Plus Jakarta Sans body; Outfit display. Body text ~15–16 px, controls ~44–58 px, supporting labels mostly 11–13 px with adequate contrast and touch spacing.
3. **Rebuild the first screen around meaning:** prominent AQI, corresponding label and plain-language narrative. Follow with four pollutants, today's weather, a 12-hour trend and inspectable guidance.
4. **Keep agency:** change city without registration, expand the underlying reasons, and change preferences.
5. **Show the data boundary:** Open-Meteo is a model forecast, not a personal health monitor or a verified local sensor. Missing data stays missing. The explicit sample mode remains clearly labeled.

## Research hypotheses, not validation claims

- **H1 — Interpretation:** A user can correctly identify the air-quality category without needing to understand the US AQI unit.
- **H2 — Next action:** Contextual copy and hourly trend lead to faster selection of a suitable time for everyday outdoor plans than a raw technical dashboard.
- **H3 — Appropriate trust:** People can distinguish model estimates from on-street measured readings after visiting the dashboard.
- **H4 — Readability:** More legible typography reduces zooming, skipped content and accidental taps.

**Proposed method:** 5–8 moderated sessions, a side-by-side comprehension task for V1 and V2, and a review for screen-reader, touch-target and reduced-motion accessibility. No sessions or results have been claimed.

## Important terminology

- **Current** = current value reported by an Open-Meteo forecast model, **not live personal sensor measurement**.
- **US AQI** categories and colors should match the US EPA AQI specification; colors cannot be the only representation.
- Pollutant values are in **µg/m³** and may be unavailable depending on location/provider coverage.
- **Insights** are deterministic and inspectable, not generative-AI recommendations.

**Source methodology:** [Open-Meteo Air Quality API](https://open-meteo.com/en/docs/air-quality-api).
