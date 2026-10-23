const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/db');
const { ROLES, hashPassword, verifyPassword, signToken, verifyToken } = require('../src/utils/auth');

// Estas pruebas no necesitan base de datos: validan la sesión y los permisos antes de llegar al servicio
describe('US-007: Inicio de sesión y control de acceso por roles', () => {
  const tokenAdmin = signToken({ sub: 'admin-test', nombre: 'Admin', email: 'admin@test.pe', rol: ROLES.ADMIN });
  const tokenUsuario = signToken({ sub: 'usuario-test', nombre: 'Usuario', email: 'usuario@test.pe', rol: ROLES.USUARIO });

  afterAll(async () => {
    await pool.end();
  });

  describe('Contraseñas y tokens', () => {
    it('debe verificar la contraseña correcta y rechazar una incorrecta', () => {
      const hash = hashPassword('Admin2026!');
      expect(verifyPassword('Admin2026!', hash)).toBe(true);
      expect(verifyPassword('otra-clave', hash)).toBe(false);
    });

    it('debe aceptar un token válido y devolver su rol', () => {
      expect(verifyToken(tokenUsuario).rol).toBe(ROLES.USUARIO);
    });

    it('debe rechazar un token alterado', () => {
      const [header, , firma] = tokenUsuario.split('.');
      const bodyFalso = Buffer.from(JSON.stringify({ sub: 'x', rol: ROLES.ADMIN, exp: 9999999999 })).toString('base64url');
      expect(verifyToken(`${header}.${bodyFalso}.${firma}`)).toBeNull();
    });

    it('debe rechazar un token expirado', () => {
      const token = signToken({ sub: 'x', rol: ROLES.ADMIN });
      const dentroDeDosDias = Date.now() + 2 * 86400 * 1000;
      const spy = jest.spyOn(Date, 'now').mockReturnValue(dentroDeDosDias);
      expect(verifyToken(token)).toBeNull();
      spy.mockRestore();
    });

    it('debe rechazar un token mal formado', () => {
      expect(verifyToken('a.b.c')).toBeNull();
      expect(verifyToken(undefined)).toBeNull();
    });
  });

  describe('Protección de endpoints', () => {
    it('POST /api/v1/auth/login debe responder 400 si el correo es inválido', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({ email: 'no-es-correo', password: 'x' });
      expect(res.status).toBe(400);
    });

    it('POST /api/v1/auth/login debe aceptar al administrador de pruebas sin base de datos', async () => {
      const res = await request(app).post('/api/v1/auth/login').send({ email: 'admin@ecologcity.pe', password: 'Admin2026!' });
      expect(res.status).toBe(200);
      expect(res.body.data.usuario.rol).toBe(ROLES.ADMIN);
      expect(verifyToken(res.body.data.token).rol).toBe(ROLES.ADMIN);
    });

    it('GET /api/v1/pedidos debe responder 401 sin sesión', async () => {
      const res = await request(app).get('/api/v1/pedidos');
      expect(res.status).toBe(401);
      expect(res.body.ok).toBe(false);
    });

    it('GET /api/v1/auth/me debe devolver el usuario de la sesión', async () => {
      const res = await request(app).get('/api/v1/auth/me').set('Authorization', `Bearer ${tokenAdmin}`);
      expect(res.status).toBe(200);
      expect(res.body.data.rol).toBe(ROLES.ADMIN);
    });

    it('POST /api/v1/rutas/optimizar debe responder 403 para el rol USUARIO', async () => {
      const res = await request(app).post('/api/v1/rutas/optimizar').set('Authorization', `Bearer ${tokenUsuario}`);
      expect(res.status).toBe(403);
    });

    it('POST /api/v1/vehiculos debe responder 403 para el rol USUARIO', async () => {
      const res = await request(app).post('/api/v1/vehiculos').set('Authorization', `Bearer ${tokenUsuario}`).send({});
      expect(res.status).toBe(403);
    });

    it('POST /api/v1/vehiculos debe validar los datos del vehículo para el ADMIN', async () => {
      const res = await request(app).post('/api/v1/vehiculos').set('Authorization', `Bearer ${tokenAdmin}`).send({ placa: 'X' });
      expect(res.status).toBe(400);
      expect(res.body.detalles.length).toBeGreaterThan(0);
    });
  });
});
