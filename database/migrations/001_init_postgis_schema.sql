-- ==============================================================================
-- EcoLogCity - Script de Migración 001: Esquema de Base de Datos Espacial (Sprint 1)
-- ==============================================================================

-- Intentar habilitar extensión PostGIS si está disponible en el servidor
DO $$
BEGIN
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS postgis;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'PostGIS no disponible localmente; se usarán tipos nativos de punto (lat/long)';
END $$;

-- 1. Tabla de Zonas de Cobertura en Huancayo
CREATE TABLE IF NOT EXISTS zonas_cobertura (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    codigo_postal VARCHAR(10),
    lat_min DOUBLE PRECISION NOT NULL,
    lat_max DOUBLE PRECISION NOT NULL,
    lon_min DOUBLE PRECISION NOT NULL,
    lon_max DOUBLE PRECISION NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Pedidos (US-001 / EP-01)
CREATE TABLE IF NOT EXISTS pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_seguimiento VARCHAR(50) UNIQUE NOT NULL,
    cliente_nombre VARCHAR(150) NOT NULL,
    cliente_telefono VARCHAR(20),
    cliente_email VARCHAR(100),
    direccion_texto TEXT NOT NULL,
    distrito VARCHAR(100) NOT NULL,
    referencia TEXT,
    latitud DOUBLE PRECISION NOT NULL,
    longitud DOUBLE PRECISION NOT NULL,
    peso_kg NUMERIC(10, 2) NOT NULL DEFAULT 1.00 CHECK (peso_kg > 0),
    volumen_m3 NUMERIC(10, 3) NOT NULL DEFAULT 0.05 CHECK (volumen_m3 > 0),
    ventana_inicio TIME NOT NULL,
    ventana_fin TIME NOT NULL,
    tiempo_servicio_min INT NOT NULL DEFAULT 10 CHECK (tiempo_servicio_min > 0),
    prioridad INT NOT NULL DEFAULT 1 CHECK (prioridad BETWEEN 1 AND 5), -- 1: Normal, 5: Muy Urgente
    estado VARCHAR(30) NOT NULL DEFAULT 'REGISTRADO' 
        CHECK (estado IN ('REGISTRADO', 'PLANIFICADO', 'EN_RUTA', 'ENTREGADO', 'CANCELADO')),
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_ventanas_horarias CHECK (ventana_fin > ventana_inicio)
);

-- Índices para optimizar consultas de despacho y geoespaciales
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_distrito ON pedidos(distrito);
CREATE INDEX IF NOT EXISTS idx_pedidos_lat_lon ON pedidos(latitud, longitud);

-- 3. Tabla de Vehículos de la Flota (Preparación Sprint 2)
CREATE TABLE IF NOT EXISTS vehiculos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    placa VARCHAR(10) UNIQUE NOT NULL,
    marca VARCHAR(50),
    modelo VARCHAR(50),
    tipo_vehiculo VARCHAR(30) DEFAULT 'FURGON_MEDIANO',
    capacidad_peso_kg NUMERIC(10, 2) NOT NULL DEFAULT 1500.00,
    capacidad_volumen_m3 NUMERIC(10, 3) NOT NULL DEFAULT 12.00,
    consumo_gal_km NUMERIC(6, 4) NOT NULL DEFAULT 0.12,
    tipo_combustible VARCHAR(20) DEFAULT 'DIESEL',
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla de Conductores (Preparación Sprint 2)
CREATE TABLE IF NOT EXISTS conductores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_completo VARCHAR(150) NOT NULL,
    dni VARCHAR(15) UNIQUE NOT NULL,
    licencia_conducir VARCHAR(20) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    disponible BOOLEAN DEFAULT TRUE,
    jornada_max_horas INT DEFAULT 8,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
