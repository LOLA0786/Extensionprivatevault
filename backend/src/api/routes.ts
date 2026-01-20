import type { FastifyInstance } from 'fastify';
import { authMiddleware } from './middleware/auth.js';
import { eventController } from '../modules/events/event_controller.js';

export async function registerRoutes(app: FastifyInstance) {
  app.get('/v1/ping', async () => ({ ok: true }));

  // DEV endpoints (no auth) - demo/debug only
  app.get('/v1/dev/events', eventController.listDev);
  app.get('/v1/dev/events/:id', eventController.getByIdDev);

  // Events (auth)
  app.post('/v1/events/ingest', { preHandler: [authMiddleware] }, eventController.ingest);
  app.post('/v1/events/batch', { preHandler: [authMiddleware] }, eventController.batchIngest);
  app.get('/v1/events/:id', { preHandler: [authMiddleware] }, eventController.getById);
  app.get('/v1/events', { preHandler: [authMiddleware] }, eventController.list);
}
