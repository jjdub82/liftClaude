const express = require("express");
const db = require("../database");
const auth = require("../middleware/auth");

const router = express.Router();

// GET /api/workouts — list all workouts for user
router.get("/", auth, (req, res) => {
  const workouts = db.prepare(`
    SELECT * FROM workouts WHERE user_id = ? ORDER BY created_at DESC LIMIT 100
  `).all(req.userId);

  const result = workouts.map(w => {
    const exercises = db.prepare("SELECT * FROM workout_exercises WHERE workout_id = ?").all(w.id);
    return {
      ...w,
      exercises: exercises.map(e => ({
        ...e,
        sets: JSON.parse(e.sets_json || "[]"),
        compound: !!e.is_compound,
      })),
    };
  });

  res.json(result);
});

// POST /api/workouts — save a new workout
router.post("/", auth, (req, res) => {
  const { client_id, date, day_name, split, duration_mins, volume_lbs, rpe, calories, notes, exercises } = req.body;

  const result = db.prepare(`
    INSERT INTO workouts (user_id, client_id, date, day_name, split, duration_mins, volume_lbs, rpe, calories, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(req.userId, client_id, date, day_name, split, duration_mins, volume_lbs || 0, rpe, calories, notes);

  const workoutId = result.lastInsertRowid;

  if (Array.isArray(exercises)) {
    const insertEx = db.prepare(`
      INSERT INTO workout_exercises (workout_id, name, muscle_group, is_compound, sets_json)
      VALUES (?, ?, ?, ?, ?)
    `);
    for (const ex of exercises) {
      insertEx.run(workoutId, ex.name, ex.group || ex.muscle_group, ex.compound ? 1 : 0, JSON.stringify(ex.sets || []));
    }
  }

  res.json({ id: workoutId, ok: true });
});

// PUT /api/workouts/:id — edit a workout
router.put("/:id", auth, (req, res) => {
  const { day_name, duration_mins, notes } = req.body;
  const workout = db.prepare("SELECT id FROM workouts WHERE id = ? AND user_id = ?").get(req.params.id, req.userId);
  if (!workout) return res.status(404).json({ error: "Not found" });
  db.prepare("UPDATE workouts SET day_name=?, duration_mins=?, notes=? WHERE id=?")
    .run(day_name, duration_mins, notes, req.params.id);
  res.json({ ok: true });
});

// DELETE /api/workouts/:id
router.delete("/:id", auth, (req, res) => {
  const workout = db.prepare("SELECT id FROM workouts WHERE id = ? AND user_id = ?").get(req.params.id, req.userId);
  if (!workout) return res.status(404).json({ error: "Not found" });
  db.prepare("DELETE FROM workouts WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
