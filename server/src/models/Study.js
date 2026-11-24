import mongoose from 'mongoose';
import { STUDY_PRIORITIES, TASK_STATUSES, DEADLINE_TYPES } from '../utils/constants.js';

const subjectSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: [true, 'Subject name is required'], trim: true },
    code: { type: String, trim: true, default: '' },
    instructor: { type: String, trim: true, default: '' },
    color: { type: String, default: '#B4623A' },
  },
  { timestamps: true }
);

const studyTaskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, trim: true, default: '' },
    priority: { type: String, enum: STUDY_PRIORITIES, default: 'medium' },
    deadline: { type: Date, index: true },
    status: { type: String, enum: TASK_STATUSES, default: 'todo' },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const studySessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
    date: { type: Date, required: true, index: true },
    startTime: { type: String, default: '' },
    durationMin: { type: Number, required: true, min: 1 },
    objectives: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

const deadlineSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: null },
    title: { type: String, required: [true, 'Title is required'], trim: true },
    type: { type: String, enum: DEADLINE_TYPES, default: 'assignment' },
    dueDate: { type: Date, required: true, index: true },
    description: { type: String, trim: true, default: '' },
    linkedEvent: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
  },
  { timestamps: true }
);

export const Subject = mongoose.model('Subject', subjectSchema);
export const StudyTask = mongoose.model('StudyTask', studyTaskSchema);
export const StudySession = mongoose.model('StudySession', studySessionSchema);
export const Deadline = mongoose.model('Deadline', deadlineSchema);

export default { Subject, StudyTask, StudySession, Deadline };
