# LifeOS — Personal Life Management Dashboard

A complete, fully functional personal life management web app: finances, a Covey-style weekly
planner, health & fitness, study tracking, a unified calendar, goals & journaling, and a
monthly report — all behind JWT authentication and persisted in MongoDB.

---

## Tech stack

| Layer      | Technology                                                        |
| ---------- | ----------------------------------------------------------------- |
| Frontend   | React 18 + Vite, JavaScript, React Router 6, Tailwind CSS, Recharts, Lucide React |
| Backend    | Node.js, Express 4 (ESM)                                          |
| Database   | MongoDB + Mongoose 8                                              |
| API        | REST over Axios                                                   |
| Auth       | JWT (`jsonwebtoken`) + password hashing (`bcryptjs`)              |

Design language: a warm, earthy palette (cream, sand, taupe, espresso, terracotta, olive, gold)
with the Fraunces display serif and Manrope body font. No blue-and-white, no pink.

---

## Project structure

```
Personal_Life_Management/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # ui kit, layout, charts, feature components
│   │   ├── context/         # AuthContext, ToastContext
│   │   ├── hooks/           # useApiData, useCollection
│   │   ├── pages/           # Dashboard, Finances, Planner, Health, Study, Calendar, Goals, Journal, Reports, Settings, Login, Register
│   │   ├── services/        # axios instance + helpers
│   │   ├── utils/           # constants, formatters
│   │   ├── App.jsx, main.jsx, index.css
│   ├── .env.example
│   ├── tailwind.config.js, vite.config.js, package.json
│
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/          # db.js (Mongo connection + in-memory fallback)
│   │   ├── controllers/     # auth, finance, planner, health, study, calendar, goals, dashboard, report
│   │   ├── middleware/      # auth (JWT), errorHandler
│   │   ├── models/          # User, Finance, Planner, Health, Study, Calendar, Goals
│   │   ├── routes/          # one router per module
│   │   ├── utils/           # constants, crud factory, cycle math, date helpers
│   │   ├── app.js, server.js, seed.js
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## Prerequisites

- **Node.js 18+** (developed on Node 22)
- **MongoDB** — one of:
  - a local MongoDB server (`mongodb://127.0.0.1:27017/lifeos`), or
  - a MongoDB Atlas cluster, or
  - **nothing** — the backend automatically falls back to an in-memory MongoDB
    (via `mongodb-memory-server`) so you can try the app immediately. The first run downloads a
    MongoDB binary (~600 MB); data is **not** persisted across restarts in this mode.

---

## Configuration

Copy the example env files and adjust if needed:

```bash
# server
cp server/.env.example server/.env

# client
cp client/.env.example client/.env
```

### `server/.env`

| Variable         | Description                                                             | Default                                  |
| ---------------- | ----------------------------------------------------------------------- | ---------------------------------------- |
| `PORT`           | API port                                                                | `5000`                                   |
| `MONGODB_URI`    | MongoDB connection string. **Leave empty for the in-memory fallback.**  | *(empty)*                                |
| `JWT_SECRET`     | Long random string used to sign tokens                                  | `change_this_to_a_long_random_secret`    |
| `JWT_EXPIRES_IN` | Token lifetime                                                          | `30d`                                    |
| `CLIENT_ORIGIN`  | Allowed CORS origin (the Vite dev server)                               | `http://localhost:5173`                  |

For a persistent database, set, for example:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/lifeos
# or, Atlas:
# MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/lifeos
```

### `client/.env`

| Variable       | Description                                                    | Default |
| -------------- | -------------------------------------------------------------- | ------- |
| `VITE_API_URL` | API base URL. Keep `/api` to use the Vite proxy in dev.        | `/api`  |

---

## Installation & running

Open **two terminals**.

### 1. Backend

```bash
cd server
npm install
npm run dev      # nodemon, restarts on change (or: npm start)
```

On first boot with an empty database the server **auto-seeds** a demo account and realistic
sample data across every module. You'll see:

```
🌱 Empty database detected — loading demo data…
🌱 Seed complete.
🚀 LifeOS API running on http://localhost:5000
   Demo login → demo@lifeos.app / demo1234
