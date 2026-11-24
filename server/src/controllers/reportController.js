import { Transaction, Saving } from '../models/Finance.js';
import { Task } from '../models/Planner.js';
import { WaterLog, Exercise } from '../models/Health.js';
import { StudySession, Deadline } from '../models/Study.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { monthKey, monthRange, round2, sumBy } from '../utils/dates.js';

export const getMonthlyReport = asyncHandler(async (req, res) => {
  const month = req.query.month || monthKey();
  const { start, end } = monthRange(month);
  const userId = req.user.id;

  const [transactions, savings, tasks, sessions, exercises, water, deadlines] = await Promise.all([
    Transaction.find({ user: userId, date: { $gte: start, $lte: end } }),
    Saving.find({ user: userId, date: { $gte: start, $lte: end } }),
    Task.find({ user: userId, date: { $gte: start, $lte: end } }),
    StudySession.find({ user: userId, date: { $gte: start, $lte: end } }),
    Exercise.find({ user: userId, date: { $gte: start, $lte: end } }),
    WaterLog.find({ user: userId, date: { $gte: start, $lte: end } }),
    Deadline.find({ user: userId, dueDate: { $gte: start, $lte: end } }),
  ]);

  const income = sumBy(transactions.filter((t) => t.type === 'income'), (t) => t.amount);
  const expenses = sumBy(transactions.filter((t) => t.type === 'expense'), (t) => t.amount);
  const deposits = sumBy(savings.filter((s) => s.type === 'deposit'), (s) => s.amount);
  const withdrawals = sumBy(savings.filter((s) => s.type === 'withdrawal'), (s) => s.amount);

  const categoryMap = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

  const studyMinutes = sumBy(sessions, (s) => s.durationMin);
  const exerciseMinutes = sumBy(exercises, (e) => e.durationMin);
  const waterTotal = sumBy(water, (w) => w.amount);

  res.json({
    month,
    finance: {
      income: round2(income),
      expenses: round2(expenses),
      net: round2(income - expenses),
      deposits: round2(deposits),
      withdrawals: round2(withdrawals),
      savingsNet: round2(deposits - withdrawals),
      byCategory: Object.entries(categoryMap)
        .map(([category, total]) => ({ category, total: round2(total) }))
        .sort((a, b) => b.total - a.total),
    },
    tasks: {
      total: tasks.length,
      completed: tasks.filter((t) => t.completed).length,
      completion: tasks.length ? Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100) : 0,
    },
    study: {
      hours: round2(studyMinutes / 60),
      minutes: studyMinutes,
      sessions: sessions.length,
    },
    exercise: {
      minutes: exerciseMinutes,
      sessions: exercises.length,
      completed: exercises.filter((e) => e.completed).length,
    },
    hydration: {
      totalMl: waterTotal,
      daysLogged: water.length,
      avgPerDay: water.length ? Math.round(waterTotal / water.length) : 0,
    },
    deadlines: { total: deadlines.length },
  });
});
