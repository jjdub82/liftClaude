const express = require("express");
const db = require("../database");
const USER_ID = 1;
const router = express.Router();

router.get("/", (req, res) => {
  const profile = db.prepare("SELECT * FROM profiles WHERE user_id = ?").get(USER_ID);
  res.json(profile || {});
});

router.put("/", (req, res) => {
  const { sex, age, weight_lbs, height_in } = req.body;
  const existing = db.prepare("SELECT id FROM profiles WHERE user_id = ?").get(USER_ID);
  if (existing) {
    db.prepare(`UPDATE profiles SET sex=?, age=?, weight_lbs=?, height_in=?, updated_at=? WHERE user_id=?`)
      .run(sex, age, weight_lbs, height_in, Date.now(), USER_ID);
  } else {
    db.prepare(`INSERT INTO profiles (user_id, sex, age, weight_lbs, height_in) VALUES (?,?,?,?,?)`)
      .run(USER_ID, sex, age, weight_lbs, height_in);
  }
  res.json({ ok: true });
});

module.exports = router;
