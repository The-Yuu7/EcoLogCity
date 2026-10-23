const authService = require('../services/authService');
const { ZodError } = require('zod');

async function handleLogin(req, res) {
  try {
    const sesion = await authService.iniciarSesion(req.body);
    if (!sesion) {
      return res.status(401).json({
        ok: false,
        error: 'Correo o contraseña incorrectos',
      });
    }
    return res.status(200).json({
      ok: true,
      mensaje: 'Inicio de sesión exitoso',
      data: sesion,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        ok: false,
        error: 'Error de validación de datos',
        detalles: error.errors.map(e => ({ campo: e.path.join('.'), mensaje: e.message })),
      });
    }
    return res.status(500).json({
      ok: false,
      error: error.message || 'Error al iniciar sesión',
    });
  }
}

function handleSesionActual(req, res) {
  return res.status(200).json({
    ok: true,
    data: req.usuario,
  });
}

module.exports = {
  handleLogin,
  handleSesionActual,
};
