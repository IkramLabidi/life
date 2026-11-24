import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signToken } from '../middleware/auth.js';
import { populateUserData } from '../seed.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }
  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters long');
  }

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({ name, email, password, cycleTrackingEnabled: true });

  // Give new accounts the full sample dataset so the app is immediately usable.
  await populateUserData(user._id);

  res.status(201).json({ token: signToken(user._id), user });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json({ token: signToken(user._id), user });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

export const updatePreferences = asyncHandler(async (req, res) => {
  const allowed = ['name', 'currency', 'cycleTrackingEnabled'];
  allowed.forEach((field) => {
    if (req.body[field] !== undefined) req.user[field] = req.body[field];
  });

  if (req.body.password) {
    if (String(req.body.password).length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters long');
    }
    req.user.password = req.body.password;
  }

  await req.user.save();
  res.json({ user: req.user });
});
