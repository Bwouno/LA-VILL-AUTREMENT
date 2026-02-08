import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

import { getDirname } from './lib/paths.mjs';
import { readJson, writeJsonAtomic, ensureDir } from './lib/storage.mjs';
import { hashPassword, verifyPassword } from './lib/passwords.mjs';
import { slugify } from './lib/slugify.mjs';
import {
  clearCookie,
  parseCookies,
  readBody,
  sendEmpty,
  sendJson,
  sendText,
  serveFile,
  setCookie
} from './lib/http.mjs';

const dirname = getDirname(import.meta.url);
const rootDir = path.join(dirname, '..');
const distDir = path.join(rootDir, 'dist');

const dataDir = path.join(dirname, 'data');
const uploadsDir = path.join(dirname, 'uploads');

const usersFile = path.join(dataDir, 'users.json');
const articlesFile = path.join(dataDir, 'articles.json');
const messagesFile = path.join(dataDir, 'messages.json');

const isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';

const port = Number(process.env.PORT || 5174);
const host = String(process.env.HOST || '127.0.0.1');
const allowedOrigins = String(process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
const cookieSecure = String(process.env.COOKIE_SECURE || (!isDev ? 'true' : 'false')) === 'true';

const sessionTtlSeconds = Number(process.env.SESSION_TTL_SECONDS || 60 * 60 * 8);
const sessions = new Map(); // sid -> { userId, expiresAt }

await ensureDir(dataDir);
await ensureDir(uploadsDir);

async function getUsers() {
  return readJson(usersFile, []);
}

async function saveUsers(users) {
  await writeJsonAtomic(usersFile, users);
}

async function getArticles() {
  return readJson(articlesFile, []);
}

async function saveArticles(articles) {
  await writeJsonAtomic(articlesFile, articles);
}

async function appendMessage(message) {
  const messages = await readJson(messagesFile, []);
  messages.push(message);
  await writeJsonAtomic(messagesFile, messages);
}

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (!origin) return true;
  if (!allowedOrigins.includes(origin)) return false;

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  return true;
}

function getSession(req) {
  const { sid } = parseCookies(req);
  if (!sid) return null;
  const session = sessions.get(sid);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(sid);
    return null;
  }
  return { sid, ...session };
}

async function requireUser(req, res) {
  const session = getSession(req);
  if (!session) {
    sendJson(res, 401, { error: 'Non authentifié.' });
    return null;
  }

  const users = await getUsers();
  const user = users.find((u) => u.id === session.userId);
  if (!user) {
    sendJson(res, 401, { error: 'Session invalide.' });
    return null;
  }

  return user;
}

function requireAdmin(res, user) {
  if (user.role !== 'admin') {
    sendJson(res, 403, { error: 'Accès refusé.' });
    return false;
  }
  return true;
}

