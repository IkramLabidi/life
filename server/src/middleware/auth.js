import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const JWT_SECRET = () => process.env.JWT_SECRET || 'lifeos_dev_secret';

export const signToken = (userId) =>
  jwt.sign({ id: userId }, JWT_SECRET(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });

/** Verify the bearer token and attach the user to the request. */
export const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }

  const token = header.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET());
  } catch (err) {
    res.status(401);
    throw new Error('Not authorized, token is invalid or expired');
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    res.status(401);
    throw new Error('Not authorized, user no longer exists');
  }

  req.user = user;
  next();
});

export default protect;
