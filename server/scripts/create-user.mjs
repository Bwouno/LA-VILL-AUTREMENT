import crypto from 'node:crypto';
import path from 'node:path';
import { getDirname } from '../lib/paths.mjs';
import { hashPassword } from '../lib/passwords.mjs';
import { readJson, writeJsonAtomic } from '../lib/storage.mjs';

const dirname = getDirname(import.meta.url);
const dataFile = path.join(dirname, '..', 'data', 'users.json');

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith('--')) continue;
    const name = key.slice(2);
    const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : 'true';
    args[name] = value;
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const username = args.username || args.user;
const password = args.password || args.pass;
const role = args.role || 'editor';

if (!username || !password) {
  // eslint-disable-next-line no-console
  console.log(
    'Usage: npm run create-user -- --username <login> --password <motdepasse> [--role admin|editor]'
  );
  process.exit(1);
}

const users = await readJson(dataFile, []);
if (users.some((u) => u.username.toLowerCase() === String(username).toLowerCase())) {
  // eslint-disable-next-line no-console
  console.log(`Utilisateur déjà existant: ${username}`);
  process.exit(1);
}

const { salt, hash } = await hashPassword(password);
const now = new Date().toISOString();
const user = {
  id: `usr_${crypto.randomBytes(8).toString('hex')}`,
  username,
  password: { salt, hash },
  role: role === 'admin' ? 'admin' : 'editor',
  createdAt: now
};

users.push(user);
await writeJsonAtomic(dataFile, users);

// eslint-disable-next-line no-console
console.log(`✅ Utilisateur créé: ${username} (${user.role})`);

