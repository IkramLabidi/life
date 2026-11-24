import { asyncHandler } from './asyncHandler.js';

/**
 * Build a standard set of REST handlers for a user-scoped Mongoose model.
 *
 * Options:
 * - sort:        default sort object for list queries
 * - buildFilter: (req) => extra filter merged with { user }
 * - buildData:   (req, mode) => extra/derived fields to merge on create/update
 */
export const crudController = (Model, options = {}) => {
  const { sort = { createdAt: -1 }, buildFilter, buildData } = options;

  return {
    list: asyncHandler(async (req, res) => {
      const filter = { user: req.user.id, ...(buildFilter ? buildFilter(req) : {}) };
      const docs = await Model.find(filter).sort(sort);
      res.json(docs);
    }),

    getOne: asyncHandler(async (req, res) => {
      const doc = await Model.findOne({ _id: req.params.id, user: req.user.id });
      if (!doc) {
        res.status(404);
        throw new Error('Resource not found');
      }
      res.json(doc);
    }),

    create: asyncHandler(async (req, res) => {
      const data = { ...req.body, user: req.user.id };
      if (buildData) Object.assign(data, buildData(req, 'create'));
      const doc = await Model.create(data);
      res.status(201).json(doc);
    }),

    update: asyncHandler(async (req, res) => {
      const data = { ...req.body };
      delete data.user;
      delete data._id;
      if (buildData) Object.assign(data, buildData(req, 'update'));

      const doc = await Model.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id },
        data,
        { new: true, runValidators: true }
      );
      if (!doc) {
        res.status(404);
        throw new Error('Resource not found');
      }
      res.json(doc);
    }),

    remove: asyncHandler(async (req, res) => {
      const doc = await Model.findOneAndDelete({ _id: req.params.id, user: req.user.id });
      if (!doc) {
        res.status(404);
        throw new Error('Resource not found');
      }
      res.json({ message: 'Deleted successfully', id: req.params.id });
    }),
  };
};

export default crudController;
