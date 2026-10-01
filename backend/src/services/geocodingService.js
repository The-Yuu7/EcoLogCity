/**
 * Servicio de Geocodificación Automática para Huancayo (US-001)
 * Soporta geocodificación directa con OpenStreetMap Nominatim
 * y base de conocimiento local para puntos de referencia críticos en Huancayo.
 */

// Puntos de referencia conocidos en el valle del Mantaro (Huancayo)
const HUANCAYO_LANDMARKS = [
  {
    alias: ['plaza constitucion', 'constitucion', 'centro huancayo', 'catedral huancayo'],
    distrito: 'Huancayo Cercado',
    direccion: 'Plaza Constitución, Huancayo',
    lat: -12.0678,
    lon: -75.2098,
  },
  {
    alias: ['parque huamanmarca', 'huamanmarca', 'municipalidad provincial de huancayo'],
    distrito: 'Huancayo Cercado',
    direccion: 'Parque Huamanmarca, Calle Real 100, Huancayo',
    lat: -12.0706,
    lon: -75.2084,
  },
  {
    alias: ['av giraldez 150', 'giraldez 150', 'avenida giraldez 150'],
    distrito: 'Huancayo Cercado',
    direccion: 'Av. Giráldez 150, Huancayo',
    lat: -12.0673,
    lon: -75.2104,
  },
  {
    alias: ['mercado modelo', 'mercado modelo huancayo', 'jr mantaro'],
    distrito: 'Huancayo Cercado',
    direccion: 'Jr. Mantaro 320, Mercado Modelo, Huancayo',
    lat: -12.0712,
    lon: -75.2081,
  },
  {
    alias: ['mercado mayorista', 'mayorista ex malteria', 'ferrocarril'],
    distrito: 'Huancayo Cercado',
    direccion: 'Av. Ferrocarril s/n, Ex Maltería Lima, Huancayo',
    lat: -12.0765,
    lon: -75.2032,
  },
  {
    alias: ['parque bolognesi', 'el tambo centro', 'plaza el tambo'],
    distrito: 'El Tambo',
    direccion: 'Parque Bolognesi, Calle Real cuadra 5, El Tambo',
    lat: -12.0535,
    lon: -75.2182,
  },
  {
    alias: ['calle real 450', 'real 450 el tambo'],
    distrito: 'El Tambo',
    direccion: 'Calle Real 450, El Tambo, Huancayo',
    lat: -12.0531,
    lon: -75.2185,
  },
  {
    alias: ['uncp', 'universidad nacional del centro del peru'],
    distrito: 'El Tambo',
    direccion: 'Av. Mariscal Castilla 3909, UNCP, El Tambo',
    lat: -12.0232,
    lon: -75.2415,
  },
  {
    alias: ['parque peñaloza', 'parque penalosa', 'plaza chilca'],
    distrito: 'Chilca',
    direccion: 'Parque Peñaloza, Av. 9 de Diciembre, Chilca',
    lat: -12.0831,
    lon: -75.2018,
  },
  {
    alias: ['av 9 de diciembre 210', '9 de diciembre 210'],
    distrito: 'Chilca',
    direccion: 'Av. 9 de Diciembre 210, Chilca, Huancayo',
    lat: -12.0825,
    lon: -75.2023,
  },
  {
    alias: ['plaza pilcomayo', 'parque pilcomayo'],
    distrito: 'Pilcomayo',
    direccion: 'Plaza Principal de Pilcomayo, Pilcomayo',
    lat: -12.0512,
    lon: -75.2490,
  },
  {
    alias: ['plaza san agustin', 'san agustin de cajas'],
    distrito: 'San Agustín de Cajas',
    direccion: 'Plaza Principal San Agustín de Cajas',
    lat: -12.0250,
    lon: -75.2340,
  }
];

// Bounding Box de cobertura autorizada en Huancayo
const HUANCAYO_BBOX = {
  minLat: -12.1500,
  maxLat: -12.0000,
  minLon: -75.3000,
  maxLon: -75.1500,
};

