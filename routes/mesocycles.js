const express = require("express");
const db = require("../database");
const USER_ID = 1;
const router = express.Router();

router.get("/active", (req, res) => {
  const meso = db.prepare(`
    SELECT * FROM mesocycles WHERE user_id = ? AND completed = 0 ORDER BY created_at DESC LIMIT 1
  `).get(USER_ID);
  if (!meso) return res.json(null);
  res.json({
    ...meso,
    config: JSON.parse(meso.config_json),
    weekPlans: JSON.parse(meso.week_plans_json),
    sessionHistory: JSON.parse(meso.session_history_json || "[]"),
  });
});

router.post("/", (req, res) => {
  const { name, config, weekPlans, startDate } = req.body;
  db.prepare("UPDATE mesocycles SET completed=1 WHERE user_id=? AND completed=0").run(USER_ID);
  const result = db.prepare(`
    INSERT INTO mesocycles (user_id, name, config_json, week_plans_json, start_date)
    VALUES (?, ?, ?, ?, ?)
  `).run(USER_ID, name, JSON.stringify(config), JSON.stringify(weekPlans), startDate);
  res.json({ id: result.lastInsertRowid, ok: true });
});

router.put("/active", (req, res) => {
  const { current_week, current_day, session_history, completed } = req.body;
  const meso = db.prepare("SELECT id FROM mesocycles WHERE user_id=? AND completed=0 ORDER BY created_at DESC LIMIT 1").get(USER_ID);
  if (!meso) return res.status(404).json({ error: "No active meso" });
  db.prepare(`
    UPDATE mesocycles SET current_week=?, current_day=?, session_history_json=?, completed=? WHERE id=?
  `).run(current_week, current_day, JSON.stringify(session_history || []), completed ? 1 : 0, meso.id);
  res.json({ ok: true });
});

router.delete("/active", (req, res) => {
  db.prepare("DELETE FROM mesocycles WHERE user_id=? AND completed=0").run(USER_ID);
  res.json({ ok: true });
});

module.exports = router;
