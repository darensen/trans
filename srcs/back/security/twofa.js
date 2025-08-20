"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/twofa.ts (backend-local)
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const client_1 = require("@prisma/client");
const otplib_1 = require("otplib");
const qrcode_1 = __importDefault(require("qrcode"));
const crypto_1 = __importDefault(require("crypto"));
const prisma = new client_1.PrismaClient();
exports.default = (0, fastify_plugin_1.default)(async (fastify) => {
    // Optional TOTP pepper (shared with app.ts)
    let pepper = null;
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
                }
                catch { }
            }
        }
        pepper = raw ? crypto_1.default.createHash('sha256').update(raw).digest() : null;
    }
    await loadPepper();
    function enc(secret) {
        if (!pepper)
            return secret;
        const iv = crypto_1.default.randomBytes(12);
        const cipher = crypto_1.default.createCipheriv('aes-256-gcm', pepper, iv);
        const enc = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
        const tag = cipher.getAuthTag();
        return `${iv.toString('base64')}:${tag.toString('base64')}:${enc.toString('base64')}`;
    }
    function dec(stored) {
        if (!stored)
            return null;
        if (!pepper)
            return stored;
        const parts = stored.split(':');
        if (parts.length !== 3)
            return stored;
        try {
            const [ivB64, tagB64, dataB64] = parts;
            const iv = Buffer.from(ivB64, 'base64');
            const tag = Buffer.from(tagB64, 'base64');
            const data = Buffer.from(dataB64, 'base64');
            const decipher = crypto_1.default.createDecipheriv('aes-256-gcm', pepper, iv);
            decipher.setAuthTag(tag);
            const decBuf = Buffer.concat([decipher.update(data), decipher.final()]);
            return decBuf.toString('utf8');
        }
        catch {
            return stored;
        }
    }
    // Start 2FA: create secret + return QR
    fastify.post('/api/2fa/enable', {
        preHandler: fastify.requireAuth
    }, async (req, reply) => {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user)
            return reply.code(404).send({ error: 'User not found' });
        const secret = otplib_1.authenticator.generateSecret();
        const issuer = encodeURIComponent('ft_transcendence');
        const label = encodeURIComponent(user.email);
        const otpauth = `otpauth://totp/${issuer}:${label}?secret=${secret}&issuer=${issuer}`;
        await prisma.user.update({ where: { id: user.id }, data: { totpSecret: enc(secret), is2FAEnabled: false } });
        const qrDataUrl = await qrcode_1.default.toDataURL(otpauth);
        return { qrDataUrl };
    });
    // Verify 2FA: user types the 6-digit code
    fastify.post('/api/2fa/verify', {
        preHandler: fastify.requireAuth,
        schema: { body: { type: 'object', required: ['code'], properties: { code: { type: 'string', pattern: '^[0-9]{6}$' } } } }
    }, async (req, reply) => {
        const { code } = req.body;
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user?.totpSecret)
            return reply.code(400).send({ error: 'No pending 2FA' });
        const plain = dec(user.totpSecret);
        if (!plain || !otplib_1.authenticator.check(code, plain)) {
            return reply.code(400).send({ error: 'Invalid code' });
        }
        await prisma.user.update({ where: { id: user.id }, data: { is2FAEnabled: true } });
        return { ok: true };
    });
    // Disable 2FA (requires a valid code)
    fastify.post('/api/2fa/disable', {
        preHandler: fastify.requireAuth,
        schema: { body: { type: 'object', required: ['code'], properties: { code: { type: 'string', pattern: '^[0-9]{6}$' } } } }
    }, async (req, reply) => {
        const { code } = req.body;
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user?.totpSecret)
            return reply.code(400).send({ error: '2FA not enabled' });
        const plain = dec(user.totpSecret);
        if (!plain || !otplib_1.authenticator.check(code, plain))
            return reply.code(400).send({ error: 'Invalid code' });
        await prisma.user.update({ where: { id: user.id }, data: { is2FAEnabled: false, totpSecret: null } });
        return { ok: true };
    });
});
