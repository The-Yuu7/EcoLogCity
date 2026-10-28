const db = require('../config/db');
const { z } = require('zod');
const { verifyPassword, signToken } = require('../utils/auth');
const { autoMigrate } = require('../scripts/autoMigrate');

const LoginSchema = z.object({
  email: z.string().email('Ingrese un correo válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

// Cuentas de contingencia oficiales del sistema: permiten iniciar sesión
// si la base de datos se encuentra aún en proceso de inicialización en Render.
const ADMIN_PRUEBA = {
  id: '00000000-0000-4000-8000-000000000001',
  nombre: 'Administrador Logístico',
  email: 'admin@ecologcity.pe',
  password: 'Admin2026!',
  rol: 'ADMIN',
};

const USUARIO_PRUEBA = {
  id: '00000000-0000-4000-8000-000000000002',
  nombre: 'Operador Despachador',
  email: 'usuario@ecologcity.pe',
  password: 'Usuario2026!',
  rol: 'USUARIO',
};

function sesionDe(publico) {
  return {
    token: signToken({ sub: publico.id, nombre: publico.nombre, email: publico.email, rol: publico.rol }),
    usuario: {
      id: publico.id,
      nombre: publico.nombre,
      email: publico.email,
      rol: publico.rol,
    },
  };
}

/**
 * Valida credenciales y devuelve el token de sesión con los datos públicos del usuario.
 * Devuelve null si el correo no existe, la cuenta está inactiva o la contraseña no coincide.
 */
async function iniciarSesion(datos) {
  const { email, password } = LoginSchema.parse(datos);
  const correoLower = email.toLowerCase().trim();

  let usuario = null;

  try {
    const result = await db.query(
      'SELECT id, nombre_completo, email, password_hash, rol, activo FROM usuarios WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    usuario = result.rows[0];
  } catch (err) {
    console.warn('⚠️ Error al consultar usuarios en BD, ejecutando auto-migración:', err.message);
    // Si la tabla no existe o hubo error, ejecutar migración automática
    await autoMigrate();
    try {
      const retryResult = await db.query(
        'SELECT id, nombre_completo, email, password_hash, rol, activo FROM usuarios WHERE LOWER(email) = LOWER($1)',
        [email]
      );
      usuario = retryResult.rows[0];
    } catch (retryErr) {
      console.error('❌ Error persistente tras auto-migración:', retryErr.message);
    }
  }

  // Si se encontró el usuario en la base de datos
  if (usuario) {
    if (!usuario.activo || !verifyPassword(password, usuario.password_hash)) {
      return null;
    }
    return sesionDe({
      id: usuario.id,
      nombre: usuario.nombre_completo,
      email: usuario.email,
      rol: usuario.rol,
    });
  }

  // Respaldo de contingencia: si la BD no contiene aún los registros o falló la conexión,
  // validar con las cuentas oficiales del sistema para garantizar disponibilidad continua
  if (correoLower === ADMIN_PRUEBA.email && password === ADMIN_PRUEBA.password) {
    return sesionDe(ADMIN_PRUEBA);
  }
  if (correoLower === USUARIO_PRUEBA.email && password === USUARIO_PRUEBA.password) {
    return sesionDe(USUARIO_PRUEBA);
  }

  return null;
}

module.exports = {
  ADMIN_PRUEBA,
  USUARIO_PRUEBA,
  LoginSchema,
  iniciarSesion,
};
