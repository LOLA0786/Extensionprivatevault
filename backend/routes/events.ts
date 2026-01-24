import { Router } from 'express';

export function eventsRouter(prisma: any) {
  const router = Router();

  router.delete('/events/:id', async (req, res) => {
    try {
      const id = req.params.id;

      const event = await prisma.event.findUnique({
        where: { id },
        include: { device: { include: { user: true } } },
      });

      if (!event) return res.status(404).json({ error: 'Event not found' });

      const enterpriseLockEnv = String(process.env.ENTERPRISE_LOCK || '').toLowerCase() === 'true';
      const isEnterprise = enterpriseLockEnv || Boolean(event?.device?.user?.isEnterprise);

      if (isEnterprise) {
        return res.status(403).json({
          error: 'Data deletion disabled for enterprise accounts to ensure compliance and audit trails.',
        });
      }

      await prisma.event.delete({ where: { id } });

      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: 'Internal server error', detail: err?.message });
    }
  });

  return router;
}
