const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function runInit() {
  console.log('🔄 Iniciando configuración de base de datos en la nube / local...');
  try {
    const migrationPath = path.join(__dirname, '../../../database/migrations/001_init_postgis_schema.sql');
    const seedPath = path.join(__dirname, '../../../database/seeds/001_seed_pedidos_huancayo.sql');

    if (fs.existsSync(migrationPath)) {
      console.log('📦 Ejecutando migración: 001_init_postgis_schema.sql...');
      const migrationSql = fs.readFileSync(migrationPath, 'utf8');
      await pool.query(migrationSql);
      console.log('✅ Esquema y tablas creadas exitosamente.');
    } else {
      console.warn('⚠️ No se encontró el archivo de migración en:', migrationPath);
    }

    if (fs.existsSync(seedPath)) {
      console.log('🌱 Ejecutando datos semilla: 001_seed_pedidos_huancayo.sql...');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await pool.query(seedSql);
      console.log('✅ Datos semilla de Huancayo insertados exitosamente.');
    } else {
      console.warn('⚠️ No se encontró el archivo de semillas en:', seedPath);
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
