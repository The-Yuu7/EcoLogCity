const db = require('../config/db');
const { z } = require('zod');
const { verifyPassword, signToken } = require('../utils/auth');

const LoginSchema = z.object({
  email: z.string().email('Ingrese un correo válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

/**
 * Valida credenciales y devuelve el token de sesión con los datos públicos del usuario.
 * Devuelve null si el correo no existe, la cuenta está inactiva o la contraseña no coincide.
 */
async function iniciarSesion(datos) {
  const { email, password } = LoginSchema.parse(datos);

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

  return {
    token: signToken({ sub: publico.id, nombre: publico.nombre, email: publico.email, rol: publico.rol }),
    usuario: publico,
  };
}

module.exports = {
  LoginSchema,
  iniciarSesion,
};
