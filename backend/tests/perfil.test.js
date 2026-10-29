const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/db');
const { ROLES, signToken } = require('../src/utils/auth');

// Validaciones y permisos que se resuelven antes de consultar la base de datos
describe('US-016: Editar perfil', () => {
  const tokenUsuario = signToken({ sub: 'usuario-test', nombre: 'Usuario', email: 'usuario@test.pe', rol: ROLES.USUARIO });
  const auth = { Authorization: `Bearer ${tokenUsuario}` };

  afterAll(async () => {
    await pool.end();
  });

  it('PATCH /api/v1/perfil debe exigir la contraseña actual para cambiar la contraseña', async () => {
    const res = await request(app).patch('/api/v1/perfil').set(auth).send({ password_nueva: 'NuevaClave2026' });
    expect(res.status).toBe(400);
    expect(res.body.detalles.map(d => d.campo)).toContain('password_actual');
  });

  it('PATCH /api/v1/perfil debe exigir la contraseña actual para cambiar el correo', async () => {
    const res = await request(app).patch('/api/v1/perfil').set(auth).send({ email: 'nuevo@test.pe' });
    expect(res.status).toBe(400);
  });

  it('PATCH /api/v1/perfil debe rechazar una solicitud sin cambios', async () => {
    const res = await request(app).patch('/api/v1/perfil').set(auth).send({});
    expect(res.status).toBe(400);
  });

  it('PATCH /api/v1/perfil debe responder 401 sin sesión', async () => {
    const res = await request(app).patch('/api/v1/perfil').send({ nombre_completo: 'Nombre' });
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/rutas (directorio de rutas) debe responder 403 para el rol USUARIO', async () => {
    const res = await request(app).get('/api/v1/rutas').set(auth);
    expect(res.status).toBe(403);
  });
});
