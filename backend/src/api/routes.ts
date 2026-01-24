import type { FastifyInstance } from 'fastify';
import type { FastifyPluginAsync } from 'fastify';

/**
 * DATABASE PROTECTION MIDDLEWARE
 * Prevents destructive database operations from being executed
 */
function validateNoDatabaseDestruction(body: any): { safe: boolean; reason?: string } {
  const bodyStr = JSON.stringify(body || {}).toLowerCase();

  // Dangerous SQL keywords
  const dangerousPatterns = [
    /drop\s+database/i,
    /drop\s+table/i,
    /truncate\s+table/i,
    /delete\s+from.*where\s+1\s*=\s*1/i,
    /delete\s+from.*without.*where/i,
    /drop\s+if\s+exists/i,
    /alter\s+table.*drop/i,
    /exec.*drop/i,
    /execute.*drop/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(bodyStr)) {
      return { safe: false, reason: 'Destructive database operation detected' };
    }
  }

  // Block attempts to delete all data
  if (bodyStr.includes('deleteall') || bodyStr.includes('wipedata') || bodyStr.includes('destroydata')) {
    return { safe: false, reason: 'Bulk deletion attempt detected' };
  }

  return { safe: true };
}

/**
 * Main API routes plugin (Fastify-native)
 */
export const apiRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Database protection middleware - runs on ALL routes
  fastify.addHook('preHandler', async (request, reply) => {
    // Skip protection for safe routes
    const safePaths = ['/health', '/blocked', '/blocked/bulk', '/feedback/bulk'];
    if (safePaths.some(p => request.url.startsWith(p))) {
      return;
    }

    // Validate request body for destructive operations
    const validation = validateNoDatabaseDestruction(request.body);
    if (!validation.safe) {
      fastify.log.error({
        reason: validation.reason,
        path: request.url,
        method: request.method,
        body: request.body
      }, 'BLOCKED_DESTRUCTIVE_OPERATION');

      return reply.code(403).send({
        error: 'Forbidden',
        message: 'Database protection: Destructive operations are not allowed',
        reason: validation.reason
      });
    }
  });

  // Health
  fastify.get('/health', async () => {
    return { ok: true };
  });

  // Single blocked event
  fastify.post('/blocked', async (request, reply) => {
    try {
      const body = (request.body ?? {}) as any;
      const category = body.category;

      if (!category || typeof category !== 'string') {
        return reply.code(400).send({ error: 'category_required' });
      }

      const meta = typeof body.meta === 'object' && body.meta ? body.meta : {};
      const ts = typeof body.ts === 'string' ? body.ts : new Date().toISOString();

      fastify.log.info({ category, meta, ts }, 'BLOCKED_PROMPT');
      return reply.send({ success: true });
    } catch (err: any) {
      fastify.log.error({ err }, 'blocked_event_failed');
      return reply.code(500).send({ error: 'Failed to log blocked event' });
    }
  });

  // Bulk blocked ingest
  fastify.post('/blocked/bulk', async (request, reply) => {
    try {
      const body = (request.body ?? {}) as any;
      const events = body.events;

      if (!Array.isArray(events)) {
        return reply.code(400).send({ error: 'events_array_required' });
      }

      for (const e of events) {
        if (!e || typeof e.category !== 'string') continue;
        fastify.log.info(
          { category: e.category, meta: e.meta ?? {}, ts: e.ts ?? null },
          'BLOCKED_PROMPT_BULK'
        );
      }

      return reply.send({ success: true, count: events.length });
    } catch (err: any) {
      fastify.log.error({ err }, 'blocked_bulk_failed');
      return reply.code(500).send({ error: 'blocked_bulk_failed' });
    }
  });

  // Bulk feedback ingest (stub)
  fastify.post('/feedback/bulk', async (request, reply) => {
    try {
      const body = (request.body ?? {}) as any;
      const events = body.events;

      if (!Array.isArray(events)) {
        return reply.code(400).send({ error: 'events_array_required' });
      }

      for (const e of events) {
        if (!e || typeof e.category !== 'string') continue;
        fastify.log.info(
          {
            category: e.category,
            feedbackType: e.feedbackType ?? null,
            note: e.note ?? null,
            ts: e.ts ?? null,
          },
          'PV_FEEDBACK_BULK'
        );
      }

      return reply.send({ success: true, count: events.length });
    } catch (err: any) {
      fastify.log.error({ err }, 'feedback_bulk_failed');
      return reply.code(500).send({ error: 'feedback_bulk_failed' });
    }
  });
};
