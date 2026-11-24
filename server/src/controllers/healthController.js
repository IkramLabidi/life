import { Meal, WaterLog, Measurement, Exercise } from '../models/Health.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { crudController } from '../utils/crud.js';
import { startOfDay, endOfDay, round2 } from '../utils/dates.js';

export const mealController = crudController(Meal, {
  sort: { date: 1, createdAt: 1 },
});

export const exerciseController = crudController(Exercise, {
  sort: { date: -1, createdAt: -1 },
});

/** Body measurement — BMI is derived from weight (kg) and height (cm). */
export const measurementController = crudController(Measurement, {
  sort: { date: -1 },
  buildData: (req) => {
    const weight = Number(req.body.weightKg);
    const height = Number(req.body.heightCm);
    if (weight > 0 && height > 0) {
      return { bmi: round2(weight / (height / 100) ** 2) };
    }
    return {};
  },
});

/** GET water logs — by single date (?date=) or a range (?from=&to=). */
export const listWater = asyncHandler(async (req, res) => {
  const { date, from, to } = req.query;

  if (date) {
    const day = startOfDay(date);
    const log = await WaterLog.findOne({ user: req.user.id, date: day });
    return res.json(log || { date: day, amount: 0, goal: 2000, empty: true });
  }

  const filter = { user: req.user.id };
  if (from || to) {
    filter.date = {};
    if (from) filter.date.$gte = startOfDay(from);
    if (to) filter.date.$lte = endOfDay(to);
  }

  const logs = await WaterLog.find(filter).sort({ date: 1 });
  return res.json(logs);
});

/** Upsert today's (or a given) water log. Supports `add` for quick-add buttons. */
export const upsertWater = asyncHandler(async (req, res) => {
  const day = startOfDay(req.body.date || new Date());
  const { amount, goal, add } = req.body;

  let log = await WaterLog.findOne({ user: req.user.id, date: day });

  if (log) {
    if (add !== undefined) log.amount = Math.max(0, log.amount + Number(add));
    else if (amount !== undefined) log.amount = Math.max(0, Number(amount));
    if (goal !== undefined) log.goal = Math.max(0, Number(goal));
    await log.save();
  } else {
    log = await WaterLog.create({
      user: req.user.id,
      date: day,
      amount: Math.max(0, Number(amount ?? add ?? 0)),
      goal: Math.max(0, Number(goal ?? 2000)),
    });
  }

  res.json(log);
});

export const deleteWater = asyncHandler(async (req, res) => {
  const log = await WaterLog.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!log) {
    res.status(404);
    throw new Error('Water log not found');
  }
  res.json({ message: 'Deleted successfully', id: req.params.id });
});
