const usuarioService = require('../services/usuarioService');
const { ZodError } = require('zod');

function responderError(res, error) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      ok: false,
      error: 'Error de validación de datos',
      detalles: error.errors.map(e => ({ campo: e.path.join('.'), mensaje: e.message })),
    });
  }
  if (error.code === '23505') {
    return res.status(409).json({ ok: false, error: 'Ya existe un usuario con ese correo' });
  }
  return res.status(error.status || 500).json({ ok: false, error: error.message });
}

async function handleListarUsuarios(req, res) {
  try {
    const usuarios = await usuarioService.listarUsuarios();
    return res.status(200).json({ ok: true, total: usuarios.length, data: usuarios });
  } catch (error) {
    return responderError(res, error);
  }
}

async function handleCrearUsuario(req, res) {
  try {
    const usuario = await usuarioService.crearUsuario(req.body);
    return res.status(201).json({ ok: true, mensaje: 'Usuario registrado', data: usuario });
  } catch (error) {
    return responderError(res, error);
  }
}

async function handleActualizarUsuario(req, res) {
  try {
    const usuario = await usuarioService.actualizarUsuario(req.params.id, req.body, req.usuario);
    if (!usuario) {
      return res.status(404).json({ ok: false, error: 'Usuario no encontrado' });
    }
    return res.status(200).json({ ok: true, data: usuario });
  } catch (error) {
    return responderError(res, error);
  }
}

module.exports = {
  handleListarUsuarios,
  handleCrearUsuario,
  handleActualizarUsuario,
};
