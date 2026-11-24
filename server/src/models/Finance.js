import mongoose from 'mongoose';
import { EXPENSE_CATEGORIES } from '../utils/constants.js';

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    amount: { type: Number, required: true, min: [0, 'Amount must be positive'] },
    date: { type: Date, required: true, index: true },
    category: { type: String, enum: [...EXPENSE_CATEGORIES, 'income'], default: 'other' },
    source: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

const savingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['deposit', 'withdrawal'], required: true },
    amount: { type: Number, required: true, min: [0, 'Amount must be positive'] },
    date: { type: Date, required: true, index: true },
    description: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model('Transaction', transactionSchema);
export const Saving = mongoose.model('Saving', savingSchema);

export default { Transaction, Saving };
