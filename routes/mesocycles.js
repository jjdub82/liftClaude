const express = require("express");
const db = require("../database");
const auth = require("../middleware/auth");

const router = express.Router();

// GET /api/meso/active — get current active mesocycle
router.get("/active", auth, (req, res) => {
  const meso = db.prepare(`
    SELECT * FROM mesocycles WHERE user_id = ? AND completed = 0 ORDER BY created_at DESC LIMIT 1
  `).get(req.userId);
  if (!meso) return res.json(null);
  res.json({
    ...meso,
    config: JSON.parse(meso.config_json),
    weekPlans: JSON.parse(meso.week_plans_json),
    sessionHistory: JSON.parse(meso.session_history_json || "[]"),
  });
});

// POST /api/meso — create new mesocycle
router.post("/", auth, (req, res) => {
  const { name, config, weekPlans, startDate } = req.body;
  // Discard any existing active meso
  db.prepare("UPDATE mesocycles SET completed=1 WHERE user_id=? AND completed=0").run(req.userId);
  const result = db.prepare(`
    INSERT INTO mesocycles (user_id, name, config_json, week_plans_json, start_date)
    VALUES (?, ?, ?, ?, ?)
  `).run(req.userId, name, JSON.stringify(config), JSON.stringify(weekPlans), startDate);
  res.json({ id: result.lastInsertRowid, ok: true });
});

// PUT /api/meso/active — advance week/day or update session history
router.put("/active", auth, (req, res) => {
  const { current_week, current_day, session_history, completed } = req.body;
  const meso = db.prepare("SELECT id FROM mesocycles WHERE user_id=? AND completed=0 ORDER BY created_at DESC LIMIT 1").get(req.userId);
  if (!meso) return res.status(404).json({ error: "No active meso" });
  db.prepare(`
    UPDATE mesocycles SET current_week=?, current_day=?, session_history_json=?, completed=? WHERE id=?
  `).run(current_week, current_day, JSON.stringify(session_history || []), completed ? 1 : 0, meso.id);
  res.json({ ok: true });
});

// DELETE /api/meso/active — discard current meso
router.delete("/active", auth, (req, res) => {
  db.prepare("DELETE FROM mesocycles WHERE user_id=? AND completed=0").run(req.userId);
  res.json({ ok: true });
});

module.exports = router;
