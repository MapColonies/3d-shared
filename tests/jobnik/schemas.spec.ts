import { describe, it, expect } from 'vitest';
import {
  deleteFilesTaskSchema,
  extract3tzTaskSchema,
  insertPartsTaskSchema,
  insertRecordTaskSchema,
  jobDataSchema,
  modelTaskSchema,
  planUploadTaskSchema,
  relativePathSchema,
  uploadFilesTaskSchema,
  validateShapefilesTaskSchema,
} from '../../src/schemas/jobnik';
import { PRODUCT_VERSION } from '../../src/constants/jobnik';

const modelId = '0b2f7f8e-4c8e-4f7c-9a52-6a1f3c2d9e10';

const footprint = {
  type: 'Polygon',
  coordinates: [
    [
      [34, 32],
      [35, 32],
      [35, 33],
      [34, 32],
    ],
  ],
};

const metadata = {
  productId: 'AFL',
  productName: 'afula',
  productType: '3DPhotoRealistic',
  classification: 'abc123',
  srsId: '4326',
  srsName: 'WGS84GEO',
  producerName: 'IDFMU',
  productionSystem: 'sys',
  productionSystemVersion: '1',
  productionDate: '2025-07-10T00:00:00.000Z',
  imagingTimeBeginUTC: '2025-07-06T00:00:00.000Z',
  imagingTimeEndUTC: '2025-07-08T00:00:00.000Z',
  minResolutionMeter: 0.5,
  maxResolutionMeter: 1,
  maxAbsoluteAccuracyCEP90: 2.5,
  maxAbsoluteAccuracyLEP90: 3,
  sensors: ['UAV'],
};

describe('relativePathSchema', () => {
  it.each(['afula/data', 'afula\\data\\tileset.json', 'afula/data\\tileset.json', ' afula '])('should accept %o', (path) => {
    expect(relativePathSchema.safeParse(path).success).toBe(true);
  });

  it.each([
    '',
    '  ',
    '/mnt/share/afula',
    'C:\\share\\afula',
    '\\\\server\\share\\afula',
    'afula/../other',
    '..\\other',
    'afula\\..\\other',
    'C:/share/afula',
    'C:afula',
  ])('should reject %o', (path) => {
    expect(relativePathSchema.safeParse(path).success).toBe(false);
  });
});

describe('task schemas', () => {
  it.each([
    ['validate-shapefiles', validateShapefilesTaskSchema, { modelId, metadataShapefilePath: 'afula/shape/ShapeMetadata.shp' }],
    ['extract-3tz', extract3tzTaskSchema, { archivePath: 'afula/data/model.3tz', tempDir: `temp/${modelId}` }],
    ['plan-upload', planUploadTaskSchema, { sourceDir: 'afula/data', s3KeyPrefix: modelId }],
    ['upload-files', uploadFilesTaskSchema, { sourceDir: 'afula/data', s3KeyPrefix: modelId, keys: ['tileset.json', 'tiles/0.b3dm'] }],
    ['delete-temp-files', deleteFilesTaskSchema, { storageProvider: 'FS', paths: [`temp/${modelId}`] }],
    ['delete-model-files', deleteFilesTaskSchema, { storageProvider: 'S3', paths: [`${modelId}/`] }],
    ['insert-parts', insertPartsTaskSchema, { modelId, metadataShapefilePath: 'afula/shape/ShapeMetadata.shp', productVersion: PRODUCT_VERSION }],
    ['insert-record', insertRecordTaskSchema, { modelId, tilesetFilename: 'tileset.json', metadata, footprint, region: ['France'] }],
    ['delete-parts / delete-record', modelTaskSchema, { modelId }],
  ])('should accept the %s task data', (_stage, schema, data) => {
    expect(schema.safeParse(data).success).toBe(true);
  });

  it('should reject an upload-files task without keys', () => {
    expect(uploadFilesTaskSchema.safeParse({ sourceDir: 'afula/data', s3KeyPrefix: modelId, keys: [] }).success).toBe(false);
  });

  it('should reject an unknown storage provider', () => {
    expect(deleteFilesTaskSchema.safeParse({ storageProvider: 'GPKG', paths: ['a'] }).success).toBe(false);
  });

  it('should reject a non uuid modelId', () => {
    expect(modelTaskSchema.safeParse({ modelId: 'afula' }).success).toBe(false);
  });

  it('should read the record dates from their ISO strings', () => {
    const result = insertRecordTaskSchema.parse({ modelId, tilesetFilename: 'tileset.json', metadata, footprint, region: ['France'] });

    expect(result.metadata.imagingTimeBeginUTC).toEqual(new Date('2025-07-06T00:00:00.000Z'));
  });

  it('should reject an insert-record task whose metadata has an unknown product type', () => {
    const data = { modelId, tilesetFilename: 'tileset.json', metadata: { ...metadata, productType: 'ORTHOPHOTO' }, footprint, region: ['France'] };

    expect(insertRecordTaskSchema.safeParse(data).success).toBe(false);
  });
});

describe('jobDataSchema', () => {
  it('should accept the modelId, productId and productName', () => {
    expect(jobDataSchema.safeParse({ modelId, productId: 'AFL', productName: 'afula' }).success).toBe(true);
  });
});
