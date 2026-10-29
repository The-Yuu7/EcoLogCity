jest.mock('../src/config/db', () => ({ pool: { query: jest.fn() }, query: jest.fn() }));
const { pool } = require('../src/config/db');
const { optimizarRutasVRP } = require('../src/services/rutaService');

const pedido = (id, peso, extra = {}) => ({
  id, codigo_seguimiento: `PED-${id}`, cliente_nombre: `Cliente ${id}`, distrito: 'El Tambo',
  direccion_texto: 'Av. X', latitud: -12.06, longitud: -75.21, peso_kg: String(peso), volumen_m3: '0.2',
  ventana_inicio: '08:00:00', ventana_fin: '10:00:00', prioridad: 3, ...extra,
});
const vehiculo = { id: 'v1', placa: 'W2X-780', capacidad_peso_kg: '100', capacidad_volumen_m3: '10' };

// Simula las consultas del motor: pedidos, flota y las actualizaciones de estado
function prepararConsultas(pedidos, vehiculos) {
  const updates = [];
  pool.query.mockImplementation(async (sql, params) => {
    if (sql.includes('FROM pedidos')) return { rows: pedidos };
    if (sql.includes('FROM vehiculos')) return { rows: vehiculos };
    if (sql.startsWith('UPDATE')) updates.push({ sql, params });
    return { rows: [] };
  });
  return updates;
}

// Motor de rutas con planificación automática (US-015), sin base de datos real
describe('US-015: Planificación automática de rutas', () => {
  beforeEach(() => pool.query.mockReset());

  it('asigna los pedidos que caben y devuelve los totales de la ruta', async () => {
    prepararConsultas([pedido('a', 40), pedido('b', 30)], [vehiculo]);
    const plan = await optimizarRutasVRP();
    expect(plan.rutas).toHaveLength(1);
    expect(plan.rutas[0].paradas.map(p => p.id)).toEqual(['a', 'b']);
    expect(plan.rutas[0].peso_total_kg).toBe(70);
    expect(plan.rutas[0].ocupacion_pct).toBe(70);
    expect(plan.rutas[0].tiempo_estimado_min).toBeGreaterThan(0);
  });

  it('marca PLANIFICADO lo asignado y devuelve a REGISTRADO lo que ya no cabe', async () => {
    const updates = prepararConsultas([pedido('a', 80), pedido('b', 50, { estado: 'PLANIFICADO' })], [vehiculo]);
    const plan = await optimizarRutasVRP();
    expect(plan.pedidos_sin_asignar.map(p => p.id)).toEqual(['b']);
    const aPlanificado = updates.find(u => u.sql.includes("estado = 'PLANIFICADO'"));
    const aRegistrado = updates.find(u => u.sql.includes("estado = 'REGISTRADO'"));
    expect(aPlanificado.params[0]).toEqual(['a']);
    expect(aRegistrado.params[0]).toEqual(['b']);
  });

  it('sin flota activa no lanza error: todos los pedidos quedan sin asignar', async () => {
    const updates = prepararConsultas([pedido('a', 10)], []);
    const plan = await optimizarRutasVRP();
    expect(plan.rutas).toEqual([]);
    expect(plan.resumen.pedidos_sin_asignar).toBe(1);
    expect(plan.aviso).toMatch(/vehículos activos/);
    expect(updates[0].sql).toContain("estado = 'REGISTRADO'");
  });
});