function sanitizeFileName(fileName) {
  const base = path.basename(String(fileName || 'file'));
  return base.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function dataUrlToBuffer(dataUrl) {
  if (typeof dataUrl !== 'string') return null;
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  const mime = match[1];
  const b64 = match[2];
  const buffer = Buffer.from(b64, 'base64');
  return { mime, buffer };
}

function extFromMime(mime) {
  if (mime === 'image/png') return '.png';
  if (mime === 'image/jpeg') return '.jpg';
  if (mime === 'image/webp') return '.webp';
  if (mime === 'image/gif') return '.gif';
  if (mime === 'image/svg+xml') return '.svg';
  return '';
}

function publicUser(user) {
  return { id: user.id, username: user.username, role: user.role, createdAt: user.createdAt };
}

function parseJsonBody(raw) {
  try {
    return JSON.parse(raw || '{}');
  } catch {
    throw Object.assign(new Error('JSON invalide.'), { status: 400 });
  }
}

const server = http.createServer(async (req, res) => {
  try {
    if (!applyCors(req, res)) {
      sendJson(res, 403, { error: 'Origin non autorisée.' });
      return;
    }

    if (req.method === 'OPTIONS') {
      sendEmpty(res, 204);
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    // Health
    if (pathname === '/api/health') {
      sendJson(res, 200, { ok: true });
      return;
    }

    // PUBLIC: articles
    if (req.method === 'GET' && pathname === '/api/public/articles') {
      const articles = await getArticles();
      const published = articles
        .filter((a) => a.status === 'published')
        .sort((a, b) => String(b.publishedAt || '').localeCompare(String(a.publishedAt || '')));
      sendJson(res, 200, published);
      return;
    }

    if (req.method === 'GET' && pathname.startsWith('/api/public/articles/')) {
      const slug = decodeURIComponent(pathname.slice('/api/public/articles/'.length));
      const articles = await getArticles();
      const article = articles.find((a) => a.slug === slug && a.status === 'published');
      if (!article) {
        sendJson(res, 404, { error: 'Article introuvable.' });
        return;
      }
      sendJson(res, 200, article);
      return;
    }

    // PUBLIC: contact
    if (req.method === 'POST' && pathname === '/api/public/contact') {
      const raw = await readBody(req, { maxBytes: 256 * 1024 });
      const data = parseJsonBody(raw);

      const name = String(data.name || '').trim();
      const email = String(data.email || '').trim();
      const message = String(data.message || '').trim();

      if (!name || !email || !message) {
        sendJson(res, 400, { error: 'Champs obligatoires manquants.' });
        return;
      }

      const record = {
        id: `msg_${crypto.randomBytes(8).toString('hex')}`,
        name,
        email,
        message,
        createdAt: new Date().toISOString()
      };
      await appendMessage(record);
      sendJson(res, 200, { ok: true });
      return;
    }

    // ADMIN: auth
    if (req.method === 'POST' && pathname === '/api/admin/auth/login') {
      const raw = await readBody(req, { maxBytes: 64 * 1024 });
      const data = parseJsonBody(raw);
      const username = String(data.username || '').trim();
      const password = String(data.password || '');

      const users = await getUsers();
      if (users.length === 0) {
        sendJson(res, 503, {
          error:
            "Aucun utilisateur n'est configuré. Créez un compte avec: npm run create-user -- --username <login> --password <motdepasse> --role admin"
        });
        return;
      }
      const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
      if (!user) {
        sendJson(res, 401, { error: 'Identifiants invalides.' });
        return;
      }

      const ok = await verifyPassword(password, user.password);
      if (!ok) {
        sendJson(res, 401, { error: 'Identifiants invalides.' });
        return;
      }

      const sid = crypto.randomBytes(24).toString('hex');
      sessions.set(sid, { userId: user.id, expiresAt: Date.now() + sessionTtlSeconds * 1000 });
      setCookie(res, 'sid', sid, {
        httpOnly: true,
        secure: cookieSecure,
        sameSite: 'Lax',
        path: '/',
        maxAge: sessionTtlSeconds
      });
      sendJson(res, 200, { user: publicUser(user) });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/admin/auth/logout') {
      const session = getSession(req);
      if (session?.sid) sessions.delete(session.sid);
      clearCookie(res, 'sid', { path: '/' });
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/admin/auth/me') {
      const user = await requireUser(req, res);
      if (!user) return;
      sendJson(res, 200, { user: publicUser(user) });
      return;
    }

    // ADMIN: articles
    if (req.method === 'GET' && pathname === '/api/admin/articles') {
      const user = await requireUser(req, res);
      if (!user) return;
      const articles = await getArticles();
      sendJson(res, 200, articles);
      return;
    }

    if (req.method === 'POST' && pathname === '/api/admin/articles') {
      const user = await requireUser(req, res);
      if (!user) return;

      const raw = await readBody(req, { maxBytes: 512 * 1024 });
      const data = parseJsonBody(raw);

      const title = String(data.title || '').trim();
      const summary = String(data.summary || '').trim();
      const content = String(data.content || '').trim();
      const coverImageUrl = String(data.coverImageUrl || '').trim();
      const status = data.status === 'published' ? 'published' : 'draft';

      if (!title || !summary) {
        sendJson(res, 400, { error: 'Titre et résumé obligatoires.' });
        return;
      }

      const slug = slugify(data.slug || title);
      if (!slug) {
        sendJson(res, 400, { error: 'Slug invalide.' });
        return;
      }

      const articles = await getArticles();
      if (articles.some((a) => a.slug === slug)) {
        sendJson(res, 409, { error: 'Un article avec ce slug existe déjà.' });
        return;
      }

      const now = new Date().toISOString();
      const article = {
        id: `art_${crypto.randomBytes(8).toString('hex')}`,
        title,
        slug,
        summary,
        content,
        coverImageUrl,
        status,
        createdAt: now,
        updatedAt: now,
        publishedAt: status === 'published' ? now : null
      };
      articles.push(article);
      await saveArticles(articles);
      sendJson(res, 200, article);
      return;
    }

    if (pathname.startsWith('/api/admin/articles/')) {
      const user = await requireUser(req, res);
      if (!user) return;

      const id = decodeURIComponent(pathname.slice('/api/admin/articles/'.length));
      const articles = await getArticles();
      const idx = articles.findIndex((a) => a.id === id);
      if (idx === -1) {
        sendJson(res, 404, { error: 'Article introuvable.' });
        return;
      }

      if (req.method === 'PUT') {
        const raw = await readBody(req, { maxBytes: 512 * 1024 });
        const data = parseJsonBody(raw);

        const title = String(data.title || '').trim();
        const summary = String(data.summary || '').trim();
        const content = String(data.content || '').trim();
        const coverImageUrl = String(data.coverImageUrl || '').trim();
        const status = data.status === 'published' ? 'published' : 'draft';
        const slug = slugify(data.slug || title);

        if (!title || !summary || !slug) {
          sendJson(res, 400, { error: 'Titre, résumé et slug obligatoires.' });
          return;
        }

        if (articles.some((a) => a.slug === slug && a.id !== id)) {
          sendJson(res, 409, { error: 'Slug déjà utilisé.' });
          return;
        }

        const now = new Date().toISOString();
        const previous = articles[idx];
        articles[idx] = {
          ...previous,
          title,
          slug,
          summary,
          content,
          coverImageUrl,
          status,
          updatedAt: now,
          publishedAt: status === 'published' ? previous.publishedAt || now : null
        };
        await saveArticles(articles);
        sendJson(res, 200, articles[idx]);
        return;
      }

      if (req.method === 'DELETE') {
        articles.splice(idx, 1);
        await saveArticles(articles);
        sendJson(res, 200, { ok: true });
        return;
      }
    }

    // ADMIN: uploads (base64)
    if (req.method === 'POST' && pathname === '/api/admin/uploads') {
      const user = await requireUser(req, res);
      if (!user) return;

      const raw = await readBody(req, { maxBytes: 8 * 1024 * 1024 });
      const data = parseJsonBody(raw);
      const parsed = dataUrlToBuffer(data.dataUrl);
      if (!parsed) {
        sendJson(res, 400, { error: 'Fichier invalide.' });
        return;
      }

      const ext = extFromMime(parsed.mime);
      if (!ext) {
        sendJson(res, 400, { error: 'Type de fichier non supporté.' });
        return;
      }

      const safeName = sanitizeFileName(data.fileName || `upload${ext}`);
      const base = safeName.replace(/\.[a-z0-9]+$/i, '');
      const filename = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}_${base}${ext}`;
      const dest = path.join(uploadsDir, filename);
      await fs.writeFile(dest, parsed.buffer);
      sendJson(res, 200, { url: `/uploads/${filename}` });
      return;
    }

    // ADMIN: users (admin only)
    if (req.method === 'GET' && pathname === '/api/admin/users') {
      const user = await requireUser(req, res);
      if (!user) return;
      if (!requireAdmin(res, user)) return;

      const users = await getUsers();
      sendJson(res, 200, users.map(publicUser));
      return;
    }

    if (req.method === 'POST' && pathname === '/api/admin/users') {
      const user = await requireUser(req, res);
      if (!user) return;
      if (!requireAdmin(res, user)) return;

      const raw = await readBody(req, { maxBytes: 64 * 1024 });
      const data = parseJsonBody(raw);

      const username = String(data.username || '').trim();
      const password = String(data.password || '');
      const role = data.role === 'admin' ? 'admin' : 'editor';

      if (!username || !password) {
        sendJson(res, 400, { error: 'username et password obligatoires.' });
        return;
      }

      const users = await getUsers();
      if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
        sendJson(res, 409, { error: 'Utilisateur déjà existant.' });
        return;
      }

      const { salt, hash } = await hashPassword(password);
      const now = new Date().toISOString();
      const newUser = {
        id: `usr_${crypto.randomBytes(8).toString('hex')}`,
        username,
        password: { salt, hash },
        role,
        createdAt: now
      };
      users.push(newUser);
      await saveUsers(users);
      sendJson(res, 200, { user: publicUser(newUser) });
      return;
    }

    if (req.method === 'DELETE' && pathname.startsWith('/api/admin/users/')) {
      const user = await requireUser(req, res);
      if (!user) return;
      if (!requireAdmin(res, user)) return;

      const id = decodeURIComponent(pathname.slice('/api/admin/users/'.length));
      if (id === user.id) {
        sendJson(res, 400, { error: 'Vous ne pouvez pas supprimer votre propre compte.' });
        return;
      }
      const users = await getUsers();
      const idx = users.findIndex((u) => u.id === id);
      if (idx === -1) {
        sendJson(res, 404, { error: 'Utilisateur introuvable.' });
        return;
      }

      const deleting = users[idx];
      if (deleting.role === 'admin') {
        const remainingAdmins = users.filter((u) => u.role === 'admin' && u.id !== id).length;
        if (remainingAdmins === 0) {
          sendJson(res, 400, { error: 'Impossible de supprimer le dernier admin.' });
          return;
        }
      }
      users.splice(idx, 1);
      await saveUsers(users);
      sendJson(res, 200, { ok: true });
      return;
    }

    // Static uploads
    if (req.method === 'GET' && pathname.startsWith('/uploads/')) {
      const rel = pathname.slice('/uploads/'.length);
      const safeRel = rel.replace(/\\/g, '/');
      if (safeRel.includes('..')) {
        sendText(res, 400, 'Bad request');
        return;
      }
      const filePath = path.join(uploadsDir, safeRel);
      try {
        await serveFile(res, filePath);
      } catch {
        sendText(res, 404, 'Not found');
      }
      return;
    }

    // Serve frontend (production)
    try {
      const exists = await fs
        .stat(distDir)
        .then((s) => s.isDirectory())
        .catch(() => false);

      if (!exists) {
        sendText(
          res,
          200,
          isDev
            ? 'Serveur API démarré. Lancez aussi Vite: npm run dev'
            : 'Build frontend manquant. Lancez: npm run build'
        );
        return;
      }

      const candidate = path.join(distDir, pathname.replace(/^\//, ''));
      const normalized = path.normalize(candidate);
      if (!normalized.startsWith(distDir)) {
        sendText(res, 400, 'Bad request');
        return;
      }

      const stats = await fs.stat(normalized).catch(() => null);
      if (stats && stats.isFile()) {
        await serveFile(res, normalized);
        return;
      }

      await serveFile(res, path.join(distDir, 'index.html'));
      return;
    } catch (error) {
      sendJson(res, 500, { error: error?.message || 'Erreur serveur.' });
    }
  } catch (error) {
    if (error?.status) {
      sendJson(res, error.status, { error: error.message });
      return;
    }
    sendJson(res, 500, { error: error?.message || 'Erreur serveur.' });
  }
});

server.listen(port, host, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on http://${host}:${port}`);
  // eslint-disable-next-line no-console
  console.log(`Allowed origins: ${allowedOrigins.join(', ') || '(none)'}`);
});
