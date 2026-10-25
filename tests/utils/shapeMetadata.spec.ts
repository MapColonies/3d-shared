import { describe, it, expect } from 'vitest';
import { extractShapeMetadataRow } from '../../src/utils/shapeMetadata';
import { SHAPE_METADATA_FIELDS } from '../../src/constants/ingestion/shapeMetadata';
import { LAYER_3D_PRODUCT_TYPE_LIST } from '../../src/constants/core';

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
  countries: 'France',
  ...overrides,
});

const MANDATORY_FIELDS = [
  'prodID',
  'prodName',
  'srsId',
  'srsName',
  'producer',
  'prodSys',
  'prodVer',
  'prodDate',
  'dateStart',
  'dateEnd',
  'minResM',
  'maxResM',
  'absCep90',
  'absLep90',
  'sensors',
  'id',
  'prodType',
  'classify',
  'countries',
];

const errorsOf = (properties: Record<string, unknown>): string[] => {
  const result = extractShapeMetadataRow(properties);
  return result.success ? [] : result.errors;
};

const utcDay = (date: Date): Record<string, number> => ({ year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() });

describe('SHAPE_METADATA_FIELDS', () => {
  it('should map every field name to itself', () => {
    expect(Object.entries(SHAPE_METADATA_FIELDS).filter(([key, value]) => key !== value)).toEqual([]);
  });

  it('should include the part data fields', () => {
    expect(Object.keys(SHAPE_METADATA_FIELDS)).toEqual(expect.arrayContaining(['id', 'countries', 'cities', 'inliersAmt', 'accAlg', 'mean', 'std']));
  });
});

