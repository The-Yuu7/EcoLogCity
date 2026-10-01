const db = require('../config/db');
const { geocodificarDireccion } = require('./geocodingService');
const { z } = require('zod');

// Esquema de validación para registro de pedidos
const PedidoSchema = z.object({
  cliente_nombre: z.string().min(2, 'El nombre del cliente es obligatorio'),
  cliente_telefono: z.string().optional(),
  cliente_email: z.string().email().optional().or(z.literal('')),
  direccion_texto: z.string().min(3, 'La dirección es obligatoria'),
  distrito: z.string().min(2, 'El distrito es obligatorio'),
  referencia: z.string().optional(),
  latitud: z.number().min(-13).max(-11).optional(),
  longitud: z.number().min(-76).max(-74).optional(),
  peso_kg: z.number().positive('El peso debe ser mayor a 0').default(1.0),
  volumen_m3: z.number().positive('El volumen debe ser mayor a 0').default(0.05),
  ventana_inicio: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, 'Formato de hora HH:MM inválido'),
  ventana_fin: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, 'Formato de hora HH:MM inválido'),
  tiempo_servicio_min: z.number().int().positive().default(10),
  prioridad: z.number().int().min(1).max(5).default(1),
  observaciones: z.string().optional(),
}).refine(data => {
  return data.ventana_fin > data.ventana_inicio;
}, {
  message: 'La ventana de fin debe ser posterior a la ventana de inicio',
  path: ['ventana_fin'],
});

/**
 * Registra un nuevo pedido con geocodificación automática si no se envían coordenadas
 */
async function crearPedido(datos) {
  const validado = PedidoSchema.parse(datos);

  let lat = validado.latitud;
  let lon = validado.longitud;
  let geocodificadoInfo = null;

  // Si no se proporcionaron coordenadas, geocodificar automáticamente
  if (!lat || !lon) {
    geocodificadoInfo = await geocodificarDireccion(validado.direccion_texto, validado.distrito);
    lat = geocodificadoInfo.latitud;
    lon = geocodificadoInfo.longitud;
  }

  // Generar código de seguimiento único
  const fechaStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const codigoSeguimiento = `PED-HYO-${fechaStr}-${randomSuffix}`;

  const query = `
    INSERT INTO pedidos (
      codigo_seguimiento,
      cliente_nombre,
      cliente_telefono,
      cliente_email,
      direccion_texto,
      distrito,
      referencia,
      latitud,
      longitud,
      peso_kg,
      volumen_m3,
      ventana_inicio,
      ventana_fin,
      tiempo_servicio_min,
      prioridad,
      observaciones,
      estado
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'REGISTRADO'
    ) RETURNING *;
  `;

  const values = [
    codigoSeguimiento,
    validado.cliente_nombre,
    validado.cliente_telefono || null,
    validado.cliente_email || null,
    validado.direccion_texto,
    validado.distrito,
    validado.referencia || null,
    lat,
    lon,
    validado.peso_kg,
    validado.volumen_m3,
    validado.ventana_inicio,
    validado.ventana_fin,
    validado.tiempo_servicio_min,
    validado.prioridad,
    validado.observaciones || null,
  ];

  const result = await db.query(query, values);
  const pedidoCreado = result.rows[0];

  return {
    pedido: pedidoCreado,
    geocodificacion: geocodificadoInfo,
  };
}

/**
 * Obtiene la lista de pedidos con filtros opcionales
 */
async function listarPedidos(filtros = {}) {
  let query = 'SELECT * FROM pedidos WHERE 1=1';
  const params = [];
  let paramIndex = 1;

  if (filtros.distrito) {
    query += ` AND distrito ILIKE $${paramIndex++}`;
    params.push(`%${filtros.distrito}%`);
  }

  if (filtros.estado) {
    query += ` AND estado = $${paramIndex++}`;
    params.push(filtros.estado);
  }

  query += ' ORDER BY created_at DESC';

  if (filtros.limit) {
    query += ` LIMIT $${paramIndex++}`;
    params.push(parseInt(filtros.limit, 10));
  }

  const result = await db.query(query, params);
  return result.rows;
}

/**
 * Obtiene estadísticas generales de los pedidos registrados (insumos para el motor VRP)
 */
async function obtenerEstadisticasPedidos() {
  const query = `
    SELECT 
      COUNT(*) AS total_pedidos,
      COUNT(*) FILTER (WHERE estado = 'REGISTRADO') AS pendientes_planificar,
      COALESCE(SUM(peso_kg), 0) AS peso_total_kg,
      COALESCE(SUM(volumen_m3), 0) AS volumen_total_m3,
      MIN(ventana_inicio) AS primera_ventana,
      MAX(ventana_fin) AS ultima_ventana
    FROM pedidos;
  `;

  const result = await db.query(query);
  return result.rows[0];
}

/**
 * Obtiene un pedido por su ID o código de seguimiento
 */
async function obtenerPedidoPorId(id) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const query = isUuid
    ? 'SELECT * FROM pedidos WHERE id = $1'
    : 'SELECT * FROM pedidos WHERE codigo_seguimiento = $1';

  const result = await db.query(query, [id]);
  return result.rows[0] || null;
}

/**
 * Elimina o cancela un pedido
 */
async function cancelarPedido(id) {
  const query = `
    UPDATE pedidos 
    SET estado = 'CANCELADO', updated_at = CURRENT_TIMESTAMP 
    WHERE id = $1 
    RETURNING *;
  `;
  const result = await db.query(query, [id]);
  return result.rows[0] || null;
}

module.exports = {
  PedidoSchema,
  crearPedido,
  listarPedidos,
  obtenerEstadisticasPedidos,
  obtenerPedidoPorId,
  cancelarPedido,
};
