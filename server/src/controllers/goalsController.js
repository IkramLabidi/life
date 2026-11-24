import { Goal, JournalEntry } from '../models/Goals.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { crudController } from '../utils/crud.js';
import { startOfDay } from '../utils/dates.js';

export const goalController = crudController(Goal, {
  sort: { completed: 1, createdAt: -1 },
});

/** Journal entries are unique per day — creating one upserts that day's entry. */
const journalBase = crudController(JournalEntry, { sort: { date: -1 } });

export const journalController = {
  ...journalBase,
  create: asyncHandler(async (req, res) => {
    const date = startOfDay(req.body.date || new Date());
    const { reflections = '', achievements = '', mood = 'okay', notes = '' } = req.body;

    const entry = await JournalEntry.findOneAndUpdate(
      { user: req.user.id, date },
      { user: req.user.id, date, reflections, achievements, mood, notes },
      { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
    );

    res.status(201).json(entry);
  }),
};
