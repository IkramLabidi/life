import mongoose from 'mongoose';
import { MEAL_TYPES } from '../utils/constants.js';

const mealSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    mealType: { type: String, enum: MEAL_TYPES, required: true },
    name: { type: String, required: [true, 'Meal name is required'], trim: true },
    ingredients: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, default: '' },
    consumed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const waterLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    amount: { type: Number, default: 0, min: 0 },
    goal: { type: Number, default: 2000, min: 0 },
  },
  { timestamps: true }
);
waterLogSchema.index({ user: 1, date: 1 }, { unique: true });

const measurementSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    weightKg: { type: Number, min: 0 },
    heightCm: { type: Number, min: 0 },
    bmi: { type: Number, min: 0 },
    notes: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

const exerciseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    date: { type: Date, required: true, index: true },
    type: { type: String, required: [true, 'Exercise type is required'], trim: true },
    durationMin: { type: Number, required: true, min: 1 },
    notes: { type: String, trim: true, default: '' },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Meal = mongoose.model('Meal', mealSchema);
export const WaterLog = mongoose.model('WaterLog', waterLogSchema);
export const Measurement = mongoose.model('Measurement', measurementSchema);
export const Exercise = mongoose.model('Exercise', exerciseSchema);

export default { Meal, WaterLog, Measurement, Exercise };