describe('extractShapeMetadataRow', () => {
  describe('row', () => {
    it('should read a full row into the model property names', () => {
      const result = extractShapeMetadataRow(
        row({
          absSep90: 4,
          relCep90: 1,
          relLep90: 1.5,
          relSep90: 2,
          id: 7,
          desc: ' a part ',
          countries: 'France, USA',
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
          countries: ['France', 'USA'],
          cities: ['Afula'],
          inliersAmt: 12,
          accAlg: 'alg',
          mean: 0.1,
          std: 0.02,
        },
      });
    });

    it('should report every mandatory attribute of an empty row', () => {
      expect(errorsOf({})).toEqual(MANDATORY_FIELDS.map((field) => `ShapeMetadata: ${field} is mandatory`));
    });

    it('should drop properties that are not part of the metadata', () => {
      const result = extractShapeMetadataRow(
        row(
          Object.fromEntries([
            ['Shape_Area', 12.5],
            ['OBJECTID', 3],
          ])
        )
      );

      expect(result.success).toBe(true);
      expect(result).not.toHaveProperty('data.Shape_Area');
      expect(result).not.toHaveProperty('data.OBJECTID');
    });

    it('should leave every optional attribute undefined when absent, null or blank', () => {
      const result = extractShapeMetadataRow(
        row({ absSep90: undefined, relCep90: null, relLep90: '', relSep90: '  ', desc: '  ', cities: '', inliersAmt: null, accAlg: '', std: null })
      );

      expect(result).toMatchObject({
        success: true,
        data: {
          maxAbsoluteAccuracySEP90: undefined,
          maxRelativeAccuracyCEP90: undefined,
          maxRelativeAccuracyLEP90: undefined,
          maxRelativeAccuracySEP90: undefined,
          description: undefined,
          cities: undefined,
          inliersAmt: undefined,
          accAlg: undefined,
          mean: undefined,
          std: undefined,
        },
      });
    });
  });

  describe.each(['prodID', 'prodName', 'srsId', 'srsName', 'producer', 'prodSys', 'prodVer'])('mandatory text %s', (field) => {
    it.each([{ value: undefined }, { value: null }, { value: '' }, { value: '   ' }])('should report $value as mandatory', ({ value }) => {
      expect(errorsOf(row({ [field]: value }))).toEqual([`ShapeMetadata: ${field} is mandatory`]);
    });

    it.each([{ value: 5 }, { value: true }, { value: ['a'] }])('should reject the non-text value $value', ({ value }) => {
      expect(errorsOf(row({ [field]: value }))).toEqual([`ShapeMetadata: ${field} must be text`]);
    });
  });

  describe('text', () => {
    it('should trim text', () => {
      expect(extractShapeMetadataRow(row({ prodID: ' AFL ', desc: ' a part ' }))).toMatchObject({
        success: true,
        data: { productId: 'AFL', description: 'a part' },
      });
    });

    it('should accept a product name of exactly the allowed length, after trimming', () => {
      const name = 'a'.repeat(120);

      expect(extractShapeMetadataRow(row({ prodName: ` ${name} ` }))).toMatchObject({ success: true, data: { productName: name } });
    });

    it('should reject a product name longer than the allowed length', () => {
      expect(errorsOf(row({ prodName: 'a'.repeat(121) }))).toEqual(['ShapeMetadata: prodName must be at most 120 characters']);
    });

    it.each(['desc', 'accAlg'])('should reject a non-text value in the optional text %s', (field) => {
      expect(errorsOf(row({ [field]: 12 }))).toEqual([`ShapeMetadata: ${field} must be text`]);
    });
  });

  describe('product type', () => {
    it.each(LAYER_3D_PRODUCT_TYPE_LIST)('should accept %s', (prodType) => {
      expect(extractShapeMetadataRow(row({ prodType }))).toMatchObject({ success: true, data: { productType: prodType } });
    });

    it.each([{ value: 'Raster' }, { value: '' }, { value: 1 }])('should reject $value', ({ value }) => {
      expect(errorsOf(row({ prodType: value }))).toEqual([expect.stringMatching('^ShapeMetadata: prodType must be one of: 3DPhotoRealistic')]);
    });
  });

  describe('classification', () => {
    it.each([
      { value: '4', expected: '4' },
      { value: ' 4 ', expected: '4' },
      { value: 'abc123', expected: 'abc123' },
    ])('should accept $value', ({ value, expected }) => {
      expect(extractShapeMetadataRow(row({ classify: value }))).toMatchObject({ success: true, data: { classification: expected } });
    });

    it.each([{ value: 'not valid!' }, { value: '' }, { value: '4-5' }])('should reject $value', ({ value }) => {
      expect(errorsOf(row({ classify: value }))).toEqual(['ShapeMetadata: classify must contain only letters and digits']);
    });

    it('should reject a number instead of converting it to text', () => {
      expect(errorsOf(row({ classify: 4 }))).toEqual(['ShapeMetadata: classify must be text']);
    });
  });

  describe('numbers', () => {
    it.each(['minResM', 'maxResM', 'absCep90', 'absLep90', 'id'])('should report a missing %s as mandatory', (field) => {
      expect(errorsOf(row({ [field]: null }))).toEqual([`ShapeMetadata: ${field} is mandatory`]);
    });

    it.each([
      ['absCep90', 'abc'],
      ['absCep90', '2.5'],
      ['mean', Infinity],
      ['absCep90', Number.NaN],
      ['absSep90', 'abc'],
      ['mean', 'x'],
    ])('should report %s with the value %o as not a number', (field, value) => {
      expect(errorsOf(row({ [field]: value }))).toEqual([`ShapeMetadata: ${field} must be a number`]);
    });

    it.each([
      ['minResM', 0.01],
      ['maxResM', 8000],
      ['absCep90', 0],
      ['absCep90', 999],
      ['absLep90', 0],
      ['absLep90', 999],
      ['relCep90', 0],
      ['relCep90', 999],
      ['relLep90', 0],
      ['relLep90', 999],
      ['absSep90', 0],
      ['absSep90', 250],
      ['relSep90', 0],
      ['relSep90', 100],
    ])('should accept %s at the edge of the allowed range (%d)', (field, value) => {
      expect(extractShapeMetadataRow(row({ [field]: value })).success).toBe(true);
    });

    it.each([
      ['minResM', 0.009],
      ['maxResM', 8000.1],
      ['absCep90', -1],
      ['absLep90', 1000],
      ['relCep90', 1000],
      ['relLep90', -1],
      ['absSep90', -0.5],
      ['absSep90', 251],
      ['relSep90', -1],
      ['relSep90', 101],
    ])('should reject %s just outside the allowed range (%d)', (field, value) => {
      const overrides = field === 'maxResM' ? { [field]: value, minResM: 0.5 } : { [field]: value };

      expect(errorsOf(row(overrides))).toEqual([expect.stringMatching(`^ShapeMetadata: ${field} must be between`)]);
    });

    it.each([0, 7])('should accept the part id %d', (id) => {
      expect(extractShapeMetadataRow(row({ id }))).toMatchObject({ success: true, data: { partId: id } });
    });

    it.each([-1, 1.5])('should reject the part id %d', (id) => {
      expect(errorsOf(row({ id }))).toEqual(['ShapeMetadata: id must be a non-negative integer']);
    });
  });

  describe('dates', () => {
    it.each(['prodDate', 'dateStart', 'dateEnd'])('should report a missing %s as mandatory', (field) => {
      expect(errorsOf(row({ [field]: undefined }))).toEqual([`ShapeMetadata: ${field} is mandatory`]);
    });

    it.each([{ value: '2025-07-10T00:00:00.000Z' }, { value: new Date('2025-07-10T00:00:00.000Z') }, { value: { year: 2025, month: 7, day: 10 } }])(
      'should accept the date $value',
      ({ value }) => {
        expect(extractShapeMetadataRow(row({ prodDate: value }))).toMatchObject({
          success: true,
          data: { productionDate: '2025-07-10T00:00:00.000Z' },
        });
      }
    );

    it.each([
      { value: 'not a date' },
      { value: 20250710 },
      { value: { year: 2025, month: 7 } },
      { value: { year: 'abc', month: 7, day: 10 } },
      { value: { year: 2025, month: 13, day: 1 } },
      { value: { year: 2025, month: 2, day: 30 } },
      { value: { year: 2025, month: 7, day: 40 } },
      { value: { year: 2025, month: 0, day: 10 } },
    ])('should reject the date $value', ({ value }) => {
      expect(errorsOf(row({ prodDate: value }))).toEqual(['ShapeMetadata: prodDate must be a valid date']);
    });

    it('should accept an imaging end date of today (UTC)', () => {
      expect(extractShapeMetadataRow(row({ dateEnd: utcDay(new Date()) })).success).toBe(true);
    });

    it('should reject an imaging end date later than today (UTC)', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

      expect(errorsOf(row({ dateEnd: utcDay(tomorrow) }))).toEqual(['ShapeMetadata: dateEnd must not be in the future']);
    });
  });

  describe('min and max', () => {
    it.each([
      ['minResM', { minResM: 3, maxResM: 1 }, 'must not be greater than maxResM'],
      ['dateStart', { dateStart: { year: 2025, month: 8, day: 1 } }, 'must not be later than dateEnd'],
    ])('should reject a row whose %s is greater than its maximum', (field, overrides, message) => {
      expect(errorsOf(row(overrides))).toEqual([`ShapeMetadata: ${field} ${message}`]);
    });

    it('should accept a minimum equal to its maximum', () => {
      const sameDay = { year: 2025, month: 7, day: 8 };

      expect(extractShapeMetadataRow(row({ minResM: 1, maxResM: 1, dateStart: sameDay, dateEnd: sameDay })).success).toBe(true);
    });
  });

  describe.each(['sensors', 'countries', 'cities'])('list %s', (field) => {
    it.each([{ value: ' , ' }, { value: ',' }, { value: ',,,' }, { value: 5 }, { value: true }, { value: ['UAV'] }, { value: {} }])(
      'should reject $value',
      ({ value }) => {
        expect(errorsOf(row({ [field]: value }))).toEqual([`ShapeMetadata: ${field} must contain at least one value`]);
      }
    );

    it.each([
      { value: 'bla bla', expected: ['bla bla'] },
      { value: 'A,B', expected: ['A', 'B'] },
      { value: ' A , B ', expected: ['A', 'B'] },
      { value: 'A,', expected: ['A'] },
      { value: ',A,,B,', expected: ['A', 'B'] },
      { value: 'UAV,UAV', expected: ['UAV'] },
      { value: 'A, A ,A', expected: ['A'] },
      { value: 'Texas,Paris,London,Paris,Texas,Texas', expected: ['Texas', 'Paris', 'London'] },
    ])('should split $value into $expected without repeats', ({ value, expected }) => {
      expect(extractShapeMetadataRow(row({ [field]: value }))).toMatchObject({ success: true, data: { [field]: expected } });
    });
  });

  describe.each(['sensors', 'countries'])('mandatory list %s', (field) => {
    it.each([{ value: undefined }, { value: null }])('should report $value as mandatory', ({ value }) => {
      expect(errorsOf(row({ [field]: value }))).toEqual([`ShapeMetadata: ${field} is mandatory`]);
    });

    it.each([{ value: '' }, { value: '   ' }])('should reject the blank value "$value"', ({ value }) => {
      expect(errorsOf(row({ [field]: value }))).toEqual([`ShapeMetadata: ${field} must contain at least one value`]);
    });
  });
});
