import mongoose from 'mongoose';
import { EVENT_CATEGORIES } from '../utils/constants.js';

const eventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, trim: true, default: '' },
    date: { type: Date, required: true, index: true },
    startTime: { type: String, default: '' },
    endTime: { type: String, default: '' },
    category: { type: String, enum: EVENT_CATEGORIES, default: 'Personal' },
    reminder: { type: Boolean, default: false },
    // 'manual' events are user-created; 'study'/'task' events are synced from other modules
    source: { type: String, enum: ['manual', 'study', 'task'], default: 'manual' },
    sourceRef: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

export const Event = mongoose.model('Event', eventSchema);

export default Event;
