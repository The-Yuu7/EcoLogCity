const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();

// Green IT: ETag fuerte para que el navegador revalide con 304 sin volver a descargar
app.set('etag', 'strong');

// Middlewares
app.use(cors());
// Green IT: compresión Brotli/Gzip de respuestas mayores a 1 KB (HTML, CSS, JS y JSON)
app.use(compression({ threshold: 1024 }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir Frontend Estático
// Green IT: los HTML siempre se revalidan (no-cache + ETag → 304 si no cambiaron);
// CSS/JS se reutilizan 1 hora sin volver a pedirlos. No se usa "immutable" porque
// los archivos no llevan hash en el nombre y un despliegue nuevo debe verse pronto.
const frontendPath = path.join(__dirname, '../../frontend/public');
const CACHE_ESTATICOS_SEG = 60 * 60;
app.use(express.static(frontendPath, {
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    } else {
      res.setHeader('Cache-Control', `public, max-age=${CACHE_ESTATICOS_SEG}`);
    }
  },
}));

// Green IT: las respuestas de la API son privadas y se revalidan con ETag (304 sin cuerpo)
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'private, no-cache');
  next();
});

// Rutas de la API v1
app.use('/api/v1', apiRoutes);

// Ruta de información API
app.get('/api', (req, res) => {
  res.json({
    nombre: 'EcoLogCity API',
    version: '1.0.0-alpha',
    descripcion: 'Plataforma de Optimización de Rutas Sostenibles - Huancayo',
    documentacion: '/api/v1/health',
    sprint: 'Sprint 2: Optimización de Rutas, Gestión de Flota y Control de Acceso por Roles',
  });
});


// Manejador 404
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({
    ok: false,
    error: 'Error interno del servidor',
    detalle: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

module.exports = app;
