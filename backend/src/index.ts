import Fastify from 'fastify';
import { apiRoutes } from './api/routes.js';

async function main() {
  const fastify = Fastify({
    logger: true,
  });

  // register routes
  await fastify.register(apiRoutes);

  const port = Number(process.env.PORT || 3000);
  const host = process.env.HOST || '0.0.0.0';

  await fastify.listen({ port, host });
  fastify.log.info(`PrivateVault backend listening on http://${host}:${port}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
