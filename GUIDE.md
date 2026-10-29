# 🚀 VidAI - Feature & Roles Guide

VidAI plans Pakistani weddings end to end: an AI assistant, PKR budget planning,
AI-written invitation wording, a reviewed vendor marketplace with bookings, and an
admin portal. For setup see `RUN.md`; for the one-command stack see the README's
Docker Compose section.

---

## 👤 Couple (Simple User)

- **Access**: [http://localhost:3000](http://localhost:3000) → **Sign up**
- **Portal at** `/user`:
  - **Dashboard** — budget total, committed spend, upcoming events.
  - **Budget** — set your total, press **Generate AI plan** for a category allocation in
    PKR (with money-saving tips), and keep your own line items alongside it.
  - **AI Assistant** — chat about budgets, traditions, vendors, timelines. Understands
    Roman Urdu terms; answers in PKR.
  - **Find Vendors** — search by city and category; open a profile and send booking
    requests with date, event type and notes.
  - **Invitations** — essentials + tone in, finished card wording out.
  - **My Bookings** — track requests (pending → confirmed → completed); cancel pending ones.

## 💼 Vendor (Service Provider)

- **Access**: [http://localhost:3000/vendor-landing](http://localhost:3000/vendor-landing) → **Join as Vendor**
- Register with your business name, complete the **Business Profile** at `/vendor/profile`
  (city, phone, description, categories), and publish **Packages** at `/vendor/services`.
- A new vendor is **pending** until an admin approves the account — only then do the
  business and packages appear in search and the AI's recommendations.
- **Booking requests** arrive at `/vendor` with the couple's name, event, date and notes;
  confirm, decline, or mark completed.

## 🛡 Admin (Platform Manager)

- **Access**: log in at `/login` with the seeded credentials (`ADMIN_EMAIL` /
  `ADMIN_PASSWORD`, default `admin@vidai.pk` / `Admin@123` — change it in production).
- **Portal at** `/admin`:
  - **Dashboard** — platform counts plus recent activity.
  - **Users** — search, ban / unban (banned users cannot log in).
  - **Vendors** — approve to list, unlist to hide.
  - **Activity Logs** — the latest 200 platform events.
  - **System Health** — backend, AI service and Ollama status at a glance.

---

## 💡 Notes

- **AI features need Ollama.** If it's down, chat and recommendations show clear
  retry messages and the budget planner returns a sensible static plan.
- **Password resets** print a link to the backend console (no SMTP in development).
- **All prices are PKR.** Vendor categories and event types are a fixed vocabulary
  shared by the frontend, backend and AI prompts.
