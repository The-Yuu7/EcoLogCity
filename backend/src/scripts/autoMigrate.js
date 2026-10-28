const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const DATABASE_DIR = path.join(__dirname, '../../../database');

const SCRIPTS = [
  { tipo: 'migración', archivo: 'migrations/001_init_postgis_schema.sql' },
  { tipo: 'migración', archivo: 'migrations/002_usuarios_roles.sql' },
  { tipo: 'semilla', archivo: 'seeds/001_seed_pedidos_huancayo.sql' },
  { tipo: 'semilla', archivo: 'seeds/002_seed_usuarios.sql' },
];

let migrationInProgress = null;

async function autoMigrate() {
  if (migrationInProgress) return migrationInProgress;

  migrationInProgress = (async () => {
    try {
      console.log('🔄 Sincronizando esquema de base de datos y usuarios...');
      for (const { tipo, archivo } of SCRIPTS) {
        const ruta = path.join(DATABASE_DIR, archivo);
        if (!fs.existsSync(ruta)) {
          console.warn(`⚠️ Archivo de ${tipo} no encontrado: ${ruta}`);
          continue;
        }
        const sql = fs.readFileSync(ruta, 'utf8');
        await db.query(sql);
      }
      console.log('✅ Base de datos sincronizada correctamente (usuarios y roles activos).');
      return true;
    } catch (err) {
      console.warn('⚠️ Nota sobre auto-migración de BD:', err.message);
      return false;
    } finally {
      migrationInProgress = null;
    }
  })();

  return migrationInProgress;
}

module.exports = { autoMigrate };
