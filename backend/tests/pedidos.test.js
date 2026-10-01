const request = require('supertest');
const app = require('../src/app');
const { PedidoSchema } = require('../src/services/pedidoService');
const { pool } = require('../src/config/db');

describe('EP-01 / US-001: Módulo de Gestión y Validación de Pedidos', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('Validación de Esquema y Reglas de Negocio (Zod)', () => {
    it('debe aceptar un pedido con ventana horaria válida', () => {
      const datosValidos = {
        cliente_nombre: 'Bodega El Valle',
        cliente_telefono: '964112233',
        direccion_texto: 'Av. Giráldez 150',
        distrito: 'Huancayo Cercado',
        ventana_inicio: '09:00',
        ventana_fin: '11:00',
        peso_kg: 25.5,
        volumen_m3: 0.2,
      };

      const resultado = PedidoSchema.safeParse(datosValidos);
      expect(resultado.success).toBe(true);
    });

    it('debe rechazar un pedido si ventana_fin es menor que ventana_inicio', () => {
      const datosInvalidos = {
        cliente_nombre: 'Bodega El Valle',
        direccion_texto: 'Av. Giráldez 150',
        distrito: 'Huancayo Cercado',
        ventana_inicio: '14:00',
        ventana_fin: '10:00', // Inválido: fin anterior al inicio
        peso_kg: 10,
        volumen_m3: 0.1,
      };

      const resultado = PedidoSchema.safeParse(datosInvalidos);
      expect(resultado.success).toBe(false);
      expect(resultado.error.errors[0].message).toContain('ventana de fin debe ser posterior');
    });

    it('debe rechazar pesos o volúmenes negativos o iguales a cero', () => {
      const datosInvalidos = {
        cliente_nombre: 'Bodega El Valle',
        direccion_texto: 'Av. Giráldez 150',
        distrito: 'Huancayo Cercado',
        ventana_inicio: '08:00',
        ventana_fin: '12:00',
        peso_kg: -5,
        volumen_m3: 0,
      };

      const resultado = PedidoSchema.safeParse(datosInvalidos);
      expect(resultado.success).toBe(false);
    });
  });

  describe('Endpoints REST de Pedidos', () => {
    it('GET /api/v1/health debe responder 200 con estado healthy', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
    });

    it('GET /api/v1/pedidos debe listar pedidos existentes en la base de datos', async () => {
      const res = await request(app).get('/api/v1/pedidos');
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('GET /api/v1/pedidos/stats debe devolver métricas agregadas para el motor VRP', async () => {
      const res = await request(app).get('/api/v1/pedidos/stats');
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toHaveProperty('total_pedidos');
      expect(res.body.data).toHaveProperty('peso_total_kg');
      expect(res.body.data).toHaveProperty('volumen_total_m3');
    });

    it('POST /api/v1/pedidos debe registrar un pedido con geocodificación automática', async () => {
      const nuevoPedido = {
        cliente_nombre: 'MiniMarket Test Sprint 1',
        cliente_telefono: '999888777',
        direccion_texto: 'Plaza Constitución',
        distrito: 'Huancayo Cercado',
        ventana_inicio: '10:00',
        ventana_fin: '12:00',
        peso_kg: 30.0,
        volumen_m3: 0.25,
        prioridad: 3,
      };

      const res = await request(app).post('/api/v1/pedidos').send(nuevoPedido);
      expect(res.status).toBe(201);
      expect(res.body.ok).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.codigo_seguimiento).toMatch(/^PED-HYO-/);
      expect(res.body.data.latitud).toBeDefined();
      expect(res.body.data.longitud).toBeDefined();
    });

    it('POST /api/v1/pedidos debe retornar 400 si faltan campos obligatorios', async () => {
      const res = await request(app).post('/api/v1/pedidos').send({
        cliente_nombre: 'Sin Direccion',
      });
      expect(res.status).toBe(400);
      expect(res.body.ok).toBe(false);
    });
  });
});
