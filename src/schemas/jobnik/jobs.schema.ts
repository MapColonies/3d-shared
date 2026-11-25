import { z } from 'zod';
import { modelIdSchema, productIdSchema, productNameSchema } from './common.schema';

export const jobDataSchema = z.object({
  modelId: modelIdSchema,
  productId: productIdSchema,
  productName: productNameSchema,
});

export const ingestionJobDataSchema = jobDataSchema;
export const deleteJobDataSchema = jobDataSchema;
