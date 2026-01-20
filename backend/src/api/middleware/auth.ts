/**
 * Authentication middleware
 * MVP: allow dev bypass via x-dev-user-id header
 */

import type { FastifyRequest, FastifyReply } from 'fastify';

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  // DEV BYPASS (for demo)
  const devUserId = request.headers['x-dev-user-id'];
  if (typeof devUserId === 'string' && devUserId.length > 0) {
    (request as any).user = { id: devUserId, orgId: 'dev-org' };
    return;
  }

  try {
    // Verify JWT token
    await request.jwtVerify();
  } catch (err) {
    return reply.status(401).send({
      error: 'Unauthorized',
      code: 'AUTH_REQUIRED',
    });
  }
}

export function requireOrg(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = request.user as any;

  if (!user?.orgId) {
    return reply.status(403).send({
      error: 'Organization required',
      code: 'ORG_REQUIRED',
    });
  }
}
