-- ==============================================================================
-- EcoLogCity - Script de Migración 003: Índices de eficiencia (Green IT)
-- Cada índice responde a una consulta real del backend; evita recorridos
-- secuenciales completos de la tabla y reduce CPU/E-S en PostgreSQL.
-- ==============================================================================

-- Listado de pedidos (pedidoService.listarPedidos): ORDER BY created_at DESC,
-- filtrado opcional por propietario (rol USUARIO).
CREATE INDEX IF NOT EXISTS idx_pedidos_created_at ON pedidos (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario_created ON pedidos (usuario_id, created_at DESC);

-- Motor VRP (rutaService): solo pedidos pendientes, ordenados por prioridad y ventana.
-- Índice parcial: no indexa los pedidos ENTREGADOS/CANCELADOS, que son la mayoría con el tiempo.
CREATE INDEX IF NOT EXISTS idx_pedidos_pendientes_vrp
    ON pedidos (prioridad DESC, ventana_inicio ASC)
    WHERE estado IN ('REGISTRADO', 'PLANIFICADO');

-- Flota activa (vehiculoService / rutaService): WHERE activo = true ORDER BY capacidad_peso_kg DESC
CREATE INDEX IF NOT EXISTS idx_vehiculos_activos_capacidad
    ON vehiculos (capacidad_peso_kg DESC)
    WHERE activo = true;
