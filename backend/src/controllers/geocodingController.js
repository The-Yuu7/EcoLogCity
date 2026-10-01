const { geocodificarDireccion, geocodificarReversa } = require('../services/geocodingService');

async function handleGeocodificar(req, res) {
  try {
    const { direccion, distrito } = req.query;

    if (!direccion) {
      return res.status(400).json({
        ok: false,
        error: 'El parámetro "direccion" es requerido en la consulta',
      });
    }

    const resultado = await geocodificarDireccion(direccion, distrito);
    return res.status(200).json({
      ok: true,
      data: resultado,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Error al geocodificar la dirección',
    });
  }
}

async function handleGeocodificarReversa(req, res) {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        ok: false,
        error: 'Los parámetros "lat" y "lon" son requeridos',
      });
    }

    const resultado = await geocodificarReversa(lat, lon);
    return res.status(200).json({
      ok: true,
      data: resultado,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Error en la geocodificación inversa',
    });
  }
}

module.exports = {
  handleGeocodificar,
  handleGeocodificarReversa,
};
