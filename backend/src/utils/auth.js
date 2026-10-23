const crypto = require('crypto');

const ROLES = { ADMIN: 'ADMIN', USUARIO: 'USUARIO' };

function getSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET no está configurado');
  }
  return 'ecologcity-dev-secret';
}

function parseExpiresIn(value) {
  const match = /^(\d+)([smhd])$/.exec(value || '24h');
  if (!match) return 24 * 3600;
  const unidades = { s: 1, m: 60, h: 3600, d: 86400 };
  return parseInt(match[1], 10) * unidades[match[2]];
}

const base64url = (input) => Buffer.from(input).toString('base64url');

/**
 * Genera el hash de una contraseña con scrypt (formato: salt:hash en hex)
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = (stored || '').split(':');
  if (!salt || !hash) return false;
  const calculado = crypto.scryptSync(password, salt, 64);
  const guardado = Buffer.from(hash, 'hex');
  return guardado.length === calculado.length && crypto.timingSafeEqual(guardado, calculado);
}

/**
 * Firma un token JWT (HS256) con los datos de sesión del usuario
 */
function signToken(payload) {
  const ahora = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify({
    ...payload,
    iat: ahora,
    exp: ahora + parseExpiresIn(process.env.JWT_EXPIRES_IN),
  }));
  const firma = crypto.createHmac('sha256', getSecret()).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${firma}`;
}

/**
 * Verifica firma y expiración del token. Devuelve el payload o null si es inválido.
 */
function verifyToken(token) {
  const partes = (token || '').split('.');
  if (partes.length !== 3) return null;
  const [header, body, firma] = partes;

  const esperada = crypto.createHmac('sha256', getSecret()).update(`${header}.${body}`).digest();
  const recibida = Buffer.from(firma, 'base64url');
  if (recibida.length !== esperada.length || !crypto.timingSafeEqual(recibida, esperada)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

module.exports = {
  ROLES,
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
};
