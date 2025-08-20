// src/twofa.ts (backend-local)
import fp from 'fastify-plugin';
import { PrismaClient } from '@prisma/client';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';

const prisma = new PrismaClient();

export default fp(async (fastify: any) => {
  // Optional TOTP pepper (shared with app.ts)
  let pepper: Buffer | null = null;
  async function loadPepper() {
    let raw = process.env.TOTP_SECRET || '';
    if (!raw) {
      const addr = process.env.VAULT_ADDR;
      const token = process.env.VAULT_TOKEN;
      const path = process.env.VAULT_SECURITY_PATH || 'v1/secret/data/security';
      if (addr && token) {
        try {
          const res = await fetch(`${addr}/${path}`, { headers: { 'X-Vault-Token': token } });
          if (res.ok) {
            const json = await res.json();
            raw = json?.data?.data?.totp_secret || '';
          }
        } catch {}
      }
    }
    pepper = raw ? crypto.createHash('sha256').update(raw).digest() : null;
  }
  await loadPepper();

  function enc(secret: string): string {
    if (!pepper) return secret;
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', pepper, iv);
    const enc = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('base64')}:${tag.toString('base64')}:${enc.toString('base64')}`;
  }
  function dec(stored: string | null): string | null {
    if (!stored) return null;
    if (!pepper) return stored;
    const parts = stored.split(':');
    if (parts.length !== 3) return stored;
    try {
      const [ivB64, tagB64, dataB64] = parts;
      const iv = Buffer.from(ivB64, 'base64');
      const tag = Buffer.from(tagB64, 'base64');
      const data = Buffer.from(dataB64, 'base64');
      const decipher = crypto.createDecipheriv('aes-256-gcm', pepper, iv);
      decipher.setAuthTag(tag);
      const decBuf = Buffer.concat([decipher.update(data), decipher.final()]);
      return decBuf.toString('utf8');
    } catch {
      return stored;
    }
  }
  // Start 2FA: create secret + return QR
  fastify.post('/api/2fa/enable', {
    preHandler: (fastify as any).requireAuth
  }, async (req: any, reply: any) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return reply.code(404).send({ error: 'User not found' });

    const secret = authenticator.generateSecret();
    const issuer = encodeURIComponent('ft_transcendence');
    const label  = encodeURIComponent(user.email);
    const otpauth = `otpauth://totp/${issuer}:${label}?secret=${secret}&issuer=${issuer}`;

  await prisma.user.update({ where: { id: user.id }, data: { totpSecret: enc(secret), is2FAEnabled: false } });
    const qrDataUrl = await QRCode.toDataURL(otpauth);
    return { qrDataUrl };
  });

  // Verify 2FA: user types the 6-digit code
  fastify.post('/api/2fa/verify', {
    preHandler: (fastify as any).requireAuth,
    schema: { body: { type: 'object', required: ['code'], properties: { code: { type: 'string', pattern: '^[0-9]{6}$' } } } }
  }, async (req: any, reply: any) => {
    const { code } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user?.totpSecret) return reply.code(400).send({ error: 'No pending 2FA' });

  const plain = dec(user.totpSecret);
  if (!plain || !authenticator.check(code, plain)) {
      return reply.code(400).send({ error: 'Invalid code' });
    }
    await prisma.user.update({ where: { id: user.id }, data: { is2FAEnabled: true } });
    return { ok: true };
  });

  // Disable 2FA (requires a valid code)
  fastify.post('/api/2fa/disable', {
    preHandler: (fastify as any).requireAuth,
    schema: { body: { type: 'object', required: ['code'], properties: { code: { type: 'string', pattern: '^[0-9]{6}$' } } } }
  }, async (req: any, reply: any) => {
    const { code } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user?.totpSecret) return reply.code(400).send({ error: '2FA not enabled' });
  const plain = dec(user.totpSecret);
  if (!plain || !authenticator.check(code, plain)) return reply.code(400).send({ error: 'Invalid code' });

    await prisma.user.update({ where: { id: user.id }, data: { is2FAEnabled: false, totpSecret: null } });
    return { ok: true };
  });
});
