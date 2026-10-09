const { pool } = require('../config/db');

// Función para calcular distancia Haversine entre dos puntos
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

async function optimizarRutasVRP() {
    // 1. Obtener pedidos pendientes
    const pedidosRes = await pool.query("SELECT * FROM pedidos WHERE estado = 'REGISTRADO' ORDER BY prioridad DESC, ventana_inicio ASC");
    const pedidos = pedidosRes.rows;

    if (pedidos.length === 0) {
        return { rutas: [], resumen: { distancia_total_km: 0, emisiones_evitadas_kg: 0 } };
    }

    // 2. Obtener flota activa
    const vehiculosRes = await pool.query("SELECT * FROM vehiculos WHERE activo = true ORDER BY capacidad_peso_kg DESC");
    const vehiculos = vehiculosRes.rows;

    if (vehiculos.length === 0) throw new Error("No hay vehiculos activos en la flota");

    // 3. Heurística Greedy VRP (Asignación a vehículos basándose en capacidad)
    // El punto de partida de DistriRápido (Almacén Central en Huancayo)
    const ALMACEN = { lat: -12.0650, lon: -75.2040 };

    const rutasAsignadas = vehiculos.map(v => ({
        vehiculo: v,
        capacidad_restante_kg: parseFloat(v.capacidad_peso_kg),
        capacidad_restante_m3: parseFloat(v.capacidad_volumen_m3),
        paradas: [],
        distancia_estimada_km: 0,
        ubicacion_actual: { ...ALMACEN }
    }));

    let pedidosSinAsignar = [];

    // Agrupar pedidos
    for (const pedido of pedidos) {
        let asignado = false;
        
        for (const ruta of rutasAsignadas) {
            const peso = parseFloat(pedido.peso_kg);
            const vol = parseFloat(pedido.volumen_m3);

            if (ruta.capacidad_restante_kg >= peso && ruta.capacidad_restante_m3 >= vol) {
                // Calcular distancia desde ubicacion actual
                const dist = calcularDistancia(ruta.ubicacion_actual.lat, ruta.ubicacion_actual.lon, pedido.latitud, pedido.longitud);
                
                ruta.paradas.push({
                    id: pedido.id,
                    codigo: pedido.codigo_seguimiento,
                    cliente: pedido.cliente_nombre,
                    lat: pedido.latitud,
                    lon: pedido.longitud,
                    direccion: pedido.direccion_texto,
                    distancia_a_parada_km: parseFloat(dist.toFixed(2))
                });

                ruta.capacidad_restante_kg -= peso;
                ruta.capacidad_restante_m3 -= vol;
                ruta.distancia_estimada_km += dist;
                ruta.ubicacion_actual = { lat: pedido.latitud, lon: pedido.longitud };
                asignado = true;
                break;
            }
        }

        if (!asignado) pedidosSinAsignar.push(pedido);
    }

    // Filtrar rutas vacías
    const rutasFinales = rutasAsignadas.filter(r => r.paradas.length > 0);

    // Sumar distancia de retorno al almacén
    let distanciaTotal = 0;
    rutasFinales.forEach(ruta => {
        const distRetorno = calcularDistancia(ruta.ubicacion_actual.lat, ruta.ubicacion_actual.lon, ALMACEN.lat, ALMACEN.lon);
        ruta.distancia_estimada_km += distRetorno;
        distanciaTotal += ruta.distancia_estimada_km;
    });

    // Métricas Green VRP
    const distanciaNoOptima = pedidos.length * 8.5; // Suposición de 8.5 km por cada pedido sin agrupar
    const ahorroKm = Math.max(0, distanciaNoOptima - distanciaTotal);
    const emisionesEvitadas = (ahorroKm * 0.12) * 2.68; // asumiendo 0.12 gal/km = 0.45 L/km

    // Marcar los pedidos procesados como PLANIFICADO (solo para la db, en un caso real esto se confirmaría primero)
    // Para no romper las pruebas del usuario, lo dejamos en REGISTRADO o lo actualizamos
    if(rutasFinales.length > 0) {
        const ids = [];
        rutasFinales.forEach(r => r.paradas.forEach(p => ids.push(p.id)));
        if(ids.length > 0) {
            const placeholders = ids.map((_, i) => `$${i+1}`).join(',');
            await pool.query(`UPDATE pedidos SET estado = 'PLANIFICADO' WHERE id IN (${placeholders})`, ids);
        }
    }

    return {
        rutas: rutasFinales,
        almacen: ALMACEN,
        resumen: {
            distancia_total_km: parseFloat(distanciaTotal.toFixed(2)),
            ahorro_estimado_km: parseFloat(ahorroKm.toFixed(2)),
            emisiones_evitadas_kg_co2: parseFloat(emisionesEvitadas.toFixed(2)),
            pedidos_asignados: pedidos.length - pedidosSinAsignar.length,
            pedidos_sin_asignar: pedidosSinAsignar.length
        }
    };
}

module.exports = { optimizarRutasVRP };
