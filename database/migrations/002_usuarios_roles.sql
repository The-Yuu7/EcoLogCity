-- ==============================================================================
-- EcoLogCity - Script de Migración 002: Usuarios, Roles y Propiedad de Pedidos
-- ==============================================================================

-- 1. Tabla de Usuarios del sistema (US-007)
-- Roles: ADMIN (Administrador Logístico) y USUARIO (Operador / Despachador)
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- scrypt: salt:hash (hex)
    rol VARCHAR(20) NOT NULL DEFAULT 'USUARIO' CHECK (rol IN ('ADMIN', 'USUARIO')),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Cada pedido registra el usuario que lo creó (US-009: directorio por usuario)
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(usuario_id);
