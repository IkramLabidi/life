import mongoose from 'mongoose';
import { TASK_PRIORITIES, TASK_STATUSES, LIFE_ROLES } from '../utils/constants.js';

const taskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, trim: true, default: '' },
    date: { type: Date, required: true, index: true },
    time: { type: String, default: '' },
    priority: { type: String, enum: TASK_PRIORITIES, default: 'Q2' },
    status: { type: String, enum: TASK_STATUSES, default: 'todo' },
    role: { type: String, enum: LIFE_ROLES, default: 'Personal Life' },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const weeklyGoalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, trim: true, default: '' },
    weekStart: { type: Date, required: true, index: true },
    role: { type: String, enum: LIFE_ROLES, default: 'Personal Life' },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const weeklyReviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    weekStart: { type: Date, required: true },
    wins: { type: String, trim: true, default: '' },
    challenges: { type: String, trim: true, default: '' },
    rating: { type: Number, min: 1, max: 5, default: 3 },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);
weeklyReviewSchema.index({ user: 1, weekStart: 1 }, { unique: true });

const cycleRecordSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    periodStart: { type: Date, required: true, index: true },
    cycleLength: { type: Number, default: 28, min: 15, max: 60 },
    periodDuration: { type: Number, default: 5, min: 1, max: 14 },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

export const Task = mongoose.model('Task', taskSchema);
export const WeeklyGoal = mongoose.model('WeeklyGoal', weeklyGoalSchema);
export const WeeklyReview = mongoose.model('WeeklyReview', weeklyReviewSchema);
export const CycleRecord = mongoose.model('CycleRecord', cycleRecordSchema);

export default { Task, WeeklyGoal, WeeklyReview, CycleRecord };
