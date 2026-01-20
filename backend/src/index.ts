/**
 * PrivateVault Backend API
 * Main entry point
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import { config } from './config.js';
import { registerRoutes } from './api/routes.js';
import { logger } from './utils/logger.js';

const fastify = Fastify({
  logger: logger,
});

// Register plugins
await fastify.register(cors, {
  origin: config.cors.origin,
  credentials: true,
});

await fastify.register(jwt, {
  secret: config.jwt.secret,
});

await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register API routes
await registerRoutes(fastify);

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  logger.error(error);

  reply.status((error as any).statusCode || 500).send({
    error: (error as any).message || 'Internal Server Error',
    code: (error as any).code || 'INTERNAL_ERROR',
    requestId: request.id,
  });
});

// Start server
try {
  await fastify.listen({
    port: config.port,
    host: config.host
  });

  logger.info(`PrivateVault API running on ${config.host}:${config.port}`);
} catch (err) {
  logger.error(err);
  process.exit(1);
}

// Graceful shutdown
const signals = ['SIGINT', 'SIGTERM'];
signals.forEach(signal => {
  process.on(signal, async () => {
    logger.info(`Received ${signal}, closing server...`);
    await fastify.close();
    process.exit(0);
  });
});
