const db = require('../config/db');
const { z } = require('zod');
const { ROLES, hashPassword, verifyPassword } = require('../utils/auth');

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

// Perfil propio (US-016): nombre, correo y contraseña.
// Cambiar el correo o la contraseña exige confirmar la contraseña actual.
const PerfilSchema = z.object({
  nombre_completo: z.string().trim().min(3, 'El nombre es obligatorio').optional(),
  email: z.string().trim().email('Ingrese un correo válido').transform(e => e.toLowerCase()).optional(),
  password_actual: z.string().optional(),
  password_nueva: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres').optional(),
}).refine(d => d.nombre_completo || d.email || d.password_nueva, {
  message: 'No hay cambios que guardar',
}).refine(d => !(d.email || d.password_nueva) || d.password_actual, {
  message: 'Ingrese su contraseña actual para cambiar el correo o la contraseña',
  path: ['password_actual'],
});

function errorConEstado(mensaje, status) {
  const error = new Error(mensaje);
  error.status = status;
  return error;
}

async function obtenerPerfil(id) {
  const result = await db.query(`SELECT ${COLUMNAS_PUBLICAS} FROM usuarios WHERE id = $1`, [id]);
  return result.rows[0] || null;
}

async function actualizarPerfil(id, datos) {
  const cambios = PerfilSchema.parse(datos);

  const actual = await db.query('SELECT id, email, password_hash FROM usuarios WHERE id = $1 AND activo = true', [id]);
  if (!actual.rows[0]) throw errorConEstado('Perfil no encontrado', 404);

  const emailCambia = cambios.email && cambios.email !== actual.rows[0].email;
  if ((emailCambia || cambios.password_nueva) && !verifyPassword(cambios.password_actual, actual.rows[0].password_hash)) {
    throw errorConEstado('La contraseña actual no es correcta', 400);
  }

  const result = await db.query(
    `UPDATE usuarios
     SET nombre_completo = COALESCE($2, nombre_completo),
         email = COALESCE($3, email),
         password_hash = COALESCE($4, password_hash)
     WHERE id = $1 RETURNING ${COLUMNAS_PUBLICAS};`,
    [id, cambios.nombre_completo ?? null, emailCambia ? cambios.email : null,
      cambios.password_nueva ? hashPassword(cambios.password_nueva) : null]
  );
  return result.rows[0];
}

module.exports = {
  PerfilSchema,
  obtenerPerfil,
  actualizarPerfil,
  UsuarioSchema,
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
};
