import mongoose from 'mongoose';
import { GOAL_CATEGORIES, GOAL_PERIODS, MOODS } from '../utils/constants.js';

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, trim: true, default: '' },
    category: { type: String, enum: GOAL_CATEGORIES, default: 'personal' },
    period: { type: String, enum: GOAL_PERIODS, default: 'monthly' },
    targetDate: { type: Date },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const journalEntrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    reflections: { type: String, trim: true, default: '' },
    achievements: { type: String, trim: true, default: '' },
    mood: { type: String, enum: MOODS, default: 'okay' },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);
journalEntrySchema.index({ user: 1, date: 1 }, { unique: true });

export const Goal = mongoose.model('Goal', goalSchema);
export const JournalEntry = mongoose.model('JournalEntry', journalEntrySchema);

export default { Goal, JournalEntry };
