const express = require("express");
const db = require("../database");
const USER_ID = 1;
const router = express.Router();

router.get("/", (req, res) => {
  const entries = db.prepare("SELECT * FROM bodyweight_log WHERE user_id=? ORDER BY logged_at ASC").all(USER_ID);
  res.json(entries);
});

router.post("/", (req, res) => {
  const { date, weight_lbs } = req.body;
  if (!weight_lbs) return res.status(400).json({ error: "weight_lbs required" });
  const result = db.prepare("INSERT INTO bodyweight_log (user_id, date, weight_lbs) VALUES (?,?,?)").run(USER_ID, date, weight_lbs);
  res.json({ id: result.lastInsertRowid, ok: true });
});

router.delete("/:id", (req, res) => {
  db.prepare("DELETE FROM bodyweight_log WHERE id=? AND user_id=?").run(req.params.id, USER_ID);
  res.json({ ok: true });
});

module.exports = router;
