import '@fastify/jwt';
import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user?: unknown;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: any;
    user: any;
  }
}
