/**
 * Event Controller
 * Handles intent event ingestion and retrieval
 */

import type { FastifyRequest, FastifyReply } from 'fastify';
import { eventService } from './event_service.js';
import type { IngestEventRequest, BatchIngestRequest } from '@privatevault/shared';

export const eventController = {
  async ingest(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as IngestEventRequest;
    const user = request.user as any;

    try {
      const result = await eventService.ingestEvent({
        event: body.event,
        payload: body.payload,
        userId: user.id,
      });

      return reply.send(result);
    } catch (error) {
      return reply.status(400).send({
        error: (error as Error).message,
        code: 'INGEST_FAILED',
      });
    }
  },

  async batchIngest(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as BatchIngestRequest;
    const user = request.user as any;

    try {
      const results = await eventService.batchIngestEvents({
        events: body.events,
        userId: user.id,
      });

      return reply.send({ results });
    } catch (error) {
      return reply.status(400).send({
        error: (error as Error).message,
        code: 'BATCH_INGEST_FAILED',
      });
    }
  },

  async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const user = request.user as any;

    try {
      const event = await eventService.getEventById(id, user.id);

      if (!event) {
        return reply.status(404).send({
          error: 'Event not found',
          code: 'EVENT_NOT_FOUND',
        });
      }

      return reply.send(event);
    } catch (error) {
      return reply.status(500).send({
        error: (error as Error).message,
        code: 'GET_EVENT_FAILED',
      });
    }
  },

  async list(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user as any;
    const query = request.query as any;

    try {
      const events = await eventService.listEvents({
        userId: user.id,
        limit: parseInt(query.limit || '50', 10),
        offset: parseInt(query.offset || '0', 10),
      });

      return reply.send(events);
    } catch (error) {
      return reply.status(500).send({
        error: (error as Error).message,
        code: 'LIST_EVENTS_FAILED',
      });
    }
  },

  // ----- DEV VIEWS (no auth) -----
  async listDev(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as any;

    const events = await eventService.listAllEvents({
      limit: parseInt(query.limit || '50', 10),
      offset: parseInt(query.offset || '0', 10),
    });

    return reply.send(events);
  },

  async getByIdDev(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };

    const event = await eventService.getAnyEventById(id);
    if (!event) return reply.status(404).send({ error: 'Event not found' });

    return reply.send(event);
  }
};
