import { Task, WeeklyGoal, WeeklyReview, CycleRecord } from '../models/Planner.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { crudController } from '../utils/crud.js';
import { startOfWeek } from '../utils/dates.js';
import { estimateCycle, PHASE_SUGGESTIONS } from '../utils/cycle.js';

export const taskController = crudController(Task, {
  sort: { date: 1, createdAt: 1 },
});

export const weeklyGoalController = crudController(WeeklyGoal, {
  sort: { weekStart: -1, createdAt: 1 },
});

export const cycleController = crudController(CycleRecord, {
  sort: { periodStart: -1 },
});

export const getWeeklyReview = asyncHandler(async (req, res) => {
  const weekStart = startOfWeek(req.query.week || new Date());
  const review = await WeeklyReview.findOne({ user: req.user.id, weekStart });
  res.json(review || { weekStart, wins: '', challenges: '', rating: 3, notes: '' });
});

export const upsertWeeklyReview = asyncHandler(async (req, res) => {
  const weekStart = startOfWeek(req.body.weekStart || req.query.week || new Date());
  const { wins = '', challenges = '', rating = 3, notes = '' } = req.body;

  const review = await WeeklyReview.findOneAndUpdate(
    { user: req.user.id, weekStart },
    { user: req.user.id, weekStart, wins, challenges, rating, notes },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  );

  res.json(review);
});

export const getCurrentCycle = asyncHandler(async (req, res) => {
  if (!req.user.cycleTrackingEnabled) {
    return res.json({ enabled: false });
  }

  const record = await CycleRecord.findOne({ user: req.user.id }).sort({ periodStart: -1 });
  if (!record) {
    return res.json({ enabled: true, record: null, current: null, suggestions: [] });
  }

  const current = estimateCycle(record);
  return res.json({ enabled: true, record, current, suggestions: PHASE_SUGGESTIONS[current.phase] || [] });
});
