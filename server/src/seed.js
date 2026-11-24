import 'dotenv/config';
import mongoose from 'mongoose';
import { pathToFileURL } from 'url';
import User from './models/User.js';
import { Transaction, Saving } from './models/Finance.js';
import { Task, WeeklyGoal, WeeklyReview, CycleRecord } from './models/Planner.js';
import { Meal, WaterLog, Measurement, Exercise } from './models/Health.js';
import { Subject, StudyTask, StudySession, Deadline } from './models/Study.js';
import { Event } from './models/Calendar.js';
import { Goal, JournalEntry } from './models/Goals.js';
import { startOfDay, startOfWeek, addDays } from './utils/dates.js';

const DEMO_EMAIL = 'demo@lifeos.app';
const DEMO_PASSWORD = 'demo1234';

const clearUserData = async (userId) => {
  await Promise.all([
    Transaction.deleteMany({ user: userId }),
    Saving.deleteMany({ user: userId }),
    Task.deleteMany({ user: userId }),
    WeeklyGoal.deleteMany({ user: userId }),
    WeeklyReview.deleteMany({ user: userId }),
    CycleRecord.deleteMany({ user: userId }),
    Meal.deleteMany({ user: userId }),
    WaterLog.deleteMany({ user: userId }),
    Measurement.deleteMany({ user: userId }),
    Exercise.deleteMany({ user: userId }),
    Subject.deleteMany({ user: userId }),
    StudyTask.deleteMany({ user: userId }),
    StudySession.deleteMany({ user: userId }),
    Deadline.deleteMany({ user: userId }),
    Event.deleteMany({ user: userId }),
    Goal.deleteMany({ user: userId }),
    JournalEntry.deleteMany({ user: userId }),
  ]);
};

/**
 * Create the full set of realistic sample records for a given user.
 * Assumes an active mongoose connection. Replaces any existing records for this
 * user, so it is safe to call on a brand-new account.
 */