function normalizarTexto(txt) {
  return txt
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Geocodifica una dirección para Huancayo y alrededores
 * @param {string} direccion Texto de la dirección
 * @param {string} [distrito] Distrito sugerido
 * @returns {Promise<object>} Resultado con coordenadas o sugerencias
 */
async function geocodificarDireccion(direccion, distrito = '') {
  if (!direccion || typeof direccion !== 'string' || direccion.trim().length === 0) {
    throw new Error('La dirección a geocodificar no puede estar vacía');
  }

  const direccionNorm = normalizarTexto(direccion);

  // 1. Verificación en base local de puntos clave de Huancayo
  const matchExacto = HUANCAYO_LANDMARKS.find(item =>
    item.alias.some(alias => direccionNorm.includes(normalizarTexto(alias)))
  );

  if (matchExacto) {
    return {
      status: 'EXACT_MATCH',
      tipo: 'PUNTO_REFERENCIA_LOCAL',
      direccion_formateada: matchExacto.direccion,
      distrito: matchExacto.distrito,
      latitud: matchExacto.lat,
      longitud: matchExacto.lon,
      confianza: 0.98,
      requiere_seleccion_manual: false,
      sugerencias: [],
    };
  }

  // 2. Consulta en OpenStreetMap Nominatim con sesgo geográfico
  try {
    const query = `${direccion}, ${distrito || ''}, Huancayo, Junín, Perú`.trim();
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&viewbox=-75.30,-12.00,-75.15,-12.15`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'EcoLogCity-VRP-Optimizer/1.0 (academic-project; huancayo)',
        'Accept-Language': 'es-PE,es;q=0.9',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        // Filtrar aquellos que caigan dentro de la zona de Huancayo
        const enCobertura = data.filter(item => {
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          return (
            lat >= HUANCAYO_BBOX.minLat &&
            lat <= HUANCAYO_BBOX.maxLat &&
            lon >= HUANCAYO_BBOX.minLon &&
            lon <= HUANCAYO_BBOX.maxLon
          );
        });

        const candidatos = enCobertura.length > 0 ? enCobertura : data;

        if (candidatos.length === 1 || parseFloat(candidatos[0].importance || '0') > 0.6) {
          const primero = candidatos[0];
          return {
            status: 'EXACT_MATCH',
            tipo: 'NOMINATIM_OSM',
            direccion_formateada: primero.display_name,
            distrito: primero.address?.suburb || primero.address?.city_district || distrito || 'Huancayo Cercado',
            latitud: parseFloat(primero.lat),
            longitud: parseFloat(primero.lon),
            confianza: parseFloat(primero.importance || '0.75'),
            requiere_seleccion_manual: false,
            sugerencias: candidatos.slice(1, 5).map(c => ({
              display_name: c.display_name,
              lat: parseFloat(c.lat),
              lon: parseFloat(c.lon),
            })),
          };
        } else {
          // Escenario 2 BDD: Dirección ambigua, devuelve lista de sugerencias
          return {
            status: 'AMBIGUOUS',
            tipo: 'NOMINATIM_OSM_MULTIPLE',
            direccion_formateada: candidatos[0].display_name,
            distrito: distrito || 'Huancayo Cercado',
            latitud: parseFloat(candidatos[0].lat),
            longitud: parseFloat(candidatos[0].lon),
            confianza: 0.50,
            requiere_seleccion_manual: true,
            mensaje: 'Se encontraron múltiples coincidencias. Seleccione la ubicación exacta en el mapa.',
            sugerencias: candidatos.slice(0, 5).map(c => ({
              display_name: c.display_name,
              lat: parseFloat(c.lat),
              lon: parseFloat(c.lon),
            })),
          };
        }
      }
    }
  } catch (err) {
    // Si la red externa no responde, aplicamos búsqueda por similitud local
  }

  // 3. Fallback inteligente: buscar coincidencias parciales locales
  const sugerenciasLocales = HUANCAYO_LANDMARKS.filter(item =>
    item.distrito.toLowerCase() === (distrito || '').toLowerCase() ||
    item.alias.some(a => normalizarTexto(a).split(' ').some(w => direccionNorm.includes(w)))
  );

  if (sugerenciasLocales.length > 0) {
    const best = sugerenciasLocales[0];
    return {
      status: 'FALLBACK_LOCAL',
      tipo: 'HUANCAYO_GRID',
      direccion_formateada: best.direccion,
      distrito: best.distrito,
      latitud: best.lat,
      longitud: best.lon,
      confianza: 0.60,
      requiere_seleccion_manual: true,
      mensaje: 'Ubicación estimada por referencia cercana en Huancayo. Ajuste el marcador si es necesario.',
      sugerencias: sugerenciasLocales.slice(0, 5).map(s => ({
        display_name: s.direccion,
        lat: s.lat,
        lon: s.lon,
      })),
    };
  }

  // Fallback por defecto en el centro de Huancayo (-12.0678, -75.2098)
  return {
    status: 'DEFAULT_HUANCAYO_CENTER',
    tipo: 'DEFAULT_COORDINATE',
    direccion_formateada: `${direccion}, Huancayo`,
    distrito: distrito || 'Huancayo Cercado',
    latitud: -12.0678,
    longitud: -75.2098,
    confianza: 0.30,
    requiere_seleccion_manual: true,
    mensaje: 'No se obtuvo coincidencia exacta. Ubique el punto manualmente en el mapa.',
    sugerencias: [],
  };
}

/**
 * Geocodificación inversa: obtener dirección textual desde coordenadas lat/lon
 */
async function geocodificarReversa(lat, lon) {
  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);

  if (isNaN(latNum) || isNaN(lonNum)) {
    throw new Error('Coordenadas latitud o longitud inválidas');
  }

  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latNum}&lon=${lonNum}&addressdetails=1`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'EcoLogCity-VRP-Optimizer/1.0',
        'Accept-Language': 'es-PE,es;q=0.9',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return {
        direccion_formateada: data.display_name,
        distrito: data.address?.suburb || data.address?.city_district || 'Huancayo',
        latitud: latNum,
        longitud: lonNum,
      };
    }
  } catch (e) {
    // fallback
  }

  return {
    direccion_formateada: `Punto GPS (${latNum.toFixed(5)}, ${lonNum.toFixed(5)}), Huancayo`,
    distrito: 'Huancayo',
    latitud: latNum,
    longitud: lonNum,
  };
}

module.exports = {
  geocodificarDireccion,
  geocodificarReversa,
  HUANCAYO_LANDMARKS,
  HUANCAYO_BBOX,
};
