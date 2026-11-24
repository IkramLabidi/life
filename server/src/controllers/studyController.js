import { Subject, StudyTask, StudySession, Deadline } from '../models/Study.js';
import { Event } from '../models/Calendar.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { crudController } from '../utils/crud.js';

export const subjectController = crudController(Subject, { sort: { name: 1 } });

export const studyTaskController = crudController(StudyTask, {
  sort: { completed: 1, deadline: 1, createdAt: -1 },
});

export const studySessionController = crudController(StudySession, {
  sort: { date: -1, createdAt: -1 },
});

export const listDeadlines = asyncHandler(async (req, res) => {
  const deadlines = await Deadline.find({ user: req.user.id })
    .populate('subject', 'name color code')
    .sort({ dueDate: 1 });
  res.json(deadlines);
});

/**
 * Academic deadlines are linked to a calendar event so they appear on the
 * calendar automatically. The link (linkedEvent) prevents duplicate events.
 */
export const createDeadline = asyncHandler(async (req, res) => {
  const deadline = await Deadline.create({ ...req.body, user: req.user.id });

  const event = await Event.create({
    user: req.user.id,
    title: deadline.title,
    description: deadline.description,
    date: deadline.dueDate,
    category: 'Academic',
    source: 'study',
    sourceRef: deadline._id,
  });

  deadline.linkedEvent = event._id;
  await deadline.save();
  await deadline.populate('subject', 'name color code');

  res.status(201).json(deadline);
});

export const updateDeadline = asyncHandler(async (req, res) => {
  const deadline = await Deadline.findOne({ _id: req.params.id, user: req.user.id });
  if (!deadline) {
    res.status(404);
    throw new Error('Deadline not found');
  }

  ['title', 'description', 'type', 'dueDate', 'subject'].forEach((field) => {
    if (req.body[field] !== undefined) deadline[field] = req.body[field];
  });
  await deadline.save();

  const eventData = {
    title: deadline.title,
    description: deadline.description,
    date: deadline.dueDate,
  };

  if (deadline.linkedEvent) {
    await Event.findOneAndUpdate(
      { _id: deadline.linkedEvent, user: req.user.id },
      eventData,
      { new: true }
    );
  } else {
    const event = await Event.create({
      user: req.user.id,
      ...eventData,
      category: 'Academic',
      source: 'study',
      sourceRef: deadline._id,
    });
    deadline.linkedEvent = event._id;
    await deadline.save();
  }

  await deadline.populate('subject', 'name color code');
  res.json(deadline);
});

export const deleteDeadline = asyncHandler(async (req, res) => {
  const deadline = await Deadline.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!deadline) {
    res.status(404);
    throw new Error('Deadline not found');
  }

  if (deadline.linkedEvent) {
    await Event.deleteOne({ _id: deadline.linkedEvent, user: req.user.id });
  }

  res.json({ message: 'Deleted successfully', id: req.params.id });
});
