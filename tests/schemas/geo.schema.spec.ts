import { bboxSchema, polygonSchema, multiPolygonSchema, geometrySchema } from '../../src/schemas/core/geo.schema';

const ring2D = [
  [34.45, 31.48],
  [34.46, 31.48],
  [34.46, 31.49],
  [34.45, 31.48],
];

const ring3D = [
  [35.0, 32.0, 5],
  [35.1, 32.0, 6],
  [35.1, 32.1, 7],
  [35.0, 32.0, 5],
];

const mixedRing = [
  [34.45, 31.48],
  [34.46, 31.48],
  [34.46, 31.49, 7],
  [34.45, 31.48],
];

describe('geo.schema', () => {
  describe('polygonSchema', () => {
    it('accepts a 2D polygon ring', () => {
      const polygon = {
        type: 'Polygon',
        coordinates: [
          [
            [34.45, 31.48],
            [34.46, 31.48],
            [34.46, 31.49],
            [34.45, 31.48],
          ],
        ],
      };
      expect(polygonSchema.safeParse(polygon).success).toBe(true);
    });

    it('accepts a 3D polygon ring (coordinates with height)', () => {
      const polygon = {
        type: 'Polygon',
        coordinates: [
          [
            [34.45, 31.48, 10],
            [34.46, 31.48, 12],
            [34.46, 31.49, 8],
            [34.45, 31.48, 10],
          ],
        ],
      };
      expect(polygonSchema.safeParse(polygon).success).toBe(true);
    });

    it('rejects the wrong "type" literal', () => {
      const notPolygon = { type: 'MultiPolygon', coordinates: [[[34.45, 31.48]]] };
      expect(polygonSchema.safeParse(notPolygon).success).toBe(false);
    });

    it('rejects a ring with fewer than 4 positions', () => {
      const bad = { type: 'Polygon', coordinates: [ring2D.slice(0, 3)] };
      expect(polygonSchema.safeParse(bad).success).toBe(false);
    });

    it('rejects a coordinate with only one number ([34.45])', () => {
      const bad = { type: 'Polygon', coordinates: [[[34.45], ...ring2D.slice(1)]] };
      expect(polygonSchema.safeParse(bad).success).toBe(false);
    });

    it('rejects a ring that mixes 2D and 3D coordinates', () => {
      const bad = { type: 'Polygon', coordinates: [mixedRing] };
      expect(polygonSchema.safeParse(bad).success).toBe(false);
    });

    it('rejects a coordinate with four numbers', () => {
      const bad = { type: 'Polygon', coordinates: [[[34.45, 31.48, 10, 5], ...ring2D.slice(1)]] };
      expect(polygonSchema.safeParse(bad).success).toBe(false);
    });
  });

  describe('multiPolygonSchema', () => {
    it('accepts a multipolygon with 2D and 3D coordinates', () => {
      const multi = { type: 'MultiPolygon', coordinates: [[ring2D], [ring3D]] };
      expect(multiPolygonSchema.safeParse(multi).success).toBe(true);
    });

    it('rejects a ring with fewer than 4 positions', () => {
      const bad = { type: 'MultiPolygon', coordinates: [[ring2D.slice(0, 3)]] };
      expect(multiPolygonSchema.safeParse(bad).success).toBe(false);
    });

    it('rejects a ring that mixes 2D and 3D coordinates', () => {
      const bad = { type: 'MultiPolygon', coordinates: [[mixedRing]] };
      expect(multiPolygonSchema.safeParse(bad).success).toBe(false);
    });

    it('rejects a polygon shape (one fewer nesting level)', () => {
      const polygon = { type: 'MultiPolygon', coordinates: [ring2D] };
      expect(multiPolygonSchema.safeParse(polygon).success).toBe(false);
    });
  });

  describe('geometrySchema', () => {
    it('accepts a Polygon', () => {
      expect(geometrySchema.safeParse({ type: 'Polygon', coordinates: [ring2D] }).success).toBe(true);
    });

    it('accepts a MultiPolygon', () => {
      expect(geometrySchema.safeParse({ type: 'MultiPolygon', coordinates: [[ring2D]] }).success).toBe(true);
    });

    it('rejects an unsupported geometry type', () => {
      expect(geometrySchema.safeParse({ type: 'Point', coordinates: [34.45, 31.48] }).success).toBe(false);
    });
  });

  describe('bboxSchema', () => {
    it('accepts exactly four numbers', () => {
      expect(bboxSchema.safeParse([34.45, 31.48, 34.46, 31.49]).success).toBe(true);
    });

    it('rejects fewer than four numbers', () => {
      expect(bboxSchema.safeParse([34.45, 31.48, 34.46]).success).toBe(false);
    });
  });
});
