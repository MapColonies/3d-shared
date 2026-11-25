import { readFileSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import {
  catalogRecordMetadataSchema,
  catalogRecordSchema,
  catalogRecordStatusUpdateSchema,
  catalogRecordUpdateSchema,
} from '../../src/schemas/catalog';
import { CATALOG_RECORD_OPENAPI_PATH, buildCatalogRecordOpenApi } from '../../scripts/openapi';

const omit = <T extends Record<string, unknown>>(value: T, field: string): Partial<T> =>
  Object.fromEntries(Object.entries(value).filter(([key]) => key !== field)) as Partial<T>;

const metadata = {
  productName: 'afula',
  productType: '3DPhotoRealistic',
  imagingTimeBeginUTC: '2025-01-01T00:00:00.000Z',
  imagingTimeEndUTC: '2025-02-01T00:00:00.000Z',
  minResolutionMeter: 0.5,
  maxResolutionMeter: 2,
  maxAbsoluteAccuracyCEP90: 3,
  maxAbsoluteAccuracyLEP90: 4,
  sensors: ['OTHER'],
  footprint: {
    type: 'Polygon',
    coordinates: [
      [
        [34, 32],
        [35, 32],
        [35, 33],
        [34, 32],
      ],
    ],
  },
  srsId: '4326',
  srsName: 'WGS84GEO',
  region: ['Israel'],
  classification: '5',
  productionSystem: 'sys',
  productionSystemVersion: '1.0',
  productionDate: '2025-03-01T00:00:00.000Z',
  producerName: 'IDFMU',
};

const record = {
  ...metadata,
  id: '0b2f7f8e-4c8e-4f7c-9a52-6a1f3c2d9e10',
  type: 'RECORD_3D',
  productId: 'AFL',
  productVersion: 1,
  productStatus: 'UNPUBLISHED',
  creationDate: '2025-04-01T00:00:00.000Z',
  updateDate: '2025-04-01T00:00:00.000Z',
  links: [{ protocol: '3DTiles', url: 'https://example.com/tileset.json' }],
};

describe('catalogRecordMetadataSchema', () => {
  it('should accept metadata without the optional accuracies', () => {
    expect(catalogRecordMetadataSchema.safeParse(metadata).success).toBe(true);
  });

  it.each(['minResolutionMeter', 'maxResolutionMeter', 'maxAbsoluteAccuracyCEP90', 'maxAbsoluteAccuracyLEP90', 'footprint', 'region'])(
    'should reject metadata without %s',
    (field) => {
      expect(catalogRecordMetadataSchema.safeParse(omit(metadata, field)).success).toBe(false);
    }
  );

  it('should accept null relative accuracies', () => {
    expect(catalogRecordMetadataSchema.safeParse({ ...metadata, maxRelativeAccuracyCEP90: null, maxRelativeAccuracyLEP90: null }).success).toBe(true);
  });

  it.each([
    ['minResolutionMeter', 0.001],
    ['maxAbsoluteAccuracyCEP90', 1000],
    ['maxAbsoluteAccuracySEP90', 251],
    ['maxRelativeAccuracySEP90', 101],
  ])('should reject %s out of range', (field, value) => {
    expect(catalogRecordMetadataSchema.safeParse({ ...metadata, [field]: value }).success).toBe(false);
  });

  it('should reject a product type that is not 3D', () => {
    expect(catalogRecordMetadataSchema.safeParse({ ...metadata, productType: 'Orthophoto' }).success).toBe(false);
  });

  it('should reject unknown fields', () => {
    expect(catalogRecordMetadataSchema.safeParse({ ...metadata, productBBox: '1,2,3,4' }).success).toBe(false);
  });
});

describe('catalogRecordSchema', () => {
  it('should accept a stored record', () => {
    expect(catalogRecordSchema.safeParse(record).success).toBe(true);
  });

  it.each(['type', 'productVersion', 'creationDate', 'updateDate', 'productStatus'])('should reject a record without %s', (field) => {
    expect(catalogRecordSchema.safeParse(omit(record, field)).success).toBe(false);
  });

  it('should reject a product version below 1', () => {
    expect(catalogRecordSchema.safeParse({ ...record, productVersion: 0 }).success).toBe(false);
  });
});

describe('catalogRecordUpdateSchema', () => {
  it('should accept a partial update', () => {
    expect(catalogRecordUpdateSchema.safeParse({ description: 'new' }).success).toBe(true);
  });

  it('should reject fields that cannot be updated', () => {
    expect(catalogRecordUpdateSchema.safeParse({ productType: '3DSemantic' }).success).toBe(false);
  });
});

describe('catalogRecordStatusUpdateSchema', () => {
  it('should accept a known status', () => {
    expect(catalogRecordStatusUpdateSchema.safeParse({ productStatus: 'PUBLISHED' }).success).toBe(true);
  });

  it('should reject an unknown status', () => {
    expect(catalogRecordStatusUpdateSchema.safeParse({ productStatus: 'DRAFT' }).success).toBe(false);
  });
});

describe('catalog record openapi', () => {
  it('should match the zod schemas, run npm run generate:openapi after changing them', () => {
    expect(readFileSync(CATALOG_RECORD_OPENAPI_PATH, 'utf8')).toBe(buildCatalogRecordOpenApi());
  });
});
