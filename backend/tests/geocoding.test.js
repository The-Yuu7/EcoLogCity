const {
  geocodificarDireccion,
  geocodificarReversa,
  HUANCAYO_BBOX,
} = require('../src/services/geocodingService');

describe('US-001: Geocodificación Automática de Direcciones en Huancayo', () => {
  describe('Escenario 1: Dirección válida dentro de cobertura (BDD)', () => {
    it('debe geocodificar Av. Giráldez 150 y devolver coordenadas precisas en Huancayo', async () => {
      const resultado = await geocodificarDireccion('Av. Giráldez 150, Huancayo', 'Huancayo Cercado');

      expect(resultado).toBeDefined();
      expect(resultado.latitud).toBeCloseTo(-12.067, 2);
      expect(resultado.longitud).toBeCloseTo(-75.210, 2);
      expect(resultado.requiere_seleccion_manual).toBe(false);
      expect(resultado.status).toBe('EXACT_MATCH');
    });

    it('debe geocodificar Plaza Constitución correctamente', async () => {
      const resultado = await geocodificarDireccion('Plaza Constitución', 'Huancayo Cercado');

      expect(resultado.latitud).toBeLessThan(HUANCAYO_BBOX.maxLat);
      expect(resultado.latitud).toBeGreaterThan(HUANCAYO_BBOX.minLat);
      expect(resultado.longitud).toBeLessThan(HUANCAYO_BBOX.maxLon);
      expect(resultado.longitud).toBeGreaterThan(HUANCAYO_BBOX.minLon);
    });

    it('debe reconocer referencias en distritos periféricos (El Tambo / Chilca)', async () => {
      const tambo = await geocodificarDireccion('Calle Real 450', 'El Tambo');
      expect(tambo.distrito).toBe('El Tambo');
      expect(tambo.latitud).toBeCloseTo(-12.053, 2);

      const chilca = await geocodificarDireccion('Av. 9 de Diciembre 210', 'Chilca');
      expect(chilca.distrito).toBe('Chilca');
      expect(chilca.latitud).toBeCloseTo(-12.082, 2);
    });
  });

  describe('Escenario 2: Dirección ambigua o genérica (BDD)', () => {
    it('debe requerir selección manual o sugerencias si la dirección es ambigua', async () => {
      const resultado = await geocodificarDireccion('Calle Desconocida Sin Numero 999');

      expect(resultado).toBeDefined();
      expect(typeof resultado.latitud).toBe('number');
      expect(typeof resultado.longitud).toBe('number');
      // Debe sugerir confirmación manual si no es exacta
      expect(resultado.requiere_seleccion_manual).toBe(true);
    });

    it('debe lanzar error si la dirección enviada está vacía', async () => {
      await expect(geocodificarDireccion('')).rejects.toThrow('La dirección a geocodificar no puede estar vacía');
    });
  });

  describe('Geocodificación Reversa', () => {
    it('debe devolver texto de dirección para coordenadas dadas en Huancayo', async () => {
      const res = await geocodificarReversa(-12.0673, -75.2104);
      expect(res).toBeDefined();
      expect(res.latitud).toBeCloseTo(-12.0673, 3);
      expect(res.longitud).toBeCloseTo(-75.2104, 3);
      expect(typeof res.direccion_formateada).toBe('string');
    });

    it('debe lanzar error para coordenadas inválidas', async () => {
      await expect(geocodificarReversa('invalido', 'invalido')).rejects.toThrow('inválidas');
    });
  });
});
