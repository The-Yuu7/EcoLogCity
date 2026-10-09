const { optimizarRutasVRP } = require('../services/rutaService');

async function handleOptimizarRutas(req, res) {
  try {
    const resultado = await optimizarRutasVRP();
    res.json({ ok: true, data: resultado });
  } catch (error) {
    console.error('Error optimizando rutas:', error);
    res.status(500).json({ ok: false, error: 'Error interno en el motor VRP' });
  }
}

module.exports = {
  handleOptimizarRutas
};
