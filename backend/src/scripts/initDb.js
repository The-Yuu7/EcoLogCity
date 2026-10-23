const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

const DATABASE_DIR = path.join(__dirname, '../../../database');

// Se ejecutan en orden: primero todas las migraciones, luego todas las semillas
const SCRIPTS = [
  { tipo: 'migración', archivo: 'migrations/001_init_postgis_schema.sql' },
  { tipo: 'migración', archivo: 'migrations/002_usuarios_roles.sql' },
  { tipo: 'semilla', archivo: 'seeds/001_seed_pedidos_huancayo.sql' },
  { tipo: 'semilla', archivo: 'seeds/002_seed_usuarios.sql' },
];

async function runInit() {
  console.log('🔄 Iniciando configuración de base de datos en la nube / local...');
  try {
    for (const { tipo, archivo } of SCRIPTS) {
      const ruta = path.join(DATABASE_DIR, archivo);
      if (!fs.existsSync(ruta)) {
        console.warn(`⚠️ No se encontró el archivo de ${tipo} en:`, ruta);
        continue;
      }
      console.log(`📦 Ejecutando ${tipo}: ${archivo}...`);
      await pool.query(fs.readFileSync(ruta, 'utf8'));
    }

    console.log('🎉 Inicialización de Base de Datos completada con éxito.');
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runInit();
