import { Router } from 'express';

/** Standard REST router for a crudController-built resource. */
export const resourceRouter = (controller) => {
  const router = Router();
  router.route('/').get(controller.list).post(controller.create);
  router.route('/:id').get(controller.getOne).put(controller.update).delete(controller.remove);
  return router;
};

export default resourceRouter;
