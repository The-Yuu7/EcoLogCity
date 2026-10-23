const db = require('../config/db');
const { z } = require('zod');

const VehiculoSchema = z.object({
  placa: z.string().trim().min(6, 'La placa es obligatoria').max(10).transform(p => p.toUpperCase()),
  marca: z.string().trim().min(2, 'La marca es obligatoria'),
  modelo: z.string().trim().min(1, 'El modelo es obligatorio'),
  tipo_vehiculo: z.enum(['CAMIONETA', 'FURGON_MEDIANO', 'FURGON_GRANDE']).default('FURGON_MEDIANO'),
  capacidad_peso_kg: z.number().positive('La capacidad de peso debe ser mayor a 0'),
  capacidad_volumen_m3: z.number().positive('La capacidad de volumen debe ser mayor a 0'),
  consumo_gal_km: z.number().positive('El consumo debe ser mayor a 0').default(0.12),
  tipo_combustible: z.enum(['DIESEL', 'GNV']).default('DIESEL'),
});

/**
 * Lista la flota. Por defecto solo vehículos activos (los que usa el motor VRP).
 */
async function listarVehiculos({ incluirInactivos = false } = {}) {
  const query = incluirInactivos
    ? 'SELECT * FROM vehiculos ORDER BY activo DESC, capacidad_peso_kg DESC;'
    : 'SELECT * FROM vehiculos WHERE activo = true ORDER BY capacidad_peso_kg DESC;';
  const result = await db.query(query);
  return result.rows;
}

async function crearVehiculo(datos) {
  const v = VehiculoSchema.parse(datos);
  const result = await db.query(
    `INSERT INTO vehiculos (placa, marca, modelo, tipo_vehiculo, capacidad_peso_kg, capacidad_volumen_m3, consumo_gal_km, tipo_combustible)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`,
    [v.placa, v.marca, v.modelo, v.tipo_vehiculo, v.capacidad_peso_kg, v.capacidad_volumen_m3, v.consumo_gal_km, v.tipo_combustible]
  );
  return result.rows[0];
}

/**
 * Activa o da de baja un vehículo (no se elimina para conservar el historial de rutas)
 */
async function cambiarEstadoVehiculo(id, activo) {
  const result = await db.query(
    'UPDATE vehiculos SET activo = $2 WHERE id = $1 RETURNING *;',
    [id, activo]
  );
  return result.rows[0] || null;
}

module.exports = {
  VehiculoSchema,
  listarVehiculos,
  crearVehiculo,
  cambiarEstadoVehiculo,
};
