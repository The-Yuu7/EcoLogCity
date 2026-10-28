const app = require('./app');
const dotenv = require('dotenv');
const { autoMigrate } = require('./scripts/autoMigrate');

dotenv.config();

const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, async () => {
  console.log(`=======================================================`);
  console.log(`🚀 EcoLogCity Backend API ejecutándose en puerto ${PORT}`);
  console.log(`📍 Ámbito: Huancayo, Junín (3,250 msnm)`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api/v1`);
  console.log(`=======================================================`);

  // Asegurar migración de esquemas y usuarios al arrancar
  await autoMigrate();
});

// Cierre controlado
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Proceso API terminado de forma controlada.');
  });
});
