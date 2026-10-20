import { describe, it, expect } from 'vitest';
import { extractShapeMetadataRow } from '../../src/utils/shapeMetadata';
import { SHAPE_METADATA_FIELDS } from '../../src/constants/ingestion/shapeMetadata';

const row = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
  prodID: 'AFL',
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
  sensors: 'UAV, OTHER',
  id: 1,
  prodType: '3DPhotoRealistic',
  classify: '4',
  countries: 'ישראל',
  ...overrides,
});

const errorsOf = (properties: Record<string, unknown>): string[] => {
  const result = extractShapeMetadataRow(properties);
  return result.success ? [] : result.errors;
};

describe('SHAPE_METADATA_FIELDS', () => {
  it('should map every field name to itself', () => {
    expect(Object.entries(SHAPE_METADATA_FIELDS).filter(([key, value]) => key !== value)).toEqual([]);
  });

  it('should include the part data fields', () => {
    expect(Object.keys(SHAPE_METADATA_FIELDS)).toEqual(expect.arrayContaining(['id', 'countries', 'cities', 'inliersAmt', 'accAlg', 'mean', 'std']));
  });
});

describe('extractShapeMetadataRow', () => {
  it('should read a full row into the model property names', () => {
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
        productId: 'AFL',
        productName: 'afula',
        srsId: '4326',
        srsName: 'WGS84GEO',
        producerName: 'IDFMU',
        productionSystem: 'sys',
        productionSystemVersion: '1',
        productionDate: '2025-07-10T00:00:00.000Z',
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
        partId: 7,
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
    });
  });

  it('should trim text and accept a numeric srsId and an ISO date', () => {
    const result = extractShapeMetadataRow(row({ prodID: ' AFL ', srsId: 4326, prodDate: '2025-07-10T00:00:00.000Z' }));

    expect(result).toMatchObject({ success: true, data: { productId: 'AFL', srsId: '4326', productionDate: '2025-07-10T00:00:00.000Z' } });
  });

  it('should leave the optional and part data undefined when absent, null or blank', () => {
    const result = extractShapeMetadataRow(row({ relCep90: null, desc: '  ', cities: '' }));

    expect(result).toMatchObject({
      success: true,
      data: {
        maxAbsoluteAccuracySEP90: undefined,
        maxRelativeAccuracyCEP90: undefined,
        description: undefined,
        cities: undefined,
        mean: undefined,
      },
    });
  });

  it.each([
    ['missing', undefined],
    ['null', null],
    ['blank', '   '],
  ])('should report a %s text attribute as mandatory', (_label, value) => {
    expect(errorsOf(row({ prodName: value }))).toEqual(['ShapeMetadata: prodName is mandatory']);
  });

  it('should report a missing number, date and list as mandatory', () => {
    expect(errorsOf(row({ minResM: null, dateEnd: undefined, sensors: null }))).toEqual([
      'ShapeMetadata: dateEnd is mandatory',
      'ShapeMetadata: minResM is mandatory',
      'ShapeMetadata: sensors is mandatory',
    ]);
  });

  it('should report every missing attribute of an empty row', () => {
    expect(errorsOf({})).toHaveLength(19);
  });

  it('should report numbers and dates that are not valid', () => {
    expect(errorsOf(row({ minResM: 'abc', mean: 'x', dateEnd: 'not a date', prodDate: 20250710 }))).toEqual([
      'ShapeMetadata: prodDate must be a valid date',
      'ShapeMetadata: dateEnd must be a valid date',
      'ShapeMetadata: minResM must be a number',
      'ShapeMetadata: mean must be a number',
    ]);
  });

  it.each([
    ['minResM', 0],
    ['maxResM', 9000],
    ['absCep90', -1],
    ['absLep90', 1000],
    ['relCep90', 1000],
    ['absSep90', -0.5],
    ['absSep90', 251],
    ['relSep90', 101],
  ])('should reject %s outside the allowed range (%d)', (field, value) => {
    const overrides = field === 'maxResM' ? { [field]: value, minResM: 0.5 } : { [field]: value };

    expect(errorsOf(row(overrides))).toEqual([expect.stringMatching(`^ShapeMetadata: ${field} must be between`)]);
  });

  it.each(['id', 'prodType', 'classify', 'countries'])('should report the part attribute %s as mandatory', (field) => {
    expect(errorsOf(row({ [field]: undefined }))).toEqual([`ShapeMetadata: ${field} is mandatory`]);
  });

  it('should accept the largest SEP90 values the catalog allows', () => {
    expect(extractShapeMetadataRow(row({ absSep90: 250, relSep90: 100 }))).toMatchObject({
      success: true,
      data: { maxAbsoluteAccuracySEP90: 250, maxRelativeAccuracySEP90: 100 },
    });
  });

  it('should not require the quality attributes inliersAmt, accAlg, mean and std', () => {
    expect(extractShapeMetadataRow(row({ inliersAmt: null, accAlg: '', mean: undefined, std: null }))).toMatchObject({
      success: true,
      data: { inliersAmt: undefined, accAlg: undefined, mean: undefined, std: undefined },
    });
  });

  it('should accept numeric classification, description and algorithm values from the DBF', () => {
    expect(extractShapeMetadataRow(row({ classify: 4, desc: 12, accAlg: 3 }))).toMatchObject({
      success: true,
      data: { classification: '4', description: '12', accAlg: '3' },
    });
  });

  it('should reject a product name that is longer than the allowed length', () => {
    expect(errorsOf(row({ prodName: 'a'.repeat(121) }))).toEqual(['ShapeMetadata: prodName must be at most 120 characters']);
  });

  it('should reject a classification with characters other than letters and digits', () => {
    expect(errorsOf(row({ classify: 'not valid!' }))).toEqual(['ShapeMetadata: classify must contain only letters and digits']);
  });

  it('should reject a product type that is not a 3D product type', () => {
    expect(errorsOf(row({ prodType: 'Raster' }))).toEqual([expect.stringMatching('^ShapeMetadata: prodType must be one of: 3DPhotoRealistic')]);
  });

  it('should reject sensors that contain only separators', () => {
    expect(errorsOf(row({ sensors: ' , ' }))).toEqual(['ShapeMetadata: sensors must contain at least one value']);
  });

  it('should reject a minimum resolution greater than the maximum', () => {
    expect(errorsOf(row({ minResM: 3, maxResM: 1 }))).toEqual(['ShapeMetadata: minResM must not be greater than maxResM']);
  });

  it('should reject an imaging start later than the end', () => {
    expect(errorsOf(row({ dateStart: { year: 2025, month: 8, day: 1 } }))).toEqual(['ShapeMetadata: dateStart must not be later than dateEnd']);
  });
});
