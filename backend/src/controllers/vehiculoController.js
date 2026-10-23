const vehiculoService = require('../services/vehiculoService');
const { ZodError } = require('zod');
const { ROLES } = require('../utils/auth');

async function handleListarVehiculos(req, res) {
  try {
    const incluirInactivos = req.query.todos === 'true' && req.usuario.rol === ROLES.ADMIN;
    const vehiculos = await vehiculoService.listarVehiculos({ incluirInactivos });
    return res.status(200).json({ ok: true, total: vehiculos.length, data: vehiculos });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}

async function handleCrearVehiculo(req, res) {
  try {
    const vehiculo = await vehiculoService.crearVehiculo(req.body);
    return res.status(201).json({ ok: true, mensaje: 'Vehículo registrado en la flota', data: vehiculo });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        ok: false,
        error: 'Error de validación de datos',
        detalles: error.errors.map(e => ({ campo: e.path.join('.'), mensaje: e.message })),
      });
    }
    if (error.code === '23505') {
      return res.status(409).json({ ok: false, error: 'Ya existe un vehículo con esa placa' });
    }
    return res.status(500).json({ ok: false, error: error.message });
  }
}

async function handleCambiarEstadoVehiculo(req, res) {
  try {
    if (typeof req.body.activo !== 'boolean') {
      return res.status(400).json({ ok: false, error: 'El campo "activo" debe ser true o false' });
    }
    const vehiculo = await vehiculoService.cambiarEstadoVehiculo(req.params.id, req.body.activo);
    if (!vehiculo) {
      return res.status(404).json({ ok: false, error: 'Vehículo no encontrado' });
    }
    return res.status(200).json({ ok: true, data: vehiculo });
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}

module.exports = {
  handleListarVehiculos,
  handleCrearVehiculo,
  handleCambiarEstadoVehiculo,
};
