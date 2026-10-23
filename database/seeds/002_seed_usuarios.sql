-- ==============================================================================
-- EcoLogCity - Datos Semilla 002: Usuarios de prueba
-- ==============================================================================
-- Cuentas solo para entorno de desarrollo y demostración:
--   admin@ecologcity.pe   / Admin2026!    (ADMIN)
--   usuario@ecologcity.pe / Usuario2026!  (USUARIO)
-- ==============================================================================

INSERT INTO usuarios (id, nombre_completo, email, password_hash, rol) VALUES
    ('00000000-0000-4000-8000-000000000001', 'Administrador Logístico', 'admin@ecologcity.pe',
     '5c346570651ab976367297d5d82decd5:764527cc0bb30859145ca72ea5044ba3c54ba58ce600ca8fa27fa213ad2c720912beb7f957fb384d2f95233140c0763c24307e93911e860982bde1a0301ce981',
     'ADMIN'),
    (gen_random_uuid(), 'Operador Despachador', 'usuario@ecologcity.pe',
     '4c0b116b3bf097c411b0f7c05628b278:0650a3406cd9dee3a28415aa45f8874b7ed45bd4589b3880f0b85bf8d675be4befa3c602ac207dbabfa602651a201e829b3e7b449d739cad9d19c05aacf60c78',
     'USUARIO')
ON CONFLICT (email) DO NOTHING;

-- Los pedidos semilla sin propietario se asignan al operador de prueba,
-- para que el directorio del usuario no aparezca vacío en la demostración.
UPDATE pedidos
SET usuario_id = (SELECT id FROM usuarios WHERE email = 'usuario@ecologcity.pe')
WHERE usuario_id IS NULL;
