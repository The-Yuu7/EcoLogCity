const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir Frontend Estático (Sprint 1 UI)
const frontendPath = path.join(__dirname, '../../frontend/public');
app.use(express.static(frontendPath));

// Rutas de la API v1
app.use('/api/v1', apiRoutes);

// Ruta de información API
app.get('/api', (req, res) => {
  res.json({
    nombre: 'EcoLogCity API',
    version: '1.0.0-alpha',
    descripcion: 'Plataforma de Optimización de Rutas Sostenibles - Huancayo',
    documentacion: '/api/v1/health',
    sprint: 'Sprint 1: Infraestructura y Gestión de Pedidos Geocodificados',
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
