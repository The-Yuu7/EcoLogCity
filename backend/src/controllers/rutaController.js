const { optimizarRutasVRP } = require('../services/rutaService');

/**
 * Devuelve el plan de rutas vigente (US-015). El plan se recalcula en cada consulta,
 * así el directorio de rutas siempre refleja los pedidos y la flota actuales.
 */
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
