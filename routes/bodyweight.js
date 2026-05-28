const express = require("express");
const db = require("../database");
const auth = require("../middleware/auth");

const router = express.Router();

// GET /api/bodyweight
router.get("/", auth, (req, res) => {
  const entries = db.prepare("SELECT * FROM bodyweight_log WHERE user_id=? ORDER BY logged_at ASC").all(req.userId);
  res.json(entries);
});

// POST /api/bodyweight
router.post("/", auth, (req, res) => {
  const { date, weight_lbs } = req.body;
  if (!weight_lbs) return res.status(400).json({ error: "weight_lbs required" });
  const result = db.prepare("INSERT INTO bodyweight_log (user_id, date, weight_lbs) VALUES (?,?,?)").run(req.userId, date, weight_lbs);
  res.json({ id: result.lastInsertRowid, ok: true });
});

// DELETE /api/bodyweight/:id
router.delete("/:id", auth, (req, res) => {
  db.prepare("DELETE FROM bodyweight_log WHERE id=? AND user_id=?").run(req.params.id, req.userId);
  res.json({ ok: true });
});

module.exports = router;
