import { Event } from '../models/Calendar.js';
import { Deadline } from '../models/Study.js';
import { Task } from '../models/Planner.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { crudController } from '../utils/crud.js';
import { startOfDay, endOfDay, addDays } from '../utils/dates.js';

export const eventController = crudController(Event, {
  sort: { date: 1, startTime: 1 },
});

/**
 * Merged calendar feed: manual events + study deadlines + planner tasks.
 * Study deadlines already have a linked event, so they are only added separately
 * when no linked event exists — this prevents duplicates.
 */
export const getCalendarRange = asyncHandler(async (req, res) => {
  const from = req.query.from ? startOfDay(req.query.from) : startOfDay(new Date());
  const to = req.query.to ? endOfDay(req.query.to) : endOfDay(addDays(from, 30));
  const userId = req.user.id;

  const [events, deadlines, tasks] = await Promise.all([
    Event.find({ user: userId, date: { $gte: from, $lte: to } }),
    Deadline.find({ user: userId, dueDate: { $gte: from, $lte: to } }),
    Task.find({ user: userId, date: { $gte: from, $lte: to } }),
  ]);

  const linkedRefs = new Set(
    events.filter((e) => e.sourceRef).map((e) => String(e.sourceRef))
  );

  const items = [
    ...events.map((e) => ({
      _id: e._id,
      refId: e._id,
      title: e.title,
      description: e.description,
      date: e.date,
      startTime: e.startTime,
      endTime: e.endTime,
      category: e.category,
      type: 'event',
      source: e.source,
      reminder: e.reminder,
    })),
    ...deadlines
      .filter((d) => !linkedRefs.has(String(d._id)))
      .map((d) => ({
        _id: d._id,
        refId: d._id,
        title: d.title,
        description: d.description,
        date: d.dueDate,
        startTime: '',
        endTime: '',
        category: 'Academic',
        type: 'deadline',
        source: 'study',
      })),
    ...tasks.map((t) => ({
      _id: t._id,
      refId: t._id,
      title: t.title,
      description: t.description,
      date: t.date,
      startTime: t.time,
      endTime: '',
      category: 'Personal',
      type: 'task',
      source: 'task',
      priority: t.priority,
      role: t.role,
      completed: t.completed,
    })),
  ];

  res.json({ items, range: { from, to } });
});
