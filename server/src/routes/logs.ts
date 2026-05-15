import { Router, Response } from 'express';
import db from '../database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// GET /api/logs/today
router.get('/today', (req: AuthRequest, res: Response): void => {
  const today = new Date().toISOString().split('T')[0];
  const log = db
    .prepare('SELECT * FROM wellbeing_logs WHERE user_id = ? AND date = ?')
    .get(req.user!.id, today);
  res.json(log ?? null);
});

// GET /api/logs?days=30
router.get('/', (req: AuthRequest, res: Response): void => {
  const daysNum = Math.min(
    Math.max(parseInt(String(req.query.days ?? '30')), 1),
    365
  );
  const logs = db
    .prepare(
      `SELECT * FROM wellbeing_logs
       WHERE user_id = ? AND date >= date('now', '-' || ? || ' days')
       ORDER BY date DESC`
    )
    .all(req.user!.id, daysNum);
  res.json(logs);
});

// POST /api/logs
router.post('/', (req: AuthRequest, res: Response): void => {
  const { mood, energy, focus, notes, work_hours, date } = req.body as {
    mood: unknown;
    energy: unknown;
    focus: unknown;
    notes?: unknown;
    work_hours?: unknown;
    date?: unknown;
  };

  if (mood === undefined || energy === undefined || focus === undefined) {
    res.status(400).json({ error: 'Mood, energy, and focus are required' });
    return;
  }

  const moodInt = Math.round(Number(mood));
  const energyInt = Math.round(Number(energy));
  const focusInt = Math.round(Number(focus));

  if ([moodInt, energyInt, focusInt].some((v) => isNaN(v) || v < 1 || v > 10)) {
    res.status(400).json({ error: 'Values must be integers between 1 and 10' });
    return;
  }

  const logDate =
    typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? date
      : new Date().toISOString().split('T')[0];

  const safeNotes =
    typeof notes === 'string' ? notes.slice(0, 1000) : null;
  const workHours =
    work_hours !== undefined
      ? Math.min(Math.max(Number(work_hours), 0), 24)
      : 8;

  db.prepare(
    `INSERT INTO wellbeing_logs (user_id, date, mood, energy, focus, notes, work_hours)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id, date) DO UPDATE SET
       mood       = excluded.mood,
       energy     = excluded.energy,
       focus      = excluded.focus,
       notes      = excluded.notes,
       work_hours = excluded.work_hours`
  ).run(req.user!.id, logDate, moodInt, energyInt, focusInt, safeNotes, workHours);

  const log = db
    .prepare('SELECT * FROM wellbeing_logs WHERE user_id = ? AND date = ?')
    .get(req.user!.id, logDate);

  res.status(201).json(log);
});

export default router;
