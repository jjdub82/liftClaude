const express = require("express");
const db = require("../database");
const auth = require("../middleware/auth");

const router = express.Router();

// GET /api/profile
router.get("/", auth, (req, res) => {
  const profile = db.prepare("SELECT * FROM profiles WHERE user_id = ?").get(req.userId);
  res.json(profile || {});
});

// PUT /api/profile
router.put("/", auth, (req, res) => {
  const { sex, age, weight_lbs, height_in } = req.body;
  const existing = db.prepare("SELECT id FROM profiles WHERE user_id = ?").get(req.userId);
  if (existing) {
    db.prepare(`UPDATE profiles SET sex=?, age=?, weight_lbs=?, height_in=?, updated_at=?
      WHERE user_id=?`).run(sex, age, weight_lbs, height_in, Date.now(), req.userId);
  } else {
    db.prepare(`INSERT INTO profiles (user_id, sex, age, weight_lbs, height_in) VALUES (?,?,?,?,?)`)
      .run(req.userId, sex, age, weight_lbs, height_in);
  }
  res.json({ ok: true });
});

module.exports = router;
