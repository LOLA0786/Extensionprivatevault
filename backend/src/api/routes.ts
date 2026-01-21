import type { FastifyInstance } from "fastify";

export async function registerRoutes(app: FastifyInstance<any, any, any, any>) {
  // NOTE:
  // FastifyInstance generics vary based on logger/type-provider.
  // We accept any instance here to avoid logger generic mismatch between modules.
  //
  // Routes can still be strongly typed at handler-level if needed.

  // ---- existing route registrations below ----
  // If you had routes earlier, paste them back here OR keep minimal for now.
  //
  // Example:
  // app.get("/health", async () => ({ ok: true }));

  app.get("/health", async () => ({ ok: true }));
}
