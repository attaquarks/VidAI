# How to Run VidAI Locally

Run these **three** processes (each in its own terminal). MongoDB must be reachable first.

```bash
# MongoDB (skip if you already run a local mongod)
docker run -d --name vidai-mongo -p 27017:27017 mongo:7
```

## 1. Backend (Node + MongoDB)

```bash
cd server
cp .env.example .env   # then edit secrets if you care to
npm install
npm run dev
```

- **Port:** 5000
- You should see: `VidAI Server running in development mode on port 5000`
- A first boot seeds the admin account (`ADMIN_EMAIL` / `ADMIN_PASSWORD`, default `admin@vidai.pk` / `Admin@123`).

## 2. AI service (Python + Ollama)

```bash
cd ai-service
cp .env.example .env
python -m venv .venv && .venv/Scripts/pip install -r requirements.txt   # Windows
.venv/Scripts/python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

- **Port:** 8000
- **Requires:** Ollama running locally (`ollama serve`, model `llama3.2:3b`)
- You should see: `Uvicorn running on http://0.0.0.0:8000`
- Without Ollama the service still starts; AI features degrade gracefully.

## 3. Frontend (React + Vite)

```bash
npm install
npm run dev
```

- **Port:** 3000 — open **http://localhost:3000**

## Verify everything

```bash
npm run validate       # stack checks: backend health, auth roundtrip, AI health
node scripts/smoke.js  # full API smoke test (43 checks) against a fresh database
```

## Roles at a glance

| Role | Enter at | Portal |
|---|---|---|
| Couple | `/register` | `/user` — budget, AI chat, vendors, invitations, bookings |
| Vendor | `/register` (choose "I'm a vendor") | `/vendor` — profile, packages, booking requests |
| Admin | seeded credentials at `/login` | `/admin` — dashboard, users, vendor approvals, logs, system health |
