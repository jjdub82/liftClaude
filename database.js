const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "liftlog.db");
const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ── CREATE TABLES ──────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    created_at INTEGER DEFAULT (strftime('%s','now') * 1000)
  );

  CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sex TEXT DEFAULT 'female',
    age REAL,
    weight_lbs REAL,
    height_in REAL,
    updated_at INTEGER DEFAULT (strftime('%s','now') * 1000)
  );

  CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id INTEGER,
    date TEXT NOT NULL,
    day_name TEXT NOT NULL,
    split TEXT,
    duration_mins INTEGER DEFAULT 0,
    volume_lbs REAL DEFAULT 0,
    rpe INTEGER,
    calories INTEGER,
    notes TEXT,
    created_at INTEGER DEFAULT (strftime('%s','now') * 1000)
  );

  CREATE TABLE IF NOT EXISTS workout_exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id INTEGER NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    muscle_group TEXT,
    is_compound INTEGER DEFAULT 0,
    sets_json TEXT DEFAULT '[]'
  );

  CREATE TABLE IF NOT EXISTS mesocycles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    config_json TEXT NOT NULL,
    week_plans_json TEXT NOT NULL,
    current_week INTEGER DEFAULT 0,
    current_day INTEGER DEFAULT 0,
    session_history_json TEXT DEFAULT '[]',
    start_date TEXT,
    completed INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s','now') * 1000)
  );

  CREATE TABLE IF NOT EXISTS bodyweight_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    weight_lbs REAL NOT NULL,
    logged_at INTEGER DEFAULT (strftime('%s','now') * 1000)
  );

  CREATE INDEX IF NOT EXISTS idx_workouts_user ON workouts(user_id);
  CREATE INDEX IF NOT EXISTS idx_workouts_created ON workouts(created_at);
  CREATE INDEX IF NOT EXISTS idx_exercises_workout ON workout_exercises(workout_id);
  CREATE INDEX IF NOT EXISTS idx_bw_user ON bodyweight_log(user_id);
  CREATE INDEX IF NOT EXISTS idx_meso_user ON mesocycles(user_id);
`);

// ── SEED DEFAULT USER ──────────────────────────────────────────────────────────
const existing = db.prepare("SELECT id FROM users WHERE id = 1").get();
if (!existing) {
  db.prepare("INSERT INTO users (id, email, password_hash, name) VALUES (1, 'default@liftlog.app', 'none', 'Me')").run();
  db.prepare("INSERT INTO profiles (user_id) VALUES (1)").run();
}

module.exports = db;
