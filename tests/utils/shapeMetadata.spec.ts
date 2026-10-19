import { describe, it, expect } from 'vitest';
import { extractCommonShapeMetadata, extractShapeMetadataRow } from '../../src/utils/shapeMetadata';
import { SHAPE_METADATA_FIELDS } from '../../src/constants/ingestion/shapeMetadata';

const common = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
  prodID: 'AFL',
  prodName: 'afula',
  srsId: '4326',
  srsName: 'WGS84GEO',
  producer: 'IDFMU',
  prodSys: 'sys',
  prodVer: '1',
  prodDate: { year: 2025, month: 7, day: 10 },
  ...overrides,
});

const row = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
  ...common(),
  dateStart: { year: 2025, month: 7, day: 6 },
  dateEnd: { year: 2025, month: 7, day: 8 },
  minResM: 0.5,
  maxResM: 1,
  absCep90: 2.5,
  absLep90: 3,
  sensors: 'UAV, OTHER',
  ...overrides,
});

const errorsOf = (result: { success: boolean; errors?: string[] }): string[] => (result.success ? [] : (result.errors ?? []));

describe('SHAPE_METADATA_FIELDS', () => {
  it('should map every field name to itself', () => {
    expect(Object.entries(SHAPE_METADATA_FIELDS).filter(([key, value]) => key !== value)).toEqual([]);
  });

  it('should include the part data fields', () => {
    expect(Object.keys(SHAPE_METADATA_FIELDS)).toEqual(expect.arrayContaining(['id', 'countries', 'cities', 'inliersAmt', 'accAlg', 'mean', 'std']));
  });
});

describe('extractCommonShapeMetadata', () => {
  it('should map the common attributes', () => {
    expect(extractCommonShapeMetadata(common())).toEqual({
      success: true,
      data: {
        productId: 'AFL',
        productName: 'afula',
        srsId: '4326',
        srsName: 'WGS84GEO',
        producerName: 'IDFMU',
        productionSystem: 'sys',
        productionSystemVersion: '1',
        productionDate: '2025-07-10T00:00:00.000Z',
      },
    });
  });

  it('should trim text and accept a numeric srsId and an ISO date', () => {
    const result = extractCommonShapeMetadata(common({ prodID: ' AFL ', srsId: 4326, prodDate: '2025-07-10T00:00:00.000Z' }));

    expect(result).toMatchObject({ success: true, data: { productId: 'AFL', srsId: '4326', productionDate: '2025-07-10T00:00:00.000Z' } });
  });

  it('should report every missing attribute', () => {
    expect(errorsOf(extractCommonShapeMetadata(common({ prodName: ' ', producer: null, prodSys: undefined })))).toEqual([
      'ShapeMetadata: prodName is mandatory',
      'ShapeMetadata: producer is mandatory',
      'ShapeMetadata: prodSys is mandatory',
    ]);
  });

  it('should report a production date that is not a date', () => {
    expect(errorsOf(extractCommonShapeMetadata(common({ prodDate: 'not a date' })))).toEqual(['ShapeMetadata: prodDate must be a valid date']);
  });
});

describe('extractShapeMetadataRow', () => {
  it('should extract the common, aggregated and part data of a full row', () => {
    const result = extractShapeMetadataRow(
      row({
        absSep90: 4,
        relCep90: 1,
        relLep90: 1.5,
        relSep90: 2,
        id: 7,
        prodType: '3DPhotoRealistic',
        desc: ' a part ',
        classify: '4',
        countries: 'ישראל, USA',
        cities: 'Afula',
        inliersAmt: 12,
        accAlg: 'alg',
        mean: 0.1,
        std: 0.02,
      })
    );

    expect(result).toEqual({
      success: true,
      data: {
        common: {
          productId: 'AFL',
          productName: 'afula',
          srsId: '4326',
          srsName: 'WGS84GEO',
          producerName: 'IDFMU',
          productionSystem: 'sys',
          productionSystemVersion: '1',
          productionDate: '2025-07-10T00:00:00.000Z',
        },
        aggregated: {
          imagingTimeBeginUTC: new Date('2025-07-06T00:00:00.000Z'),
          imagingTimeEndUTC: new Date('2025-07-08T00:00:00.000Z'),
          minResolutionMeter: 0.5,
          maxResolutionMeter: 1,
          maxAbsoluteAccuracyCEP90: 2.5,
          maxAbsoluteAccuracyLEP90: 3,
          maxAbsoluteAccuracySEP90: 4,
          maxRelativeAccuracyCEP90: 1,
          maxRelativeAccuracyLEP90: 1.5,
          maxRelativeAccuracySEP90: 2,
          sensors: ['UAV', 'OTHER'],
        },
        part: {
          id: 7,
          productType: '3DPhotoRealistic',
          description: 'a part',
          classification: '4',
          countries: ['ישראל', 'USA'],
          cities: ['Afula'],
          inliersAmt: 12,
          accAlg: 'alg',
          mean: 0.1,
          std: 0.02,
        },
      },
    });
  });

  it('should leave the optional and part data undefined when absent', () => {
    const result = extractShapeMetadataRow(row());

    expect(result).toMatchObject({
      success: true,
      data: {
        aggregated: { maxAbsoluteAccuracySEP90: undefined, maxRelativeAccuracyCEP90: undefined },
        part: { id: undefined, countries: undefined, mean: undefined },
      },
    });
  });

  it('should report the missing aggregated attributes together with the common ones', () => {
    expect(errorsOf(extractShapeMetadataRow(common({ prodName: '' })))).toEqual([
      'ShapeMetadata: prodName is mandatory',
      'ShapeMetadata: minResM is mandatory',
      'ShapeMetadata: maxResM is mandatory',
      'ShapeMetadata: absCep90 is mandatory',
      'ShapeMetadata: absLep90 is mandatory',
      'ShapeMetadata: dateStart is mandatory',
      'ShapeMetadata: dateEnd is mandatory',
      'ShapeMetadata: sensors is mandatory',
    ]);
  });

  it('should report numbers and dates that are not valid', () => {
    expect(errorsOf(extractShapeMetadataRow(row({ minResM: 'abc', mean: 'x', dateEnd: 'not a date' })))).toEqual([
      'ShapeMetadata: minResM must be a number',
      'ShapeMetadata: mean must be a number',
      'ShapeMetadata: dateEnd must be a valid date',
    ]);
  });

  it('should reject a minimum resolution greater than the maximum', () => {
    expect(errorsOf(extractShapeMetadataRow(row({ minResM: 3, maxResM: 1 })))).toEqual(['ShapeMetadata: minResM must not be greater than maxResM']);
  });

  it('should reject an imaging start later than the end', () => {
    expect(errorsOf(extractShapeMetadataRow(row({ dateStart: { year: 2025, month: 8, day: 1 } })))).toEqual([
      'ShapeMetadata: dateStart must not be later than dateEnd',
    ]);
  });
});
