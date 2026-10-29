# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Couples planning a Pakistani wedding** (primary): often splitting planning with family, working in PKR across 3–7 events (Nikkah, Mehndi, Baraat, Walima…), comparing vendors by city and category. *[inferred from GUIDE.md, RUN.md, ai-service prompts]*
- **Vendors**: photographers, caterers, venues, makeup artists etc. in Pakistani cities, listing packages and taking booking requests.
- **Admins**: platform staff approving vendors, managing users, watching system health.

## Product Purpose

VidAI is an AI-powered wedding planning platform for Pakistan: an AI assistant (chat), AI budget allocation in PKR, AI-generated invitation content, a vendor marketplace with bookings, and admin moderation. Success: a couple goes from "we got engaged" to a booked, budgeted multi-event plan in one place.

## Positioning

Local-AI wedding planning: runs on a local Ollama model (llama3.2:3b) tuned with Pakistani wedding knowledge — PKR market rates, event customs, city-specific pricing — plus real vendor data from the platform's own database, so recommendations name actual listed vendors rather than fictional ones.

## Operating Context

Three services: Vite SPA (:3000), Node/Express + MongoDB backend (:5000, JWT auth with refresh cookies), Python FastAPI AI service (:8000, Ollama + Gemini + Mongo vendor context). Docker Compose runs the whole stack. AI features degrade gracefully when Ollama is down (fallback budget plans, empty recommendations with a message).

## Capabilities and Constraints

- Roles: user, vendor (needs admin approval), admin (seeded admin@vidai.pk, password from ADMIN_PASSWORD env).
- AI endpoints: chat, recommendations, budget-plan (Ollama, JSON mode), invitation text generation (Gemini text model).
- Currency always PKR. Vendor categories and event types are a fixed shared vocabulary (must match across frontend, backend, ai-service).
- Password policy: 8+ chars, upper, lower, number.
- No SMTP: password reset links log to the server console in dev.
- Mobile: React Native (Expo) app in `mobile/` covering auth, dashboard, budget, vendors, chat, invitations and bookings against the same backend; emulator targets the host API at 10.0.2.2. *[rebuilt 2026-10-27 on user request]*
- **Build policy (binding rule, set 2026-10-28): all Android builds run in Expo's cloud via EAS Build (`eas build`); all web deploys run on Vercel. Never run local Gradle builds, never install a local Android SDK/emulator, never run heavy compilation on the user's machine.** The file `mobile/android/` (local prebuild) and `C:\Android\Sdk` were a one-time local experiment and should be removed / rebuilt via EAS.
- Payments: not part of the product; not built.

## Brand Commitments

From the incumbent build (source deleted; a built dist/ and brand tokens survive): name **VidAI**, rose/crimson `#d7385e` with pink `#ec4899`, display face **Playfair Display**, UI face **Outfit**. Wedding-planner-for-Pakistan voice: warm, practical, culturally fluent (mehndi, baraat, walima, PKR).

## Evidence on Hand

- `GUIDE.md`, `RUN.md` — setup, roles, user flows.
- `ai-service/app/services/prompts.py` — deep product knowledge: PKR market ranges, category vocabulary, event customs, cities.
- Route surface recovered from the surviving `dist/` bundle (now deleted): /user/* (dashboard, budget, chat, vendors, invitations, bookings), /vendor/* (profile, services, bookings), /admin/* (dashboard, users, vendors, logs, system-health), auth routes, /vendor-landing.
- No real imagery, logos, testimonials, or customer data exist; none may be invented. Demonstration data is authored and labeled synthetic.

## Product Principles

1. Pakistani weddings are multi-event plans, not one day — the product thinks in ribbons of events.
2. PKR is the only currency; every number a user sees is plausible for the local market.
3. AI assists but never blocks: every AI surface degrades to a working fallback.
4. Vendors are real local businesses; approval is a human admin decision.

## Accessibility & Inclusion

Body text contrast ≥4.5:1, visible focus states, keyboard-operable controls. English UI that understands Urdu/Roman Urdu terms (per product prompts).
