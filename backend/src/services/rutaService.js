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
    const pedidosRes = await pool.query("SELECT * FROM pedidos WHERE estado IN ('REGISTRADO', 'PLANIFICADO') ORDER BY prioridad DESC, ventana_inicio ASC");
    const pedidos = pedidosRes.rows;

    if (pedidos.length === 0) {
        return { rutas: [], almacen: { lat: -12.0650, lon: -75.2040 }, pedidos_sin_asignar: [], generado_en: new Date().toISOString(), resumen: { distancia_total_km: 0, ahorro_estimado_km: 0, emisiones_evitadas_kg_co2: 0, pedidos_asignados: 0, pedidos_sin_asignar: 0 } };
    }

    // 2. Obtener flota activa
    const vehiculosRes = await pool.query("SELECT * FROM vehiculos WHERE activo = true ORDER BY capacidad_peso_kg DESC");
    const vehiculos = vehiculosRes.rows;

    // Sin flota activa ningún pedido puede planificarse: todos vuelven a REGISTRADO
    if (vehiculos.length === 0) {
        await pool.query("UPDATE pedidos SET estado = 'REGISTRADO', updated_at = CURRENT_TIMESTAMP WHERE estado = 'PLANIFICADO'");
        return {
            rutas: [],
            almacen: { lat: -12.0650, lon: -75.2040 },
            pedidos_sin_asignar: pedidos.map(p => ({ id: p.id, codigo: p.codigo_seguimiento, cliente: p.cliente_nombre, distrito: p.distrito, peso_kg: parseFloat(p.peso_kg) })),
            generado_en: new Date().toISOString(),
            aviso: 'No hay vehículos activos en la flota',
            resumen: { distancia_total_km: 0, ahorro_estimado_km: 0, emisiones_evitadas_kg_co2: 0, pedidos_asignados: 0, pedidos_sin_asignar: pedidos.length }
        };
    }

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
                    distrito: pedido.distrito,
                    peso_kg: peso,
                    volumen_m3: vol,
                    ventana_inicio: pedido.ventana_inicio,
                    ventana_fin: pedido.ventana_fin,
                    prioridad: pedido.prioridad,
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

    // Sumar distancia de retorno al almacén y totales de carga por ruta
    let distanciaTotal = 0;
    rutasFinales.forEach(ruta => {
        const distRetorno = calcularDistancia(ruta.ubicacion_actual.lat, ruta.ubicacion_actual.lon, ALMACEN.lat, ALMACEN.lon);
        ruta.distancia_estimada_km = parseFloat((ruta.distancia_estimada_km + distRetorno).toFixed(2));
        distanciaTotal += ruta.distancia_estimada_km;

        const capacidadKg = parseFloat(ruta.vehiculo.capacidad_peso_kg);
        ruta.peso_total_kg = parseFloat((capacidadKg - ruta.capacidad_restante_kg).toFixed(2));
        ruta.volumen_total_m3 = parseFloat((parseFloat(ruta.vehiculo.capacidad_volumen_m3) - ruta.capacidad_restante_m3).toFixed(3));
        ruta.ocupacion_pct = Math.round((ruta.peso_total_kg / capacidadKg) * 100);
        // Tiempo estimado: 25 km/h promedio urbano + tiempo de servicio de 10 min por parada
        ruta.tiempo_estimado_min = Math.round((ruta.distancia_estimada_km / 25) * 60 + ruta.paradas.length * 10);
    });

    // Métricas Green VRP
    const distanciaNoOptima = pedidos.length * 8.5; // Suposición de 8.5 km por cada pedido sin agrupar
    const ahorroKm = Math.max(0, distanciaNoOptima - distanciaTotal);
    const emisionesEvitadas = (ahorroKm * 0.12) * 2.68; // asumiendo 0.12 gal/km = 0.45 L/km

    // Sincronizar estados: los pedidos asignados quedan PLANIFICADO y los que ya no caben vuelven a REGISTRADO
    const asignados = [];
    rutasFinales.forEach(r => r.paradas.forEach(p => asignados.push(p.id)));
    const sinAsignarIds = pedidosSinAsignar.map(p => p.id);
    if (asignados.length > 0) {
        await pool.query("UPDATE pedidos SET estado = 'PLANIFICADO', updated_at = CURRENT_TIMESTAMP WHERE id = ANY($1::uuid[]) AND estado <> 'PLANIFICADO'", [asignados]);
    }
    if (sinAsignarIds.length > 0) {
        await pool.query("UPDATE pedidos SET estado = 'REGISTRADO', updated_at = CURRENT_TIMESTAMP WHERE id = ANY($1::uuid[]) AND estado <> 'REGISTRADO'", [sinAsignarIds]);
    }

    rutasFinales.forEach(r => { delete r.ubicacion_actual; });

    return {
        rutas: rutasFinales,
        almacen: ALMACEN,
        pedidos_sin_asignar: pedidosSinAsignar.map(p => ({
            id: p.id,
            codigo: p.codigo_seguimiento,
            cliente: p.cliente_nombre,
            distrito: p.distrito,
            peso_kg: parseFloat(p.peso_kg),
        })),
        generado_en: new Date().toISOString(),
        resumen: {
            distancia_total_km: parseFloat(distanciaTotal.toFixed(2)),
            ahorro_estimado_km: parseFloat(ahorroKm.toFixed(2)),
            emisiones_evitadas_kg_co2: parseFloat(emisionesEvitadas.toFixed(2)),
            pedidos_asignados: pedidos.length - pedidosSinAsignar.length,
            pedidos_sin_asignar: pedidosSinAsignar.length
        }
    };
}

/**
 * Planificación automática (US-015): se ejecuta cada vez que cambian los pedidos o la flota,
 * sin intervención del usuario. Un error (por ejemplo, flota vacía) no debe impedir
 * registrar el pedido, por eso solo se informa en el log.
 */
async function planificarAutomaticamente(motivo) {
    try {
        const { resumen } = await optimizarRutasVRP();
        console.log(`🧭 Rutas replanificadas (${motivo}): ${resumen.pedidos_asignados} asignados, ${resumen.pedidos_sin_asignar} sin asignar`);
    } catch (error) {
        console.warn(`⚠️ No se pudo replanificar las rutas (${motivo}):`, error.message);
    }
}

module.exports = { optimizarRutasVRP, planificarAutomaticamente };
