const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/db');
const { ROLES, signToken } = require('../src/utils/auth');

// Permisos y validaciones del módulo de usuarios: se resuelven antes de consultar la base de datos
describe('US-010: Gestión de Usuarios', () => {
  const ADMIN_ID = '00000000-0000-4000-8000-000000000001';
  const tokenAdmin = signToken({ sub: ADMIN_ID, nombre: 'Admin', email: 'admin@test.pe', rol: ROLES.ADMIN });
  const tokenUsuario = signToken({ sub: 'usuario-test', nombre: 'Usuario', email: 'usuario@test.pe', rol: ROLES.USUARIO });

  afterAll(async () => {
    await pool.end();
  });

  it('GET /api/v1/usuarios debe responder 403 para el rol USUARIO', async () => {
    const res = await request(app).get('/api/v1/usuarios').set('Authorization', `Bearer ${tokenUsuario}`);
    expect(res.status).toBe(403);
  });

  it('POST /api/v1/usuarios debe validar correo y longitud de contraseña', async () => {
    const res = await request(app).post('/api/v1/usuarios').set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ nombre_completo: 'Ana Pérez', email: 'no-es-correo', password: 'corta' });
    expect(res.status).toBe(400);
    const campos = res.body.detalles.map(d => d.campo);
    expect(campos).toEqual(expect.arrayContaining(['email', 'password']));
  });

  it('PATCH /api/v1/usuarios/:id no debe permitir que el admin desactive su propia cuenta', async () => {
    const res = await request(app).patch(`/api/v1/usuarios/${ADMIN_ID}`).set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ activo: false });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/propia cuenta/);
  });

  it('PATCH /api/v1/usuarios/:id debe exigir rol o estado', async () => {
    const res = await request(app).patch('/api/v1/usuarios/otro-id').set('Authorization', `Bearer ${tokenAdmin}`).send({});
    expect(res.status).toBe(400);
  });
});
