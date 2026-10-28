const crypto = require('crypto');

const ROLES = { ADMIN: 'ADMIN', USUARIO: 'USUARIO' };

function getSecret() {
  return process.env.JWT_SECRET || 'ecologcity-jwt-secret-pfa-2026-production-key-huancayo';
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
function signToken(payload, expiresIn = '24h') {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + parseExpiresIn(expiresIn);
  const cuerpo = { ...payload, exp };

  const encabezadoCod = base64url(JSON.stringify(header));
  const cuerpoCod = base64url(JSON.stringify(cuerpo));
  const datos = `${encabezadoCod}.${cuerpoCod}`;

  const firma = crypto.createHmac('sha256', getSecret()).update(datos).digest('base64url');
  return `${datos}.${firma}`;
}

/**
 * Verifica la firma y la fecha de expiración de un JWT.
 * Devuelve el payload si es válido o null si es inválido o expiró.
 */
function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const partes = token.split('.');
  if (partes.length !== 3) return null;

  const [encabezadoCod, cuerpoCod, firmaRecibida] = partes;
  const datos = `${encabezadoCod}.${cuerpoCod}`;
  const firmaEsperada = crypto.createHmac('sha256', getSecret()).update(datos).digest('base64url');

  if (firmaRecibida.length !== firmaEsperada.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(firmaRecibida), Buffer.from(firmaEsperada))) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(cuerpoCod, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      return null;
    }
    return payload;
  } catch (e) {
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
