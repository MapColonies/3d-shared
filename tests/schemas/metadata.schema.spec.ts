import { new3DLayerMetadataSchema, update3DLayerMetadataSchema, aggregation3DMetadataSchema } from '../../src/schemas/ingestion/metadata.schema';
import { LAYER_3D_PRODUCT_TYPE_LIST } from '../../src/constants/core';
import { INGESTION_VALIDATIONS } from '../../src/constants/ingestion';

const validNewMetadata = {
  productId: 'p-1',
  productName: 'my-product',
  productType: LAYER_3D_PRODUCT_TYPE_LIST[0],
  classification: 'abc123',
  srsId: '4326',
  srsName: 'WGS84GEO',
  region: ['ישראל'],
  producerName: 'IDFMU',
  productionSystem: 'sys',
  productionSystemVersion: '1',
  productionDate: '2025-07-08T11:26:00.000Z',
};

describe('new3DLayerMetadataSchema', () => {
  it('accepts a valid metadata object', () => {
    expect(new3DLayerMetadataSchema.safeParse(validNewMetadata).success).toBe(true);
  });

  it('rejects a productName over the max length', () => {
    const tooLong = { ...validNewMetadata, productName: 'a'.repeat(INGESTION_VALIDATIONS.productName.maxLength + 1) };
    expect(new3DLayerMetadataSchema.safeParse(tooLong).success).toBe(false);
  });

  it('rejects a productType outside the allowed 3D list', () => {
    const bad = { ...validNewMetadata, productType: 'NOT_A_3D_TYPE' };
    expect(new3DLayerMetadataSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects an empty region array', () => {
    const bad = { ...validNewMetadata, region: [] };
    expect(new3DLayerMetadataSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a srsId other than "4326"', () => {
    const bad = { ...validNewMetadata, srsId: '3857' };
    expect(new3DLayerMetadataSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects when a required field is missing', () => {
    const missing = { ...validNewMetadata };
    delete (missing as Partial<typeof validNewMetadata>).productName;
    expect(new3DLayerMetadataSchema.safeParse(missing).success).toBe(false);
  });
});

describe('update3DLayerMetadataSchema', () => {
  it('accepts an empty object (all fields optional)', () => {
    expect(update3DLayerMetadataSchema.safeParse({}).success).toBe(true);
  });

  it('accepts a partial update', () => {
    expect(update3DLayerMetadataSchema.safeParse({ description: 'updated' }).success).toBe(true);
  });

  it('rejects a productName over the max length', () => {
    const bad = { productName: 'a'.repeat(INGESTION_VALIDATIONS.productName.maxLength + 1) };
    expect(update3DLayerMetadataSchema.safeParse(bad).success).toBe(false);
  });
});

describe('aggregation3DMetadataSchema', () => {
  const validAggregation = {
    footprint: {
      type: 'Polygon',
      coordinates: [
        [
          [34.45, 31.48],
          [34.46, 31.48],
          [34.45, 31.48],
        ],
      ],
    },
    imagingTimeBeginUTC: new Date('2025-07-06T11:10:00.000Z'),
    imagingTimeEndUTC: new Date('2025-07-10T11:10:00.000Z'),
    maxAbsoluteAccuracyCEP90: 1,
    maxAbsoluteAccuracyLEP90: 1,
    maxRelativeAccuracyCEP90: 1,
    maxRelativeAccuracyLEP90: 1,
    maxResolutionMeter: 1,
    minResolutionMeter: 0.5,
    productBoundingBox: '34.45,31.48,34.46,31.49',
    sensors: ['sensor-1'],
  };

  it('accepts a valid aggregation', () => {
    expect(aggregation3DMetadataSchema.safeParse(validAggregation).success).toBe(true);
  });

  it('rejects when imagingTimeBeginUTC is after imagingTimeEndUTC', () => {
    const bad = { ...validAggregation, imagingTimeBeginUTC: new Date('2025-07-11T00:00:00.000Z') };
    const result = aggregation3DMetadataSchema.safeParse(bad);
    expect(result.success).toBe(false);
  });

  it('rejects unknown keys (schema is strict)', () => {
    const bad = { ...validAggregation, unexpected: true };
    expect(aggregation3DMetadataSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects a resolutionMeter below the minimum', () => {
    const bad = { ...validAggregation, minResolutionMeter: INGESTION_VALIDATIONS.resolutionMeter.min / 2 };
    expect(aggregation3DMetadataSchema.safeParse(bad).success).toBe(false);
  });

  it('rejects an empty sensors array', () => {
    const bad = { ...validAggregation, sensors: [] };
    expect(aggregation3DMetadataSchema.safeParse(bad).success).toBe(false);
  });

  it('coerces ISO date strings for imagingTimeBeginUTC/imagingTimeEndUTC', () => {
    const withStringDates = { ...validAggregation, imagingTimeBeginUTC: '2025-07-06T11:10:00.000Z', imagingTimeEndUTC: '2025-07-10T11:10:00.000Z' };
    const result = aggregation3DMetadataSchema.safeParse(withStringDates);
    expect(result.success).toBe(true);
  });

  it('accepts the optional v2 fields (visualAccuracy, heightRange, flightAlt, geographicArea, SEP90 accuracies)', () => {
    const withOptionals = {
      ...validAggregation,
      visualAccuracy: 50,
      maxAbsoluteAccuracySEP90: 100,
      maxRelativeAccuracySEP90: 50,
      heightRangeFrom: 0,
      heightRangeTo: 120,
      minFlightAlt: 100,
      maxFlightAlt: 400,
      geographicArea: 'ישראל',
    };
    expect(aggregation3DMetadataSchema.safeParse(withOptionals).success).toBe(true);
  });

  it('rejects maxRelativeAccuracySEP90 above the accuracy max bound', () => {
    const bad = { ...validAggregation, maxRelativeAccuracySEP90: INGESTION_VALIDATIONS.accuracy.max + 1 };
    expect(aggregation3DMetadataSchema.safeParse(bad).success).toBe(false);
  });

  it('accepts aggregation without the optional relative CEP90/LEP90 accuracies', () => {
    const withoutRelative = { ...validAggregation };
    delete (withoutRelative as Record<string, unknown>).maxRelativeAccuracyCEP90;
    delete (withoutRelative as Record<string, unknown>).maxRelativeAccuracyLEP90;
    expect(aggregation3DMetadataSchema.safeParse(withoutRelative).success).toBe(true);
  });

  it('rejects aggregation missing a mandatory accuracy (maxAbsoluteAccuracyCEP90)', () => {
    const missingMandatory = { ...validAggregation };
    delete (missingMandatory as Record<string, unknown>).maxAbsoluteAccuracyCEP90;
    expect(aggregation3DMetadataSchema.safeParse(missingMandatory).success).toBe(false);
  });
});
