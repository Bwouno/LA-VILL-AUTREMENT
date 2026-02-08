import crypto from 'node:crypto';

function scryptAsync(password, salt, keylen, options) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, keylen, options, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

export async function hashPassword(password) {
  if (typeof password !== 'string' || password.length < 8) {
    throw new Error('Mot de passe trop court (8 caractères minimum).');
  }

  const salt = crypto.randomBytes(16);
  const keylen = 64;
  const derived = await scryptAsync(password, salt, keylen, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024
  });

  return {
    salt: salt.toString('base64'),
    hash: Buffer.from(derived).toString('base64')
  };
}

export async function verifyPassword(password, passwordRecord) {
  if (!passwordRecord || !passwordRecord.salt || !passwordRecord.hash) return false;
  const salt = Buffer.from(passwordRecord.salt, 'base64');
  const expected = Buffer.from(passwordRecord.hash, 'base64');
  const derived = await scryptAsync(password, salt, expected.length, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024
  });
  return crypto.timingSafeEqual(Buffer.from(derived), expected);
}

