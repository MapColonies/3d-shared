import { calculatePolygonFromTileset, ERROR_BOX_TILESET, ERROR_BAD_FORMAT_TILESET } from '../../src/utils/tileset';
import type { TileSetJson } from '../../src/types/core/tileset';

describe('calculatePolygonFromTileset', () => {
  it('converts a region bounding volume (radians) to a WGS84 polygon', () => {
    const tileset: TileSetJson = {
      root: { boundingVolume: { region: [0, 0, 0.1, 0.1, 0, 100] } },
    };

    const polygon = calculatePolygonFromTileset(tileset);

    expect(polygon.type).toBe('Polygon');
    const ring = polygon.coordinates[0];
    expect(ring.length).toBeGreaterThanOrEqual(5);
    // west/south corner ~ [0, 0], east/north ~ [5.729, 5.729] degrees
    const lons = ring.map((c) => c[0]);
    const lats = ring.map((c) => c[1]);
    expect(Math.min(...lons)).toBeCloseTo(0, 5);
    expect(Math.max(...lons)).toBeCloseTo(5.729578, 3);
    expect(Math.max(...lats)).toBeCloseTo(5.729578, 3);
  });

  it('converts a sphere bounding volume to a closed WGS84 polygon', () => {
    const tileset: TileSetJson = {
      root: { boundingVolume: { sphere: [4437589, 3079759, 3287656, 1000] } },
    };

    const polygon = calculatePolygonFromTileset(tileset);

    expect(polygon.type).toBe('Polygon');
    const ring = polygon.coordinates[0];
    expect(ring.length).toBeGreaterThanOrEqual(4);
    expect(ring[0]).toEqual(ring[ring.length - 1]);
  });

  it('throws for an unsupported box bounding volume', () => {
    const tileset: TileSetJson = {
      root: { boundingVolume: { box: [0, 0, 0, 100, 0, 0, 0, 100, 0, 0, 0, 100] } },
    };

    expect(() => calculatePolygonFromTileset(tileset)).toThrow(ERROR_BOX_TILESET);
  });

  it('throws for a bounding volume with no recognised shape', () => {
    const tileset = { root: { boundingVolume: {} } } as TileSetJson;

    expect(() => calculatePolygonFromTileset(tileset)).toThrow(ERROR_BAD_FORMAT_TILESET);
  });
});
