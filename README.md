# VidAI

VidAI is a full-stack AI-powered wedding planning platform. It includes a React web app, Node/Express backend, FastAPI AI microservice, and React Native mobile app for users, vendors, and admins.

## Overview

The system is designed around three product surfaces:

- **Users:** discover vendors, manage bookings, plan budgets, and chat with an AI assistant.
- **Vendors:** manage profiles, packages, and booking workflows.
- **Admins:** review vendors, monitor users, inspect activity logs, and check system health.

The AI service connects to Ollama for local LLM inference and exposes chat, recommendation, and budget-planning endpoints.

## Tech Stack

| Layer | Tools |
|---|---|
| Web frontend | React 19, Vite, React Router, lucide-react, React Hot Toast |
| Backend API | Node.js, Express, MongoDB/Mongoose, JWT auth, Stripe, Cloudinary |
| AI service | FastAPI, Ollama, Python |
| Mobile | React Native, Expo |
| DevOps | Docker, Docker Compose |

## Architecture

```text
React/Vite web app      React Native mobile app
        |                         |
        +---------- API ----------+
                   |
          Node/Express backend
                   |
     MongoDB, Stripe, Cloudinary
                   |
             FastAPI AI service
                   |
                Ollama
```

## Key Features

- Role-based authentication for users, vendors, and admins.
- Vendor discovery, profiles, packages, and booking management.
- Budget planning workflows with AI-generated planning support.
- AI chat, recommendations, and budget-plan generation.
- Stripe payment flow and webhook handling.
- Cloudinary-backed image uploads.
- Admin dashboards for vendor verification, users, logs, and health checks.
- Mobile app entry points for user workflows.

## Repository Structure

```text
src/             React/Vite web frontend
server/          Node/Express API, controllers, models, routes, middleware
ai-service/      FastAPI service for AI chat, recommendations, and budget plans
mobile/          React Native / Expo application
SRS/             Software requirements documentation
docker-compose.yml
Dockerfile
GUIDE.md         Non-technical Docker setup guide
RUN.md           Local multi-terminal run guide
```

## Quick Start With Docker

Docker is the easiest way to run the full system.

```bash
docker-compose up --build
```

Then open:

```text
http://localhost:3000
```

The first run may take several minutes while dependencies and the local AI model are prepared.

## Local Development

Run each service in a separate terminal.

### Backend

```bash
cd server
npm install
node server.js
```

Backend API:

```text
http://localhost:5000
```

### AI Service

```bash
cd ai-service
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

AI service:

```text
http://localhost:8000
```

### Frontend

```bash
npm install
npm run dev
```

Frontend:

```text
http://localhost:3000
```

### Mobile

```bash
cd mobile
npm install
npm start
```

## Environment Variables

The backend expects a `server/.env` file. Start from:

```bash
cp server/.env.example server/.env
```

Common required values include:

- `MONGODB_URI`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- Stripe credentials
- Cloudinary credentials
- frontend/client URLs

The AI service expects Ollama to be running locally and a model such as `llama3.2:3b` to be available.

## Validation

```bash
npm run validate
```

Run this after starting the backend and AI service to verify the main local paths.

## Project Status

VidAI is a multi-surface product prototype with production-oriented pieces already present: role separation, secure middleware, payment/webhook routes, AI microservice boundaries, Docker setup, mobile app structure, and admin/vendor/user flows.
