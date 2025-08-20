// src/gdpr.ts (backend-local)
import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export default fp(async (fastify: any) => {
  // Export my data
  fastify.get('/api/me/export', { preHandler: (fastify as any).requireAuth }, async (req: any) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        // include relations if needed
      }
    });
    return user;
  });

  // Anonymize my data (keep stats but remove identifiers)
  fastify.post('/api/me/anonymize', { preHandler: (fastify as any).requireAuth }, async (req: any) => {
    const anonName = `user_${req.user.id}`;
    // Remove stored avatar file if exists
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { avatar: true } });
    if (user?.avatar && user.avatar !== '/avatars/default.png') {
      const avatarsDir = path.resolve(process.cwd(), 'srcs/back/avatars');
      const filePath = path.join(avatarsDir, path.basename(user.avatar));
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch {}
    }
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        email: `${anonName}@anonymized.local`,
        displayName: anonName,
        avatar: null,
        anonymizedAt: new Date(),
        // Optional: reduce sensitive fields
        totpSecret: null,
        is2FAEnabled: false
      }
    });
    return { ok: true };
  });

  // Delete my account (soft delete)
  fastify.delete('/api/me', { preHandler: (fastify as any).requireAuth }, async (req: any, reply: any) => {
    // Remove avatar file if present
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { avatar: true } });
    if (user?.avatar && user.avatar !== '/avatars/default.png') {
      const avatarsDir = path.resolve(process.cwd(), 'srcs/back/avatars');
      const filePath = path.join(avatarsDir, path.basename(user.avatar));
      try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { deletedAt: new Date(), totpSecret: null, is2FAEnabled: false }
    });
    // Clear auth cookie
    reply.clearCookie('token', { path: '/' });
    return { ok: true };
  });
});
