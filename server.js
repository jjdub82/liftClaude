require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARE ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ── ROUTES ────────────────────────────────────────────────────────────────────
app.use("/api/auth",       require("./routes/auth"));
app.use("/api/profile",    require("./routes/profile"));
app.use("/api/workouts",   require("./routes/workouts"));
app.use("/api/meso",       require("./routes/mesocycles"));
app.use("/api/bodyweight", require("./routes/bodyweight"));

// ── HEALTH CHECK ──────────────────────────────────────────────────────────────
app.get("/api/health", (_, res) => res.json({ status: "ok", ts: Date.now() }));

// ── FALLBACK: serve frontend for all non-API routes ───────────────────────────
app.get("*", (req, res) => {
  if (!req.path.startsWith("/api")) {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  }
});

// ── START ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`LiftLog server running on port ${PORT}`);
});