export const populateUserData = async (userId) => {
  const today = startOfDay(new Date());
  const weekStart = startOfWeek(today);
  const day = (offset) => addDays(today, offset);
  const at = (base, hour, minute = 0) => {
    const d = new Date(base);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  await clearUserData(userId);
  const user_id = userId;

  // ---------- Finance ----------
  await Transaction.insertMany([
    { user: user_id, type: 'income', amount: 2400, date: at(addDays(today, -55), 9), category: 'income', source: 'Monthly salary', description: 'Part-time internship pay' },
    { user: user_id, type: 'income', amount: 2400, date: at(addDays(today, -25), 9), category: 'income', source: 'Monthly salary', description: 'Part-time internship pay' },
    { user: user_id, type: 'income', amount: 320, date: at(addDays(today, -18), 14), category: 'income', source: 'Freelance', description: 'Landing page project' },
    { user: user_id, type: 'income', amount: 2400, date: at(addDays(today, -3), 9), category: 'income', source: 'Monthly salary', description: 'Part-time internship pay' },
    { user: user_id, type: 'income', amount: 150, date: at(addDays(today, -1), 16), category: 'income', source: 'Scholarship', description: 'Merit stipend' },
    { user: user_id, type: 'expense', amount: 620, date: at(addDays(today, -24), 11), category: 'food', description: 'Groceries for the month' },
    { user: user_id, type: 'expense', amount: 180, date: at(addDays(today, -22), 8), category: 'transportation', description: 'Metro & bus pass' },
    { user: user_id, type: 'expense', amount: 240, date: at(addDays(today, -20), 13), category: 'education', description: 'Textbooks and course materials' },
    { user: user_id, type: 'expense', amount: 95, date: at(addDays(today, -14), 17), category: 'shopping', description: 'Winter jacket' },
    { user: user_id, type: 'expense', amount: 60, date: at(addDays(today, -12), 10), category: 'health', description: 'Dentist appointment' },
    { user: user_id, type: 'expense', amount: 45, date: at(addDays(today, -9), 20), category: 'entertainment', description: 'Cinema with friends' },
    { user: user_id, type: 'expense', amount: 210, date: at(addDays(today, -6), 11), category: 'food', description: 'Weekly groceries' },
    { user: user_id, type: 'expense', amount: 130, date: at(addDays(today, -4), 9), category: 'transportation', description: 'Fuel' },
    { user: user_id, type: 'expense', amount: 75, date: at(addDays(today, -2), 18), category: 'shopping', description: 'Running shoes' },
    { user: user_id, type: 'expense', amount: 40, date: at(today, 12), category: 'food', description: 'Lunch out' },
    { user: user_id, type: 'expense', amount: 25, date: at(today, 15), category: 'other', description: 'Stationery' },
  ]);

  await Saving.insertMany([
    { user: user_id, type: 'deposit', amount: 300, date: at(addDays(today, -40), 12), description: 'Monthly savings transfer' },
    { user: user_id, type: 'deposit', amount: 200, date: at(addDays(today, -20), 12), description: 'Savings transfer' },
    { user: user_id, type: 'withdrawal', amount: 80, date: at(addDays(today, -10), 12), description: 'Emergency phone repair' },
    { user: user_id, type: 'deposit', amount: 250, date: at(addDays(today, -2), 12), description: 'Savings transfer' },
  ]);

  // ---------- Planner ----------
  await Task.insertMany([
    { user: user_id, title: 'Finish algorithms assignment', description: 'Complete the graph traversal exercises', date: at(weekStart, 10), time: '10:00', priority: 'Q1', status: 'in-progress', role: 'Student', completed: false },
    { user: user_id, title: 'Gym session', description: 'Upper body strength', date: at(weekStart, 18), time: '18:00', priority: 'Q2', status: 'todo', role: 'Health', completed: false },
    { user: user_id, title: 'Team meeting sync', description: 'Weekly project stand-up', date: at(addDays(weekStart, 1), 9), time: '09:30', priority: 'Q1', status: 'todo', role: 'Student', completed: false },
    { user: user_id, title: 'Read 30 pages', description: 'Deep Work by Cal Newport', date: at(addDays(weekStart, 2), 21), time: '21:00', priority: 'Q2', status: 'todo', role: 'Personal Development', completed: false },
    { user: user_id, title: 'Reply to emails', description: 'Low-priority inbox clearing', date: at(addDays(weekStart, 3), 16), time: '16:00', priority: 'Q3', status: 'todo', role: 'Personal Life', completed: false },
    { user: user_id, title: 'Call grandparents', description: 'Weekly catch-up', date: at(addDays(weekStart, 4), 19), time: '19:00', priority: 'Q2', status: 'done', role: 'Family', completed: true },
    { user: user_id, title: 'Binge a series', description: 'Relaxation time', date: at(addDays(weekStart, 5), 20), time: '20:00', priority: 'Q4', status: 'todo', role: 'Personal Life', completed: false },
    { user: user_id, title: 'Meal prep for the week', description: 'Cook and portion lunches', date: at(addDays(weekStart, 6), 11), time: '11:00', priority: 'Q2', status: 'todo', role: 'Health', completed: false },
    { user: user_id, title: 'Review lecture notes', description: 'Statistics chapter 4', date: at(day(1), 17), time: '17:00', priority: 'Q2', status: 'todo', role: 'Student', completed: false },
  ]);

  await WeeklyGoal.insertMany([
    { user: user_id, title: 'Submit all assignments on time', description: 'No late submissions this week', weekStart, role: 'Student', completed: false },
    { user: user_id, title: 'Exercise 4 times', description: 'Mix of cardio and strength', weekStart, role: 'Health', completed: false },
    { user: user_id, title: 'Spend quality time with family', description: 'At least two evenings', weekStart, role: 'Family', completed: true },
  ]);

  await WeeklyReview.create({
    user: user_id,
    weekStart,
    wins: 'Stuck to my study schedule and finished the algorithms milestones early.',
    challenges: 'Slept late a few nights which hurt morning focus.',
    rating: 4,
    notes: 'Next week: protect a consistent sleep window.',
  });

  await CycleRecord.create({
    user: user_id,
    periodStart: addDays(today, -10),
    cycleLength: 28,
    periodDuration: 5,
    notes: 'Regular cycle. Mild cramps on day 1.',
  });

  // ---------- Health ----------
  const mealPlan = [];
  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].forEach((_, i) => {
    const d = at(addDays(weekStart, i), 8);
    mealPlan.push(
      { user: user_id, date: d, mealType: 'breakfast', name: 'Oatmeal with berries', ingredients: 'Oats, milk, blueberries', notes: '', consumed: i <= 2 },
      { user: user_id, date: at(addDays(weekStart, i), 13), mealType: 'lunch', name: 'Chicken and rice bowl', ingredients: 'Chicken, rice, veggies', notes: 'Meal prep', consumed: i <= 2 },
      { user: user_id, date: at(addDays(weekStart, i), 19), mealType: 'dinner', name: 'Grilled salmon & salad', ingredients: 'Salmon, greens, olive oil', notes: '', consumed: i <= 1 },
      { user: user_id, date: at(addDays(weekStart, i), 16), mealType: 'snack', name: 'Greek yogurt & nuts', ingredients: 'Yogurt, almonds', notes: '', consumed: false }
    );
  });
  await Meal.insertMany(mealPlan);

  await WaterLog.insertMany(
    [0, 1, 2, 3, 4, 5, 6].map((i) => ({
      user: user_id,
      date: at(addDays(weekStart, i), 0),
      amount: [1800, 2200, 1500, 2000, 2400, 1700, 900][i],
      goal: 2000,
    }))
  );

  await Measurement.insertMany([
    { user: user_id, date: at(addDays(today, -120), 8), weightKg: 72.5, heightCm: 174, bmi: 23.94, notes: 'Start of tracking' },
    { user: user_id, date: at(addDays(today, -90), 8), weightKg: 71.8, heightCm: 174, bmi: 23.71, notes: '' },
    { user: user_id, date: at(addDays(today, -60), 8), weightKg: 70.9, heightCm: 174, bmi: 23.41, notes: '' },
    { user: user_id, date: at(addDays(today, -30), 8), weightKg: 70.2, heightCm: 174, bmi: 23.18, notes: 'Feeling stronger' },
    { user: user_id, date: at(addDays(today, -2), 8), weightKg: 69.6, heightCm: 174, bmi: 22.99, notes: '' },
  ]);

  await Exercise.insertMany([
    { user: user_id, date: at(weekStart, 7), type: 'Running', durationMin: 30, notes: '5 km easy pace', completed: true },
    { user: user_id, date: at(addDays(weekStart, 1), 18), type: 'Strength', durationMin: 45, notes: 'Upper body', completed: true },
    { user: user_id, date: at(addDays(weekStart, 3), 7), type: 'Yoga', durationMin: 25, notes: 'Mobility flow', completed: false },
    { user: user_id, date: at(addDays(weekStart, 5), 9), type: 'Cycling', durationMin: 60, notes: 'Weekend ride', completed: false },
  ]);

  // ---------- Study ----------
  const [algorithms, statistics, databases] = await Subject.insertMany([
    { user: user_id, name: 'Algorithms', code: 'CS201', instructor: 'Dr. Haddad', color: '#B4623A' },
    { user: user_id, name: 'Statistics', code: 'MA110', instructor: 'Prof. Nouri', color: '#7A8450' },
    { user: user_id, name: 'Databases', code: 'CS230', instructor: 'Dr. Ben Ali', color: '#C08A3E' },
  ]);

  await StudyTask.insertMany([
    { user: user_id, subject: algorithms._id, title: 'Graph traversal exercises', description: 'BFS & DFS problems 1-8', priority: 'high', deadline: addDays(today, 3), status: 'in-progress', completed: false },
    { user: user_id, subject: statistics._id, title: 'Problem set 4', description: 'Hypothesis testing', priority: 'medium', deadline: addDays(today, 6), status: 'todo', completed: false },
    { user: user_id, subject: databases._id, title: 'Normalization notes', description: 'Read chapter 6 and summarize', priority: 'low', deadline: addDays(today, -2), status: 'todo', completed: false },
    { user: user_id, subject: algorithms._id, title: 'Review complexity analysis', description: 'Big-O recap', priority: 'medium', deadline: addDays(today, -5), status: 'done', completed: true },
  ]);

  await StudySession.insertMany([
    { user: user_id, subject: algorithms._id, date: at(addDays(weekStart, 0), 14), startTime: '14:00', durationMin: 90, objectives: 'Complete BFS problems', notes: 'Good focus' },
    { user: user_id, subject: statistics._id, date: at(addDays(weekStart, 1), 15), startTime: '15:00', durationMin: 60, objectives: 'Practice hypothesis tests', notes: '' },
    { user: user_id, subject: databases._id, date: at(addDays(weekStart, 3), 10), startTime: '10:00', durationMin: 75, objectives: 'Read normalization chapter', notes: 'Took notes' },
    { user: user_id, subject: algorithms._id, date: at(addDays(weekStart, 4), 16), startTime: '16:00', durationMin: 45, objectives: 'Review Dijkstra', notes: '' },
  ]);

  const deadlineSeeds = [
    { subject: algorithms._id, title: 'Algorithms midterm exam', type: 'exam', dueDate: at(addDays(today, 5), 9), description: 'Covers graphs and complexity' },
    { subject: statistics._id, title: 'Statistics project report', type: 'project', dueDate: at(addDays(today, 12), 23), description: 'Submit PDF via the portal' },
    { subject: databases._id, title: 'Database design assignment', type: 'assignment', dueDate: at(addDays(today, 2), 23), description: 'ER diagram + SQL scripts' },
  ];

  for (const seedDeadline of deadlineSeeds) {
    const deadline = await Deadline.create({ user: user_id, ...seedDeadline });
    const event = await Event.create({
      user: user_id,
      title: deadline.title,
      description: deadline.description,
      date: deadline.dueDate,
      category: 'Academic',
      source: 'study',
      sourceRef: deadline._id,
    });
    deadline.linkedEvent = event._id;
    await deadline.save();
  }

  // ---------- Calendar ----------
  await Event.insertMany([
    { user: user_id, title: 'Study group session', description: 'Algorithms practice', date: at(addDays(today, 1), 17), startTime: '17:00', endTime: '19:00', category: 'Academic' },
    { user: user_id, title: 'Dentist appointment', description: 'Routine check-up', date: at(addDays(today, 3), 10), startTime: '10:00', endTime: '11:00', category: 'Health', reminder: true },
    { user: user_id, title: 'Pay rent', description: 'Monthly rent transfer', date: at(addDays(today, 4), 9), startTime: '09:00', endTime: '', category: 'Financial' },
    { user: user_id, title: 'Friends dinner', description: 'Downtown restaurant', date: at(addDays(today, 6), 20), startTime: '20:00', endTime: '22:30', category: 'Personal' },
    { user: user_id, title: 'Doctor follow-up', description: 'Check blood test results', date: at(addDays(today, 9), 11), startTime: '11:00', endTime: '11:30', category: 'Health' },
  ]);

  // ---------- Goals & Journal ----------
  await Goal.insertMany([
    { user: user_id, title: 'Save 1500 for emergency fund', description: 'Build a safety net', category: 'finance', period: 'yearly', targetDate: addDays(today, 180), progress: 55, completed: false },
    { user: user_id, title: 'Pass all first-semester exams', description: 'Target above 80% average', category: 'education', period: 'yearly', targetDate: addDays(today, 120), progress: 40, completed: false },
    { user: user_id, title: 'Exercise 3x per week', description: 'Consistent training habit', category: 'health', period: 'monthly', targetDate: addDays(today, 20), progress: 65, completed: false },
    { user: user_id, title: 'Read 2 books this month', description: 'Personal growth reading', category: 'personal', period: 'monthly', targetDate: addDays(today, 15), progress: 100, completed: true },
  ]);

  await JournalEntry.insertMany([
    { user: user_id, date: at(addDays(today, -2), 0), reflections: 'Balanced study and rest well today.', achievements: 'Finished the graph exercises.', mood: 'good', notes: 'Sleep earlier tomorrow.' },
    { user: user_id, date: at(addDays(today, -1), 0), reflections: 'A bit tired but productive.', achievements: 'Cleared two assignments.', mood: 'okay', notes: 'Need a break this weekend.' },
    { user: user_id, date: at(today, 0), reflections: 'Great start to the day, energized.', achievements: 'Morning workout and study session.', mood: 'great', notes: 'Keep the momentum.' },
  ]);

  return userId;
};

/**
 * Create the demo account (demo@lifeos.app / demo1234) and populate it with the
 * full sample dataset. Safe to call on an empty database.
 */
export const seedDatabase = async () => {
  let user = await User.findOne({ email: DEMO_EMAIL });
  if (!user) {
    user = await User.create({
      name: 'Demo User',
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      cycleTrackingEnabled: true,
    });
  } else {
    user.name = 'Demo User';
    user.cycleTrackingEnabled = true;
    await user.save();
  }

  await populateUserData(user._id);

  console.log('🌱 Seed complete.');
  console.log(`   Demo account → email: ${DEMO_EMAIL}  password: ${DEMO_PASSWORD}`);

  return user;
};

/* Run as a standalone script (`npm run seed`) when executed directly. */
const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  const { connectDB, disconnectDB } = await import('./config/db.js');
  try {
    await connectDB();
    await seedDatabase();
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    await mongoose.connection.close().catch(() => {});
    process.exit(1);
  }
}
