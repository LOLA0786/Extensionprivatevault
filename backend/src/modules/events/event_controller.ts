import type { FastifyInstance } from "fastify";
import type { IngestEventRequest, BatchIngestRequest } from "@privatevault/shared/dist/types/api";

export async function registerEventRoutes(app: FastifyInstance) {
  app.post<{ Body: IngestEventRequest }>("/api/events/ingest", async (req, reply) => {
    // placeholder: actual logic in service layer
    reply.send({ ok: true });
  });

  app.post<{ Body: BatchIngestRequest }>("/api/events/batch", async (req, reply) => {
    reply.send({ ok: true });
  });
}
