import { Transaction, Saving } from '../models/Finance.js';
import { Task, CycleRecord } from '../models/Planner.js';
import { WaterLog, Exercise } from '../models/Health.js';
import { StudySession, Deadline } from '../models/Study.js';
import { Event } from '../models/Calendar.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { startOfDay, endOfDay, startOfWeek, addDays, round2, sumBy } from '../utils/dates.js';
import { estimateCycle } from '../utils/cycle.js';

export const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfWeek(now);
  const weekEnd = endOfDay(addDays(weekStart, 6));
  const upcomingEnd = endOfDay(addDays(now, 30));

  const [
    transactions,
    savings,
    todayTasks,
    weekTasks,
    upcomingDeadlines,
    todayWater,
    upcomingEvents,
    weekSessions,
    weekExercises,
    latestCycle,
    overdueTasks,
  ] = await Promise.all([
    Transaction.find({ user: userId }),
    Saving.find({ user: userId }),
    Task.find({ user: userId, date: { $gte: todayStart, $lte: todayEnd } }).sort({ time: 1 }),
    Task.find({ user: userId, date: { $gte: weekStart, $lte: weekEnd } }),
    Deadline.find({ user: userId, dueDate: { $gte: todayStart, $lte: upcomingEnd } })
      .populate('subject', 'name color')
      .sort({ dueDate: 1 })
      .limit(6),
    WaterLog.findOne({ user: userId, date: todayStart }),
    Event.find({ user: userId, date: { $gte: todayStart, $lte: upcomingEnd } })
      .sort({ date: 1, startTime: 1 })
      .limit(6),
    StudySession.find({ user: userId, date: { $gte: weekStart, $lte: weekEnd } }),
    Exercise.find({ user: userId, date: { $gte: weekStart, $lte: weekEnd } }),
    CycleRecord.findOne({ user: userId }).sort({ periodStart: -1 }),
    Task.find({ user: userId, completed: false, date: { $lt: todayStart } }).sort({ date: 1 }).limit(6),
  ]);

  const income = sumBy(transactions.filter((t) => t.type === 'income'), (t) => t.amount);
  const expenses = sumBy(transactions.filter((t) => t.type === 'expense'), (t) => t.amount);
  const deposits = sumBy(savings.filter((s) => s.type === 'deposit'), (s) => s.amount);
  const withdrawals = sumBy(savings.filter((s) => s.type === 'withdrawal'), (s) => s.amount);

  const weekTotal = weekTasks.length;
  const weekDone = weekTasks.filter((t) => t.completed).length;

  const studyMinutes = sumBy(weekSessions, (s) => s.durationMin);
  const exerciseMinutes = sumBy(weekExercises, (e) => e.durationMin);
  const waterAmount = todayWater?.amount || 0;
  const waterGoal = todayWater?.goal || 2000;

  res.json({
    finance: {
      bankBalance: round2(income - expenses),
      piggyBalance: round2(deposits - withdrawals),
    },
    tasks: {
      today: todayTasks,
      weekTotal,
      weekDone,
      completion: weekTotal ? Math.round((weekDone / weekTotal) * 100) : 0,
      overdue: overdueTasks,
    },
    deadlines: upcomingDeadlines,
    hydration: {
      amount: waterAmount,
      goal: waterGoal,
      percent: waterGoal ? Math.round((waterAmount / waterGoal) * 100) : 0,
    },
    events: upcomingEvents,
    study: {
      minutes: studyMinutes,
      hours: round2(studyMinutes / 60),
      sessions: weekSessions.length,
    },
    exercise: {
      minutes: exerciseMinutes,
      sessions: weekExercises.length,
      completed: weekExercises.filter((e) => e.completed).length,
    },
    cycle: req.user.cycleTrackingEnabled && latestCycle ? estimateCycle(latestCycle) : null,
  });
});
