# VidAI — AI Wedding Planner for Pakistan

VidAI helps Pakistani couples plan multi-event weddings (nikkah, mehndi, baraat, walima)
with an AI assistant, PKR budget planning, AI-drafted invitation wording, and a vendor
marketplace with bookings. Vendors list packages after admin approval; admins run the
platform from a dedicated portal.

## Stack

| Tier | Tech | Dev port |
|---|---|---|
| Frontend | React 19 + Vite (SPA) | 3000 |
| Backend | Node 22 + Express 5 + MongoDB (Mongoose), JWT auth with refresh cookies | 5000 |
| AI service | Python 3.12 + FastAPI, local Ollama (`llama3.2:3b`) + Google Gemini for invitations | 8000 |
| Mobile | React Native (Expo) — Android APK; talks to the same backend | — |
| Databases | MongoDB 7 | 27017 |

## Quick start (local, three processes)

```bash
# 1. MongoDB — a local mongod or Docker container
docker run -d --name vidai-mongo -p 27017:27017 mongo:7

# 2. Backend
cd server && cp .env.example .env && npm install
npm run dev            # → VidAI Server running on port 5000 (seeds admin@vidai.pk / Admin@123)

# 3. AI service (needs Ollama running: `ollama serve` + `ollama pull llama3.2:3b`)
cd ai-service && cp .env.example .env
python -m venv .venv && .venv/Scripts/pip install -r requirements.txt   # Windows
.venv/Scripts/python.exe -m uvicorn app.main:app --port 8000

# 4. Frontend
npm install && npm run dev   # → http://localhost:3000
```

Ollama is optional: every AI feature degrades gracefully without it (static fallback
budget plans, clear error messages).

## Android app

```bash
cd mobile && npm install
npx expo export --platform android   # compile-check the JS bundle
npx expo prebuild --platform android # generate android/ (once)
cd android && ./gradlew assembleRelease  # → android/app/build/outputs/apk/release/app-release.apk
```

The app targets `http://10.0.2.2:5000/api/v1` (the host machine from an Android
emulator); change `extra.apiUrl` in `mobile/app.json` for a physical device.

## Quick start (Docker Compose)

```bash
docker compose up --build
```

Frontend on **http://localhost:8080** (nginx serves the SPA and proxies `/api` and
`/uploads` to the backend). The first run pulls the Ollama image; pull a model into the
container with `docker compose exec ollama ollama pull llama3.2:3b`.

## Verification

```bash
npm run lint        # eslint across frontend + backend
npm run build       # production SPA build
npm run validate    # end-to-end checks against a running stack (backend + AI health, auth roundtrip)
node scripts/smoke.js   # 43-check API smoke test (needs a running backend + fresh DB)
cd server && node smoke-boot.js   # boot the backend on a throwaway in-memory MongoDB
```

## Roles

- **Couple** — register at `/register`, plan at `/user` (budget, AI chat, vendors, invitations, bookings).
- **Vendor** — register at `/register` as a vendor, complete the profile at `/vendor`, wait for admin approval.
- **Admin** — seeded from `ADMIN_EMAIL`/`ADMIN_PASSWORD` (default `admin@vidai.pk` / `Admin@123` — change it), portal at `/admin`.

## Project layout

```
├─ src/            # React SPA (pages, components, styles)
├─ server/         # Express API (auth, vendors, bookings, budget, AI proxy, admin, uploads)
├─ ai-service/     # FastAPI (chat / recommendations / budget-plan via Ollama, invitations via Gemini)
├─ scripts/        # smoke.js (API smoke test), validate.js (stack checks)
├─ docker-compose.yml, Dockerfile, nginx.conf
└─ PRODUCT.md      # product truth; .impeccable/ holds the design records
```

Password reset links are written to the backend console (no SMTP in dev).