```

To re-seed at any time (wipes and recreates the demo user's data):

```bash
npm run seed
```

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Then open **http://localhost:5173**.

---

## Demo account

| Email             | Password   |
| ----------------- | ---------- |
| `demo@lifeos.app` | `demo1234` |

The sign-in screen also has a **Fill** button that populates these credentials for you.

---

## Modules

1. **Financial Tracker** — bank balance, income/expense entry with categories, a separate piggy
   bank savings tracker, monthly summaries, and charts (spending by category, income vs expenses).
   Balances are always recomputed from stored transactions, so editing or deleting a transaction
   never double-counts.
2. **Weekly Planner (Covey's 7 Habits)** — full Monday→Sunday board, tasks with
   title/description/date/time/priority/quadrant/life-role/status, move-between-days, the four
   quadrants (Q1–Q4), weekly goals, a weekly review, optional rest days, and an **optional,
   private** menstrual-cycle tracker with a current-phase estimate, an approximate cycle calendar,
   manual corrections, and non-prescriptive energy suggestions.
3. **Health & Fitness** — weekly meal planner (breakfast/lunch/dinner/snacks + ingredients & notes,
   and what was actually eaten), water intake with a daily goal and weekly history, body
   measurements with automatic BMI (clearly labelled as an adult screening measure, not a
   diagnosis), and a weekly exercise table with completion tracking.
4. **Study Tracker** — subjects/courses, study tasks with priorities and deadlines,
   exams/assignments/projects, study sessions with objectives, weekly statistics & charts, and
   upcoming/overdue views. Academic deadlines are synced to the calendar.
5. **Personal Calendar** — month / week / day views with events (title, description, date, start,
   end, category), showing events, study deadlines and tasks together, colour-coded by category,
   with reminders.
6. **Dashboard** — bank balance, piggy savings, today's tasks & priorities, weekly completion,
   upcoming deadlines, hydration, upcoming events, study hours this week, exercise progress, the
   current cycle phase (only when enabled), and quick actions.
7. **Goals & Journal** — monthly/yearly goals by category with progress tracking, plus a daily
   journal (reflections, achievements, mood, notes).

Plus a **Reports** page (monthly summary of finances, tasks, study, exercise, hydration and
deadlines) and a **Settings** page (profile, currency, cycle-tracking toggle, password change).

---

## Integration notes

- **Study deadlines → Calendar**: creating/updating/deleting a deadline also creates/updates/deletes
  a linked calendar event. The calendar de-duplicates using linked references so the same deadline
  never appears twice.
- **Financial transactions → Balances**: bank and piggy balances are derived from transactions on
  every read, never stored as a mutable number.
- **Exercise & study sessions → Statistics** and the monthly report.
- Every private record is scoped to the authenticated user via the JWT.

---

## API overview

All routes are prefixed with `/api` and (except `auth` + `health`) require a
`Authorization: Bearer <token>` header.

| Area      | Endpoints (abridged)                                                                    |
| --------- | --------------------------------------------------------------------------------------- |
| Auth      | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `PUT /auth/preferences`       |
| Finance   | `/transactions`, `/savings`, `GET /finance/summary?month=YYYY-MM`                        |
| Planner   | `/tasks`, `/weekly-goals`, `/cycle`, `GET/PUT /weekly-review`, `GET /cycle/current`      |
| Health    | `/meals`, `/water`, `/measurements`, `/exercises`                                        |
| Study     | `/subjects`, `/study-tasks`, `/study-sessions`, `/deadlines`                             |
| Calendar  | `/events`, `GET /calendar?from=&to=`                                                     |
| Goals     | `/goals`, `/journal`                                                                     |
| Dashboard | `GET /dashboard`                                                                         |
| Reports   | `GET /reports/monthly?month=YYYY-MM`                                                     |

---

## Troubleshooting

- **First backend start is slow** — the in-memory MongoDB binary (~600 MB) is downloading. Later
  starts are instant. Set `MONGODB_URI` to skip it entirely.
- **Demo data disappears after restarting the server** — you're using the in-memory fallback.
  Set `MONGODB_URI` for persistence.
- **“Invalid email or password”** — run `npm run seed` in `server/` to recreate the demo user
  (only when pointing at a persistent database).
- **CORS errors** — make sure `CLIENT_ORIGIN` in `server/.env` matches the URL you open the client on.
