const request = require('supertest');

// Credenciales de database/seeds/002_seed_usuarios.sql
const CUENTAS = {
  ADMIN: { email: 'admin@ecologcity.pe', password: 'Admin2026!' },
  USUARIO: { email: 'usuario@ecologcity.pe', password: 'Usuario2026!' },
};

/**
 * Inicia sesión con una cuenta de prueba y devuelve la cabecera Authorization
 */
async function cabeceraSesion(app, rol = 'ADMIN') {
  const res = await request(app).post('/api/v1/auth/login').send(CUENTAS[rol]);
  return { Authorization: `Bearer ${res.body.data ? res.body.data.token : ''}` };
}

module.exports = { CUENTAS, cabeceraSesion };
