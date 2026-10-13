import {
  ingestion3DNewJobParamsSchema,
  ingestion3DUpdateJobParamsSchema,
  ingestion3DDeleteJobParamsSchema,
} from '../../src/schemas/ingestion/ingestionJobParams.schema';
import { LAYER_3D_PRODUCT_TYPE_LIST } from '../../src/constants/core';

const validMetadata = {
  productType: LAYER_3D_PRODUCT_TYPE_LIST[0],
  classification: 'abc123',
  region: ['ישראל'],
};

describe('ingestion3DNewJobParamsSchema', () => {
  it('accepts params wrapping valid new metadata', () => {
    expect(ingestion3DNewJobParamsSchema.safeParse({ metadata: validMetadata }).success).toBe(true);
  });

  it('rejects params with invalid metadata', () => {
    expect(ingestion3DNewJobParamsSchema.safeParse({ metadata: { classification: 'abc123' } }).success).toBe(false);
  });

  it('rejects params missing metadata', () => {
    expect(ingestion3DNewJobParamsSchema.safeParse({}).success).toBe(false);
  });
});

describe('ingestion3DUpdateJobParamsSchema', () => {
  it('accepts params with a partial metadata update', () => {
    expect(ingestion3DUpdateJobParamsSchema.safeParse({ metadata: { description: 'x' } }).success).toBe(true);
  });

  it('accepts params with empty metadata (all update fields optional)', () => {
    expect(ingestion3DUpdateJobParamsSchema.safeParse({ metadata: {} }).success).toBe(true);
  });
});

describe('ingestion3DDeleteJobParamsSchema', () => {
  it('accepts a productId string', () => {
    expect(ingestion3DDeleteJobParamsSchema.safeParse({ productId: 'p-1' }).success).toBe(true);
  });

  it('rejects a missing productId', () => {
    expect(ingestion3DDeleteJobParamsSchema.safeParse({}).success).toBe(false);
  });

  it('rejects a non-string productId', () => {
    expect(ingestion3DDeleteJobParamsSchema.safeParse({ productId: 123 }).success).toBe(false);
  });
});
