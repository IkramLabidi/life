export const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found: ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Server error';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid identifier supplied';
  }

  if (err.code === 11000) {
    status = 400;
    const field = Object.keys(err.keyValue || { field: '' })[0];
    message = `Duplicate value for ${field}`;
  }

  if (process.env.NODE_ENV !== 'production' && status >= 500) {
    console.error(err);
  }

  res.status(status).json({ message });
};

export default errorHandler;
