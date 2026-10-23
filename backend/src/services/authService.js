const db = require('../config/db');
const { z } = require('zod');
const { verifyPassword, signToken } = require('../utils/auth');

const LoginSchema = z.object({
  email: z.string().email('Ingrese un correo válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

// Administrador de pruebas definido en código: permite iniciar sesión sin depender
// de la tabla usuarios. Solo funciona fuera de producción.
// Su id coincide con el admin de database/seeds/002_seed_usuarios.sql.
const ADMIN_PRUEBA = {
  id: '00000000-0000-4000-8000-000000000001',
  nombre: 'Administrador de Pruebas',
  email: 'admin@ecologcity.pe',
  password: 'Admin2026!',
  rol: 'ADMIN',
};

function sesionDe(publico) {
  return {
    token: signToken({ sub: publico.id, nombre: publico.nombre, email: publico.email, rol: publico.rol }),
    usuario: publico,
  };
}

/**
 * Valida credenciales y devuelve el token de sesión con los datos públicos del usuario.
 * Devuelve null si el correo no existe, la cuenta está inactiva o la contraseña no coincide.
 */
async function iniciarSesion(datos) {
  const { email, password } = LoginSchema.parse(datos);

  if (process.env.NODE_ENV !== 'production'
    && email.toLowerCase() === ADMIN_PRUEBA.email && password === ADMIN_PRUEBA.password) {
    const { password: _omitida, ...publico } = ADMIN_PRUEBA;
    return sesionDe(publico);
  }

  const result = await db.query(
    'SELECT id, nombre_completo, email, password_hash, rol, activo FROM usuarios WHERE LOWER(email) = LOWER($1)',
    [email]
  );
  const usuario = result.rows[0];

  if (!usuario || !usuario.activo || !verifyPassword(password, usuario.password_hash)) {
    return null;
  }

  const publico = {
    id: usuario.id,
    nombre: usuario.nombre_completo,
    email: usuario.email,
    rol: usuario.rol,
  };

  return sesionDe(publico);
}

module.exports = {
  ADMIN_PRUEBA,
  LoginSchema,
  iniciarSesion,
};
