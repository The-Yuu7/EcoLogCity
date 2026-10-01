const pedidoService = require('../services/pedidoService');
const { ZodError } = require('zod');

async function handleCrearPedido(req, res) {
  try {
    const resultado = await pedidoService.crearPedido(req.body);
    return res.status(201).json({
      ok: true,
      mensaje: 'Pedido registrado con éxito',
      data: resultado.pedido,
      geocodificacion: resultado.geocodificacion,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        ok: false,
        error: 'Error de validación de datos',
        detalles: error.errors.map(e => ({ campo: e.path.join('.'), mensaje: e.message })),
      });
    }
    return res.status(500).json({
      ok: false,
      error: error.message || 'Error al procesar el pedido',
    });
  }
}

async function handleListarPedidos(req, res) {
  try {
    const { distrito, estado, limit } = req.query;
    const pedidos = await pedidoService.listarPedidos({ distrito, estado, limit });
    return res.status(200).json({
      ok: true,
      total: pedidos.length,
      data: pedidos,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Error al consultar pedidos',
    });
  }
}

async function handleObtenerStats(req, res) {
  try {
    const stats = await pedidoService.obtenerEstadisticasPedidos();
    return res.status(200).json({
      ok: true,
      data: stats,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message || 'Error al obtener estadísticas',
    });
  }
}

async function handleObtenerPedidoPorId(req, res) {
  try {
    const pedido = await pedidoService.obtenerPedidoPorId(req.params.id);
    if (!pedido) {
      return res.status(404).json({
        ok: false,
        error: 'Pedido no encontrado',
      });
    }
    return res.status(200).json({
      ok: true,
      data: pedido,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
}

async function handleCancelarPedido(req, res) {
  try {
    const cancelado = await pedidoService.cancelarPedido(req.params.id);
    if (!cancelado) {
      return res.status(404).json({
        ok: false,
        error: 'Pedido no encontrado para cancelar',
      });
    }
    return res.status(200).json({
      ok: true,
      mensaje: 'Pedido cancelado correctamente',
      data: cancelado,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
}

module.exports = {
  handleCrearPedido,
  handleListarPedidos,
  handleObtenerStats,
  handleObtenerPedidoPorId,
  handleCancelarPedido,
};
