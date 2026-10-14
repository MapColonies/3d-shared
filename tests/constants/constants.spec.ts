import { describe, it, expect } from 'vitest';
import { Layer3DProductTypes, LAYER_3D_PRODUCT_TYPE_LIST } from '../../src/constants/core';
import { INGESTION_VALIDATIONS } from '../../src/constants/ingestion';

describe('core constants', () => {
  it('should expose the 3D product type list derived from the enum values', () => {
    expect(LAYER_3D_PRODUCT_TYPE_LIST).toEqual(Object.values(Layer3DProductTypes));
  });

  it('should include the expected 3D product types', () => {
    expect(LAYER_3D_PRODUCT_TYPE_LIST).toEqual(expect.arrayContaining([Layer3DProductTypes.PHOTO_REALISTIC, Layer3DProductTypes.POINT_CLOUD]));
  });
});

describe('INGESTION_VALIDATIONS', () => {
  it('should define a coherent resolutionMeter range (min < max)', () => {
    expect(INGESTION_VALIDATIONS.resolutionMeter.min).toBeLessThan(INGESTION_VALIDATIONS.resolutionMeter.max);
  });

  it('should define a coherent accuracy range (min < max)', () => {
    expect(INGESTION_VALIDATIONS.accuracy.min).toBeLessThan(INGESTION_VALIDATIONS.accuracy.max);
  });

  it('should require at least one sensor and one region', () => {
    expect(INGESTION_VALIDATIONS.sensors.minItems).toBeGreaterThanOrEqual(1);
    expect(INGESTION_VALIDATIONS.region.minItems).toBeGreaterThanOrEqual(1);
  });
});
