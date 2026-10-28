const db = require('../config/db');
const { z } = require('zod');
const { ROLES, hashPassword } = require('../utils/auth');

const COLUMNAS_PUBLICAS = 'id, nombre_completo, email, rol, activo, created_at';

const UsuarioSchema = z.object({
  nombre_completo: z.string().trim().min(3, 'El nombre es obligatorio'),
  email: z.string().trim().email('Ingrese un correo válido').transform(e => e.toLowerCase()),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  rol: z.enum([ROLES.ADMIN, ROLES.USUARIO]).default(ROLES.USUARIO),
});

const ActualizacionSchema = z.object({
  rol: z.enum([ROLES.ADMIN, ROLES.USUARIO]).optional(),
  activo: z.boolean().optional(),
}).refine(d => d.rol !== undefined || d.activo !== undefined, {
  message: 'Indique el rol o el estado a actualizar',
});

/**
 * Lista los usuarios con la cantidad de pedidos que registró cada uno (sin exponer contraseñas)
 */
async function listarUsuarios() {
  const result = await db.query(`
    SELECT u.id, u.nombre_completo, u.email, u.rol, u.activo, u.created_at,
           COUNT(p.id) FILTER (WHERE p.estado <> 'CANCELADO') AS pedidos_registrados
    FROM usuarios u
    LEFT JOIN pedidos p ON p.usuario_id = u.id
    GROUP BY u.id
    ORDER BY u.rol, u.nombre_completo;
  `);
  return result.rows;
}

async function crearUsuario(datos) {
  const u = UsuarioSchema.parse(datos);
  const result = await db.query(
    `INSERT INTO usuarios (nombre_completo, email, password_hash, rol)
     VALUES ($1, $2, $3, $4) RETURNING ${COLUMNAS_PUBLICAS};`,
    [u.nombre_completo, u.email, hashPassword(u.password), u.rol]
  );
  return result.rows[0];
}

/**
 * Cambia el rol o activa/desactiva una cuenta.
 * Un administrador no puede quitarse a sí mismo el rol ni desactivar su propia cuenta.
 */
async function actualizarUsuario(id, datos, solicitante) {
  const cambios = ActualizacionSchema.parse(datos);
  if (solicitante && solicitante.id === id && (cambios.activo === false || cambios.rol === ROLES.USUARIO)) {
    const error = new Error('No puede desactivar ni quitar el rol de administrador a su propia cuenta');
    error.status = 400;
    throw error;
  }

  const result = await db.query(
    `UPDATE usuarios
     SET rol = COALESCE($2, rol), activo = COALESCE($3, activo)
     WHERE id = $1 RETURNING ${COLUMNAS_PUBLICAS};`,
    [id, cambios.rol ?? null, cambios.activo ?? null]
  );
  return result.rows[0] || null;
}

module.exports = {
  UsuarioSchema,
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
};
