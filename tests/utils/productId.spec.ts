import { describe, it, expect } from 'vitest';
import { toProductId } from '../../src/utils/productId';
import { extractShapeMetadataRow } from '../../src/utils/shapeMetadata';

describe('toProductId', () => {
  it.each([
    ['AFL', 'AFL'],
    ['  AFL ', 'AFL'],
    ['AFL  north', 'AFL north'],
    [' AFL \t north ', 'AFL north'],
    ['AFL north', 'AFL north'],
  ])('should map %o to %o', (prodID, productId) => {
    expect(toProductId(prodID)).toBe(productId);
  });

  it('should be the productId the shape metadata row produces', () => {
    const result = extractShapeMetadataRow({
      prodID: ' AFL ',
      prodName: 'afula',
      srsId: '4326',
      srsName: 'WGS84GEO',
      producer: 'IDFMU',
      prodSys: 'sys',
      prodVer: '1',
      prodDate: { year: 2025, month: 7, day: 10 },
      dateStart: { year: 2025, month: 7, day: 6 },
      dateEnd: { year: 2025, month: 7, day: 8 },
      minResM: 0.5,
      maxResM: 1,
      absCep90: 2.5,
      absLep90: 3,
      sensors: 'UAV',
      id: 1,
      countries: 'France',
    });

    expect(result.success && result.data.productId).toBe(toProductId(' AFL '));
  });
});
