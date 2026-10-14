import { describe, it, expect } from 'vitest';
import { ingestion3DNewJobParamsSchema, ingestion3DDeleteJobParamsSchema } from '../../src/schemas/ingestion/ingestionJobParams.schema';
import { LAYER_3D_PRODUCT_TYPE_LIST } from '../../src/constants/core';

const validMetadata = {
  productType: LAYER_3D_PRODUCT_TYPE_LIST[0],
  classification: 'abc123',
  region: ['ישראל'],
};

describe('ingestion3DNewJobParamsSchema', () => {
  it('should accept params wrapping valid new metadata', () => {
    expect(ingestion3DNewJobParamsSchema.safeParse({ metadata: validMetadata }).success).toBe(true);
  });

  it('should reject params with invalid metadata', () => {
    expect(ingestion3DNewJobParamsSchema.safeParse({ metadata: { classification: 'abc123' } }).success).toBe(false);
  });

  it('should reject params missing metadata', () => {
    expect(ingestion3DNewJobParamsSchema.safeParse({}).success).toBe(false);
  });
});

/* eslint-disable vitest/no-commented-out-tests -- restore with update3DLayerMetadataSchema */
// describe('ingestion3DUpdateJobParamsSchema', () => {
//   it('should accept params with a partial metadata update', () => {
//     expect(ingestion3DUpdateJobParamsSchema.safeParse({ metadata: { description: 'x' } }).success).toBe(true);
//   });
//
//   it('should accept params with empty metadata (all update fields optional)', () => {
//     expect(ingestion3DUpdateJobParamsSchema.safeParse({ metadata: {} }).success).toBe(true);
//   });
// });
/* eslint-enable vitest/no-commented-out-tests */

describe('ingestion3DDeleteJobParamsSchema', () => {
  it('should accept a productId string', () => {
    expect(ingestion3DDeleteJobParamsSchema.safeParse({ productId: 'p-1' }).success).toBe(true);
  });

  it('should reject a missing productId', () => {
    expect(ingestion3DDeleteJobParamsSchema.safeParse({}).success).toBe(false);
  });

  it('should reject a non-string productId', () => {
    expect(ingestion3DDeleteJobParamsSchema.safeParse({ productId: 123 }).success).toBe(false);
  });
});
