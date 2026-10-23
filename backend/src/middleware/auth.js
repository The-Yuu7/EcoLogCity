const { verifyToken } = require('../utils/auth');

/**
 * Exige un token Bearer válido y deja los datos de sesión en req.usuario
 */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  const payload = verifyToken(token);

  if (!payload) {
    return res.status(401).json({
      ok: false,
      error: 'Sesión no válida o expirada. Inicie sesión nuevamente.',
    });
  }

  req.usuario = { id: payload.sub, nombre: payload.nombre, email: payload.email, rol: payload.rol };
  return next();
}

/**
 * Restringe la ruta a los roles indicados (usar después de requireAuth)
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return res.status(403).json({
        ok: false,
        error: 'No tiene permisos para realizar esta acción',
      });
    }
    return next();
  };
}

module.exports = {
  requireAuth,
  requireRole,
};
