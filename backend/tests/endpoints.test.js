const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/db');

describe('Controladores de API (Endpoints y Casos Límite)', () => {
  let createdPedidoId = null;

  afterAll(async () => {
    await pool.end();
  });

  describe('GET /api/v1/geocodificar', () => {
    it('debe devolver 400 si falta el parámetro direccion', async () => {
      const res = await request(app).get('/api/v1/geocodificar');
      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
      expect(res.body.error).toContain('requerido');
    });

    it('debe devolver 200 y datos de geocodificación para direccion válida', async () => {
      const res = await request(app).get('/api/v1/geocodificar?direccion=Av.+Giraldez+150&distrito=Huancayo+Cercado');
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data.latitud).toBeDefined();
    });

    it('GET /api/v1/geocodificar/reversa debe validar lat y lon', async () => {
      const sinParams = await request(app).get('/api/v1/geocodificar/reversa');
      expect(sinParams.status).toBe(400);

      const conParams = await request(app).get('/api/v1/geocodificar/reversa?lat=-12.0673&lon=-75.2104');
      expect(conParams.status).toBe(200);
      expect(conParams.body.ok).toBe(true);
    });
  });

  describe('Endpoints CRUD de Pedidos', () => {
    it('debe listar pedidos filtrando por distrito y estado', async () => {
      const res = await request(app).get('/api/v1/pedidos?distrito=Huancayo&estado=REGISTRADO&limit=5');
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('debe crear un pedido completo y obtenerlo por ID', async () => {
      const nuevo = {
        cliente_nombre: 'Comercial Andina SAC',
        cliente_telefono: '954123987',
        cliente_email: 'andina@distrirapido.pe',
        direccion_texto: 'Parque Huamanmarca',
        distrito: 'Huancayo Cercado',
        referencia: 'Frente a la municipalidad',
        latitud: -12.0706,
        longitud: -75.2084,
        peso_kg: 50.0,
        volumen_m3: 0.4,
        ventana_inicio: '08:30',
        ventana_fin: '10:30',
        tiempo_servicio_min: 15,
        prioridad: 4,
        observaciones: 'Entregar por puerta 2',
      };

      const resCrear = await request(app).post('/api/v1/pedidos').send(nuevo);
      expect(resCrear.status).toBe(201);
      createdPedidoId = resCrear.body.data.id;

      const resGet = await request(app).get(`/api/v1/pedidos/${createdPedidoId}`);
      expect(resGet.status).toBe(200);
      expect(resGet.body.data.cliente_nombre).toBe('Comercial Andina SAC');
    });

    it('debe devolver 404 para un ID de pedido inexistente', async () => {
      const res = await request(app).get('/api/v1/pedidos/00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
    });

    it('debe cancelar un pedido existente', async () => {
      if (createdPedidoId) {
        const res = await request(app).patch(`/api/v1/pedidos/${createdPedidoId}/cancelar`);
        expect(res.status).toBe(200);
        expect(res.body.data.estado).toBe('CANCELADO');
      }
    });

    it('debe devolver 404 al cancelar un pedido inexistente', async () => {
      const res = await request(app).patch('/api/v1/pedidos/00000000-0000-0000-0000-000000000000/cancelar');
      expect(res.status).toBe(404);
    });

    it('debe manejar rutas no encontradas (404)', async () => {
      const res = await request(app).get('/api/v1/ruta-no-existe');
      expect(res.status).toBe(404);
      expect(res.body.ok).toBe(false);
    });

    it('debe responder en la ruta informativa /api', async () => {
      const res = await request(app).get('/api');
      expect(res.status).toBe(200);
      expect(res.body.nombre).toBe('EcoLogCity API');
    });

    it('debe servir el frontend estático en la ruta raíz /', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.text).toContain('EcoLogCity');
    });
  });
});
