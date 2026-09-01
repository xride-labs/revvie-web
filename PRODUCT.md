# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Motorcycle riders, primarily in India with stated global ambition. Ranges from weekend warriors to serious tourers, Royal Enfield owners to sportbike riders. Riders currently coordinate via WhatsApp groups, Facebook pages, and spreadsheets — fragmented, offline-native tooling with no dedicated platform. Secondary audience: motorcycle brands, dealerships, and gear companies (served through a separate Brand Portal, out of scope for this redesign pass).

## Product Purpose

Revvie is the social layer for motorcycle culture — one platform bringing together club discovery/management, organized group rides, real-time ride tracking, a rider-specific marketplace, safety features, and social identity. Success means every solo ride becomes a shared story and every rider finds their tribe, replacing the fragmented WhatsApp/Facebook/spreadsheet workflow riders use today.

## Positioning

Purpose-built for motorcycle culture, not a generic social template adapted for bikers. Ride-native design (minimal, fast, usable with gloves on, one hand on the bars, at speed) and safety woven into the core experience (fall detection, snatch detection, SOS alerts, trusted-contact ride sharing) rather than bolted on.

## Operating Context

- The web app (`web/`) already covers: rides, clubs, marketplace, business/brand portal, admin, auth/login, profile. Architecture: Next.js App Router, RTK Query against a BFF gateway, `entities/`+`features/` layering (robokidz360-style, migration completed in an earlier session).
- The mobile app (`mobile/`) is ahead of web in feature surface. Confirmed present on mobile but **absent from the web app and from the marketing site's feature copy**: event hosting (with ticket tiers/orders, gate scanning), expense splitting (ride/club expenses with per-person splits), garage (bike/vehicle management), friends & squads (friend groups), in-app messaging, notifications, live-ride GPS tracking with turn-by-turn navigation, and a gamification layer (XP, levels, Fun Mode).
- **This redesign pass is scoped to the marketing site only** (public, unauthenticated pages: `app/page.tsx` + `components/landing/*`, plus `app/(company)/*`). Building event hosting and expense splitting as real functional features in the authenticated web app is explicitly a separate, later phase — not part of this pass. The marketing site's feature copy should still be corrected to reflect what the product actually does/will do, without implying the authenticated web app currently has parity with mobile.
- The product has **not yet launched publicly**. No live App Store or Play Store listings exist (`app/download/page.tsx` has both URLs hardcoded `null`). There is an existing invite-only community of early riders (per the current About page) — real, but not the source for any public-facing metric to display, since no confirmed number exists.
- **Confirmed launch date: November 12 (2026), both iOS and Android simultaneously.** The redesign must add a countdown section counting down to this date and should reframe pre-launch CTAs (currently "Get the App" linking to `#download` where nothing downloadable exists yet) around the countdown/launch rather than implying immediate availability.
- Company: XRide Labs, operating as Revvie. Country of incorporation: India. Contact: hello@xride-labs.in.

## Capabilities and Constraints

- **Confirmed real backend-supported features** (verified this session and in prior sessions against `backend/src/routes/**` and `backend/prisma/schema.prisma`): clubs (discovery, membership, roles, management), rides (creation, GPS tracking, participants, ride chat), marketplace (listings, categories), events (hosting, ticket tiers, orders, gate scanning), expenses (creation, per-person splits, settlement), friends (requests, friend groups/squads), messaging, notifications, user reporting and blocking, Revvie Pro subscription tier.
- **Fabrication constraint:** do not invent user counts, club counts, ride counts, testimonials, or press mentions. The prior hero's "10K+ Active Riders / 500+ Clubs / 2K+ Rides" stat row was placeholder and has been removed by explicit decision — do not reintroduce a stats row unless a real, confirmed number is provided.
- Stack: Next.js (App Router), Tailwind, shadcn/ui (Radix-based, `components.json` present), Motion (`motion/react`) for animation, Josefin Sans as the established brand typeface (already used on both mobile and web).

## Brand Commitments

- Name: **Revvie**. Company: XRide Labs.
- **New logo mark** (app icon, the current source of truth — supersedes the pink/black diamond-blade icon currently live at `web/public/revvie-logo.png` and `public/assets/revvie_logo_*`): `mobile/assets/branding/logo-v4.png` — black rounded-square background, bold white angular "R" mark built from speed-line/arrow strokes.
- **New full wordmark + tagline** (the current source of truth for the lockup, supersedes the current hero's "Ride Together. Build Your Tribe."): `mobile/assets/logo-fullname.png` — distressed/weathered "REVVIE" wordmark in white with a red accent slash through the V, tagline **"RIDE. TRACK. CONNECT."** in red below. This tagline is now the binding brand tagline for the redesign.
- Established brand colors already in the web app's design tokens (`brand-red`, `brand-red-light`, `brand-teal`, `neon-green`) trace to the same palette used on mobile — evidence the color system itself is already aligned; only the logo asset and tagline are stale, not the underlying token system. New-work should verify token values against the mobile theme (`mobile/src/theme`) rather than assume, since the current site's specific hex usages (e.g. `#77ff00`, `#37c8c3`) are inline rather than routed through the token system in several landing components.
- Legal/company facts already correct on the current About/Terms/Privacy pages and must be preserved: XRide Labs entity, India incorporation, `hello@xride-labs.in` contact, Brand Portal description for business partners, Revvie Pro premium tier description.

## Evidence on Hand

- Logo mark: `mobile/assets/branding/logo-v4.png` (also `logo-v2.png`/`logo-v3.png`/`logo.png` as earlier iterations — v4 is the newest by file timestamp and the one to use).
- Full wordmark + tagline lockup: `mobile/assets/logo-fullname.png` (transparent background, white/red on black).
- Existing legal/company copy: `web/app/(company)/about/page.tsx`, `terms/page.tsx`, `privacy/page.tsx`, `refund/page.tsx` — factually accurate, not to be treated as stale.
- No real user/club/ride counts, testimonials, or press exist. State this absence rather than fabricating numbers.

## Product Principles

1. **Ride-native, not desk-native.** Every surface should read as built for someone with gloves on, one hand on the bars — minimal, fast, high-contrast, not a generic SaaS template.
2. **Safety is core identity, not a feature bullet.** Fall detection, SOS, trusted-contact sharing belong in the primary narrative, not buried in a features grid.
3. **Honest about launch state.** The product is pre-launch (Nov 12, 2026). Copy, CTAs, and any stats must reflect that truthfully — no fabricated traction, clear "coming" framing, a real countdown as the anchor.
4. **Purpose-built culture, not adapted template.** Positioning consistently rejects "generic social media adapted for bikers" in favor of "built from the ground up for riders."
5. **India-first, global-ambition.** Don't erase the India-specific origin story; frame it as the credibility root of a platform built for riders everywhere.

## Accessibility & Inclusion

No product-specific accessibility requirement has been established beyond standard web accessibility practice (the existing codebase already respects `useReducedMotion` in landing animations — preserve this pattern in redesign work).
