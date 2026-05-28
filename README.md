# 🏋️ LiftLog

A personal lifting tracker with mesocycle programming, progressive overload, calorie estimation, and full analytics. Built with Node.js + Express + SQLite.

---

## Features

- **User accounts** — separate logins for you and your wife
- **Workout logging** — log sets, reps, weight with live rest timer
- **Progressive overload** — RP/SBS-based suggestions per muscle group
- **Mesocycles** — guided 4-6 week programs with auto volume ramp and deload
- **Calorie estimation** — based on weight, age, sex, duration, and RPE
- **Analytics** — volume trends, RPE trends, exercise progression, bodyweight log
- **Weekly muscle volume** — MEV/MRV tracking per muscle group

---

## Local Development

### 1. Install dependencies

```bash
cd liftlog
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
```

Edit `.env` and set a strong `JWT_SECRET` (any long random string).

### 3. Run the server

```bash
npm run dev   # with auto-reload
# or
npm start     # production mode
```

Open `http://localhost:3000` in your browser.

---

## Deploy to Railway (Free)

### Step 1 — Create a GitHub repo

1. Go to [github.com](https://github.com) and create a new **private** repository called `liftlog`
2. On your computer, open Terminal in the `liftlog` folder and run:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/liftlog.git
git push -u origin main
```

### Step 2 — Deploy on Railway

1. Go to [railway.app](https://railway.app) and sign up (free)
2. Click **New Project** → **Deploy from GitHub repo**
3. Connect your GitHub account and select the `liftlog` repo
4. Railway will detect Node.js and start deploying automatically

### Step 3 — Set environment variables

In your Railway project dashboard:
1. Click your service → **Variables** tab
2. Add these variables:

| Key | Value |
|-----|-------|
| `JWT_SECRET` | A long random string (e.g. `openssl rand -hex 32` in Terminal) |
| `NODE_ENV` | `production` |

Railway automatically sets `PORT` for you.

### Step 4 — Get your URL

1. Click **Settings** → **Networking** → **Generate Domain**
2. Your app will be live at something like `liftlog-production.up.railway.app`
3. Open that URL, create your account, done!

### Step 5 — Add to iPhone home screen

1. Open your Railway URL in **Safari**
2. Tap the **Share** button (box with arrow)
3. Tap **Add to Home Screen**
4. Name it **LiftLog** and tap Add

It'll appear on your home screen and work like a native app.

---

## Database

SQLite database (`liftlog.db`) is created automatically on first run. Railway's free tier includes persistent storage — your data won't disappear between deploys.

---

## Project Structure

```
liftlog/
├── server.js           Main Express server
├── database.js         SQLite setup and schema
├── package.json
├── railway.toml        Railway deployment config
├── .env.example        Environment variable template
├── routes/
│   ├── auth.js         Signup, login, JWT
│   ├── profile.js      User profile (age, weight, sex)
│   ├── workouts.js     Workout CRUD
│   ├── mesocycles.js   Mesocycle management
│   └── bodyweight.js   Bodyweight log
├── middleware/
│   └── auth.js         JWT validation
└── public/
    └── index.html      Full frontend (single file)
```

---

## Adding More Users

Anyone with the URL can sign up. If you want to restrict signups to invite-only, open `routes/auth.js` and add an allowlist check on the email before the `existing` query.

---

## Updating the App

After making changes:

```bash
git add .
git commit -m "Your change description"
git push
```

Railway auto-deploys within ~60 seconds.
# liftlog
