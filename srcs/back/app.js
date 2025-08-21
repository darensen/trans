"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("@fastify/jwt");
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const static_1 = __importDefault(require("@fastify/static"));
// Use require to avoid TS confusion with default export typing
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Fastify = require('fastify');
const cookie_1 = __importDefault(require("@fastify/cookie"));
const crypto_1 = __importDefault(require("crypto"));
const security_1 = __importDefault(require("./security/security"));
const twofa_1 = __importDefault(require("./security/twofa"));
const gdpr_1 = __importDefault(require("./security/gdpr"));
async function main() {
    const app = Fastify();
    const prisma = new client_1.PrismaClient();
    // Cache for shared WS token and TOTP pepper
    let WS_SHARED_SECRET = null;
    let TOTP_PEPPER = null;
    async function getFromVault(pathEnv, defaultPath, key) {
        const addr = process.env.VAULT_ADDR;
        const token = process.env.VAULT_TOKEN;
        const path = process.env[pathEnv] || defaultPath;
        if (!addr || !token)
            return null;
        try {
            const res = await fetch(`${addr}/${path}`, { headers: { 'X-Vault-Token': token } });
            if (!res.ok)
                throw new Error('Vault error');
            const json = await res.json();
            return json?.data?.data?.[key] ?? null;
        }
        catch {
            return null;
        }
    }
    async function loadWsSecret() {
        WS_SHARED_SECRET = process.env.WS_SHARED_SECRET || process.env.WT_SECRET || await getFromVault('VAULT_WS_PATH', 'v1/secret/data/ws', 'wt_secret');
        if (WS_SHARED_SECRET) {
            console.log('[vault] WS shared secret loaded');
        }
        else {
            console.warn('[vault] WS shared secret not configured; /api/matches will accept unauthenticated calls');
        }
    }
    async function loadTotpPepper() {
        const val = process.env.TOTP_SECRET || await getFromVault('VAULT_SECURITY_PATH', 'v1/secret/data/security', 'totp_secret');
        if (val) {
            // Derive a 32-byte key from the provided secret
            TOTP_PEPPER = crypto_1.default.createHash('sha256').update(val).digest();
            console.log('[vault] TOTP pepper loaded');
        }
        else {
            TOTP_PEPPER = null;
            console.warn('[vault] TOTP secret not set; TOTP secrets stored in plaintext');
        }
    }
    // Retry loading TOTP pepper a few times on startup in case Vault is not ready yet
    (async function retryPepper(attempt = 1) {
        if (TOTP_PEPPER)
            return; // already loaded
        if (attempt > 6)
            return; // ~30s total
        await new Promise((r) => setTimeout(r, 5000));
        await loadTotpPepper();
        if (!TOTP_PEPPER)
            retryPepper(attempt + 1);
    })();
    function encryptTotpSecret(secret) {
        if (!TOTP_PEPPER)
            return secret;
        const iv = crypto_1.default.randomBytes(12);
        const cipher = crypto_1.default.createCipheriv('aes-256-gcm', TOTP_PEPPER, iv);
        const enc = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
        const tag = cipher.getAuthTag();
        return `${iv.toString('base64')}:${tag.toString('base64')}:${enc.toString('base64')}`;
    }
    function tryDecryptTotpSecret(stored) {
        if (!stored)
            return null;
        if (!TOTP_PEPPER)
            return stored; // plaintext mode
        const parts = stored.split(':');
        if (parts.length !== 3)
            return stored; // looks like plaintext
        try {
            const [ivB64, tagB64, dataB64] = parts;
            const iv = Buffer.from(ivB64, 'base64');
            const tag = Buffer.from(tagB64, 'base64');
            const data = Buffer.from(dataB64, 'base64');
            const decipher = crypto_1.default.createDecipheriv('aes-256-gcm', TOTP_PEPPER, iv);
            decipher.setAuthTag(tag);
            const dec = Buffer.concat([decipher.update(data), decipher.final()]);
            return dec.toString('utf8');
        }
        catch {
            // fallback to plaintext in case of legacy value
            return stored;
        }
    }
    // Ensure avatars directory exists (robust + single source)
    const avatarsDir = path_1.default.resolve(process.cwd(), 'srcs/back/avatars');
    try {
        await fs_1.default.promises.mkdir(avatarsDir, { recursive: true });
        console.log('[startup] Avatars dir ready:', avatarsDir);
    }
    catch (e) {
        console.error('[startup] Cannot create avatars dir', avatarsDir, e);
    }
    await loadWsSecret();
    await loadTotpPepper();
    await app.register(security_1.default);
    await app.register(twofa_1.default);
    await app.register(gdpr_1.default);
    app.register(static_1.default, {
        root: avatarsDir,
        prefix: '/avatars/',
    });
    app.register(multipart_1.default, {
        limits: {
            fileSize: 10 * 1024 * 1024 // 10 Mo pour l'avatar (c'est beaucoup)
        }
    });
    app.register(cookie_1.default);
    //   app.register(fastifySession, {
    //     secret: 'secretsecretsecretsecretsecretsecret',
    //     cookie: { secure: false, httpOnly: true, sameSite: 'lax' }, // secure: true en prod HTTPS
    //     saveUninitialized: false
    //   });
    //   fastify.post('/api/register', async (req, reply) => {
    //     const { email, password, displayName } = req.body as any;
    //     const hash = await bcrypt.hash(password, 10);
    //     try {
    //       const user = await prisma.user.create({
    //         data: { email, password: hash, displayName }
    //       });
    //       reply.send({ id: user.id, email: user.email, displayName: user.displayName });
    //     } catch (e) {
    //       reply.status(400).send({ error: 'Email ou pseudo déjà utilisé.' });
    //     }
    //   });
    app.post('/api/register', {
        schema: {
            body: {
                type: 'object',
                required: ['email', 'password', 'displayName'],
                properties: {
                    email: { type: 'string', format: 'email', maxLength: 255 },
                    password: { type: 'string', minLength: 8, maxLength: 128 },
                    displayName: { type: 'string', minLength: 2, maxLength: 32 }
                }
            }
        }
    }, async (req, reply) => {
        const { email, password, displayName } = req.body;
        const hash = await bcrypt_1.default.hash(password, 12);
        try {
            const user = await prisma.user.create({ data: { email, password: hash, displayName } });
            // do not auto-login, ask to login
            reply.send({ id: user.id, email: user.email, displayName: user.displayName });
        }
        catch (e) {
            reply.status(400).send({ error: 'Email ou pseudo déjà utilisé.' });
        }
    });
    app.post('/api/login', {
        schema: {
            body: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                    otp: { type: 'string', pattern: '^[0-9]{6}$' }
                }
            }
        }
    }, async (req, reply) => {
        const { email, password, otp } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
            return reply.code(401).send({ error: 'Mauvais email/mot de passe.' });
        }
        if (user.deletedAt) {
            return reply.code(410).send({ error: 'Compte supprimé.' });
        }
        if (user.is2FAEnabled) {
            if (!otp)
                return reply.code(206).send({ need2FA: true }); // ask for OTP
            const { authenticator } = await Promise.resolve().then(() => __importStar(require('otplib')));
            const plainTotp = tryDecryptTotpSecret(user.totpSecret);
            if (!plainTotp || !authenticator.check(otp, plainTotp)) {
                return reply.code(401).send({ error: 'Mauvais code.' });
            }
        }
        const token = app.jwt.sign({ id: user.id, email: user.email });
        // Safer cookie (JS cannot read it). If you want localStorage instead, return {token}.
        // In production behind HTTPS, set secure cookie
        const isProd = process.env.NODE_ENV === 'production';
        const maxAge = 12 * 60 * 60 * 1000; // 12 heures en millisecondes
        reply
            .setCookie('token', token, {
            httpOnly: true,
            secure: isProd,
            sameSite: 'lax',
            path: '/',
            maxAge: maxAge // Expiration explicite du cookie
        })
            .send({ ok: true });
    });
    app.get('/api/me', { preHandler: app.requireAuth }, async (req) => {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, email: true, displayName: true, avatar: true, is2FAEnabled: true }
        });
        return user;
    });
    app.put('/api/me', { preHandler: app.requireAuth }, async (req, reply) => {
        const { email, displayName } = req.body;
        try {
            const user = await prisma.user.update({
                where: { id: req.user.id },
                data: { email, displayName }
            });
            reply.send({ email: user.email, displayName: user.displayName });
        }
        catch (e) {
            reply.status(400).send({ error: 'Email ou pseudo déjà utilisé.' });
        }
    });
    app.post('/api/me/avatar', { preHandler: app.requireAuth }, async (req, reply) => {
        const MAX_SIZE = 50 * 1024; // 50kb
        const parts = req.parts ? req.parts() : null;
        const userId = req.user.id;
        let filePart = null;
        if (parts) {
            for await (const part of parts) {
                if (part.type === 'file') {
                    filePart = part;
                }
            }
        }
        else {
            filePart = await req.file();
        }
        if (!filePart)
            return reply.status(400).send({ error: 'No file uploaded' });
        if (!userId)
            return reply.status(400).send({ error: 'No userId provided' });
        // Vérification taille du fichier
        const chunks = [];
        let totalSize = 0;
        let tooBig = false;
        for await (const chunk of filePart.file) {
            totalSize += chunk.length;
            if (totalSize > MAX_SIZE) {
                tooBig = true;
                break;
            }
            chunks.push(chunk);
        }
        if (tooBig) {
            // Vide le stream restant pour éviter le blocage
            filePart.file.resume && filePart.file.resume();
            return reply.status(413).send({ error: 'Avatar trop volumineux (max 50kb).' });
        }
        const buffer = Buffer.concat(chunks);
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.avatar && user.avatar !== '/avatars/default.png') {
            const oldPath = path_1.default.join(avatarsDir, path_1.default.basename(user.avatar));
            console.log('Trying to delete old avatar:', oldPath);
            if (fs_1.default.existsSync(oldPath)) {
                fs_1.default.unlinkSync(oldPath);
                console.log('Old avatar deleted:', oldPath);
            }
        }
        const ext = path_1.default.extname(filePart.filename || 'avatar.png');
        const fileName = `user_${userId}_${Date.now()}${ext}`;
        const filePath = path_1.default.join(avatarsDir, fileName);
        console.log('Upload avatar debug:', {
            fileName,
            filePath,
            __dirname,
            avatarsDir,
            exists: fs_1.default.existsSync(avatarsDir),
            cwd: process.cwd()
        });
        await fs_1.default.promises.mkdir(path_1.default.dirname(filePath), { recursive: true });
        await fs_1.default.promises.writeFile(filePath, buffer);
        // Vérifier que le fichier a bien été créé
        if (!fs_1.default.existsSync(filePath)) {
            console.error('File was not created:', filePath);
            return reply.status(500).send({ error: 'Failed to save avatar' });
        }
        console.log('[avatar] saved', filePath);
        await prisma.user.update({
            where: { id: userId },
            data: { avatar: `/avatars/${fileName}` }
        });
        reply.send({ success: true, avatar: `/avatars/${fileName}` });
    });
    app.delete('/api/me/avatar', { preHandler: app.requireAuth }, async (req, reply) => {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user?.avatar && user.avatar !== '/avatars/default.png') {
            const oldPath = path_1.default.join(avatarsDir, path_1.default.basename(user.avatar));
            if (fs_1.default.existsSync(oldPath))
                fs_1.default.unlinkSync(oldPath);
        }
        await prisma.user.update({ where: { id: userId }, data: { avatar: null } });
        reply.send({ success: true });
    });
    app.post('/api/logout', { preHandler: app.requireAuth }, async (req, reply) => {
        const userId = req.user.id;
        if (userId)
            onlineUsers.delete(userId);
        reply
            .clearCookie('token', { path: '/' })
            .send({ success: true });
    });
    const onlineUsers = new Map();
    const ONLINE_TIMEOUT = 10000; //10sec avant d'etre mis hors ligne
    app.post('/api/ping', { preHandler: app.requireAuth }, async (req, reply) => {
        const userId = req.user.id;
        if (userId) {
            onlineUsers.set(userId, Date.now());
            reply.send({ online: true });
        }
        else {
            reply.status(401).send({ error: 'Non authentifié.' });
        }
    });
    function isUserOnline(userId) {
        const last = onlineUsers.get(userId);
        return !!last && Date.now() - last < ONLINE_TIMEOUT;
    }
    app.get('/api/user/:displayName', { preHandler: app.requireAuth }, async (req, reply) => {
        const { displayName } = req.params;
        const user = await prisma.user.findUnique({ where: { displayName } });
        if (!user)
            return reply.status(404).send({ error: 'Utilisateur non trouvé' });
        reply.send({
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            avatar: user.avatar ? user.avatar : '/avatars/default.png',
            online: isUserOnline(user.id)
        });
    });
    app.get('/api/friends', { preHandler: app.requireAuth }, async (req, reply) => {
        const userId = req.user.id;
        if (!userId)
            return reply.status(401).send({ error: 'Non authentifié.' });
        const friends = await prisma.friend.findMany({
            where: { userId, status: 'ACCEPTED' },
            include: { friend: { select: { id: true, displayName: true, avatar: true, email: true } } },
        });
        reply.send(friends.map((f) => ({
            ...f.friend,
            online: isUserOnline(f.friend.id)
        })));
    });
    app.get('/api/friends/requests', { preHandler: app.requireAuth }, async (req, reply) => {
        const userId = req.user.id;
        if (!userId)
            return reply.status(401).send({ error: 'Non authentifié.' });
        const requests = await prisma.friend.findMany({
            where: { friendId: userId, status: 'PENDING' },
            include: { user: { select: { id: true, displayName: true, avatar: true, email: true } } },
        });
        reply.send(requests.map((r) => ({
            id: r.user.id,
            displayName: r.user.displayName,
            avatar: r.user.avatar,
            email: r.user.email,
            online: isUserOnline(r.user.id),
            friendRequestId: r.id
        })));
    });
    app.post('/api/friends/:id', { preHandler: app.requireAuth }, async (req, reply) => {
        const userId = req.user.id;
        const friendId = parseInt(req.params.id, 10);
        if (!userId || !friendId)
            return reply.status(400).send({ error: 'Paramètres invalides.' });
        if (userId === friendId)
            return reply.status(400).send({ error: 'Impossible de s\'ajouter soi-même.' });
        const existing = await prisma.friend.findFirst({
            where: {
                OR: [
                    { userId, friendId },
                    { userId: friendId, friendId: userId }
                ]
            }
        });
        if (existing) {
            if (existing.status === 'ACCEPTED')
                return reply.status(400).send({ error: 'Déjà amis.' });
            if (existing.userId === userId)
                return reply.status(400).send({ error: 'Demande déjà envoyée.' });
            else
                return reply.status(400).send({ error: 'Cet utilisateur vous a déjà envoyé une demande.' });
        }
        await prisma.friend.create({
            data: { userId, friendId, status: 'PENDING' }
        });
        reply.send({ success: true });
    });
    app.post('/api/friends/:id/accept', { preHandler: app.requireAuth }, async (req, reply) => {
        const userId = req.user.id;
        const requestId = parseInt(req.params.id, 10);
        if (!userId || !requestId)
            return reply.status(400).send({ error: 'Paramètres invalides.' });
        const friendRequest = await prisma.friend.findUnique({ where: { id: requestId } });
        if (!friendRequest || friendRequest.friendId !== userId || friendRequest.status !== 'PENDING')
            return reply.status(404).send({ error: 'Demande non trouvée.' });
        await prisma.friend.update({
            where: { id: requestId },
            data: { status: 'ACCEPTED' }
        });
        await prisma.friend.create({
            data: { userId: userId, friendId: friendRequest.userId, status: 'ACCEPTED' }
        });
        reply.send({ success: true });
    });
    app.delete('/api/friends/:id', { preHandler: app.requireAuth }, async (req, reply) => {
        const userId = req.user.id;
        const friendId = parseInt(req.params.id, 10);
        if (!userId || !friendId)
            return reply.status(400).send({ error: 'Paramètres invalides.' });
        await prisma.friend.deleteMany({
            where: {
                OR: [
                    { userId, friendId },
                    { userId: friendId, friendId: userId }
                ]
            }
        });
        reply.send({ success: true });
    });
    // Endpoint pour sauvegarder un match
    app.post('/api/matches', async (req, reply) => {
        // If WS secret configured, require matching token header
        if (WS_SHARED_SECRET === null) {
            await loadWsSecret();
        }
        if (WS_SHARED_SECRET) {
            const hdr = (req.headers['x-ws-token'] || req.headers['X-WS-Token']);
            if (!hdr || hdr !== WS_SHARED_SECRET) {
                return reply.status(403).send({ error: 'Forbidden' });
            }
        }
        const { player1Id, player2Id, player1Score, player2Score, matchType } = req.body;
        if (!player1Id || !player2Id || player1Score === undefined || player2Score === undefined) {
            return reply.status(400).send({ error: 'Données manquantes' });
        }
        const winnerId = player1Score > player2Score ? parseInt(player1Id) : parseInt(player2Id);
        try {
            const match = await prisma.match.create({
                data: {
                    player1Id: parseInt(player1Id),
                    player2Id: parseInt(player2Id),
                    player1Score: parseInt(player1Score),
                    player2Score: parseInt(player2Score),
                    winnerId,
                    matchType: matchType || 'NORMAL'
                }
            });
            reply.send({ success: true, matchId: match.id });
        }
        catch (error) {
            console.error('Erreur lors de la création du match:', error);
            reply.status(500).send({ error: 'Erreur serveur' });
        }
    });
    // Endpoint pour récupérer l'historique des matches d'un utilisateur
    app.get('/api/matches/history', { preHandler: app.requireAuth }, async (req, reply) => {
        const userId = req.user.id;
        if (!userId) {
            return reply.status(401).send({ error: 'Non authentifié' });
        }
        try {
            const matches = await prisma.match.findMany({
                where: {
                    OR: [
                        { player1Id: userId },
                        { player2Id: userId }
                    ]
                },
                include: {
                    player1: {
                        select: { id: true, displayName: true, avatar: true }
                    },
                    player2: {
                        select: { id: true, displayName: true, avatar: true }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            const formattedMatches = matches.map((match) => ({
                id: match.id,
                player1: match.player1,
                player2: match.player2,
                player1Score: match.player1Score,
                player2Score: match.player2Score,
                winnerId: match.winnerId,
                matchType: match.matchType,
                createdAt: match.createdAt,
                isWinner: match.winnerId === userId
            }));
            reply.send(formattedMatches);
        }
        catch (error) {
            console.error('Erreur lors de la récupération de l\'historique:', error);
            reply.status(500).send({ error: 'Erreur serveur' });
        }
    });
    // Endpoint pour récupérer l'historique des matches d'un utilisateur spécifique par ID
    app.get('/api/matches/history/:userId', { preHandler: app.requireAuth }, async (req, reply) => {
        const targetUserId = parseInt(req.params.userId, 10);
        const currentUserId = req.user.id;
        if (!targetUserId || !currentUserId) {
            return reply.status(400).send({ error: 'Paramètres invalides' });
        }
        try {
            // Vérifier si l'utilisateur cible existe
            const targetUser = await prisma.user.findUnique({
                where: { id: targetUserId },
                select: { id: true, displayName: true }
            });
            if (!targetUser) {
                return reply.status(404).send({ error: 'Utilisateur non trouvé' });
            }
            // Vérifier si l'utilisateur actuel peut voir l'historique (soit c'est lui-même, soit ils sont amis)
            const isSelf = currentUserId === targetUserId;
            let isFriend = false;
            if (!isSelf) {
                const friendship = await prisma.friend.findFirst({
                    where: {
                        OR: [
                            { userId: currentUserId, friendId: targetUserId, status: 'ACCEPTED' },
                            { userId: targetUserId, friendId: currentUserId, status: 'ACCEPTED' }
                        ]
                    }
                });
                isFriend = !!friendship;
            }
            if (!isSelf && !isFriend) {
                return reply.status(403).send({ error: 'Vous n\'êtes pas autorisé à voir l\'historique de cet utilisateur' });
            }
            const matches = await prisma.match.findMany({
                where: {
                    OR: [
                        { player1Id: targetUserId },
                        { player2Id: targetUserId }
                    ]
                },
                include: {
                    player1: {
                        select: { id: true, displayName: true, avatar: true }
                    },
                    player2: {
                        select: { id: true, displayName: true, avatar: true }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            const formattedMatches = matches.map((match) => ({
                id: match.id,
                player1: match.player1,
                player2: match.player2,
                player1Score: match.player1Score,
                player2Score: match.player2Score,
                winnerId: match.winnerId,
                matchType: match.matchType,
                createdAt: match.createdAt,
                isWinner: match.winnerId === targetUserId
            }));
            reply.send(formattedMatches);
        }
        catch (error) {
            console.error('Erreur lors de la récupération de l\'historique:', error);
            reply.status(500).send({ error: 'Erreur serveur' });
        }
    });
    // Simple health endpoint (used by WAF rule & docker healthcheck)
    app.get('/api/health', async () => ({ ok: true }));
    app.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log(`Server listening at ${address}`);
    });
}
;
// Global error logging
process.on('unhandledRejection', (r) => console.error('[unhandledRejection]', r));
process.on('uncaughtException', (e) => { console.error('[uncaughtException]', e); });
main();
